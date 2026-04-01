import { Game, TimeTier } from './types';

export type RerollMode = 'anything' | 'quick-session' | 'deep-cut' | 'continue';

export const REROLL_MODES: { mode: RerollMode; label: string; icon: string; description: string }[] = [
  { mode: 'anything', label: 'Anything', icon: '🎲', description: 'Random from all games' },
  { mode: 'quick-session', label: 'Quick Session', icon: '🌙', description: 'Wind-down tier only' },
  { mode: 'deep-cut', label: 'Deep Cut', icon: '🔥', description: 'Deep-cut tier only' },
  { mode: 'continue', label: 'Continue', icon: '▶', description: 'Currently playing only' },
];

export function getEligibleGames(games: Game[], mode: RerollMode): Game[] {
  return games.filter((game) => {
    // Exclude played and bailed from all modes
    if (game.status === 'played' || game.status === 'bailed') return false;

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
