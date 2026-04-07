import { Game, MoodTag, PlatformPreference } from './types';
import { isSoftIgnored, getSkipWeightMultiplier } from './skipTracking';
import { getGenreCooldownMultiplier } from './genreCooldown';
import { isNotInterestedIgnored, isHitAWallSuppressed, getAllSkipReasons } from './skipReasons';
import { getBehavioralWeight } from './decisionHistory';

export type RerollMode = 'anything' | 'quick-session' | 'deep-cut' | 'continue' | 'almost-done';

export const REROLL_MODES: { mode: RerollMode; label: string; icon: string; description: string }[] = [
  { mode: 'anything', label: 'Anything', icon: '🎲', description: 'Random from all games' },
  { mode: 'quick-session', label: 'Quick Session', icon: '🌙', description: 'Wind-down tier only' },
  { mode: 'deep-cut', label: 'Deep Cut', icon: '🔥', description: 'A game buried in your backlog you may have forgotten about' },
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
      case 'quick-session':
        return game.timeTier === 'quick-hit' || game.timeTier === 'wind-down';
      case 'deep-cut':
        return game.timeTier === 'deep-cut' || game.timeTier === 'marathon';
      case 'continue':
        return game.status === 'playing';
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

  // Time-of-day contextual reason
  const time = getTimeOfDay();
  const moods = game.moodTags || [];
  if (time === 'late-night' && (moods.includes('chill') || moods.includes('brainless') || game.timeTier === 'quick-hit')) {
    reasons.push({ label: 'Good pick for a late session', icon: '🌙' });
  } else if (time === 'evening' && (moods.includes('chill') || moods.includes('story-rich') || moods.includes('atmospheric'))) {
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

/** Simple random pick (kept for backward compatibility) */
export function pickRandom(games: Game[]): Game | null {
  if (games.length === 0) return null;
  return games[Math.floor(Math.random() * games.length)];
}
