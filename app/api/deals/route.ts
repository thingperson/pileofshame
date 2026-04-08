import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

// IsThereAnyDeal API — better data, built-in affiliate links
// Docs: https://docs.isthereanydeal.com/

const ITAD_BASE = 'https://api.isthereanydeal.com';
const ITAD_KEY = process.env.ITAD_API_KEY || '';

const FETCH_OPTS: RequestInit = {
  headers: {
    'User-Agent': 'InventoryFull/1.0 (https://inventoryfull.gg)',
    'Accept': 'application/json',
  },
};

// In-memory cache for game ID lookups (title → ITAD UUID)
const idCache = new Map<string, string | null>();

async function lookupGameId(title: string): Promise<string | null> {
  const key = title.trim().toLowerCase();
  if (idCache.has(key)) return idCache.get(key) || null;

  try {
    const res = await fetch(
      `${ITAD_BASE}/games/search/v1?key=${ITAD_KEY}&title=${encodeURIComponent(title.trim())}&results=1`,
      FETCH_OPTS,
    );
    if (!res.ok) {
      console.error(`ITAD search failed: ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (data && data.length > 0) {
      const id = data[0].id;
      idCache.set(key, id);
      return id;
    }
    idCache.set(key, null);
    return null;
  } catch (err) {
    console.error('ITAD lookup error:', err);
    return null;
  }
}

async function getPrices(gameIds: string[]): Promise<Record<string, {
  deals: Array<{ shop: string; price: number; regular: number; cut: number; url: string }>;
  historyLow: number | null;
}>> {
  if (gameIds.length === 0) return {};

  try {
    const res = await fetch(
      `${ITAD_BASE}/games/prices/v3?key=${ITAD_KEY}&country=US&capacity=5&nondeals=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'InventoryFull/1.0 (https://inventoryfull.gg)',
          'Accept': 'application/json',
        },
        body: JSON.stringify(gameIds),
      },
    );
    if (!res.ok) {
      console.error(`ITAD prices failed: ${res.status}`);
      return {};
    }
    const data = await res.json();
    const result: Record<string, {
      deals: Array<{ shop: string; price: number; regular: number; cut: number; url: string }>;
      historyLow: number | null;
    }> = {};

    for (const game of data) {
      result[game.id] = {
        deals: (game.deals || []).map((d: { shop: { name: string }; price: { amount: number }; regular: { amount: number }; cut: number; url: string }) => ({
          shop: d.shop?.name || 'Unknown',
          price: d.price?.amount || 0,
          regular: d.regular?.amount || 0,
          cut: d.cut || 0,
          url: d.url || '',
        })),
        historyLow: game.historyLow?.all?.amount ?? null,
      };
    }
    return result;
  } catch (err) {
    console.error('ITAD prices error:', err);
    return {};
  }
}

// Rate limit: 40 requests per minute per IP
const RATE_LIMIT = 40;
const RATE_WINDOW = 60_000;

export async function GET(req: NextRequest) {
  const ip = getClientIP(req.headers);
  const limited = checkRateLimit(ip, 'deals', RATE_LIMIT, RATE_WINDOW);
  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } },
    );
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'search';

  if (!ITAD_KEY) {
    return NextResponse.json({ error: 'ITAD API key not configured' }, { status: 500 });
  }

  try {
    // Search for deals by game title
    if (action === 'search') {
      const title = searchParams.get('title');
      if (!title) {
        return NextResponse.json({ error: 'title required' }, { status: 400 });
      }

      const gameId = await lookupGameId(title);
      if (!gameId) {
        return NextResponse.json({ results: [], deals: [] });
      }

      const prices = await getPrices([gameId]);
      const gameData = prices[gameId];
      if (!gameData || gameData.deals.length === 0) {
        return NextResponse.json({ results: [], deals: [] });
      }

      // Sort by price ascending
      const sortedDeals = gameData.deals
        .filter(d => d.price > 0)
        .sort((a, b) => a.price - b.price)
        .slice(0, 5)
        .map(d => ({
          store: d.shop,
          price: d.price,
          retailPrice: d.regular,
          savings: d.cut,
          dealUrl: d.url, // ITAD URLs include affiliate tags — do NOT modify per TOS
          isAffiliate: true,
        }));

      return NextResponse.json({
        gameId,
        name: title.trim(),
        cheapest: sortedDeals[0]?.price.toFixed(2) || null,
        cheapestEver: gameData.historyLow ? {
          price: gameData.historyLow,
          date: null,
        } : null,
        deals: sortedDeals,
      });
    }

    // Batch lookup: check deals for multiple games at once
    if (action === 'batch') {
      const titles = searchParams.get('titles');
      if (!titles) {
        return NextResponse.json({ error: 'titles required (comma-separated)' }, { status: 400 });
      }

      const titleList = titles.split(',').slice(0, 10);
      const results = [];

      // Look up all game IDs (with small delays)
      const idMap: { title: string; id: string }[] = [];
      for (const title of titleList) {
        const id = await lookupGameId(title.trim());
        if (id) {
          idMap.push({ title: title.trim(), id });
        }
        await new Promise(r => setTimeout(r, 100));
      }

      if (idMap.length > 0) {
        // Batch price lookup
        const prices = await getPrices(idMap.map(g => g.id));

        for (const { title, id } of idMap) {
          const gameData = prices[id];
          if (gameData && gameData.deals.length > 0) {
            const best = gameData.deals
              .filter(d => d.cut > 0)
              .sort((a, b) => a.price - b.price)[0];
            if (best) {
              results.push({
                title,
                searchTitle: title,
                salePrice: best.price,
                normalPrice: best.regular,
                savings: best.cut,
                store: best.shop,
                dealUrl: best.url,
              });
            }
          }
        }
      }

      return NextResponse.json({ results });
    }

    // Price lookup: get retail prices for a list of games (for backlog value estimation)
    if (action === 'prices') {
      const titles = searchParams.get('titles');
      if (!titles) {
        return NextResponse.json({ error: 'titles required (comma-separated)' }, { status: 400 });
      }

      const titleList = titles.split(',').slice(0, 15);
      const prices: { title: string; retailPrice: number }[] = [];

      // Look up all game IDs
      const idMap: { title: string; id: string }[] = [];
      for (const title of titleList) {
        const id = await lookupGameId(title.trim());
        if (id) {
          idMap.push({ title: title.trim(), id });
        }
        await new Promise(r => setTimeout(r, 100));
      }

      if (idMap.length > 0) {
        const priceData = await getPrices(idMap.map(g => g.id));

        for (const { title, id } of idMap) {
          const gameData = priceData[id];
          if (gameData && gameData.deals.length > 0) {
            // Use the highest regular price as retail
            const retailPrice = Math.max(...gameData.deals.map(d => d.regular));
            if (retailPrice > 0) {
              prices.push({ title, retailPrice });
            }
          }
        }
      }

      return NextResponse.json({ prices });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Deals API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
