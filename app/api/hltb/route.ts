import { NextRequest, NextResponse } from 'next/server';
import { HowLongToBeatService } from 'howlongtobeat';

const hltb = new HowLongToBeatService();

// NOTE: As of April 2026, HLTB moved from /api/search to /api/find with
// anti-bot fingerprinting (token + IP + UA hash). The howlongtobeat npm
// package (1.8.0) is broken — all searches return 404. Existing cached
// HLTB data in users' localStorage is unaffected. This route now gracefully
// returns found:false instead of 500 until we build a direct integration
// or the npm package is updated.
//
// Simple in-memory cache to avoid hammering HLTB
const cache = new Map<string, { main: number; extra: number; completionist: number }>();

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
        return NextResponse.json({ ...cache.get(key), title: title.trim(), cached: true });
      }

      let results;
      try {
        results = await hltb.search(title.trim());
      } catch (searchErr) {
        console.warn('HLTB search failed for:', title.trim(), searchErr);
        return NextResponse.json({ title: title.trim(), main: 0, extra: 0, completionist: 0, found: false });
      }

      if (!results || results.length === 0) {
        return NextResponse.json({ title: title.trim(), main: 0, extra: 0, completionist: 0, found: false });
      }

      const best = results[0];
      const data = {
        main: best.gameplayMain || 0,
        extra: best.gameplayMainExtra || 0,
        completionist: best.gameplayCompletionist || 0,
      };

      cache.set(key, data);

      return NextResponse.json({
        title: best.name,
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
          const searchResults = await hltb.search(title.trim());
          if (searchResults && searchResults.length > 0) {
            const best = searchResults[0];
            const main = best.gameplayMain || 0;
            cache.set(key, {
              main,
              extra: best.gameplayMainExtra || 0,
              completionist: best.gameplayCompletionist || 0,
            });
            results.push({ title: best.name, main, found: true });
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
