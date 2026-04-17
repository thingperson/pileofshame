import { Game, MoodTag, PlatformPreference } from './types';
import { isSoftIgnored, getSkipWeightMultiplier } from './skipTracking';
import { getGenreCooldownMultiplier } from './genreCooldown';
import { isNotInterestedIgnored, isHitAWallSuppressed, getAllSkipReasons } from './skipReasons';
import { getBehavioralWeight } from './decisionHistory';
import type { SmartPickType } from './smartPickCopy';

export type RerollMode = 'anything' | 'quick-session' | 'deep-cut' | 'continue' | 'almost-done';

export const REROLL_MODES: { mode: RerollMode; label: string; icon: string; description: string }[] = [
  { mode: 'anything', label: 'Anything', icon: '🎲', description: 'Random from all games' },
  { mode: 'quick-session', label: 'Quick Session', icon: '🌙', description: 'A short session you can wrap today' },
  // Deep Cut semantic: a PERSONAL deep cut backed by evidence (real hours played). You lived in
  // this world and stepped away — not a curator's obscure gem pick. Filter reflects that below.
  { mode: 'deep-cut', label: 'Deep Cut', icon: '🔥', description: 'A world you lived in. The hours prove it.' },
  { mode: 'continue', label: 'Keep Playing', icon: '▶', description: 'Games you already started' },
  { mode: 'almost-done', label: 'Almost Done', icon: '🏁', description: 'Games you\'re close to finishing' },
];

// Sources that are PC-compatible (Steam can be Mac too, handled separately)
const PC_SOURCES = new Set(['steam', 'epic', 'gog', 'other']);
const CONSOLE_SOURCES = new Set(['playstation', 'xbox', 'switch']);

function matchesPlatformPreference(game: Game, pref: PlatformPreference): boolean {
  if (pref === 'any') return true;

  if (pref === 'mac') {
    // Mac = Steam games only (most cross-platform). Not perfect, but best we can do without per-game platform data.
    // Users can manually set time tier or vibes to exclude non-Mac games.
    return game.source === 'steam' || game.source === 'gog' || game.source === 'other';
  }

  if (pref === 'pc') {
    return PC_SOURCES.has(game.source);
  }

  if (pref === 'console') {
    return CONSOLE_SOURCES.has(game.source);
  }

  return true;
}

export function getEligibleGames(
  games: Game[],
  mode: RerollMode,
  platformPreference: PlatformPreference = 'any',
  moodFilters: MoodTag[] = [],
): Game[] {
  return games.filter((game) => {
    // Exclude ignored games from all recommendations
    if (game.ignored) return false;

    // Exclude soft-ignored games (5+ skips in decision engine)
    if (isSoftIgnored(game.id)) return false;

    // Exclude games the user said "not interested" to 2+ times
    if (isNotInterestedIgnored(game.id)) return false;

    // Exclude played and bailed from all modes
    if (game.status === 'played' || game.status === 'bailed') return false;

    // Platform preference filter
    if (!matchesPlatformPreference(game, platformPreference)) return false;

    // Mood filter: game must have ALL selected moods
    if (moodFilters.length > 0) {
      const gameMoods = game.moodTags || [];
      if (!moodFilters.every((mood) => gameMoods.includes(mood))) return false;
    }

    switch (mode) {
      case 'anything':
        return true;
      case 'quick-session': {
        // Tier is the primary gate, but cross-check against hltbMain so a 52-hour sim
        // tagged 'wind-down' doesn't leak into "short session today." Drop-in games
        // (isNonFinishable) are exempt — Vampire Survivors and Stardew are legitimately
        // short-session friendly regardless of total length.
        if (game.timeTier !== 'quick-hit' && game.timeTier !== 'wind-down') return false;
        if (game.isNonFinishable) return true;
        if (game.hltbMain && game.hltbMain > 12) return false;
        return true;
      }
      case 'deep-cut': {
        // "Personal deep cut with evidence": you sank real hours into this world and
        // stepped away from it. Not a curator's obscure gem — yours, backed by your own
        // playtime. Threshold: 5+ hours demonstrates genuine engagement (not a trial),
        // and the game must be in a stepped-away state (on-deck or buried, never actively
        // playing and never already cleared/bailed).
        if (game.hoursPlayed < 5) return false;
        if (game.status === 'playing') return false;
        return game.status === 'on-deck' || game.status === 'buried';
      }
      case 'continue': {
        // Resume covers all four Smart Pick buckets: Almost There, Keep Flowing,
        // Forgotten Gem, Unfinished Business. Any game with real hours logged in
        // a non-terminal status is eligible; the Smart Pick classifier picks the
        // highest-priority bucket that has candidates.
        // (played/bailed already excluded above — TS has narrowed status accordingly.)
        if (game.status !== 'playing' && game.status !== 'on-deck' && game.status !== 'buried') return false;
        return game.hoursPlayed >= 1;
      }
      case 'almost-done': {
        if (game.isNonFinishable) return false;
        if (!game.hltbMain || game.hltbMain <= 0 || game.hoursPlayed <= 0) return false;
        const remaining = (game.hltbMain - game.hoursPlayed) / game.hltbMain;
        // Games past the HLTB estimate (remaining < 0) also qualify — they're probably close
        return remaining < 0.20;
      }
      default:
        return true;
    }
  });
}

// ── Energy matching ───────────────────────────────────────────────
// Replaces time-of-day weighting with explicit user energy selection.
// Default energy is still derived from time-of-day, but users can override.

export type EnergyLevel = 'low' | 'medium' | 'high';

export function getDefaultEnergy(): EnergyLevel {
  const hour = new Date().getHours();
  if (hour >= 21 || hour < 6) return 'low';
  if (hour >= 6 && hour < 11) return 'high';
  return 'medium';
}

function getEnergyWeight(game: Game, energy: EnergyLevel): number {
  const moods = game.moodTags || [];
  const tier = game.timeTier;
  let multiplier = 1;

  if (energy === 'low') {
    if (moods.includes('chill')) multiplier *= 1.8;
    if (moods.includes('brainless')) multiplier *= 1.8;
    if (moods.includes('atmospheric')) multiplier *= 1.4;
    if (moods.includes('story-rich')) multiplier *= 1.2;
    if (tier === 'quick-hit') multiplier *= 1.6;
    if (tier === 'wind-down') multiplier *= 1.5;
    if (moods.includes('intense')) multiplier *= 0.4;
    if (moods.includes('competitive')) multiplier *= 0.4;
    if (moods.includes('strategic')) multiplier *= 0.5;
    if (tier === 'marathon') multiplier *= 0.4;
    if (tier === 'deep-cut') multiplier *= 0.6;
  } else if (energy === 'high') {
    if (moods.includes('intense')) multiplier *= 1.8;
    if (moods.includes('competitive')) multiplier *= 1.6;
    if (moods.includes('strategic')) multiplier *= 1.5;
    if (tier === 'deep-cut') multiplier *= 1.3;
    if (tier === 'marathon') multiplier *= 1.2;
    if (moods.includes('brainless')) multiplier *= 0.5;
    if (moods.includes('chill')) multiplier *= 0.6;
    if (tier === 'quick-hit') multiplier *= 0.7;
  } else {
    // Medium — mostly neutral
    if (moods.includes('atmospheric')) multiplier *= 1.3;
    if (moods.includes('story-rich')) multiplier *= 1.3;
    if (moods.includes('creative')) multiplier *= 1.2;
  }

  return Math.max(0.2, Math.min(multiplier, 4.0));
}

// ── Time-of-day (kept for contextual pick reasons only) ──────────

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'late-night';

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 5) return 'late-night';
  if (hour >= 20) return 'evening';
  if (hour >= 12) return 'afternoon';
  return 'morning';
}

// ── Genre balance ──────────────────────────────────────────────────
// Avoid recommending 3 RPGs in a row. Penalize genres that appeared
// in the last few picks.

function getGenreBalanceWeight(game: Game, recentGenres: string[]): number {
  if (recentGenres.length === 0) return 1;
  const gameGenres = (game.genres || []).map(g => g.toLowerCase());
  if (gameGenres.length === 0) return 1;

  // Count how many of this game's genres appeared recently
  const overlap = gameGenres.filter(g => recentGenres.includes(g)).length;

  if (overlap >= 2) return 0.4;  // Heavy genre overlap — strong penalty
  if (overlap === 1) return 0.7; // Some overlap — mild penalty
  return 1.2; // Fresh genre — slight boost
}

/**
 * Calculate a weight for a game based on available signals.
 * Higher weight = more likely to be picked.
 */
function calculateWeight(
  game: Game,
  skippedIds: Set<string>,
  recentPickGenres: string[] = [],
  energy: EnergyLevel = 'medium',
): number {
  let weight = 1;

  // Metacritic score
  if (game.metacritic) {
    if (game.metacritic >= 90) weight *= 3;
    else if (game.metacritic >= 75) weight *= 2;
    else if (game.metacritic < 50) weight *= 0.5;
  }

  // Enrichment completeness: games with more data are better recommendations
  const hasDescription = !!game.description;
  const hasCover = !!game.coverUrl;
  const hasMoods = game.moodTags && game.moodTags.length > 0;
  if (hasDescription && hasCover && hasMoods) {
    weight *= 2;
  } else if (!hasDescription && !hasCover) {
    weight *= 0.5;
  }

  // Backlog age: surface forgotten games
  const daysSinceAdded = (Date.now() - new Date(game.addedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceAdded > 365) weight *= 1.5;
  else if (daysSinceAdded > 180) weight *= 1.3;

  // Hours played: boost started-but-not-deep games, reduce comfort games
  if (game.hoursPlayed > 0 && game.hoursPlayed <= 20) {
    weight *= 1.5; // Started, worth continuing
  } else if (game.hoursPlayed > 50) {
    weight *= 0.5; // Probably a comfort game, deprioritize for discovery
  }

  // Energy matching
  weight *= getEnergyWeight(game, energy);

  // Genre balance: avoid same-genre streaks
  weight *= getGenreBalanceWeight(game, recentPickGenres);

  // Genre cooldown: penalize genres from recent completions (V3)
  weight *= getGenreCooldownMultiplier(game.genres || []);

  // Persistent skip tracking: penalize repeatedly skipped games
  weight *= getSkipWeightMultiplier(game.id);

  // Skip reason: "hit a wall" suppression (recent wall = strong deprioritize)
  if (isHitAWallSuppressed(game.id)) {
    weight *= 0.1;
  }

  // Skip reason: global "too long" signal — user pattern across all games
  // If they keep saying games are too long, deprioritize marathon/deep-cut
  const allReasons = getAllSkipReasons();
  const totalTooLong = Object.values(allReasons).reduce(
    (sum, d) => sum + (d.reasons['too-long'] || 0), 0
  );
  if (totalTooLong >= 6) {
    if (game.timeTier === 'marathon') weight *= 0.5;
    else if (game.timeTier === 'deep-cut') weight *= 0.7;
  } else if (totalTooLong >= 3) {
    if (game.timeTier === 'marathon') weight *= 0.7;
    else if (game.timeTier === 'deep-cut') weight *= 0.85;
  }

  // Behavioral learning (V3 #6)
  weight *= getBehavioralWeight(game);

  // Session skips: strongly deprioritize games skipped this session
  if (skippedIds.has(game.id)) {
    weight *= 0.2;
  }

  // Clamp to reasonable range
  return Math.max(0.1, Math.min(weight, 20));
}

export interface PickReason {
  label: string;
  icon: string;
}

/** Build human-readable reasons why a game was surfaced */
export function getPickReasons(game: Game): PickReason[] {
  const reasons: PickReason[] = [];

  if (game.metacritic && game.metacritic >= 90) {
    reasons.push({ label: `Rated ${game.metacritic} on Metacritic`, icon: '⭐' });
  } else if (game.metacritic && game.metacritic >= 75) {
    reasons.push({ label: `Well-reviewed (${game.metacritic} Metacritic)`, icon: '👍' });
  }

  if (game.hoursPlayed > 0 && game.hoursPlayed <= 20) {
    reasons.push({ label: `You've started this one (${game.hoursPlayed}h in)`, icon: '▶' });
  }

  const daysSinceAdded = (Date.now() - new Date(game.addedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceAdded > 365) {
    reasons.push({ label: `In your pile for ${Math.round(daysSinceAdded / 365)}+ year${Math.round(daysSinceAdded / 365) > 1 ? 's' : ''}`, icon: '📅' });
  } else if (daysSinceAdded > 180) {
    reasons.push({ label: 'Been in your pile a while', icon: '📅' });
  }

  if (game.hltbMain && game.hltbMain <= 8) {
    reasons.push({ label: `Beatable in ~${game.hltbMain}h`, icon: '⏱️' });
  }

  // Time-of-day contextual reason.
  // Guard: never surface a "wind-down" framing if the game's own mood tags
  // contradict it (intense / competitive / hot). A short intense game is fine,
  // but calling it a wind-down is the trust-breaking contradiction.
  const time = getTimeOfDay();
  const moods = game.moodTags || [];
  const isHighEnergy = moods.includes('intense') || moods.includes('competitive');
  if (time === 'late-night' && !isHighEnergy && (moods.includes('chill') || moods.includes('brainless') || game.timeTier === 'quick-hit')) {
    reasons.push({ label: 'Good pick for a late session', icon: '🌙' });
  } else if (time === 'evening' && !isHighEnergy && (moods.includes('chill') || moods.includes('story-rich') || moods.includes('atmospheric'))) {
    reasons.push({ label: 'Fits an evening wind-down', icon: '🌆' });
  }

  if (game.moodTags && game.moodTags.length > 0 && reasons.length < 3) {
    reasons.push({ label: `Mood: ${game.moodTags.slice(0, 2).join(', ')}`, icon: '🎭' });
  }

  return reasons.slice(0, 3);
}

/**
 * Weighted random selection. Games with higher signals (metacritic, enrichment,
 * backlog age, time-of-day, genre balance) are more likely to be picked.
 * Skipped games are deprioritized.
 */
export function pickWeighted(
  games: Game[],
  skippedIds: Set<string> = new Set(),
  recentPicks: Game[] = [],
  energy?: EnergyLevel,
): Game | null {
  if (games.length === 0) return null;

  const resolvedEnergy = energy || getDefaultEnergy();

  // Collect genres from recent picks for balance scoring
  const recentGenres = recentPicks
    .flatMap(g => (g.genres || []).map(genre => genre.toLowerCase()));

  const weighted = games.map((game) => ({
    game,
    weight: calculateWeight(game, skippedIds, recentGenres, resolvedEnergy),
  }));

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return w.game;
  }

  return weighted[weighted.length - 1].game;
}

// ── Smart Pick classifier (Resume mode) ──────────────────────────
// Priority chain: first match wins. Returns null for games that don't
// belong in any Resume bucket.
//
// Steam positive % + review count are not on the Game type yet (see
// docs/session-resume-2026-04-17.md "known gotchas"), so Forgotten Gem
// gating falls back to Metacritic >= 85. When Steam review enrichment
// lands on the Game type, extend the Forgotten Gem check here.

export function classifySmartPick(game: Game): SmartPickType | null {
  const { status, hoursPlayed, hltbMain, metacritic } = game;

  if (
    hltbMain && hltbMain > 0 &&
    hoursPlayed / hltbMain >= 0.75 &&
    (status === 'playing' || status === 'on-deck')
  ) {
    return 'almost-there';
  }

  if (status === 'playing' && hoursPlayed >= 1) {
    return 'keep-flowing';
  }

  if (
    (status === 'on-deck' || status === 'buried') &&
    hoursPlayed >= 5 &&
    metacritic != null && metacritic >= 85
  ) {
    return 'forgotten-gem';
  }

  if ((status === 'on-deck' || status === 'buried') && hoursPlayed >= 5) {
    return 'unfinished-business';
  }

  return null;
}

const SMART_PICK_PRIORITY: SmartPickType[] = [
  'almost-there',
  'keep-flowing',
  'forgotten-gem',
  'unfinished-business',
];

/**
 * Pick a Resume game using the Smart Pick priority chain. Groups eligible
 * games into the four Smart Pick buckets and picks from the highest-priority
 * non-empty bucket via `pickWeighted`. Returns the picked game and its
 * sub-type so the UI can render the correct pill + headline.
 *
 * Falls back to plain `pickWeighted` across all games if no candidate
 * classifies — shouldn't happen when called with proper Resume eligibles,
 * but guards against edge cases (e.g. hoursPlayed rounding).
 */
export function pickSmartResume(
  games: Game[],
  skippedIds: Set<string> = new Set(),
  recentPicks: Game[] = [],
  energy?: EnergyLevel,
): { game: Game; smartPickType: SmartPickType } | null {
  if (games.length === 0) return null;

  const buckets: Record<SmartPickType, Game[]> = {
    'almost-there': [],
    'keep-flowing': [],
    'forgotten-gem': [],
    'unfinished-business': [],
  };

  for (const game of games) {
    const type = classifySmartPick(game);
    if (type) buckets[type].push(game);
  }

  for (const type of SMART_PICK_PRIORITY) {
    if (buckets[type].length > 0) {
      const game = pickWeighted(buckets[type], skippedIds, recentPicks, energy);
      if (game) return { game, smartPickType: type };
    }
  }

  const fallback = pickWeighted(games, skippedIds, recentPicks, energy);
  return fallback ? { game: fallback, smartPickType: 'unfinished-business' } : null;
}

/** Simple random pick (kept for backward compatibility) */
export function pickRandom(games: Game[]): Game | null {
  if (games.length === 0) return null;
  return games[Math.floor(Math.random() * games.length)];
}
