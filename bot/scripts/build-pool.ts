#!/usr/bin/env tsx
/**
 * build-pool.ts — Fetch games from RAWG + HLTB to build the Pip pick pool.
 *
 * Usage:
 *   RAWG_API_KEY=xxx npx tsx bot/scripts/build-pool.ts
 *   RAWG_API_KEY=xxx npx tsx bot/scripts/build-pool.ts --rawg-only
 *
 * Outputs: bot/data/pick-pool-draft.json
 * Preserves existing entries from pick-pool.json (hand-crafted blurbs stay).
 * New entries get empty blurbs — fill those in before promoting to pick-pool.json.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXISTING_POOL_PATH = join(__dirname, '..', 'data', 'pick-pool.json');
const OUTPUT_PATH = join(__dirname, '..', 'data', 'pick-pool-draft.json');

const RAWG_KEY = process.env.RAWG_API_KEY;
if (!RAWG_KEY) {
  console.error('RAWG_API_KEY env var required');
  process.exit(1);
}

const RAWG_ONLY = process.argv.includes('--rawg-only');
const TARGET_NEW = 280;
const HLTB_DELAY_MS = 2100;
const HLTB_BASE = 'https://howlongtobeat.com';
const HLTB_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

// ── Types ──

interface PoolEntry {
  title: string;
  lengthHours: number;
  moods: string[];
  blurb: string;
}

interface RawgGame {
  id: number;
  name: string;
  metacritic: number | null;
  genres: { name: string }[];
  tags: { name: string }[] | null;
}

// ── Mood mapping ──

const GENRE_MOODS: Record<string, string[]> = {
  Action: ['intense'],
  Adventure: ['story-rich', 'atmospheric'],
  RPG: ['story-rich', 'strategic'],
  Strategy: ['strategic'],
  Puzzle: ['brain-off', 'chill'],
  Platformer: ['intense'],
  Shooter: ['intense'],
  Simulation: ['chill', 'creative'],
  Casual: ['brain-off', 'chill'],
  Indie: ['atmospheric'],
  Arcade: ['brain-off', 'intense'],
  Racing: ['brain-off'],
  Fighting: ['intense'],
};

const TAG_MOODS: Record<string, string[]> = {
  Horror: ['spooky', 'atmospheric'],
  Survival: ['intense', 'atmospheric'],
  Sandbox: ['creative', 'chill'],
  Stealth: ['strategic', 'atmospheric'],
  Roguelike: ['intense', 'strategic'],
  Roguelite: ['intense'],
  'Souls-like': ['intense'],
  'Walking Simulator': ['atmospheric', 'emotional', 'chill'],
  Narrative: ['story-rich', 'emotional'],
  Exploration: ['atmospheric', 'chill'],
  Relaxing: ['chill', 'brain-off'],
  Atmospheric: ['atmospheric'],
  Emotional: ['emotional', 'story-rich'],
  'Story Rich': ['story-rich'],
  Metroidvania: ['atmospheric', 'intense'],
  'City Builder': ['creative', 'strategic'],
  'Tower Defense': ['strategic'],
  'Hack and Slash': ['intense', 'brain-off'],
  'Visual Novel': ['story-rich', 'emotional'],
  'Point-and-click': ['story-rich', 'chill'],
  Cozy: ['chill'],
  Dark: ['atmospheric', 'spooky'],
  Mystery: ['story-rich', 'atmospheric'],
  'Psychological Horror': ['spooky', 'emotional'],
  'Survival Horror': ['spooky', 'intense'],
  'Turn-Based': ['strategic'],
  'Open World': ['atmospheric'],
};

function inferMoods(genres: string[], tags: string[]): string[] {
  const moods = new Set<string>();
  for (const g of genres) for (const m of GENRE_MOODS[g] ?? []) moods.add(m);
  for (const t of tags) for (const m of TAG_MOODS[t] ?? []) moods.add(m);
  if (moods.size === 0) moods.add('atmospheric');
  return [...moods].slice(0, 3);
}

// ── RAWG ──

async function rawgPage(
  page: number,
  extra: Record<string, string> = {},
): Promise<RawgGame[]> {
  const url = new URL('https://api.rawg.io/api/games');
  url.searchParams.set('key', RAWG_KEY!);
  url.searchParams.set('metacritic', '75,100');
  url.searchParams.set('ordering', '-metacritic');
  url.searchParams.set('page_size', '40');
  url.searchParams.set('page', String(page));
  url.searchParams.set('dates', '1990-01-01,2026-12-31');
  for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`RAWG ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { results: RawgGame[] };
  return data.results;
}

async function fetchAllRawg(existingTitles: Set<string>): Promise<RawgGame[]> {
  const all: RawgGame[] = [];
  const seen = new Set<string>();

  const addUnique = (games: RawgGame[]) => {
    for (const g of games) {
      const key = g.name.toLowerCase().trim();
      if (!seen.has(key) && !existingTitles.has(key)) {
        seen.add(key);
        all.push(g);
      }
    }
  };

  // Broad sweep: top metacritic across all genres
  for (let p = 1; p <= 10 && all.length < TARGET_NEW; p++) {
    process.stdout.write(`\rRAWG: page ${p} … ${all.length} unique so far`);
    addUnique(await rawgPage(p));
    await sleep(350);
  }

  // Indie-specific sweep for hidden gems
  for (let p = 1; p <= 3 && all.length < TARGET_NEW + 40; p++) {
    process.stdout.write(`\rRAWG indie: page ${p} … ${all.length} unique`);
    addUnique(await rawgPage(p, { genres: '51' }));
    await sleep(350);
  }

  // Puzzle/strategy sweep (often underrepresented in top metacritic)
  for (let p = 1; p <= 2 && all.length < TARGET_NEW + 60; p++) {
    process.stdout.write(`\rRAWG puzzle+strategy: page ${p} … ${all.length} unique`);
    addUnique(await rawgPage(p, { genres: '7,10' }));
    await sleep(350);
  }

  console.log(`\nRAWG done: ${all.length} unique candidates`);
  return all;
}

// ── HLTB ──

let hltbAuth: { token: string; hpKey: string; hpVal: string; exp: number } | null = null;

async function getAuth() {
  if (hltbAuth && Date.now() < hltbAuth.exp) return hltbAuth;
  const res = await fetch(`${HLTB_BASE}/api/find/init?t=${Date.now()}`, {
    headers: { 'User-Agent': HLTB_UA, Referer: HLTB_BASE },
  });
  if (!res.ok) throw new Error(`HLTB init ${res.status}`);
  const d = (await res.json()) as { token: string; hpKey: string; hpVal: string };
  hltbAuth = { ...d, exp: Date.now() + 4 * 60_000 };
  return hltbAuth;
}

async function hltbLookup(title: string, retried = false): Promise<number> {
  const auth = await getAuth();
  const terms = title.split(/\s+/).filter(Boolean);

  const body: Record<string, unknown> = {
    searchType: 'games',
    searchTerms: terms,
    searchPage: 1,
    size: 5,
    searchOptions: {
      games: {
        userId: 0,
        platform: '',
        sortCategory: 'popular',
        rangeCategory: 'main',
        rangeTime: { min: 0, max: 0 },
        gameplay: { perspective: '', flow: '', genre: '', difficulty: '' },
        rangeYear: { min: '', max: '' },
        modifier: '',
      },
      users: { sortCategory: 'postcount' },
      lists: { sortCategory: 'follows' },
      filter: '',
      sort: 0,
      randomizer: 0,
    },
    useCache: true,
  };
  if (auth.hpKey) body[auth.hpKey] = auth.hpVal;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': HLTB_UA,
    Referer: HLTB_BASE,
    Origin: HLTB_BASE,
  };
  if (auth.token) headers['x-auth-token'] = auth.token;
  if (auth.hpKey) {
    headers['x-hp-key'] = auth.hpKey;
    headers['x-hp-val'] = auth.hpVal;
  }

  try {
    const res = await fetch(`${HLTB_BASE}/api/find`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (res.status === 403 && !retried) {
      hltbAuth = null;
      return hltbLookup(title, true);
    }
    if (!res.ok) return 0;

    const data = (await res.json()) as { data: { comp_main: number; comp_plus: number; comp_100: number }[] };
    if (!data.data?.length) return 0;

    const secs = data.data[0].comp_main || data.data[0].comp_plus || 0;
    return secs > 0 ? Math.round((secs / 3600) * 10) / 10 : 0;
  } catch {
    return 0;
  }
}

// ── Exclusions ──

const EXCLUDE_GENRES = new Set(['Massively Multiplayer']);
const EXCLUDE_TAGS = new Set(['MMORPG', 'Battle Royale']);

function shouldSkip(g: RawgGame): boolean {
  if (g.genres.some((x) => EXCLUDE_GENRES.has(x.name))) return true;
  if (g.tags?.some((x) => EXCLUDE_TAGS.has(x.name))) return true;
  return false;
}

// ── Util ──

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ── Main ──

async function main() {
  let existing: PoolEntry[] = [];
  try {
    existing = JSON.parse(readFileSync(EXISTING_POOL_PATH, 'utf-8'));
    console.log(`Existing pool: ${existing.length} entries (preserved)`);
  } catch {
    console.log('No existing pool found');
  }
  const existingTitles = new Set(existing.map((e) => e.title.toLowerCase().trim()));

  const rawg = await fetchAllRawg(existingTitles);
  const candidates = rawg.filter((g) => !shouldSkip(g)).slice(0, TARGET_NEW);
  console.log(`Candidates after filtering: ${candidates.length}`);

  const newEntries: PoolEntry[] = [];

  if (RAWG_ONLY) {
    for (const g of candidates) {
      newEntries.push({
        title: g.name,
        lengthHours: 0,
        moods: inferMoods(
          g.genres.map((x) => x.name),
          (g.tags ?? []).map((x) => x.name),
        ),
        blurb: '',
      });
    }
  } else {
    for (let i = 0; i < candidates.length; i++) {
      const g = candidates[i];
      process.stdout.write(`\rHLTB [${i + 1}/${candidates.length}]: ${g.name.slice(0, 40).padEnd(40)}`);
      const hrs = await hltbLookup(g.name);
      newEntries.push({
        title: g.name,
        lengthHours: hrs || 15,
        moods: inferMoods(
          g.genres.map((x) => x.name),
          (g.tags ?? []).map((x) => x.name),
        ),
        blurb: '',
      });
      await sleep(HLTB_DELAY_MS);
    }
    console.log();
  }

  const pool = [...existing, ...newEntries];
  writeFileSync(OUTPUT_PATH, JSON.stringify(pool, null, 2));
  console.log(`\nPool written: ${pool.length} total (${existing.length} existing + ${newEntries.length} new)`);
  console.log(`Output: ${OUTPUT_PATH}`);

  const empty = pool.filter((e) => !e.blurb).length;
  if (empty > 0) console.log(`${empty} entries still need blurbs`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
