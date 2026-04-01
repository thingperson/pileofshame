import { NextRequest, NextResponse } from 'next/server';

// CheapShark API — free, no key required
// Docs: https://apidocs.cheapshark.com/

const CHEAPSHARK_BASE = 'https://www.cheapshark.com/api/1.0';

const FETCH_OPTS: RequestInit = {
  headers: {
    'User-Agent': 'PileOfShame/1.0 (https://pileofsha.me)',
    'Accept': 'application/json',
  },
};

// Store ID → affiliate-friendly store names
const STORE_MAP: Record<string, { name: string; isAffiliate: boolean }> = {
  '1': { name: 'Steam', isAffiliate: false },
  '2': { name: 'GamersGate', isAffiliate: true },
  '3': { name: 'GreenManGaming', isAffiliate: true },
  '7': { name: 'GOG', isAffiliate: true },
  '8': { name: 'Origin', isAffiliate: false },
  '11': { name: 'Humble Bundle', isAffiliate: true },
  '13': { name: 'Uplay', isAffiliate: false },
  '15': { name: 'Fanatical', isAffiliate: true },
  '21': { name: 'WinGameStore', isAffiliate: true },
  '23': { name: 'GameBillet', isAffiliate: true },
  '24': { name: 'Voidu', isAffiliate: true },
  '25': { name: 'Epic Games', isAffiliate: false },
  '27': { name: 'Gamesplanet', isAffiliate: true },
  '28': { name: 'Gamesload', isAffiliate: true },
  '29': { name: '2Game', isAffiliate: true },
  '30': { name: 'IndieGala', isAffiliate: true },
  '31': { name: 'Blizzard', isAffiliate: false },
  '33': { name: 'DLGamer', isAffiliate: true },
  '34': { name: 'Noctre', isAffiliate: true },
  '35': { name: 'DreamGame', isAffiliate: true },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'search';

  try {
    // Search for deals by game title
    if (action === 'search') {
      const title = searchParams.get('title');
      if (!title) {
        return NextResponse.json({ error: 'title required' }, { status: 400 });
      }

      // First, search for the game to get its CheapShark ID
      const searchRes = await fetch(
        `${CHEAPSHARK_BASE}/games?title=${encodeURIComponent(title)}&limit=1`,
        FETCH_OPTS,
      );
      if (!searchRes.ok) {
        console.error(`CheapShark search failed: ${searchRes.status} ${searchRes.statusText}`);
        return NextResponse.json({ error: `CheapShark search failed: ${searchRes.status}` }, { status: 502 });
      }

      const games = await searchRes.json();
      if (!games || games.length === 0) {
        return NextResponse.json({ results: [] });
      }

      const game = games[0];

      // Now get deals for this specific game
      const dealsRes = await fetch(
        `${CHEAPSHARK_BASE}/games?id=${game.gameID}`,
        FETCH_OPTS,
      );
      if (!dealsRes.ok) {
        return NextResponse.json({ results: [] });
      }

      const gameData = await dealsRes.json();
      const deals = (gameData.deals || [])
        .map((deal: { storeID: string; price: string; retailPrice: string; dealID: string; savings: string }) => ({
          store: STORE_MAP[deal.storeID]?.name || `Store ${deal.storeID}`,
          storeId: deal.storeID,
          price: parseFloat(deal.price),
          retailPrice: parseFloat(deal.retailPrice),
          dealId: deal.dealID,
          savings: Math.round(parseFloat(deal.savings)),
          dealUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
          isAffiliate: STORE_MAP[deal.storeID]?.isAffiliate || false,
        }))
        .filter((d: { price: number }) => d.price > 0) // exclude free-to-play noise
        .sort((a: { price: number }, b: { price: number }) => a.price - b.price)
        .slice(0, 5);

      return NextResponse.json({
        gameId: game.gameID,
        name: game.external,
        cheapest: game.cheapest,
        cheapestEver: gameData.cheapestPriceEver ? {
          price: parseFloat(gameData.cheapestPriceEver.price),
          date: new Date(gameData.cheapestPriceEver.date * 1000).toISOString().split('T')[0],
        } : null,
        deals,
      });
    }

    // Batch lookup: check deals for multiple games at once
    if (action === 'batch') {
      const titles = searchParams.get('titles');
      if (!titles) {
        return NextResponse.json({ error: 'titles required (comma-separated)' }, { status: 400 });
      }

      const titleList = titles.split(',').slice(0, 10); // max 10 at a time
      const results = [];

      for (const title of titleList) {
        try {
          const searchRes = await fetch(
            `${CHEAPSHARK_BASE}/deals?title=${encodeURIComponent(title.trim())}&onSale=1&sortBy=Price&pageSize=1`,
            FETCH_OPTS,
          );
          if (searchRes.ok) {
            const deals = await searchRes.json();
            if (deals && deals.length > 0) {
              const deal = deals[0];
              results.push({
                title: deal.title,
                searchTitle: title.trim(),
                salePrice: parseFloat(deal.salePrice),
                normalPrice: parseFloat(deal.normalPrice),
                savings: Math.round(parseFloat(deal.savings)),
                store: STORE_MAP[deal.storeID]?.name || `Store ${deal.storeID}`,
                dealUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
                metacritic: deal.metacriticScore ? parseInt(deal.metacriticScore) : null,
              });
            }
          }
          // Small delay to be nice to CheapShark
          await new Promise((r) => setTimeout(r, 100));
        } catch {
          // skip individual failures
        }
      }

      return NextResponse.json({ results });
    }

    // Price lookup: get retail prices for a list of games (for backlog value estimation)
    // Uses the /deals endpoint — single call per game, returns normalPrice (retail)
    if (action === 'prices') {
      const titles = searchParams.get('titles');
      if (!titles) {
        return NextResponse.json({ error: 'titles required (comma-separated)' }, { status: 400 });
      }

      const titleList = titles.split(',').slice(0, 15); // max 15 to stay fast
      const prices: { title: string; retailPrice: number }[] = [];

      for (const title of titleList) {
        try {
          const searchRes = await fetch(
            `${CHEAPSHARK_BASE}/deals?title=${encodeURIComponent(title.trim())}&pageSize=1`,
            FETCH_OPTS,
          );
          if (searchRes.ok) {
            const deals = await searchRes.json();
            if (deals && deals.length > 0) {
              const normalPrice = parseFloat(deals[0].normalPrice);
              if (normalPrice > 0) {
                prices.push({
                  title: title.trim(),
                  retailPrice: normalPrice,
                });
              }
            }
          }
          // Be respectful — 100ms between requests
          await new Promise((r) => setTimeout(r, 100));
        } catch {
          // skip failures
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
