'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Game } from '@/lib/types';
import CategorySection from '@/components/CategorySection';
import FilterBar from '@/components/FilterBar';
import AddGameModal from '@/components/AddGameModal';
import Reroll from '@/components/Reroll';
import ImportHub from '@/components/ImportHub';
import SettingsMenu from '@/components/SettingsMenu';
import ViewToggle from '@/components/ViewToggle';
import { ToastProvider } from '@/components/Toast';

function AppContent() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [rerollOpen, setRerollOpen] = useState(false);
  const [importHubOpen, setImportHubOpen] = useState(false);

  const games = useStore((s) => s.games);
  const categories = useStore((s) => s.categories);
  const filters = useStore((s) => s.filters);

  // Apply filters
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Status visibility
      if (game.status === 'played' && !filters.showPlayed) return false;
      if (game.status === 'bailed' && !filters.showBailed) return false;

      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !game.name.toLowerCase().includes(q) &&
          !game.notes.toLowerCase().includes(q)
        )
          return false;
      }

      // Category
      if (filters.category && game.category !== filters.category) return false;

      // Vibe
      if (filters.vibe && !game.vibes.includes(filters.vibe)) return false;

      // Time tier
      if (filters.timeTier && game.timeTier !== filters.timeTier) return false;

      return true;
    });
  }, [games, filters]);

  // Group by category
  const gamesByCategory = useMemo(() => {
    const map = new Map<string, Game[]>();
    categories.forEach((cat) => map.set(cat, []));
    filteredGames.forEach((game) => {
      const list = map.get(game.category);
      if (list) {
        list.push(game);
      } else {
        const uncategorized = map.get(categories[0]) || [];
        uncategorized.push(game);
        map.set(categories[0], uncategorized);
      }
    });
    return map;
  }, [filteredGames, categories]);

  // Quick stats
  const stats = useMemo(() => {
    const playing = games.filter((g) => g.status === 'playing').length;
    const buried = games.filter((g) => g.status === 'buried' || g.status === 'on-deck').length;
    const played = games.filter((g) => g.status === 'played').length;
    const totalHrs = games.reduce((s, g) => s + (g.hoursPlayed || 0), 0);
    return { playing, buried, played, total: games.length, totalHrs };
  }, [games]);

  const isEmpty = games.length === 0;
  const noResults = games.length > 0 && filteredGames.length === 0;

  return (
    <div className="relative z-10 w-full max-w-[960px] mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            Pile of Shame
          </h1>
          {!isEmpty ? (
            <div className="flex gap-3 text-[10px] sm:text-xs font-[family-name:var(--font-mono)] mt-0.5">
              <span><span style={{ color: '#f59e0b' }}>{stats.playing}</span> <span className="text-text-faint">playing</span></span>
              <span><span className="text-text-muted">{stats.buried}</span> <span className="text-text-faint">backlog</span></span>
              <span><span style={{ color: '#22c55e' }}>{stats.played}</span> <span className="text-text-faint">done</span></span>
              <span className="hidden sm:inline"><span className="text-accent-purple">{stats.total}</span> <span className="text-text-faint">total</span></span>
              {stats.totalHrs > 0 && (
                <span className="hidden sm:inline"><span className="text-accent-pink">{stats.totalHrs.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> <span className="text-text-faint">hrs</span></span>
              )}
            </div>
          ) : (
            <p className="text-[10px] sm:text-xs text-text-dim font-[family-name:var(--font-mono)] mt-0.5">
              Your backlog isn&apos;t going to play itself.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle />
          <button
            onClick={() => setImportHubOpen(true)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-subtle text-text-secondary hover:border-accent-purple hover:text-text-primary transition-all"
          >
            📥 Import
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border-subtle text-text-secondary hover:border-accent-purple hover:text-text-primary transition-all"
          >
            + Add
          </button>
          <SettingsMenu />
        </div>
      </header>

      {/* Filters */}
      {!isEmpty && (
        <div className="mb-5">
          <FilterBar />
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">🎮</p>
          <h2 className="text-lg font-bold text-text-primary mb-2">
            Nothing here yet.
          </h2>
          <p className="text-sm text-text-muted mb-6 max-w-xs">
            We both know that&apos;s not true. You&apos;ve got games. Add them.
          </p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--color-accent-purple)',
              color: '#0a0a0f',
            }}
          >
            + Add Your First Game
          </button>
          <button
            onClick={() => setImportHubOpen(true)}
            className="mt-3 px-4 py-2 text-xs font-medium rounded-lg border border-border-subtle text-text-muted hover:border-accent-purple hover:text-text-secondary transition-all"
          >
            📥 Or import your library
          </button>
        </div>
      )}

      {/* No Filter Results */}
      {noResults && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-sm text-text-muted">
            No games match your filters.
          </p>
        </div>
      )}

      {/* Category Sections */}
      {!isEmpty && !noResults && (
        <div className="space-y-7">
          {categories.map((cat) => {
            const catGames = gamesByCategory.get(cat) || [];
            return (
              <CategorySection key={cat} name={cat} games={catGames} />
            );
          })}
        </div>
      )}

      {/* Reroll FAB */}
      {!isEmpty && (
        <button
          onClick={() => setRerollOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-black/40 transition-all hover:scale-110 active:scale-95 z-30"
          style={{
            backgroundColor: 'var(--color-accent-purple)',
            color: '#0a0a0f',
          }}
          title="Reroll"
        >
          🎲
        </button>
      )}

      {/* Modals */}
      <AddGameModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <ImportHub open={importHubOpen} onClose={() => setImportHubOpen(false)} />
      <Reroll open={rerollOpen} onClose={() => setRerollOpen(false)} />
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
