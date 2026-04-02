'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Game } from '@/lib/types';
import { RerollMode } from '@/lib/reroll';
import CategorySection from '@/components/CategorySection';
import UpNextSection from '@/components/UpNextSection';
import ClearedSection from '@/components/ClearedSection';
import FilterBar from '@/components/FilterBar';
import AddGameModal from '@/components/AddGameModal';
import Reroll from '@/components/Reroll';
import ImportHub from '@/components/ImportHub';
import SettingsMenu from '@/components/SettingsMenu';
import ViewToggle from '@/components/ViewToggle';
import StatsPanel from '@/components/StatsPanel';
import AuthButton from '@/components/AuthButton';
import CloudSync from '@/components/CloudSync';
import CompletionCelebration from '@/components/CompletionCelebration';
import HelpModal from '@/components/HelpModal';
import { ToastProvider } from '@/components/Toast';
import EnrichmentIndicator from '@/components/EnrichmentIndicator';
import JustFiveMinutes from '@/components/JustFiveMinutes';
import NinetiesMode from '@/components/NinetiesMode';
import SyncNudge from '@/components/SyncNudge';
import { useAutoEnrich } from '@/hooks/useAutoEnrich';
import OnboardingWelcome from '@/components/OnboardingWelcome';

function InlineSearch() {
  const [expanded, setExpanded] = useState(false);
  const filters = useStore((s) => s.filters);
  const setFilter = useStore((s) => s.setFilter);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (!expanded) {
      setExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (!filters.search) {
      setExpanded(false);
    }
  };

  const handleBlur = () => {
    if (!filters.search) {
      setExpanded(false);
    }
  };

  return (
    <div className="flex items-center">
      {expanded ? (
        <div className="relative animate-[fadeIn_150ms_ease-out]">
          <svg
            aria-hidden="true"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            onBlur={handleBlur}
            placeholder="Search..."
            aria-label="Search games"
            className="w-24 sm:w-36 md:w-48 text-xs sm:text-sm bg-bg-card border border-border-subtle rounded-lg pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 sm:py-2 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent-purple transition-all"
          />
        </div>
      ) : (
        <button
          onClick={handleToggle}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-subtle text-text-dim hover:border-accent-purple hover:text-text-secondary transition-all"
          title="Search games"
          aria-label="Search games"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      )}
    </div>
  );
}

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
  const celebrationGame = useStore((s) => s.celebrationGame);
  const closeCelebration = useStore((s) => s.closeCelebration);
  const cycleStatus = useStore((s) => s.cycleStatus);

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

      // Vibe (legacy manual tags)
      if (filters.vibe && !game.vibes.includes(filters.vibe)) return false;

      // Mood (auto-inferred from genres)
      if (filters.mood && (!game.moodTags || !game.moodTags.includes(filters.mood))) return false;

      // Time tier
      if (filters.timeTier && game.timeTier !== filters.timeTier) return false;

      return true;
    });
  }, [games, filters]);

  // Group by category (exclude playing/on-deck — they're in the Up Next section)
  const gamesByCategory = useMemo(() => {
    const map = new Map<string, Game[]>();
    categories.forEach((cat) => map.set(cat, []));
    filteredGames.forEach((game) => {
      if (game.status === 'playing' || game.status === 'on-deck') return;
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

  // Auto-enrich games in background after import
  useAutoEnrich();

  // First-time experience: track if user has ever used the reroll
  const [mounted, setMounted] = useState(false);
  const [hasUsedReroll, setHasUsedReroll] = useState(true);
  useEffect(() => {
    setMounted(true);
    setHasUsedReroll(!!localStorage.getItem('pos-reroll-used'));
  }, []);

  const handleOpenReroll = (mode?: RerollMode) => {
    if (!hasUsedReroll) {
      localStorage.setItem('pos-reroll-used', '1');
      setHasUsedReroll(true);
    }
    openReroll(mode);
  };

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
              Inventory Full
            </h1>
            <p className="text-sm text-text-dim mt-0.5 italic">
              Your backlog should feel exciting, not a warehouse of good intentions.
            </p>
            {!isEmpty && (
              <div className="flex gap-3 text-xs font-[family-name:var(--font-mono)] mt-1.5">
                <span><span style={{ color: '#f59e0b' }}>{stats.playing}</span> <span className="text-text-faint">playing</span></span>
                <span><span className="text-text-muted">{stats.buried}</span> <span className="text-text-faint">backlog</span></span>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => document.getElementById('cleared-section')?.scrollIntoView({ behavior: 'smooth' })}
                  title="Jump to Cleared"
                ><span style={{ color: '#22c55e' }}>{stats.played}</span> <span className="text-text-faint">cleared 🏆</span></span>
                <span className="hidden sm:inline"><span className="text-accent-purple">{stats.total}</span> <span className="text-text-faint">total</span></span>
                {stats.totalHrs > 0 && (
                  <span className="hidden sm:inline"><span className="text-accent-pink">{stats.totalHrs.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> <span className="text-text-faint">hrs</span></span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHelpOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-sm text-text-dim hover:text-text-muted transition-colors rounded-lg hover:bg-white/5"
              title="Help & FAQ"
              aria-label="Help and FAQ"
            >
              ?
            </button>
            <AuthButton />
            <SettingsMenu />
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ViewToggle />
          {!isEmpty && <InlineSearch />}
          <button
            onClick={() => setImportHubOpen(true)}
            className="px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg border border-border-subtle text-text-secondary hover:border-accent-purple hover:text-text-primary transition-all"
          >
            📥 <span className="hidden sm:inline">&nbsp;Import</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg border border-border-subtle text-text-secondary hover:border-accent-purple hover:text-text-primary transition-all"
          >
            + <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </header>

      {/* Sync nudge — shows once for unsigned-in users after first import */}
      {!isEmpty && <SyncNudge />}

      {/* Filters */}
      {!isEmpty && (
        <div className="mb-4">
          <FilterBar />
        </div>
      )}

      {/* Auto-enrichment progress */}
      <EnrichmentIndicator />

      {/* Get Playing — Hero Action */}
      {!isEmpty && (
        <div className="mb-6 space-y-2">
          <button
            onClick={() => handleOpenReroll('anything')}
            className={`w-full px-6 py-4 text-lg font-bold rounded-xl text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] ${mounted && !hasUsedReroll ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}`}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
          >
            🎲&nbsp; What Should I Play?
          </button>
          {mounted && !hasUsedReroll && (
            <p className="text-center text-xs text-text-dim mt-2 mb-1 font-[family-name:var(--font-mono)] animate-[fadeIn_500ms_ease-out]">
              ↑ Tell us your mood. We&apos;ll find your game.
            </p>
          )}
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={() => openReroll('quick-session')}
              className="flex-1 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
              title="Pick a game you can finish in one sitting"
            >
              🌙&nbsp; <span className="hidden sm:inline">Quick </span>Session
            </button>
            <button
              onClick={() => openReroll('deep-cut')}
              className="flex-1 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #dc2626, #f87171)' }}
              title="Pick a long game you can really sink into"
            >
              🔥&nbsp; Deep Cut
            </button>
            <button
              onClick={() => openReroll('continue')}
              className="flex-1 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #d97706, #fbbf24)' }}
              title="Pick from games you already started"
            >
              ▶&nbsp; <span className="hidden sm:inline">Keep </span>Playing
            </button>
            <JustFiveMinutes games={games} />
          </div>
        </div>
      )}

      {/* Stats Panel */}
      {!isEmpty && <StatsPanel games={games} />}

      {/* Empty State */}
      {isEmpty && (
        <OnboardingWelcome
          onImport={() => setImportHubOpen(true)}
          onAddManual={() => setAddModalOpen(true)}
        />
      )}

      {/* No Filter Results */}
      {noResults && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-sm text-text-muted mb-3">
            No games match your filters.
          </p>
          {filters.search && (
            <button
              onClick={() => {
                setAddModalOpen(true);
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'rgba(167, 139, 250, 0.1)',
                color: '#a78bfa',
                border: '1px solid rgba(167, 139, 250, 0.25)',
              }}
            >
              + Add &ldquo;{filters.search}&rdquo; to your pile?
            </button>
          )}
        </div>
      )}

      {/* Play Next Queue — always visible regardless of filters */}
      {!isEmpty && <UpNextSection games={games} />}

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

      {/* Cleared — Hall of Fame */}
      {!isEmpty && <ClearedSection games={games} />}

      {/* Modals */}
      <AddGameModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <ImportHub open={importHubOpen} onClose={() => setImportHubOpen(false)} />
      <Reroll open={rerollOpen} onClose={() => { setRerollOpen(false); setRerollMode(undefined); }} initialMode={rerollMode} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <CompletionCelebration
        game={celebrationGame}
        onClose={closeCelebration}
        onConfirm={() => {
          if (celebrationGame) {
            cycleStatus(celebrationGame.id);
          }
        }}
      />
      <CloudSync />

      {/* Footer */}
      <footer className="mt-12 pb-6 text-center space-y-2">
        <a
          href="https://ko-fi.com/inventoryfull"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-full border transition-all hover:scale-[1.03] hover:border-accent-pink hover:text-accent-pink"
          style={{
            borderColor: 'var(--color-border-active)',
            color: 'var(--color-text-secondary)',
          }}
        >
          🍕 Buy me a slice
        </a>
        <p className="text-xs text-text-faint font-[family-name:var(--font-mono)]">
          ❤️ Free forever. Tips keep the servers running and new features coming.
        </p>
        <div className="flex items-center gap-4 mt-3">
          <a href="/privacy" className="text-[11px] text-text-faint hover:text-text-dim transition-colors font-[family-name:var(--font-mono)]">Privacy</a>
          <a href="/terms" className="text-[11px] text-text-faint hover:text-text-dim transition-colors font-[family-name:var(--font-mono)]">Terms</a>
        </div>
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
