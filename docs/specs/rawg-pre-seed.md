# Spec: RAWG Metadata Pre-Seeding

**Status:** Specced, not built  
**Priority:** Medium — reduces RAWG API pressure on free tier, improves first-import UX  
**Created:** 2026-05-15  

---

## Problem

Every new user import triggers RAWG API calls per-game. The enrichment pipeline in `lib/enrichGame.ts` does this:

1. If the game has no `rawgSlug`, search RAWG by name (`/api/rawg?search=...`) — 1 API call
2. If the search returns a result without a description, follow up with a slug fetch (`/api/rawg?slug=...`) — 2nd API call
3. Each call hits RAWG's free tier (20k requests/month)

A user importing 300 Steam games with no cache hits = 300–600 RAWG calls. Ten users doing that in a month = 3,000–6,000 calls, which is 15–30% of the monthly budget on just import enrichment.

The Supabase `game_metadata` table already caches RAWG responses (L2 cache), but it starts empty. The first user to import a given game always pays the API cost.

## Solution

Pre-seed the `game_metadata` table with the top ~500 most-owned/popular Steam games. These overlap heavily with what users actually import. A pre-seeded cache means most first-import games hit Supabase instead of RAWG.

## Where to get the top 500 list

RAWG's `/api/games` endpoint supports ordering and filtering. The best approach:

```
GET https://api.rawg.io/api/games?key={KEY}&ordering=-added&page_size=40&platforms=4&page={N}
```

- `ordering=-added` — sorted by how many RAWG users added the game (proxy for ownership/popularity)
- `platforms=4` — PC/Steam platform ID (our primary import source)
- `page_size=40` — max per page
- Pages 1–13 = 520 games (overshoot to account for duplicates/skips)

Alternative considered: `ordering=-rating` (biased toward niche well-reviewed games, not what users actually own). `-added` is the better proxy for "games our users are likely to have."

RAWG also has a `stores` filter (`stores=1` for Steam specifically), but `platforms=4` is broader and catches games that are on Steam but might have store metadata gaps.

## What data to cache

Must match the `game_metadata` table schema exactly (from `002_game_metadata_cache.sql`):

| Column | Source from RAWG response | Notes |
|--------|--------------------------|-------|
| `slug` | `game.slug` | PK — this is what `enrichGame.ts` looks up by |
| `name` | `game.name` | |
| `cover_url` | `game.background_image` | |
| `metacritic` | `game.metacritic` | Nullable — many games lack scores |
| `genres` | `game.genres[].name` | Array of strings |
| `platforms` | `game.platforms[].platform.name` | Array of strings |
| `released` | `game.released` | Date string e.g. "2020-11-19" |
| `rating` | `game.rating` | RAWG community rating (0-5 scale) |
| `description` | `game.description_raw` (cleaned) | Truncated to 300 chars, HTML stripped |
| `tags` | `game.tags[].name` (first 10) | Array of strings |
| `hltb_main` | null | Not populated by this script — HLTB is a separate pipeline |
| `hltb_extra` | null | |
| `hltb_completionist` | null | |

The RAWG list endpoint (`/api/games`) returns all of these fields inline — no per-game follow-up fetch is needed. This is a key efficiency win: 13 API calls total for 520 games, not 520.

**Exception:** The list endpoint returns `short_screenshots` and basic metadata but does NOT include `description_raw`. The description field requires a per-game detail fetch (`/api/games/{slug}`). Two options:

1. **Skip descriptions in pre-seed** — the enrichment pipeline will backfill descriptions on first user lookup (one API call per game, but cached after that). Saves 520 API calls during seeding.
2. **Fetch descriptions too** — 13 list calls + 520 detail calls = 533 total. Gets full cache coverage but costs 2.7% of monthly budget.

**Recommendation:** Option 2 (fetch descriptions). The whole point is to avoid per-user API calls. A game with no description in the cache still triggers a RAWG call when a user imports it (see `enrichGame.ts` line 90: `if (!game.description || ...)`). Pre-seeding without descriptions defeats half the purpose.

## Rate limiting math

RAWG allows ~5 requests/second on the free tier (undocumented but observed). Being conservative:

- **1 request per second** (safe margin)
- 13 list requests + 520 detail requests = **533 total requests**
- At 1 req/s = **~9 minutes**
- At 2 req/s (still conservative) = **~4.5 minutes**

Monthly budget impact: 533 out of 20,000 = **2.7%**. Run once, then only re-run monthly or when you want to refresh. Acceptable.

## Script location and execution

- **Location:** `scripts/rawg-pre-seed.ts`
- **Runtime:** `npx tsx scripts/rawg-pre-seed.ts` (tsx is already usable via npx; no new dep needed)
- **Environment:** Requires `RAWG_API_KEY` and Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) — same env vars the app already uses. Load from `.env.local`.
- **When to run:** Once to bootstrap, then optionally monthly to pick up new popular releases.
- **Where to run:** Locally (Brady's machine) or any environment with the env vars. Not a deployed endpoint — this is an offline maintenance script.

## Idempotency

The script uses Supabase `upsert` with `onConflict: 'slug'` — same pattern as `saveToSupabase()` in `app/api/rawg/route.ts` line 64. Safe to re-run. Existing rows get updated timestamps and refreshed metadata; no duplicates.

## Draft script

```typescript
/**
 * RAWG Pre-Seed Script
 *
 * Pre-populates the Supabase game_metadata cache with the top ~500
 * most-popular PC games from RAWG. Reduces API pressure on the free tier
 * by ensuring common imports hit the cache instead of the live API.
 *
 * Usage:
 *   npx tsx scripts/rawg-pre-seed.ts
 *
 * Requires .env.local with:
 *   RAWG_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TARGET_GAMES = 500;
const PAGE_SIZE = 40; // RAWG max
const PAGES_NEEDED = Math.ceil(TARGET_GAMES / PAGE_SIZE); // 13
const DELAY_MS = 1000; // 1 req/s — conservative rate limit
const DETAIL_DELAY_MS = 600; // slightly faster for detail fetches
const DESC_MAX_LENGTH = 300;

// ---------------------------------------------------------------------------
// Load env from .env.local (lightweight, no dotenv dependency)
// ---------------------------------------------------------------------------

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local might not exist if env vars are set another way
  }
}

loadEnv();

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!RAWG_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing required env vars. Need: RAWG_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RawgListGame {
  slug: string;
  name: string;
  background_image: string | null;
  metacritic: number | null;
  genres: { name: string }[];
  platforms: { platform: { name: string } }[] | null;
  released: string | null;
  rating: number | null;
  tags: { name: string }[];
}

interface GameMetadataRow {
  slug: string;
  name: string;
  cover_url: string | null;
  metacritic: number | null;
  genres: string[];
  platforms: string[];
  released: string | null;
  rating: number | null;
  description: string | null;
  tags: string[];
  hltb_main: number | null;
  hltb_extra: number | null;
  hltb_completionist: number | null;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function cleanDescription(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/<[^>]*>/g, '').trim();
  if (cleaned.length <= DESC_MAX_LENGTH) return cleaned;
  return cleaned.slice(0, DESC_MAX_LENGTH - 3).replace(/\s+\S*$/, '') + '...';
}

// ---------------------------------------------------------------------------
// Step 1: Fetch the top N games from the RAWG list endpoint
// ---------------------------------------------------------------------------

async function fetchGameList(): Promise<RawgListGame[]> {
  const games: RawgListGame[] = [];
  const seen = new Set<string>();

  console.log(`\nFetching top ${TARGET_GAMES} PC games from RAWG (${PAGES_NEEDED} pages)...\n`);

  for (let page = 1; page <= PAGES_NEEDED; page++) {
    const url = new URL('https://api.rawg.io/api/games');
    url.searchParams.set('key', RAWG_API_KEY!);
    url.searchParams.set('ordering', '-added');
    url.searchParams.set('platforms', '4'); // PC
    url.searchParams.set('page_size', String(PAGE_SIZE));
    url.searchParams.set('page', String(page));

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`  Page ${page} failed: ${res.status} ${res.statusText}`);
      // Try to continue with what we have
      break;
    }

    const data = await res.json();
    const results: RawgListGame[] = data.results || [];

    for (const game of results) {
      if (!seen.has(game.slug)) {
        seen.add(game.slug);
        games.push(game);
      }
    }

    console.log(`  Page ${page}/${PAGES_NEEDED}: ${results.length} games (${games.length} total unique)`);

    if (!data.next) {
      console.log('  No more pages.');
      break;
    }

    await sleep(DELAY_MS);
  }

  // Trim to target count
  return games.slice(0, TARGET_GAMES);
}

// ---------------------------------------------------------------------------
// Step 2: Fetch full details (description) for each game
// ---------------------------------------------------------------------------

async function fetchGameDetail(slug: string): Promise<string | null> {
  const url = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${RAWG_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  return cleanDescription(data.description_raw || data.description);
}

// ---------------------------------------------------------------------------
// Step 3: Upsert into Supabase
// ---------------------------------------------------------------------------

async function upsertBatch(rows: GameMetadataRow[]): Promise<number> {
  // Supabase upsert in chunks of 50 to stay under payload limits
  let upserted = 0;
  const CHUNK = 50;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from('game_metadata')
      .upsert(chunk, { onConflict: 'slug' });

    if (error) {
      console.error(`  Upsert error (chunk ${Math.floor(i / CHUNK) + 1}):`, error.message);
    } else {
      upserted += chunk.length;
    }
  }

  return upserted;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const startTime = Date.now();
  console.log('=== RAWG Pre-Seed Script ===');
  console.log(`Target: ${TARGET_GAMES} games\n`);

  // Step 1: Get the game list
  const games = await fetchGameList();
  console.log(`\nGot ${games.length} unique games from list endpoint.\n`);

  if (games.length === 0) {
    console.error('No games fetched. Check your RAWG_API_KEY.');
    process.exit(1);
  }

  // Step 2: Fetch descriptions for each game
  console.log('Fetching descriptions (this takes ~5-8 minutes)...\n');
  const rows: GameMetadataRow[] = [];
  let descFetched = 0;
  let descFailed = 0;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];

    // Fetch full description
    const description = await fetchGameDetail(game.slug);
    if (description) {
      descFetched++;
    } else {
      descFailed++;
    }

    rows.push({
      slug: game.slug,
      name: game.name,
      cover_url: game.background_image,
      metacritic: game.metacritic,
      genres: game.genres?.map((g) => g.name) || [],
      platforms: game.platforms?.map((p) => p.platform.name) || [],
      released: game.released,
      rating: game.rating,
      description,
      tags: (game.tags || []).slice(0, 10).map((t) => t.name),
      hltb_main: null,
      hltb_extra: null,
      hltb_completionist: null,
      updated_at: new Date().toISOString(),
    });

    // Progress log every 25 games
    if ((i + 1) % 25 === 0 || i === games.length - 1) {
      console.log(`  ${i + 1}/${games.length} details fetched (${descFetched} descriptions, ${descFailed} failed)`);
    }

    await sleep(DETAIL_DELAY_MS);
  }

  // Step 3: Upsert to Supabase
  console.log(`\nUpserting ${rows.length} games to Supabase...`);
  const upserted = await upsertBatch(rows);

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`
=== Done ===
Games fetched:       ${games.length}
Descriptions found:  ${descFetched}
Descriptions failed: ${descFailed}
Rows upserted:       ${upserted}
RAWG API calls used: ${PAGES_NEEDED + games.length} (${PAGES_NEEDED} list + ${games.length} detail)
Time elapsed:        ${elapsed}s
Monthly budget used: ${((PAGES_NEEDED + games.length) / 20000 * 100).toFixed(1)}%
`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
```

## What the script does NOT do

- **HLTB data** — the `hltb_main/extra/completionist` columns are left null. HLTB has its own scraping pipeline with token auth, and pre-seeding 500 HLTB lookups would be slow and fragile (their honeypot auth rotates). The enrichment pipeline in `enrichGame.ts` already handles HLTB lazily on demand. If we want to pre-seed HLTB too, that's a separate script.
- **Client-side cache** — this only seeds Supabase (L2). The in-memory L1 cache in the RAWG route handler populates naturally on first request.
- **Non-PC games** — the query filters to `platforms=4` (PC). Users importing PS/Xbox libraries may not get cache hits from this seed. A follow-up could add console-specific seeding, but PC/Steam is the primary import source.

## What the enrichment pipeline does with a cache hit

When `enrichGame.ts` runs for an imported game:

1. It calls `/api/rawg?search={name}` (or `?slug={slug}` if rawgSlug is set)
2. The RAWG route handler checks L1 (in-memory) then L2 (Supabase)
3. If the game is in `game_metadata` (pre-seeded), it returns the cached data — **zero RAWG API calls**
4. The client gets cover_url, genres, metacritic, description, etc. instantly

The slug-based lookup path is the most efficient. Currently, imported games don't have `rawgSlug` set, so they go through the search path first. A future optimization would be to match Steam app IDs or game names to RAWG slugs during import, but that's out of scope here.

## Re-run strategy

- **Monthly refresh:** Run the script once a month to pick up newly popular games. The upsert is idempotent, so existing rows just get an updated `updated_at` timestamp.
- **Expanding coverage:** Change `TARGET_GAMES` to 1000 if the budget allows (would use ~5% of monthly quota).
- **Stale data:** Game metadata rarely changes in ways that matter (genres, platforms, descriptions are stable). Metacritic scores and ratings can shift early in a game's life, so monthly refresh covers that.

## Open questions

1. **Should we also seed by RAWG's "most popular on Steam" specifically?** The `stores=1` filter could narrow to Steam-listed games. Current approach uses `platforms=4` which is broader.
2. **Want a `--dry-run` flag?** Would be easy to add — skip the Supabase upsert and just print what would be seeded.
3. **npm script?** Could add `"seed:rawg": "npx tsx scripts/rawg-pre-seed.ts"` to package.json for convenience.
