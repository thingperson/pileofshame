import { NextRequest, NextResponse } from 'next/server';

const RAWG_API_KEY = process.env.RAWG_API_KEY;

export async function GET(request: NextRequest) {
  if (!RAWG_API_KEY) {
    return NextResponse.json({ error: 'RAWG API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const slug = searchParams.get('slug');

  try {
    if (slug) {
      // Fetch single game by slug
      const res = await fetch(
        `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${RAWG_API_KEY}`
      );
      if (!res.ok) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      }
      const game = await res.json();

      // Clean HTML tags from description
      const cleanDesc = (game.description_raw || game.description || '')
        .replace(/<[^>]*>/g, '')
        .trim();
      // Truncate to ~300 chars for a synopsis
      const synopsis = cleanDesc.length > 300
        ? cleanDesc.slice(0, 297).replace(/\s+\S*$/, '') + '...'
        : cleanDesc;

      return NextResponse.json({
        game: {
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
        },
      });
    }

    if (search) {
      // Search games
      const res = await fetch(
        `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(search)}&page_size=8&search_precise=true`
      );
      if (!res.ok) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
      }
      const data = await res.json();
      return NextResponse.json({
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
      });
    }

    return NextResponse.json({ error: 'Provide search or slug parameter' }, { status: 400 });
  } catch (err) {
    console.error('RAWG API error:', err);
    return NextResponse.json({ error: 'Failed to fetch RAWG data' }, { status: 500 });
  }
}
