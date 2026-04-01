export type GameSource = 'steam' | 'playstation' | 'epic' | 'xbox' | 'switch' | 'gog' | 'other';
export type TimeTier = 'quick-hit' | 'wind-down' | 'deep-cut' | 'marathon';
export type GameStatus = 'buried' | 'on-deck' | 'playing' | 'played' | 'bailed';

export type MoodTag = 'chill' | 'intense' | 'story-rich' | 'brainless' | 'atmospheric' | 'competitive' | 'spooky' | 'creative' | 'strategic' | 'emotional';

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
  rating?: number; // 1-5, set on completion
  completedAt?: string; // ISO date when marked as played
  addedAt: string;
  updatedAt: string;

  // Auto-enrichment fields (populated from RAWG, HLTB, Steam)
  description?: string;        // Game synopsis from RAWG
  moodTags?: MoodTag[];        // Auto-inferred from genres
  hltbMain?: number;           // Hours to beat (main story) from HLTB
  hltbComplete?: number;       // Hours to 100% from HLTB
  enrichedAt?: string;         // ISO date of last enrichment
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
  theme: 'dark' | 'light' | '90s' | '80s' | 'future' | 'dino';
  platformPreference: PlatformPreference;
}

export interface FilterState {
  search: string;
  category: string;
  vibe: string;
  mood: '' | MoodTag;
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
  linkedSteamId?: string;
  lastSaved: string;
}
