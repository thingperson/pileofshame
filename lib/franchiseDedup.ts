import type { Game } from './types';

/**
 * Annual franchise detection. Games in these franchises are "superseded" by
 * newer entries — if the user owns FIFA 23 AND FIFA 24, only 24 is eligible.
 *
 * This does NOT apply to franchises where each entry is a distinct experience
 * (Dark Souls, Civilization, Final Fantasy, Zelda, etc.). Those are all valid
 * picks regardless of how many the user owns.
 */

interface FranchisePattern {
  key: string;
  match: (title: string) => boolean;
  extractYear: (title: string, releaseYear?: number) => number;
}

const ANNUAL_FRANCHISES: FranchisePattern[] = [
  // Sports
  {
    key: 'fifa',
    match: (t) => /\b(fifa|ea\s*(sports\s*)?fc)\b/i.test(t),
    extractYear: yearFromTitleOrRelease(/\b(\d{2,4})\b/),
  },
  {
    key: 'madden',
    match: (t) => /\bmadden\s*(nfl\s*)?\d/i.test(t),
    extractYear: yearFromTitleOrRelease(/\b(\d{2,4})\b/),
  },
  {
    key: 'nhl',
    match: (t) => /\bnhl\s*\d/i.test(t),
    extractYear: yearFromTitleOrRelease(/\b(\d{2,4})\b/),
  },
  {
    key: 'nba2k',
    match: (t) => /\bnba\s*2k/i.test(t),
    extractYear: yearFromTitleOrRelease(/2k\s*(\d{2,4})/i),
  },
  {
    key: 'mlb',
    match: (t) => /\bmlb\s*the\s*show\b/i.test(t),
    extractYear: yearFromTitleOrRelease(/\b(\d{2,4})\b/),
  },
  {
    key: 'wwe2k',
    match: (t) => /\bwwe\s*2k/i.test(t),
    extractYear: yearFromTitleOrRelease(/2k\s*(\d{2,4})/i),
  },
  {
    key: 'pes',
    match: (t) => /\b(pes|efootball|pro\s*evolution\s*soccer)\b/i.test(t),
    extractYear: yearFromTitleOrRelease(/\b(\d{4})\b/),
  },

  // Racing (annualized)
  {
    key: 'f1',
    match: (t) => /\bf1\s*\d{4}\b/i.test(t),
    extractYear: yearFromTitleOrRelease(/\b(\d{4})\b/),
  },
  {
    key: 'gran-turismo',
    match: (t) => /\bgran\s*turismo\s*\d/i.test(t) && !/\bgran\s*turismo\s*(sport|4|3|2|1)\b/i.test(t),
    extractYear: yearFromTitleOrRelease(/\b(\d{1,4})\b/),
  },

  // Management sims
  {
    key: 'football-manager',
    match: (t) => /\bfootball\s*manager\b/i.test(t),
    extractYear: yearFromTitleOrRelease(/\b(\d{4})\b/),
  },

  // Shooters where MP replaced the predecessor
  {
    key: 'cs',
    match: (t) => /\b(counter[\s-]*strike|cs\s*2|cs\s*:?\s*go)\b/i.test(t),
    extractYear: (_t, ry) => ry || 0,
  },
];

function yearFromTitleOrRelease(pattern: RegExp) {
  return (title: string, releaseYear?: number): number => {
    const m = title.match(pattern);
    if (m) {
      const n = parseInt(m[1]);
      return n < 100 ? n + 2000 : n;
    }
    return releaseYear || 0;
  };
}

/**
 * Returns the set of game IDs that are superseded by a newer entry in the
 * same annual franchise. Only affects the user's own library — if they own
 * NHL 22 and NHL 24, NHL 22's ID is in the returned set.
 */
export function getSupersededGameIds(games: Game[]): Set<string> {
  const groups = new Map<string, { game: Game; year: number }[]>();

  for (const game of games) {
    for (const franchise of ANNUAL_FRANCHISES) {
      if (franchise.match(game.name)) {
        const year = franchise.extractYear(game.name, game.releaseYear);
        if (!groups.has(franchise.key)) groups.set(franchise.key, []);
        groups.get(franchise.key)!.push({ game, year });
        break;
      }
    }
  }

  const superseded = new Set<string>();

  for (const [, entries] of groups) {
    if (entries.length <= 1) continue;
    entries.sort((a, b) => b.year - a.year);
    for (let i = 1; i < entries.length; i++) {
      superseded.add(entries[i].game.id);
    }
  }

  return superseded;
}
