export type GameSource = 'steam' | 'playstation' | 'epic' | 'xbox' | 'switch' | 'gog' | 'other';
export type TimeTier = 'wind-down' | 'deep-cut';
export type GameStatus = 'buried' | 'on-deck' | 'playing' | 'played' | 'bailed';

export interface Game {
  id: string;
  name: string;
  source: GameSource;
  steamAppId?: number;
  rawgSlug?: string;
  coverUrl?: string;
  metacritic?: number;
  genres?: string[];
  hoursPlayed: number;
  installed: boolean;
  timeTier: TimeTier;
  category: string;
  vibes: string[];
  priority: number;
  notes: string;
  status: GameStatus;
  isWishlisted?: boolean;
  addedAt: string;
  updatedAt: string;
}

export type PlatformPreference = 'any' | 'pc' | 'mac' | 'console';

export interface RerollState {
  sessionCount: number;
  lastThreePicks: Game[];
}

export type ViewMode = 'list' | 'grid';

export interface LibrarySettings {
  showPlayed: boolean;
  showBailed: boolean;
  viewMode: ViewMode;
  theme: 'dark' | '90s';
  platformPreference: PlatformPreference;
}

export interface FilterState {
  search: string;
  category: string;
  vibe: string;
  timeTier: '' | TimeTier;
  showPlayed: boolean;
  showBailed: boolean;
}

export interface LibraryState {
  games: Game[];
  categories: string[];
  customVibes: string[];
  settings: LibrarySettings;
  reroll: RerollState;
  filters: FilterState;
  lastSaved: string;
}
