'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Game } from '@/lib/types';
import { RerollMode } from '@/lib/reroll';
import CategorySection from '@/components/CategorySection';
import FilterBar from '@/components/FilterBar';
import AddGameModal from '@/components/AddGameModal';
import Reroll from '@/components/Reroll';
import ImportHub from '@/components/ImportHub';
import SettingsMenu from '@/components/SettingsMenu';
import ViewToggle from '@/components/ViewToggle';
import StatsPanel from '@/components/StatsPanel';
import AuthButton from '@/components/AuthButton';
import CloudSync from '@/components/CloudSync';
import HelpModal from '@/components/HelpModal';
import { ToastProvider } from '@/components/Toast';
import NinetiesMode from '@/components/NinetiesMode';

function AppContent() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [rerollOpen, setRerollOpen] = useState(false);
  const [rerollMode, setRerollMode] = useState<RerollMode | undefined>();
  const [importHubOpen, setImportHubOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const openReroll = (mode?: RerollMode) => {
    setRerollMode(mode);
    setRerollOpen(true);
  };

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
      <header className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-extrabold tracking-tight text-text-primary cursor-pointer hover:text-accent-purple transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Pile Of Shame
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
            <button
              onClick={() => setHelpOpen(true)}
              className="w-8 h-8 flex items-center justify-center text-sm text-text-dim hover:text-text-muted transition-colors rounded-lg hover:bg-white/5"
              title="Help & FAQ"
            >
              ?
            </button>
            <AuthButton />
            <SettingsMenu />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle />
          <button
            onClick={() => setImportHubOpen(true)}
            className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-border-subtle text-text-secondary hover:border-accent-purple hover:text-text-primary transition-all"
          >
            📥 Import Library
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-border-subtle text-text-secondary hover:border-accent-purple hover:text-text-primary transition-all"
          >
            + Add Game
          </button>
        </div>
      </header>

      {/* Filters */}
      {!isEmpty && (
        <div className="mb-4">
          <FilterBar />
        </div>
      )}

      {/* Get Playing — Hero Action */}
      {!isEmpty && (
        <div className="mb-6 space-y-2">
          <button
            onClick={() => openReroll('anything')}
            className="w-full px-6 py-3.5 text-base font-bold rounded-xl text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
          >
            🎲 Get Playing
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => openReroll('quick-session')}
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
              title="Pick a game you can finish in one sitting"
            >
              🌙 Quick Session
            </button>
            <button
              onClick={() => openReroll('deep-cut')}
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #dc2626, #f87171)' }}
              title="Pick a long game you can really sink into"
            >
              🔥 Deep Cut
            </button>
            <button
              onClick={() => openReroll('continue')}
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #d97706, #fbbf24)' }}
              title="Pick from games you already started"
            >
              ▶ Keep Playing
            </button>
          </div>
        </div>
      )}

      {/* Stats Panel */}
      {!isEmpty && <StatsPanel games={games} />}

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

      {/* Modals */}
      <AddGameModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <ImportHub open={importHubOpen} onClose={() => setImportHubOpen(false)} />
      <Reroll open={rerollOpen} onClose={() => { setRerollOpen(false); setRerollMode(undefined); }} initialMode={rerollMode} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <CloudSync />

      {/* Footer */}
      <footer className="mt-12 pb-6 text-center space-y-2">
        <a
          href="https://ko-fi.com/pileofshame"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full border transition-all hover:scale-[1.02] hover:border-accent-pink"
          style={{
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-muted)',
          }}
        >
          🍕 Grab me a slice
        </a>
        <p className="text-[10px] text-text-faint font-[family-name:var(--font-mono)]">
          Get playing for free, forever. Slices keep the lights on.
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <NinetiesMode>
        <AppContent />
      </NinetiesMode>
    </ToastProvider>
  );
}
