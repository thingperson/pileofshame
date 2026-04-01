import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeNpssoForCode,
  exchangeCodeForAccessToken,
  getUserTitles,
} from 'psn-api';

interface PSNTitle {
  trophyTitleName: string;
  trophyTitlePlatform: string;
  trophyTitleIconUrl: string;
  lastUpdatedDateTime: string;
  progress: number;
  definedTrophies: { bronze: number; silver: number; gold: number; platinum: number };
  earnedTrophies: { bronze: number; silver: number; gold: number; platinum: number };
}

export async function POST(request: NextRequest) {
  try {
    const { npsso } = await request.json();

    if (!npsso || typeof npsso !== 'string') {
      return NextResponse.json({ error: 'NPSSO token is required' }, { status: 400 });
    }

    // Step 1: Exchange NPSSO for auth code
    let accessCode: string;
    try {
      accessCode = await exchangeNpssoForCode(npsso.trim());
    } catch {
      return NextResponse.json({
        error: 'Invalid or expired NPSSO token. Try getting a fresh one.',
      }, { status: 401 });
    }

    // Step 2: Exchange auth code for access token
    const authorization = await exchangeCodeForAccessToken(accessCode);

    // Step 3: Fetch all games (paginated)
    const allTitles: PSNTitle[] = [];
    let offset = 0;
    const limit = 100;
    let totalItemCount = Infinity;

    while (offset < totalItemCount && offset < 2000) {
      const response = await getUserTitles(authorization, 'me', { limit, offset });
      totalItemCount = response.totalItemCount;
      allTitles.push(...(response.trophyTitles as PSNTitle[]));
      offset += limit;

      // Rate limit protection
      if (offset < totalItemCount) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    // Map to our app's format
    const games = allTitles.map((title) => ({
      name: title.trophyTitleName,
      platform: title.trophyTitlePlatform,
      imageUrl: title.trophyTitleIconUrl,
      lastPlayed: title.lastUpdatedDateTime,
      progress: title.progress,
      trophiesEarned:
        title.earnedTrophies.bronze +
        title.earnedTrophies.silver +
        title.earnedTrophies.gold +
        title.earnedTrophies.platinum,
      trophiesTotal:
        title.definedTrophies.bronze +
        title.definedTrophies.silver +
        title.definedTrophies.gold +
        title.definedTrophies.platinum,
      hasPlatinum: title.definedTrophies.platinum > 0,
      earnedPlatinum: title.earnedTrophies.platinum > 0,
    }));

    return NextResponse.json({
      gameCount: games.length,
      games,
    });
  } catch (err) {
    console.error('PSN API error:', err);
    return NextResponse.json({ error: 'Failed to fetch PlayStation data' }, { status: 500 });
  }
}
