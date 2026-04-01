import { Game, PlatformPreference } from './types';

export type RerollMode = 'anything' | 'quick-session' | 'deep-cut' | 'continue';

export const REROLL_MODES: { mode: RerollMode; label: string; icon: string; description: string }[] = [
  { mode: 'anything', label: 'Anything', icon: '🎲', description: 'Random from all games' },
  { mode: 'quick-session', label: 'Quick Session', icon: '🌙', description: 'Wind-down tier only' },
  { mode: 'deep-cut', label: 'Deep Cut', icon: '🔥', description: 'Deep-cut tier only' },
  { mode: 'continue', label: 'Keep Playing', icon: '▶', description: 'Dive back into games you already started' },
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

export function getEligibleGames(games: Game[], mode: RerollMode, platformPreference: PlatformPreference = 'any'): Game[] {
  return games.filter((game) => {
    // Exclude played and bailed from all modes
    if (game.status === 'played' || game.status === 'bailed') return false;

    // Platform preference filter
    if (!matchesPlatformPreference(game, platformPreference)) return false;

    switch (mode) {
      case 'anything':
        return true;
      case 'quick-session':
        return game.timeTier === 'wind-down';
      case 'deep-cut':
        return game.timeTier === 'deep-cut';
      case 'continue':
        return game.status === 'playing';
      default:
        return true;
    }
  });
}

export function pickRandom(games: Game[]): Game | null {
  if (games.length === 0) return null;
  return games[Math.floor(Math.random() * games.length)];
}
