import { Game, MoodTag, PlatformPreference } from './types';

export type RerollMode = 'anything' | 'quick-session' | 'deep-cut' | 'continue';

export const REROLL_MODES: { mode: RerollMode; label: string; icon: string; description: string }[] = [
  { mode: 'anything', label: 'Anything', icon: '🎲', description: 'Random from all games' },
  { mode: 'quick-session', label: 'Quick Session', icon: '🌙', description: 'Wind-down tier only' },
  { mode: 'deep-cut', label: 'Deep Cut', icon: '🔥', description: 'Deep-cut tier only' },
  { mode: 'continue', label: 'Keep Playing', icon: '▶', description: 'Games you already started' },
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
      default:
        return true;
    }
  });
}

/**
 * Calculate a weight for a game based on available signals.
 * Higher weight = more likely to be picked.
 */
function calculateWeight(game: Game, skippedIds: Set<string>): number {
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

  // Recently skipped: strongly deprioritize
  if (skippedIds.has(game.id)) {
    weight *= 0.2;
  }

  // Clamp to reasonable range
  return Math.max(0.1, Math.min(weight, 20));
}

/**
 * Weighted random selection. Games with higher signals (metacritic, enrichment,
 * backlog age) are more likely to be picked. Skipped games are deprioritized.
 */
export function pickWeighted(games: Game[], skippedIds: Set<string> = new Set()): Game | null {
  if (games.length === 0) return null;

  const weighted = games.map((game) => ({
    game,
    weight: calculateWeight(game, skippedIds),
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
