import { NextRequest, NextResponse } from 'next/server';

// Direct HLTB integration — April 2026
// The howlongtobeat npm packages (both 1.8.0 and howlongtobeat-core 1.1.0)
// are broken. HLTB moved to /api/find with token auth + honeypot fields.
// This implementation talks to HLTB directly using their current API.

const HLTB_BASE = 'https://howlongtobeat.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

// Token cache (5 min TTL)
let tokenCache: { token: string; hpKey: string; hpVal: string; expires: number } | null = null;

// Results cache to avoid hammering HLTB
const cache = new Map<string, { main: number; extra: number; completionist: number }>();

async function getToken(): Promise<{ token: string; hpKey: string; hpVal: string } | null> {
  if (tokenCache && Date.now() < tokenCache.expires) {
    return tokenCache;
  }

  try {
    const res = await fetch(`${HLTB_BASE}/api/find/init?t=${Date.now()}`, {
      headers: { 'User-Agent': UA, 'Referer': HLTB_BASE },
    });

    if (!res.ok) {
      console.warn('HLTB token fetch failed:', res.status);
      return null;
    }

    const data = await res.json();
    tokenCache = {
      token: data.token,
      hpKey: data.hpKey,
      hpVal: data.hpVal,
      expires: Date.now() + 4 * 60 * 1000, // 4 min (conservative)
    };
    return tokenCache;
  } catch (err) {
    console.warn('HLTB token error:', err);
    return null;
  }
}

interface HltbRawGame {
  game_name: string;
  comp_main: number;
  comp_plus: number;
  comp_100: number;
  comp_all: number;
}

async function searchHltb(title: string): Promise<HltbRawGame[] | null> {
  const auth = await getToken();
  if (!auth) return null;

  const body: Record<string, unknown> = {
    searchType: 'games',
    searchTerms: title.split(' ').filter((t) => t.length > 0),
    searchPage: 1,
    size: 5,
    searchOptions: {
      games: {
        userId: 0, platform: '', sortCategory: 'popular', rangeCategory: 'main',
        rangeTime: { min: 0, max: 0 },
        gameplay: { perspective: '', flow: '', genre: '', difficulty: '' },
        rangeYear: { min: '', max: '' }, modifier: '',
      },
      users: { sortCategory: 'postcount' },
      lists: { sortCategory: 'follows' },
      filter: '', sort: 0, randomizer: 0,
    },
    useCache: true,
  };

  // Honeypot: must go in BOTH body AND headers
  if (auth.hpKey) body[auth.hpKey] = auth.hpVal;

  try {
    const res = await fetch(`${HLTB_BASE}/api/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': UA,
        'Referer': HLTB_BASE,
        'Origin': HLTB_BASE,
        'x-auth-token': auth.token,
        'x-hp-key': auth.hpKey,
        'x-hp-val': auth.hpVal,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 403) {
      // Token expired — clear cache and retry once
      tokenCache = null;
      const freshAuth = await getToken();
      if (!freshAuth) return null;

      if (freshAuth.hpKey) body[freshAuth.hpKey] = freshAuth.hpVal;

      const retry = await fetch(`${HLTB_BASE}/api/find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': UA,
          'Referer': HLTB_BASE,
          'Origin': HLTB_BASE,
          'x-auth-token': freshAuth.token,
          'x-hp-key': freshAuth.hpKey,
          'x-hp-val': freshAuth.hpVal,
        },
        body: JSON.stringify(body),
      });

      if (!retry.ok) return null;
      const retryData = await retry.json();
      return retryData.data || null;
    }

    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.warn('HLTB search error for', title, ':', err);
    return null;
  }
}

function secsToHrs(secs: number): number {
  return secs > 0 ? Math.round((secs / 3600) * 10) / 10 : 0;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'single';

  try {
    // Single game lookup
    if (action === 'single') {
      const title = searchParams.get('title');
      if (!title) {
        return NextResponse.json({ error: 'title required' }, { status: 400 });
      }

      const key = title.trim().toLowerCase();
      if (cache.has(key)) {
        return NextResponse.json({ ...cache.get(key), title: title.trim(), cached: true, found: true });
      }

      const results = await searchHltb(title.trim());
      if (!results || results.length === 0) {
        return NextResponse.json({ title: title.trim(), main: 0, extra: 0, completionist: 0, found: false });
      }

      const best = results[0];
      const data = {
        main: secsToHrs(best.comp_main),
        extra: secsToHrs(best.comp_plus),
        completionist: secsToHrs(best.comp_100),
      };

      cache.set(key, data);

      return NextResponse.json({
        title: best.game_name,
        ...data,
        found: true,
      });
    }

    // Batch lookup — get main story hours for multiple games
    if (action === 'batch') {
      const titles = searchParams.get('titles');
      if (!titles) {
        return NextResponse.json({ error: 'titles required (comma-separated)' }, { status: 400 });
      }

      const titleList = titles.split(',').slice(0, 15); // max 15
      const results: { title: string; main: number; found: boolean }[] = [];

      for (const title of titleList) {
        const key = title.trim().toLowerCase();

        if (cache.has(key)) {
          results.push({ title: title.trim(), main: cache.get(key)!.main, found: true });
          continue;
        }

        try {
          const searchResults = await searchHltb(title.trim());
          if (searchResults && searchResults.length > 0) {
            const best = searchResults[0];
            const main = secsToHrs(best.comp_main);
            cache.set(key, {
              main,
              extra: secsToHrs(best.comp_plus),
              completionist: secsToHrs(best.comp_100),
            });
            results.push({ title: best.game_name, main, found: true });
          } else {
            results.push({ title: title.trim(), main: 0, found: false });
          }
          // Be nice to HLTB
          await new Promise((r) => setTimeout(r, 200));
        } catch {
          results.push({ title: title.trim(), main: 0, found: false });
        }
      }

      // Calculate aggregate stats
      const found = results.filter((r) => r.found && r.main > 0);
      const totalHours = found.reduce((sum, r) => sum + r.main, 0);
      const avgHours = found.length > 0 ? totalHours / found.length : 0;

      return NextResponse.json({
        results,
        summary: {
          gamesFound: found.length,
          totalSampled: titleList.length,
          totalHours,
          avgHoursPerGame: Math.round(avgHours * 10) / 10,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('HLTB API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
