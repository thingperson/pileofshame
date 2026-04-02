import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeNpssoForCode,
  exchangeCodeForAccessToken,
  getUserTitles,
  getPurchasedGames,
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

function sumTrophies(t: { bronze: number; silver: number; gold: number; platinum: number }): number {
  return t.bronze + t.silver + t.gold + t.platinum;
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

    // Step 3+4: Fetch purchased games AND trophy titles in parallel
    const purchasedMap = new Map<string, {
      name: string;
      platform: string;
      imageUrl: string;
      productId: string;
    }>();
    const trophyMap = new Map<string, PSNTitle>();

    const fetchPurchased = async () => {
      let start = 0;
      const size = 100;
      let hasMore = true;

      while (hasMore && start < 2000) {
        const response = await getPurchasedGames(authorization, {
          size,
          start,
          platform: ['ps4', 'ps5'],
          sortBy: 'ACTIVE_DATE',
          sortDirection: 'desc',
        });

        const games = response?.data?.purchasedTitlesRetrieve?.games || [];
        if (games.length === 0) break;

        for (const g of games) {
          const key = g.name.toLowerCase().trim();
          if (!purchasedMap.has(key)) {
            purchasedMap.set(key, {
              name: g.name,
              platform: g.platform || 'PS4/PS5',
              imageUrl: g.image?.url || '',
              productId: g.productId || '',
            });
          }
        }

        start += size;
        if (games.length < size) hasMore = false;
        if (hasMore) await new Promise((r) => setTimeout(r, 300));
      }
    };

    const fetchTrophies = async () => {
      let offset = 0;
      const limit = 100;
      let totalItemCount = Infinity;

      while (offset < totalItemCount && offset < 2000) {
        const response = await getUserTitles(authorization, 'me', { limit, offset });
        totalItemCount = response.totalItemCount;
        for (const t of response.trophyTitles as PSNTitle[]) {
          trophyMap.set(t.trophyTitleName.toLowerCase().trim(), t);
        }
        offset += limit;
        if (offset < totalItemCount) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    };

    // Run both API loops concurrently
    const [purchasedResult, trophyResult] = await Promise.allSettled([fetchPurchased(), fetchTrophies()]);
    if (purchasedResult.status === 'rejected') console.error('getPurchasedGames error:', purchasedResult.reason);
    if (trophyResult.status === 'rejected') console.error('getUserTitles error:', trophyResult.reason);

    // Step 5: Merge — purchased games as base, trophy data layered on top
    const mergedGames = new Map<string, {
      name: string;
      platform: string;
      imageUrl: string;
      lastPlayed: string;
      progress: number;
      trophiesEarned: number;
      trophiesTotal: number;
      hasPlatinum: boolean;
      earnedPlatinum: boolean;
      source: 'purchased' | 'trophy' | 'both';
    }>();

    // Add all purchased games first
    for (const [key, purchased] of purchasedMap) {
      const trophy = trophyMap.get(key);
      mergedGames.set(key, {
        name: purchased.name,
        platform: purchased.platform,
        imageUrl: trophy?.trophyTitleIconUrl || purchased.imageUrl,
        lastPlayed: trophy?.lastUpdatedDateTime || '',
        progress: trophy?.progress || 0,
        trophiesEarned: trophy
          ? sumTrophies(trophy.earnedTrophies)
          : 0,
        trophiesTotal: trophy
          ? sumTrophies(trophy.definedTrophies)
          : 0,
        hasPlatinum: trophy?.definedTrophies.platinum ? trophy.definedTrophies.platinum > 0 : false,
        earnedPlatinum: trophy?.earnedTrophies.platinum ? trophy.earnedTrophies.platinum > 0 : false,
        source: trophy ? 'both' : 'purchased',
      });
    }

    // Add trophy-only games (PS3, Vita, etc. not covered by purchased API)
    for (const [key, trophy] of trophyMap) {
      if (!mergedGames.has(key)) {
        mergedGames.set(key, {
          name: trophy.trophyTitleName,
          platform: trophy.trophyTitlePlatform,
          imageUrl: trophy.trophyTitleIconUrl,
          lastPlayed: trophy.lastUpdatedDateTime,
          progress: trophy.progress,
          trophiesEarned: sumTrophies(trophy.earnedTrophies),
          trophiesTotal: sumTrophies(trophy.definedTrophies),
          hasPlatinum: trophy.definedTrophies.platinum > 0,
          earnedPlatinum: trophy.earnedTrophies.platinum > 0,
          source: 'trophy',
        });
      }
    }

    const games = Array.from(mergedGames.values());

    return NextResponse.json({
      gameCount: games.length,
      purchasedCount: purchasedMap.size,
      trophyCount: trophyMap.size,
      games,
    });
  } catch (err) {
    console.error('PSN API error:', err);
    return NextResponse.json({ error: 'Failed to fetch PlayStation data' }, { status: 500 });
  }
}
