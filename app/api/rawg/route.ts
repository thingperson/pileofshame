import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

const RAWG_API_KEY = process.env.RAWG_API_KEY;

// In-memory cache (still useful as L1 in front of Supabase L2)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const MAX_CACHE = 500;

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown) {
  if (cache.size >= MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { data, ts: Date.now() });
}

// Supabase L2 cache helpers
async function getFromSupabase(slug: string) {
  if (!supabaseServer) return null;
  try {
    const { data } = await supabaseServer
      .from('game_metadata')
      .select('*')
      .eq('slug', slug)
      .single();
    if (!data) return null;
    return {
      game: {
        slug: data.slug,
        name: data.name,
        coverUrl: data.cover_url,
        metacritic: data.metacritic,
        genres: data.genres || [],
        platforms: data.platforms || [],
        released: data.released,
        rating: data.rating,
        description: data.description,
        tags: data.tags || [],
      },
    };
  } catch {
    return null;
  }
}

async function saveToSupabase(slug: string, game: Record<string, unknown>, hltb?: { main: number; extra: number; completionist: number }) {
  if (!supabaseServer) return;
  try {
    await supabaseServer.from('game_metadata').upsert({
      slug,
      name: game.name,
      cover_url: game.coverUrl,
      metacritic: game.metacritic,
      genres: game.genres || [],
      platforms: game.platforms || [],
      released: game.released,
      rating: game.rating,
      description: game.description,
      tags: game.tags || [],
      hltb_main: hltb?.main ?? null,
      hltb_extra: hltb?.extra ?? null,
      hltb_completionist: hltb?.completionist ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'slug' });
  } catch (err) {
    console.warn('Supabase cache write failed:', err);
  }
}

// Rate limit: 60 requests per minute per IP
const RATE_LIMIT = 60;
const RATE_WINDOW = 60_000;

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = getClientIP(request.headers);
  const limited = checkRateLimit(ip, 'rawg', RATE_LIMIT, RATE_WINDOW);
  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } },
    );
  }

  if (!RAWG_API_KEY) {
    return NextResponse.json({ error: 'RAWG API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const slug = searchParams.get('slug');

  try {
    if (slug) {
      // L1: in-memory
      const cacheKey = `slug:${slug}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return NextResponse.json(cached, {
          headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
        });
      }

      // L2: Supabase
      const sbCached = await getFromSupabase(slug);
      if (sbCached) {
        setCache(cacheKey, sbCached);
        return NextResponse.json(sbCached, {
          headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
        });
      }

      // L3: RAWG API
      const res = await fetch(
        `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${RAWG_API_KEY}`
      );
      if (!res.ok) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      }
      const game = await res.json();

      const cleanDesc = (game.description_raw || game.description || '')
        .replace(/<[^>]*>/g, '')
        .trim();
      const synopsis = cleanDesc.length > 300
        ? cleanDesc.slice(0, 297).replace(/\s+\S*$/, '') + '...'
        : cleanDesc;

      const gameData = {
        slug: game.slug,
        name: game.name,
        coverUrl: game.background_image,
        metacritic: game.metacritic,
        genres: game.genres?.map((g: { name: string }) => g.name) || [],
        platforms: game.platforms?.map((p: { platform: { name: string } }) => p.platform.name) || [],
        released: game.released,
        rating: game.rating,
        description: synopsis,
        tags: game.tags?.slice(0, 10).map((t: { name: string }) => t.name) || [],
      };

      const result = { game: gameData };
      setCache(cacheKey, result);

      // Write-through to Supabase (non-blocking)
      saveToSupabase(game.slug, gameData);

      return NextResponse.json(result, {
        headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
      });
    }

    if (search) {
      const cacheKey = `search:${search.toLowerCase().trim()}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return NextResponse.json(cached, {
          headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
        });
      }

      const res = await fetch(
        `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(search)}&page_size=8&search_precise=true`
      );
      if (!res.ok) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
      }
      const data = await res.json();
      const result = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        results: (data.results || []).map((game: any) => ({
          slug: game.slug,
          name: game.name,
          coverUrl: game.background_image,
          metacritic: game.metacritic,
          genres: game.genres?.map((g: { name: string }) => g.name) || [],
          platforms: game.platforms?.map((p: { platform: { name: string } }) => p.platform.name) || [],
          released: game.released,
          rating: game.rating,
          description: (game.description_raw || '').replace(/<[^>]*>/g, '').slice(0, 200) || undefined,
        })),
      };
      setCache(cacheKey, result);
      return NextResponse.json(result, {
        headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
      });
    }

    return NextResponse.json({ error: 'Provide search or slug parameter' }, { status: 400 });
  } catch (err) {
    console.error('RAWG API error:', err);
    return NextResponse.json({ error: 'Failed to fetch RAWG data' }, { status: 500 });
  }
}
