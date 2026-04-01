import { NextRequest, NextResponse } from 'next/server';

const STEAM_API_KEY = process.env.STEAM_API_KEY;

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number; // minutes
  img_icon_url: string;
}

async function resolveSteamId(input: string): Promise<{ steamId: string } | { error: string }> {
  if (/^\d{17}$/.test(input)) {
    return { steamId: input };
  }
  // Also handle full profile URLs
  const urlMatch = input.match(/steamcommunity\.com\/(?:id|profiles)\/([^/]+)/);
  const lookup = urlMatch ? urlMatch[1] : input;

  if (/^\d{17}$/.test(lookup)) {
    return { steamId: lookup };
  }

  const vanityRes = await fetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(lookup)}`
  );
  const vanityData = await vanityRes.json();
  if (vanityData.response?.success !== 1) {
    return { error: `Could not find Steam user "${lookup}"` };
  }
  return { steamId: vanityData.response.steamid };
}

async function getPlayerSummary(steamId: string) {
  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`
  );
  const data = await res.json();
  const player = data.response?.players?.[0];
  if (!player) return null;
  return {
    steamId: player.steamid,
    personaName: player.personaname,
    avatarUrl: player.avatarmedium,
    profileUrl: player.profileurl,
  };
}

export async function GET(request: NextRequest) {
  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: 'Steam API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const input = searchParams.get('steamId');
  const action = searchParams.get('action') || 'games';

  if (!input) {
    return NextResponse.json({ error: 'steamId parameter required' }, { status: 400 });
  }

  try {
    const resolved = await resolveSteamId(input);
    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 404 });
    }
    const { steamId } = resolved;

    // Action: resolve — return profile info for user confirmation
    if (action === 'resolve') {
      const profile = await getPlayerSummary(steamId);
      if (!profile) {
        return NextResponse.json({ error: 'Could not load profile' }, { status: 404 });
      }
      return NextResponse.json({ profile });
    }

    // Action: games — fetch owned games
    const gamesRes = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`
    );
    const gamesData = await gamesRes.json();

    if (!gamesData.response?.games) {
      return NextResponse.json({
        error: 'No games found. Make sure your Steam profile and game details are set to public.',
      }, { status: 404 });
    }

    const games: SteamGame[] = gamesData.response.games;
    games.sort((a, b) => b.playtime_forever - a.playtime_forever);

    return NextResponse.json({
      steamId,
      gameCount: games.length,
      games: games.map((g) => ({
        appid: g.appid,
        name: g.name,
        playtimeHours: Math.round(g.playtime_forever / 60 * 10) / 10,
        iconUrl: g.img_icon_url
          ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
          : null,
        headerUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      })),
    });
  } catch (err) {
    console.error('Steam API error:', err);
    return NextResponse.json({ error: 'Failed to fetch Steam data' }, { status: 500 });
  }
}
