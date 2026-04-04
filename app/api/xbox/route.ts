import { NextRequest, NextResponse } from 'next/server';

const OPENXBL_API_KEY = process.env.OPENXBL_API_KEY;

export async function GET(request: NextRequest) {
  if (!OPENXBL_API_KEY) {
    return NextResponse.json({ error: 'Xbox API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const gamertag = searchParams.get('gamertag');
  const xuid = searchParams.get('xuid');
  const action = searchParams.get('action') || 'games';

  const headers = {
    'X-Authorization': OPENXBL_API_KEY,
    'Accept': 'application/json',
    'Accept-Language': 'en-US',
  };

  try {
    // Action: resolve — search by gamertag to get XUID and profile
    if (action === 'resolve') {
      if (!gamertag) {
        return NextResponse.json({ error: 'gamertag parameter required' }, { status: 400 });
      }

      const res = await fetch(
        `https://xbl.io/api/v2/search/${encodeURIComponent(gamertag)}`,
        { headers }
      );

      if (!res.ok) {
        if (res.status === 429) {
          return NextResponse.json({ error: 'Rate limited. Try again in a minute.' }, { status: 429 });
        }
        return NextResponse.json({ error: `Could not find gamertag "${gamertag}"` }, { status: 404 });
      }

      const data = await res.json();
      const people = data.content?.people || data.people || data.profileUsers || [];
      if (people.length === 0) {
        return NextResponse.json({ error: `No Xbox profile found for "${gamertag}"` }, { status: 404 });
      }

      const player = people[0];
      return NextResponse.json({
        profile: {
          xuid: player.xuid || player.id,
          gamertag: player.gamertag || player.settings?.find((s: { id: string; value: string }) => s.id === 'Gamertag')?.value || gamertag,
          avatarUrl: player.displayPicRaw || player.settings?.find((s: { id: string; value: string }) => s.id === 'GameDisplayPicRaw')?.value || null,
          gamerscore: player.gamerScore || player.settings?.find((s: { id: string; value: string }) => s.id === 'Gamerscore')?.value || '0',
        },
      });
    }

    // Action: games — get title history by XUID
    if (!xuid) {
      return NextResponse.json({ error: 'xuid parameter required' }, { status: 400 });
    }

    const res = await fetch(
      `https://xbl.io/api/v2/player/titleHistory/${xuid}`,
      { headers }
    );

    if (!res.ok) {
      if (res.status === 429) {
        return NextResponse.json({ error: 'Rate limited. Try again in a minute.' }, { status: 429 });
      }
      return NextResponse.json({
        error: 'Could not load game history. The profile may be private.',
      }, { status: 404 });
    }

    const data = await res.json();
    const titles = data.content?.titles || data.titles || [];

    // Filter and format titles
    const games = titles
      .filter((t: { type: string }) => t.type === 'Game' || !t.type) // some entries might be apps
      .map((t: {
        titleId: string;
        name: string;
        displayImage?: string;
        achievement?: { currentAchievements?: number; totalAchievements?: number; currentGamerscore?: number; totalGamerscore?: number };
        titleHistory?: { lastTimePlayed?: string };
        devices?: string[];
      }) => ({
        titleId: t.titleId,
        name: t.name,
        imageUrl: t.displayImage || null,
        achievements: t.achievement ? {
          earned: t.achievement.currentAchievements || 0,
          total: t.achievement.totalAchievements || 0,
          gamerscore: t.achievement.currentGamerscore || 0,
          totalGamerscore: t.achievement.totalGamerscore || 0,
        } : null,
        lastPlayed: t.titleHistory?.lastTimePlayed || null,
        devices: t.devices || [],
      }));

    return NextResponse.json({
      xuid,
      gameCount: games.length,
      games,
    });
  } catch (err) {
    console.error('Xbox API error:', err);
    return NextResponse.json({ error: 'Failed to fetch Xbox data' }, { status: 500 });
  }
}
