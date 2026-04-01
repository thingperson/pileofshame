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
        results: (data.results || []).map((game: {
          slug: string;
          name: string;
          background_image: string | null;
          metacritic: number | null;
          genres: { name: string }[];
          platforms: { platform: { name: string } }[];
          released: string | null;
          rating: number | null;
        }) => ({
          slug: game.slug,
          name: game.name,
          coverUrl: game.background_image,
          metacritic: game.metacritic,
          genres: game.genres?.map((g) => g.name) || [],
          platforms: game.platforms?.map((p) => p.platform.name) || [],
          released: game.released,
          rating: game.rating,
        })),
      });
    }

    return NextResponse.json({ error: 'Provide search or slug parameter' }, { status: 400 });
  } catch (err) {
    console.error('RAWG API error:', err);
    return NextResponse.json({ error: 'Failed to fetch RAWG data' }, { status: 500 });
  }
}
