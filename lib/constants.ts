import { GameStatus, GameSource, TimeTier } from './types';

export const DEFAULT_CATEGORIES = [
  'The Pile',
  'Favorites',
  'Quick Wins',
];

export const DEFAULT_VIBES = [
  'cozy',
  'narrative',
  'atmospheric',
  'challenge',
  'mindless',
  'philosophical',
];

export const CUSTOM_VIBE_COLORS = [
  '#fb923c',
  '#38bdf8',
  '#e879f9',
  '#a3e635',
  '#2dd4bf',
  '#f472b6',
];

export const VIBE_COLORS: Record<string, string> = {
  cozy: '#f9a8d4',
  narrative: '#93c5fd',
  atmospheric: '#a78bfa',
  challenge: '#f87171',
  mindless: '#fbbf24',
  philosophical: '#34d399',
};

export const STATUS_CONFIG: Record<GameStatus, {
  label: string;
  shortLabel?: string;
  icon: string;
  asciiIcon: string;
  color: string;
  bg: string;
}> = {
  buried: { label: 'Backlog', icon: '📚', asciiIcon: '[=]', color: '#64748b', bg: '#1e293b' },
  'on-deck': { label: 'Play Next', shortLabel: 'Next', icon: '🎯', asciiIcon: '>>>', color: '#38bdf8', bg: '#082f49' },
  playing: { label: 'Now Playing', shortLabel: 'Playing', icon: '🔥', asciiIcon: '(~)', color: '#f59e0b', bg: '#422006' },
  played: { label: 'Played', icon: '✅', asciiIcon: '[x]', color: '#22c55e', bg: '#052e16' },
  bailed: { label: 'Bailed', icon: '🚪', asciiIcon: '[!]', color: '#ef4444', bg: '#450a0a' },
};

export const STATUS_CYCLE: GameStatus[] = ['buried', 'on-deck', 'playing', 'played'];

export const SOURCE_ICONS: Record<GameSource, string> = {
  steam: '🟦',
  playstation: '🔵',
  epic: '⬛',
  xbox: '🟩',
  switch: '🔴',
  gog: '🟣',
  other: '🎲',
};

/** Short platform labels for badges */
export const SOURCE_SHORT: Record<GameSource, string> = {
  steam: 'Steam',
  playstation: 'PS',
  epic: 'Epic',
  xbox: 'Xbox',
  switch: 'NSW',
  gog: 'GOG',
  other: '???',
};

/** Platform badge colors for visual distinction */
export const SOURCE_COLORS: Record<GameSource, { bg: string; text: string }> = {
  steam: { bg: 'rgba(66, 133, 244, 0.15)', text: '#6ba4f7' },
  playstation: { bg: 'rgba(0, 112, 210, 0.15)', text: '#4da3e8' },
  epic: { bg: 'rgba(255, 255, 255, 0.08)', text: '#999' },
  xbox: { bg: 'rgba(16, 124, 16, 0.15)', text: '#4ec44e' },
  switch: { bg: 'rgba(230, 0, 18, 0.12)', text: '#e85555' },
  gog: { bg: 'rgba(165, 100, 235, 0.15)', text: '#b98ce8' },
  other: { bg: 'rgba(255, 255, 255, 0.06)', text: '#777' },
};

export const SOURCE_LABELS: Record<GameSource, string> = {
  steam: 'Steam',
  playstation: 'PlayStation',
  epic: 'Epic',
  xbox: 'Xbox',
  switch: 'Switch',
  gog: 'GOG',
  other: 'Other',
};

export const TIME_TIER_CONFIG: Record<TimeTier, { label: string; icon: string; description: string }> = {
  'quick-hit': { label: 'Quick Hit', icon: '⚡', description: '20 min brain-off session' },
  'wind-down': { label: 'Wind-Down', icon: '🌙', description: '30–60 min, unwind mode' },
  'deep-cut': { label: 'Deep Cut', icon: '🔥', description: 'Clear the schedule, 2–3 hrs' },
  'marathon': { label: 'Marathon', icon: '🏔️', description: 'This IS the plan tonight' },
};

export const REROLL_MESSAGES: Record<number, string> = {
  3: 'Getting picky?',
  5: 'The dice are getting tired.',
  7: "You're here to play, not spin.",
};

export const CATEGORY_ICONS: Record<string, string> = {
  'The Pile': '🗻',
  'Favorites': '⭐',
  'Quick Wins': '⚡',
};

export function getVibeColor(vibe: string): string {
  if (VIBE_COLORS[vibe]) return VIBE_COLORS[vibe];
  // Hash the vibe name to pick a consistent custom color
  let hash = 0;
  for (let i = 0; i < vibe.length; i++) {
    hash = vibe.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CUSTOM_VIBE_COLORS[Math.abs(hash) % CUSTOM_VIBE_COLORS.length];
}
