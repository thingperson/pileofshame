'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Game, GameStatus, LibraryState, FilterState, TimeTier, PlatformPreference } from './types';
import { DEFAULT_CATEGORIES, DEFAULT_VIBES, STATUS_CYCLE } from './constants';
import { SEED_GAMES } from './seedData';

interface StoreActions {
  // Game CRUD
  addGame: (game: Omit<Game, 'id' | 'priority' | 'addedAt' | 'updatedAt' | 'hoursPlayed' | 'installed'> & { hoursPlayed?: number; isWishlisted?: boolean }) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  deleteGame: (id: string) => void;

  // Status
  cycleStatus: (id: string) => GameStatus | null;
  getNextStatus: (status: GameStatus) => GameStatus | null;
  setBailed: (id: string) => void;
  unBail: (id: string) => void;
  shelveGame: (id: string) => void;
  playAgain: (id: string) => void;
  newGamePlus: (id: string) => void;

  // Celebration (lives in store so it survives GameCard unmount)
  celebrationGame: Game | null;
  showCelebration: (game: Game) => void;
  closeCelebration: () => void;

  // Auto-enrichment progress (transient, not persisted)
  enrichmentProgress: { done: number; total: number } | null;

  // Filters
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;

  // Reroll
  incrementReroll: () => void;
  pushLastPick: (game: Game) => void;
  resetReroll: () => void;

  // Categories
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;

  // Backup
  exportState: () => string;
  importState: (json: string) => boolean;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: '',
  vibe: '',
  mood: '',
  timeTier: '',
  showPlayed: false,
  showBailed: false,
};

export const useStore = create<LibraryState & StoreActions>()(
  persist(
    (set, get) => ({
      // State — seed with test data in dev when no localStorage exists
      games: process.env.NODE_ENV === 'development' ? SEED_GAMES : [],
      categories: [...DEFAULT_CATEGORIES],
      customVibes: [],
      settings: {
        showPlayed: false,
        showBailed: false,
        viewMode: 'list' as const,
        theme: 'dark' as const,
        platformPreference: 'any' as PlatformPreference,
      },
      reroll: {
        sessionCount: 0,
        lastThreePicks: [],
      },
      filters: { ...DEFAULT_FILTERS },
      linkedSteamId: undefined,
      lastSaved: new Date().toISOString(),

      // Celebration state (global so it survives GameCard unmount)
      celebrationGame: null,
      enrichmentProgress: null,
      showCelebration: (game: Game) => {
        set({ celebrationGame: { ...game } }); // snapshot the game before status change
      },
      closeCelebration: () => {
        set({ celebrationGame: null });
      },

      // Game CRUD
      addGame: (gameData) => {
        const now = new Date().toISOString();
        const state = get();
        const categoryGames = state.games.filter(g => g.category === gameData.category);
        const newGame: Game = {
          ...gameData,
          id: uuidv4(),
          hoursPlayed: gameData.hoursPlayed ?? 0,
          installed: false,
          isWishlisted: gameData.isWishlisted || false,
          priority: categoryGames.length,
          addedAt: now,
          updatedAt: now,
        };
        set({
          games: [...state.games, newGame],
          lastSaved: now,
        });
      },

      updateGame: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          games: state.games.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: now } : g
          ),
          lastSaved: now,
        }));
      },

      deleteGame: (id) => {
        set((state) => ({
          games: state.games.filter((g) => g.id !== id),
          lastSaved: new Date().toISOString(),
        }));
      },

      // Status
      getNextStatus: (status: GameStatus): GameStatus | null => {
        const idx = STATUS_CYCLE.indexOf(status);
        if (idx === -1 || idx === STATUS_CYCLE.length - 1) return null;
        return STATUS_CYCLE[idx + 1];
      },

      cycleStatus: (id) => {
        const state = get();
        const game = state.games.find((g) => g.id === id);
        if (!game) return null;
        const nextStatus = state.getNextStatus(game.status);
        if (!nextStatus) return null;
        const now = new Date().toISOString();
        set({
          games: state.games.map((g) =>
            g.id === id ? {
              ...g,
              status: nextStatus,
              updatedAt: now,
              ...(nextStatus === 'played' ? { completedAt: now } : {}),
            } : g
          ),
          lastSaved: now,
        });
        return nextStatus;
      },

      setBailed: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          games: state.games.map((g) =>
            g.id === id && g.status !== 'played'
              ? { ...g, status: 'bailed' as GameStatus, updatedAt: now }
              : g
          ),
          lastSaved: now,
        }));
      },

      unBail: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          games: state.games.map((g) =>
            g.id === id && g.status === 'bailed'
              ? { ...g, status: 'buried' as GameStatus, updatedAt: now }
              : g
          ),
          lastSaved: now,
        }));
      },

      shelveGame: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          games: state.games.map((g) =>
            g.id === id && (g.status === 'playing' || g.status === 'on-deck')
              ? { ...g, status: 'buried' as GameStatus, updatedAt: now }
              : g
          ),
          lastSaved: now,
        }));
      },

      playAgain: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          games: state.games.map((g) =>
            g.id === id && g.status === 'played'
              ? { ...g, status: 'playing' as GameStatus, updatedAt: now }
              : g
          ),
          lastSaved: now,
        }));
      },

      newGamePlus: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          games: state.games.map((g) =>
            g.id === id && g.status === 'played'
              ? {
                  ...g,
                  status: 'on-deck' as GameStatus,
                  notes: g.notes ? `${g.notes}\nRound 2` : 'Round 2',
                  updatedAt: now,
                }
              : g
          ),
          lastSaved: now,
        }));
      },

      // Filters
      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }));
      },

      resetFilters: () => {
        set({ filters: { ...DEFAULT_FILTERS } });
      },

      // Reroll
      incrementReroll: () => {
        set((state) => ({
          reroll: {
            ...state.reroll,
            sessionCount: state.reroll.sessionCount + 1,
          },
        }));
      },

      pushLastPick: (game) => {
        set((state) => ({
          reroll: {
            ...state.reroll,
            lastThreePicks: [...state.reroll.lastThreePicks, game].slice(-3),
          },
        }));
      },

      resetReroll: () => {
        set({
          reroll: { sessionCount: 0, lastThreePicks: [] },
        });
      },

      // Categories
      addCategory: (name) => {
        set((state) => ({
          categories: state.categories.includes(name)
            ? state.categories
            : [...state.categories, name],
        }));
      },

      removeCategory: (name) => {
        set((state) => ({
          categories: state.categories.filter((c) => c !== name),
        }));
      },

      // Backup
      exportState: () => {
        const state = get();
        const exportData = {
          games: state.games,
          categories: state.categories,
          customVibes: state.customVibes,
          settings: state.settings,
          linkedSteamId: state.linkedSteamId,
          lastSaved: state.lastSaved,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importState: (json: string) => {
        try {
          const data = JSON.parse(json);
          if (!data.games || !Array.isArray(data.games)) return false;
          set({
            games: data.games,
            categories: data.categories || [...DEFAULT_CATEGORIES],
            customVibes: data.customVibes || [],
            linkedSteamId: data.linkedSteamId,
            settings: data.settings || {
              showPlayed: false,
              showBailed: false,
              viewMode: 'list',
              theme: 'dark',
              platformPreference: 'any',
            },
            lastSaved: new Date().toISOString(),
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'getplaying-library',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version === 0) {
          // Rename "Your Queue" category → "The Pile"
          const cats = state.categories as string[] | undefined;
          if (cats) {
            state.categories = cats.map((c: string) => c === 'Your Queue' ? 'The Pile' : c);
          }
          // Migrate games in "Your Queue" category
          const games = state.games as Array<{ category: string }> | undefined;
          if (games) {
            games.forEach((g) => {
              if (g.category === 'Your Queue') g.category = 'The Pile';
            });
          }
        }
        if (version < 2) {
          // Add new default categories for existing users
          const cats = state.categories as string[] | undefined;
          if (cats) {
            if (!cats.includes('Brain Off')) cats.push('Brain Off');
            if (!cats.includes('The Shame Wall')) cats.push('The Shame Wall');
          }
        }
        return state;
      },
      partialize: (state) => ({
        games: state.games,
        categories: state.categories,
        customVibes: state.customVibes,
        settings: state.settings,
        reroll: state.reroll,
        linkedSteamId: state.linkedSteamId,
        lastSaved: state.lastSaved,
      }),
    }
  )
);
