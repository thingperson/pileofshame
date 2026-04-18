'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Game, GameStatus } from '@/lib/types';
import { RerollMode } from '@/lib/reroll';
import { sortBestForYou } from '@/lib/smartSort';
import { STATUS_CONFIG, MAX_PLAYING_NOW, MAX_UP_NEXT } from '@/lib/constants';
import TabNav, { TabId, TABS } from '@/components/TabNav';
import GameCard from '@/components/GameCard';
import GridCard from '@/components/GridCard';
// GridCard handles its own GameDetailModal internally
import AddGameModal from '@/components/AddGameModal';
import Reroll from '@/components/Reroll';
import ImportHub from '@/components/ImportHub';
import SettingsMenu from '@/components/SettingsMenu';
import ViewToggle from '@/components/ViewToggle';
import AuthButton from '@/components/AuthButton';
import CloudSync from '@/components/CloudSync';
import CompletionCelebration from '@/components/CompletionCelebration';
import HelpModal from '@/components/HelpModal';
import { ToastProvider, useToast } from '@/components/Toast';
import EnrichmentIndicator from '@/components/EnrichmentIndicator';
import JustFiveMinutes, { JustFiveMinutesHandle } from '@/components/JustFiveMinutes';
import NinetiesMode from '@/components/NinetiesMode';
import SyncNudge from '@/components/SyncNudge';
import { useAutoEnrich } from '@/hooks/useAutoEnrich';
import OnboardingWelcome from '@/components/OnboardingWelcome';
import LandingPage from '@/components/LandingPage';
import { SAMPLE_GAMES } from '@/lib/sampleLibrary';
import PostImportSummary from '@/components/PostImportSummary';
import SampleImportNudge from '@/components/SampleImportNudge';
import GamePassBrowse from '@/components/GamePassBrowse';
import StalledGameNudge from '@/components/StalledGameNudge';
import FinishCheckNudge from '@/components/FinishCheckNudge';
import { trackThemeSession } from '@/lib/archetypes';
import { trackSampleStarted, trackImportCompleted, trackSignupCompleted } from '@/lib/analytics';
import { useAuth } from '@/lib/useAuth';

// ── Inline Search ──────────────────────────────────────────────────

function InlineSearch({ onAddManual }: { onAddManual: () => void }) {
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

  return (
    <div className="flex items-center gap-1">
      {expanded ? (
        <>
          <div className="relative animate-[fadeIn_150ms_ease-out]">
            <svg aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              onBlur={() => { if (!filters.search) setExpanded(false); }}
              placeholder="Search or add..."
              aria-label="Search games or add manually"
              className="w-28 sm:w-40 md:w-48 text-xs sm:text-sm bg-bg-card border border-border-subtle rounded-lg pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 sm:py-2 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent-purple transition-all"
            />
          </div>
          <button
            onMouseDown={(e) => { e.preventDefault(); onAddManual(); }}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-text-dim hover:text-accent-purple hover:bg-white/5 transition-all"
            title="Add a game manually"
            aria-label="Add a game manually"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </>
      ) : (
        <button
          onClick={handleToggle}
          className="w-11 h-11 flex items-center justify-center rounded-lg border border-border-subtle text-text-dim hover:border-accent-purple hover:text-text-secondary transition-all"
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

// ── Main App ───────────────────────────────────────────────────────
// Shelf caps are centralized in lib/constants.ts (MAX_PLAYING_NOW, MAX_UP_NEXT).

function AppContent() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalInitialName, setAddModalInitialName] = useState('');
  const [rerollOpen, setRerollOpen] = useState(false);
  const [rerollMode, setRerollMode] = useState<RerollMode | undefined>();
  const [importHubOpen, setImportHubOpen] = useState(false);
  const [gamePassOpen, setGamePassOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('backlog');
  // Tab-follow UX: when a game's status changes, auto-switch to the destination
  // tab, flash its underline (~1s), and pulse-outline the game's row in its new
  // home (~1.5s). Without these, a cycle-badge click made the game vanish with
  // no trail — users lost where it went.
  const [flashingTab, setFlashingTab] = useState<TabId | null>(null);
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerTabFollow = useCallback((targetTab: TabId, gameId: string) => {
    setActiveTab(targetTab);
    setFlashingTab(targetTab);
    setRecentlyMovedId(gameId);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    // Match the keyframe durations in globals.css; clearing the class re-arms
    // the animation for the next move.
    flashTimerRef.current = setTimeout(() => setFlashingTab(null), 1000);
    pulseTimerRef.current = setTimeout(() => setRecentlyMovedId(null), 1500);
  }, []);

  // Listen for status changes anywhere in the tree (incl. inside
  // GameDetailModal, which is mounted from GridCard and doesn't thread a prop
  // back to page-level state). GameCard dispatches `gp-status-change` from
  // every status transition.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ gameId: string; newStatus: GameStatus }>).detail;
      if (!detail) return;
      const targetTab = TABS.find((t) => t.statuses.includes(detail.newStatus));
      if (targetTab) triggerTabFollow(targetTab.id, detail.gameId);
    };
    window.addEventListener('gp-status-change', handler);
    return () => window.removeEventListener('gp-status-change', handler);
  }, [triggerTabFollow]);
  const [backlogLimit, setBacklogLimit] = useState(10);
  const [backlogSort, setBacklogSort] = useState<'smart' | 'a-z' | 'z-a' | 'newest' | 'oldest' | 'most-playtime' | 'least-playtime' | 'closest-to-done'>('smart');
  const [sampleBannerDismissed, setSampleBannerDismissed] = useState(false);
  const [pendingSampleReroll, setPendingSampleReroll] = useState(false);
  const isSampleLoad = useRef(false);
  const [pulseReroll, setPulseReroll] = useState(false);
  // Forwarded handle so the Reroll modal's "Just 5 mins" CTA can launch the
  // JustFiveMinutes flow without re-implementing its pick + timer logic.
  const justFiveRef = useRef<JustFiveMinutesHandle>(null);
  // GridCard handles its own detail modal internally

  const openReroll = (mode?: RerollMode) => {
    setRerollMode(mode);
    setRerollOpen(true);
  };

  // ── Post-import summary ──
  const [importBreakdown, setImportBreakdown] = useState<{
    total: number; backlog: number; started: number; upNext: number; nowPlaying: number; completed: number;
  } | null>(null);
  const prevGameCount = useRef<number | null>(null);

  const games = useStore((s) => s.games);
  const filters = useStore((s) => s.filters);
  const setFilter = useStore((s) => s.setFilter);
  const currentTheme = useStore((s) => s.settings.theme);
  const viewMode = useStore((s) => s.settings.viewMode);
  const updateGame = useStore((s) => s.updateGame);
  const { showToast } = useToast();

  // Track theme usage once per session
  useEffect(() => {
    const sessionKey = 'pos-theme-tracked';
    if (!sessionStorage.getItem(sessionKey)) {
      trackThemeSession(currentTheme);
      sessionStorage.setItem(sessionKey, '1');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { user, isSignedIn } = useAuth();
  const celebrationGame = useStore((s) => s.celebrationGame);
  const closeCelebration = useStore((s) => s.closeCelebration);
  const cycleStatus = useStore((s) => s.cycleStatus);

  // ── Filter games (search applies across all tabs) ──

  const filteredGames = useMemo(() => {
    if (!filters.search) return games;
    const q = filters.search.toLowerCase();
    return games.filter((game) =>
      game.name.toLowerCase().includes(q) || game.notes.toLowerCase().includes(q)
    );
  }, [games, filters.search]);

  // ── Tab counts (always from full games, not filtered) ──

  const tabCounts = useMemo(() => {
    const counts: Record<TabId, number> = {
      'backlog': 0,
      'up-next': 0,
      'now-playing': 0,
      'completed': 0,
    };
    for (const game of games) {
      for (const tab of TABS) {
        if (tab.statuses.includes(game.status)) {
          counts[tab.id]++;
          break;
        }
      }
    }
    return counts;
  }, [games]);

  // ── Games for the active tab ──

  const activeTabDef = TABS.find((t) => t.id === activeTab)!;

  const tabGames = useMemo(() => {
    const inTab = filteredGames.filter((g) => activeTabDef.statuses.includes(g.status));

    // Sort based on tab
    if (activeTab === 'backlog') {
      let sorted: Game[];
      if (backlogSort === 'smart') {
        sorted = sortBestForYou(inTab, games);
      } else {
        sorted = [...inTab];
        switch (backlogSort) {
          case 'a-z': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
          case 'z-a': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
          case 'newest': sorted.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()); break;
          case 'oldest': sorted.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()); break;
          case 'most-playtime': sorted.sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0) || a.name.localeCompare(b.name)); break;
          case 'least-playtime': sorted.sort((a, b) => (a.hoursPlayed || 0) - (b.hoursPlayed || 0) || a.name.localeCompare(b.name)); break;
          case 'closest-to-done': sorted.sort((a, b) => {
            // Tier 1: Has HLTB + progress → sort by remaining hours (lowest first)
            const hasDataA = a.hoursPlayed > 0 && a.hltbMain && a.hltbMain > 0;
            const hasDataB = b.hoursPlayed > 0 && b.hltbMain && b.hltbMain > 0;
            const remA = hasDataA ? Math.max(a.hltbMain! - a.hoursPlayed, 0) : Infinity;
            const remB = hasDataB ? Math.max(b.hltbMain! - b.hoursPlayed, 0) : Infinity;
            if (hasDataA && hasDataB) return remA - remB;
            if (hasDataA && !hasDataB) return -1;
            if (!hasDataA && hasDataB) return 1;
            // Tier 2: Has playtime but no HLTB → sort by most hours (likely furthest along)
            if (a.hoursPlayed > 0 && b.hoursPlayed > 0) return (b.hoursPlayed || 0) - (a.hoursPlayed || 0);
            if (a.hoursPlayed > 0) return -1;
            if (b.hoursPlayed > 0) return 1;
            // Tier 3: Has HLTB but no playtime → short games first (quick wins)
            if (a.hltbMain && b.hltbMain) return a.hltbMain - b.hltbMain;
            if (a.hltbMain) return -1;
            if (b.hltbMain) return 1;
            // Tier 4: No data → A-Z fallback
            return a.name.localeCompare(b.name);
          }); break;
          default: sorted = sortBestForYou(inTab, games);
        }
      }
      // Push ignored games to the bottom
      return sorted.sort((a, b) => (a.ignored ? 1 : 0) - (b.ignored ? 1 : 0));
    }
    if (activeTab === 'completed') {
      // Most recently completed first
      return [...inTab].sort((a, b) => {
        if (a.status === 'bailed' && b.status !== 'bailed') return 1;
        if (b.status === 'bailed' && a.status !== 'bailed') return -1;
        return new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime();
      });
    }
    // Up Next: by priority. Playing Now: by most recently updated.
    return [...inTab].sort((a, b) => {
      if (activeTab === 'up-next') return a.priority - b.priority;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredGames, activeTab, activeTabDef, games, backlogSort]);

  // Paginated backlog (show `backlogLimit` at a time)
  const visibleGames = activeTab === 'backlog' ? tabGames.slice(0, backlogLimit) : tabGames;
  const hasMoreBacklog = activeTab === 'backlog' && backlogLimit < tabGames.length;

  // ── Move game to next tab ──

  const getNextTabStatus = useCallback((currentStatus: string): { status: string; tabId: TabId; label: string } | null => {
    const statusOrder = ['buried', 'on-deck', 'playing', 'played'] as const;
    const idx = statusOrder.indexOf(currentStatus as typeof statusOrder[number]);
    if (idx === -1 || idx >= statusOrder.length - 1) return null;
    const nextStatus = statusOrder[idx + 1];
    const nextTab = TABS.find((t) => t.statuses.includes(nextStatus));
    if (!nextTab) return null;
    return { status: nextStatus, tabId: nextTab.id, label: nextTab.label };
  }, []);

  const moveGameForward = useCallback((game: Game) => {
    setSampleBannerDismissed(true);
    const next = getNextTabStatus(game.status);
    if (!next) return;

    // Up Next cap check
    if (next.status === 'on-deck') {
      const upNextCount = games.filter((g) => g.status === 'on-deck').length;
      if (upNextCount >= MAX_UP_NEXT) {
        showToast(`Up Next is capped at ${MAX_UP_NEXT}. These are games you're actually going to play next. Move something back first.`);
        return;
      }
    }

    // Playing Now cap check
    if (next.status === 'playing') {
      const nowPlayingCount = games.filter((g) => g.status === 'playing').length;
      if (nowPlayingCount >= MAX_PLAYING_NOW) {
        showToast(`Playing Now is capped at ${MAX_PLAYING_NOW}. Finish or shelve something first.`);
        return;
      }
    }

    // If moving to played, trigger celebration flow instead
    if (next.status === 'played') {
      const { showCelebration } = useStore.getState();
      showCelebration(game);
      cycleStatus(game.id);
      return;
    }

    updateGame(game.id, {
      status: next.status as Game['status'],
      ...(next.status === 'played' ? { completedAt: new Date().toISOString() } : {}),
    });

    const statusLabel = STATUS_CONFIG[next.status as Game['status']].label;
    showToast(`${game.name} → ${statusLabel}`);

    // Switch to the destination tab, flash its underline, pulse the row.
    triggerTabFollow(next.tabId, game.id);
  }, [games, updateGame, showToast, cycleStatus, getNextTabStatus, triggerTabFollow]);

  const moveGameBack = useCallback((game: Game) => {
    const statusOrder = ['buried', 'on-deck', 'playing', 'played'] as const;
    const idx = statusOrder.indexOf(game.status as typeof statusOrder[number]);
    if (idx <= 0) return;

    // Bailed games go back to backlog
    const prevStatus = game.status === 'bailed' ? 'buried' : statusOrder[idx - 1];
    const prevTab = TABS.find((t) => t.statuses.includes(prevStatus));

    updateGame(game.id, { status: prevStatus as Game['status'] });
    showToast(`${game.name} → ${STATUS_CONFIG[prevStatus as Game['status']].label}`);

    if (prevTab) triggerTabFollow(prevTab.id, game.id);
  }, [updateGame, showToast, triggerTabFollow]);

  // Auto-enrich games in background after import
  useAutoEnrich();

  // Track Zustand persist hydration so import detection only starts
  // AFTER localStorage has been read. Without this, the 0 -> N transition
  // from Zustand's async rehydrate is misread as a fresh import and the
  // PostImportSummary modal wrongly appears on every page load for users
  // with existing libraries.
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(useStore.persist.hasHydrated());
    const unsub = useStore.persist.onFinishHydration(() => setHasHydrated(true));
    return () => { unsub(); };
  }, []);

  // Detect post-import transition (0 → N games) and compute breakdown.
  // Guards:
  //   (1) Hydration must finish first — otherwise the async 0 → N rehydrate
  //       looks like an import.
  //   (2) Sample loads are flagged in localStorage so the detection
  //       survives any render race with the Zustand setState.
  useEffect(() => {
    if (!hasHydrated) return;

    // First run after hydration: capture real count. Never show summary.
    if (prevGameCount.current === null) {
      prevGameCount.current = games.length;
      return;
    }
    if (prevGameCount.current === 0 && games.length > 0) {
      const isSample = isSampleLoad.current || (typeof window !== 'undefined' && localStorage.getItem('if-sample-active') === '1');
      if (isSample) {
        isSampleLoad.current = false;
        try { localStorage.removeItem('if-sample-active'); } catch {}
      } else {
        const breakdown = {
          total: games.length,
          backlog: games.filter((g) => g.status === 'buried' && g.hoursPlayed === 0).length,
          started: games.filter((g) => g.status === 'buried' && g.hoursPlayed > 0).length,
          upNext: games.filter((g) => g.status === 'on-deck').length,
          nowPlaying: games.filter((g) => g.status === 'playing').length,
          completed: games.filter((g) => g.status === 'played').length,
        };
        setImportBreakdown(breakdown);
        // We don't know the exact source here (Steam/Xbox/PSN/manual) so we
        // fire a generic "any" source — the breakdown already tells GA4
        // everything about the resulting library shape.
        trackImportCompleted('any', games.length);
      }
    }
    prevGameCount.current = games.length;
  }, [games, hasHydrated]);

  // First-time experience: track if user has ever used the reroll
  const [mounted, setMounted] = useState(false);
  const [hasUsedReroll, setHasUsedReroll] = useState(true);
  useEffect(() => {
    setMounted(true);
    setHasUsedReroll(!!localStorage.getItem('pos-reroll-used'));

    // Auth callback lands on /?auth=ok — fire GA4 signup_completed once,
    // then strip the flag so a reload doesn't re-fire it.
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'ok') {
        trackSignupCompleted();
        params.delete('auth');
        const newSearch = params.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }
    } catch {
      // URL manipulation is best-effort
    }
  }, []);

  const handleOpenReroll = (mode?: RerollMode) => {
    if (!hasUsedReroll) {
      localStorage.setItem('pos-reroll-used', '1');
      setHasUsedReroll(true);
    }
    openReroll(mode);
  };

  const isEmpty = games.length === 0;
  const isSampleLibrary = games.length > 0 && games.every(g => g.id.startsWith('sample-'));
  const isVoid = currentTheme === 'void' && !isEmpty;

  // ── Swipe gesture for tab switching ──
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);
  const TAB_ORDER: TabId[] = useMemo(() => TABS.map((t) => t.id), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;
    const dx = touchStart.current.x - touchEnd.current.x;
    const dy = touchStart.current.y - touchEnd.current.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (dx > 0 && currentIndex < TAB_ORDER.length - 1) {
      setActiveTab(TAB_ORDER[currentIndex + 1]);
    } else if (dx < 0 && currentIndex > 0) {
      setActiveTab(TAB_ORDER[currentIndex - 1]);
    }
  }, [activeTab, TAB_ORDER]);

  // After sample data loads, pulse the "What Should I Play?" button to guide the user
  useEffect(() => {
    if (pendingSampleReroll && games.length > 0) {
      const t = setTimeout(() => {
        setPulseReroll(true);
        setPendingSampleReroll(false);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [pendingSampleReroll, games.length]);

  // Reset backlog limit when switching tabs
  useEffect(() => {
    setBacklogLimit(10);
  }, [activeTab]);

  // Auto-switch to the tab with games after first import
  useEffect(() => {
    if (games.length > 0 && activeTab === 'backlog') {
      // If there are Up Next games (from smart import), show that tab
      const upNextCount = games.filter((g) => g.status === 'on-deck').length;
      if (upNextCount > 0 && games.filter((g) => g.status === 'buried').length === 0) {
        setActiveTab('up-next');
      }
    }
  }, [games.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // === THE VOID ===
  if (isVoid) {
    return (
      <div className="relative z-10 w-full max-w-[960px] mx-auto px-4 flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <SettingsMenu />
        </div>
        <div className="flex flex-col items-center gap-8 w-full max-w-md">
          <div className="text-center">
            <h1 className="text-lg font-light tracking-[6px] text-[#444] lowercase">inventory full</h1>
            <p className="text-xs text-[#333] mt-2 font-[family-name:var(--font-mono)]">{games.length} games. Pick one.</p>
          </div>
          <button
            onClick={() => handleOpenReroll('anything')}
            className="w-full px-8 py-6 text-lg font-medium rounded-xl transition-all hover:bg-[#111] active:scale-[0.98]"
            style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', color: '#888' }}
          >
            Pick for me
          </button>
          <div className="flex gap-2 w-full">
            {(['quick-session', 'continue'] as const).map((m) => (
              <button
                key={m}
                onClick={() => openReroll(m)}
                className="flex-1 px-3 py-3 text-xs font-[family-name:var(--font-mono)] rounded-lg transition-all hover:bg-[#111]"
                style={{ background: '#050505', border: '1px solid #111', color: '#555' }}
              >
                {m === 'quick-session' ? 'quick session' : 'resume'}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#222] font-[family-name:var(--font-mono)] mt-4">less deciding. more playing.</p>
        </div>
        <Reroll open={rerollOpen} onClose={() => { setRerollOpen(false); setRerollMode(undefined); }} initialMode={rerollMode} onJustFiveMinutes={() => { setRerollOpen(false); setRerollMode(undefined); justFiveRef.current?.startSession(); }} />
        <CompletionCelebration game={celebrationGame} onClose={() => { closeCelebration(); setActiveTab('completed'); }} onConfirm={() => { if (celebrationGame) cycleStatus(celebrationGame.id); }} />
        <CloudSync />
      </div>
    );
  }

  // ── Landing page for empty library ──
  if (isEmpty) {
    return (
      <>
        <LandingPage
          onImport={() => setImportHubOpen(true)}
          onLoadSample={() => {
            isSampleLoad.current = true;
            try {
              localStorage.setItem('if-sample-active', '1');
              // Separate flag that persists until sample_completed fires
              // (the above is cleared on first render). Used to attribute
              // the user's first real commit back to sample onboarding.
              localStorage.setItem('if-sample-pending', '1');
            } catch {}
            trackSampleStarted();
            useStore.setState({
              games: SAMPLE_GAMES,
              settings: { ...useStore.getState().settings, viewMode: 'grid' },
              lastSaved: new Date().toISOString(),
            });
            window.scrollTo({ top: 0 });
            setPendingSampleReroll(true);
          }}
        />
        <ImportHub open={importHubOpen} onClose={() => setImportHubOpen(false)} />
        <AddGameModal open={addModalOpen} onClose={() => { setAddModalOpen(false); setAddModalInitialName(''); }} initialName={addModalInitialName} />
        <CloudSync />
      </>
    );
  }

  // ── Next tab action label for game cards ──
  const nextTabLabel = activeTab === 'backlog' ? 'Up Next'
    : activeTab === 'up-next' ? 'Playing Now'
    : activeTab === 'now-playing' ? 'Completed'
    : null;

  const prevTabLabel = activeTab === 'up-next' ? 'Backlog'
    : activeTab === 'now-playing' ? 'Up Next'
    : activeTab === 'completed' ? 'Playing Now'
    : null;

  return (
    <div className="relative z-10 w-full max-w-[960px] mx-auto px-4 py-6 pb-24">
      {/* ── Header ── */}
      <header className="mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-extrabold tracking-tight text-text-primary cursor-pointer hover:text-accent-purple transition-colors"
              onClick={() => { setActiveTab('backlog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              Inventory Full
            </h1>
            <p className="text-xs text-text-faint mt-0.5 font-[family-name:var(--font-mono)]">
              get playing.
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="hidden sm:contents">
              <InlineSearch onAddManual={() => { setAddModalInitialName(''); setAddModalOpen(true); }} />
              <button
                onClick={() => setImportHubOpen(true)}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border border-border-subtle text-text-secondary hover:border-accent-purple hover:text-text-primary transition-all"
                title="Import games"
              >
                <span className="text-base">📥</span>
                <span>Import</span>
              </button>
              <a
                href="/stats"
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border border-border-subtle text-text-secondary hover:border-accent-purple hover:text-text-primary transition-all"
                title="Stats"
              >
                <span className="text-base">📊</span>
                <span>Stats</span>
              </a>
              <AuthButton />
            </div>
            <SettingsMenu
              onOpenImport={() => setImportHubOpen(true)}
              onOpenSearch={() => { setAddModalInitialName(''); setAddModalOpen(true); }}
            />
          </div>
        </div>
      </header>

      {/* ── Library status pill ── */}
      {!isEmpty && (
        <div className="mb-2 flex items-center gap-2">
          {isSampleLibrary ? (
            <button
              type="button"
              onClick={() => setImportHubOpen(true)}
              title="Click to import your real library"
              aria-label="Click to import your real library"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-[family-name:var(--font-mono)] cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-accent-purple) 10%, transparent)',
                color: 'var(--color-accent-purple)',
                border: '1px solid color-mix(in srgb, var(--color-accent-purple) 20%, transparent)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--color-accent-purple)' }}
              />
              Sample Library
            </button>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-[family-name:var(--font-mono)]"
              style={{
                backgroundColor: isSignedIn
                  ? 'rgba(34, 197, 94, 0.08)'
                  : 'rgba(255, 255, 255, 0.04)',
                color: isSignedIn
                  ? '#4ade80'
                  : 'var(--color-text-faint)',
                border: `1px solid ${isSignedIn
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(255, 255, 255, 0.06)'}`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: isSignedIn ? '#4ade80' : 'var(--color-text-faint)' }}
              />
              {isSignedIn
                ? `Synced as ${user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'you'}`
                : 'Your Library'}
            </span>
          )}
          {!isSampleLibrary && !isSignedIn && (
            <span className="text-xs text-text-faint font-[family-name:var(--font-mono)]">
              not synced
            </span>
          )}
        </div>
      )}

      {/* ── Sample library banner (auto-dismiss after first action) ── */}
      {isSampleLibrary && !sampleBannerDismissed && (
        <div
          className="mb-3 hidden sm:flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-xs font-[family-name:var(--font-mono)]"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-accent-purple) 8%, var(--color-bg-card))',
            border: '1px solid color-mix(in srgb, var(--color-accent-purple) 20%, transparent)',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>
            You&apos;re exploring a sample library.{' '}
            <span style={{ color: 'var(--color-text-dim)' }}>Poke around, try the features - it&apos;s all fake data.</span>
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setImportHubOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent-purple) 0%, var(--color-accent-pink) 100%)',
                color: '#fff',
              }}
            >
              Import yours
            </button>
            <button
              onClick={() => setSampleBannerDismissed(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:border-accent-purple"
              style={{
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-text-dim)',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Hero CTA ── */}
      <div className="mb-3 space-y-2">
          <button
            onClick={() => { setPulseReroll(false); handleOpenReroll(); }}
            className={`w-full px-4 sm:px-6 py-4 sm:py-3.5 text-lg sm:text-lg font-bold rounded-xl text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] ${(mounted && !hasUsedReroll) || pulseReroll ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}`}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
          >
            🎲&nbsp; What Should I Play?
          </button>
          {(mounted && !hasUsedReroll) || pulseReroll ? (
            <p className="text-center text-xs text-text-dim mt-1 font-[family-name:var(--font-mono)] animate-[fadeIn_500ms_ease-out]">
              ↑ Tell us your mood. We&apos;ll find your game.
            </p>
          ) : null}
          {/* Reroll-mode drop-pill strip retired 2026-04-17 — modes live inside
              the Reroll modal now (hero "What Should I Play?" button is the
              single entry point). JustFiveMinutes is still mounted (hidden
              button) so its ref can be called from inside the modal. Sub
              Shuffle stays visible — it's a distinct feature, not a reroll
              mode. */}
          <JustFiveMinutes ref={justFiveRef} games={games} hideButton />
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => setGamePassOpen(true)}
              className="shrink-0 px-3 sm:px-4 py-3 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 active:scale-[0.97] whitespace-nowrap flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #107c10 0%, #1a8a1a 50%, #0070d1 100%)' }}
              title="Pick a game from Game Pass or PS+ catalog"
            >
              <span className="inline-flex items-center gap-1">
                <span className="text-xs font-black tracking-tight" style={{ color: '#7ec850' }}>GP</span>
                <span className="text-xs opacity-50">/</span>
                <span className="text-xs font-black tracking-tight" style={{ color: '#ffd800' }}>PS+</span>
              </span>
              <span>Sub Shuffle</span>
            </button>
          </div>
        </div>

      {/* Auto-enrichment progress */}
      <EnrichmentIndicator />

      {/* ── Tab Navigation ── */}
      <div className="mb-3">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} flashingTab={flashingTab} />
      </div>

      {/* ── Sort control + View toggle ── */}
      {!isEmpty && tabGames.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          {activeTab === 'backlog' && (
            <>
              <label htmlFor="backlog-sort" className="text-xs text-text-faint font-[family-name:var(--font-mono)]">Sort:</label>
              <select
                id="backlog-sort"
                value={backlogSort}
                onChange={(e) => { setBacklogSort(e.target.value as typeof backlogSort); setBacklogLimit(10); }}
                className="text-xs bg-bg-card border border-border-subtle rounded-lg px-2 py-2.5 sm:py-1 min-h-[44px] sm:min-h-0 text-text-muted focus:outline-none focus:border-accent-purple transition-all cursor-pointer font-[family-name:var(--font-mono)]"
              >
                <option value="smart">✨ Best for You</option>
                <option value="a-z">A → Z</option>
                <option value="z-a">Z → A</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="closest-to-done">🏁 Closest to Done</option>
                <option value="most-playtime">Most playtime</option>
                <option value="least-playtime">Least playtime</option>
              </select>
            </>
          )}
          <div className="ml-auto">
            <ViewToggle />
          </div>
        </div>
      )}

      {/* ── Behavioral Nudges (1 each per session, dismissable) ── */}
      {!isEmpty && activeTab === 'backlog' && <StalledGameNudge games={games} onTabSwitch={(id) => setActiveTab(id as TabId)} />}
      {!isEmpty && activeTab === 'backlog' && <FinishCheckNudge games={games} onTabSwitch={(id) => setActiveTab(id as TabId)} />}

      {/* ── Sync Nudge (below tabs, above games) ── */}
      {!isEmpty && <SyncNudge />}

      {/* ── Post-Import Summary ── */}
      {importBreakdown && (
        <PostImportSummary
          breakdown={importBreakdown}
          onDismiss={() => setImportBreakdown(null)}
          onPlay={() => {
            setImportBreakdown(null);
            handleOpenReroll('anything');
          }}
        />
      )}

      {/* ── Sample-user post-commit nudge (one-time) ── */}
      <SampleImportNudge
        isSampleLibrary={isSampleLibrary}
        onImport={() => setImportHubOpen(true)}
      />

      {/* ── Tab Content (swipe left/right to switch tabs) ── */}
      {!isEmpty && (
        <div
          className="min-h-[200px]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Search active indicator */}
          {filters.search && (
            <div className="mb-3">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5">
                <span className="text-xs text-text-dim">Searching: &ldquo;{filters.search}&rdquo;</span>
                <button
                  onClick={() => setFilter('search', '')}
                  className="text-xs text-text-faint hover:text-text-muted transition-colors"
                >
                  Clear
                </button>
                <span className="text-xs text-text-faint font-[family-name:var(--font-mono)] ml-auto">
                  {tabGames.length} result{tabGames.length !== 1 ? 's' : ''} in {activeTabDef.label}
                </span>
              </div>
              {/* Search-to-add: no results anywhere in library */}
              {tabGames.length === 0 && (() => {
                const q = filters.search.toLowerCase();
                const anywhereCount = games.filter((g) => g.name.toLowerCase().includes(q) || g.notes.toLowerCase().includes(q)).length;
                if (anywhereCount > 0) {
                  // Results exist in other tabs
                  const otherTabs = TABS.filter((t) => t.id !== activeTab && games.some((g) => t.statuses.includes(g.status) && (g.name.toLowerCase().includes(q) || g.notes.toLowerCase().includes(q))));
                  return (
                    <div className="mt-2 px-3 py-2 rounded-lg text-xs text-text-muted" style={{ backgroundColor: 'rgba(167, 139, 250, 0.06)' }}>
                      Not in {activeTabDef.label}, but found in: {otherTabs.map((t) => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} className="text-accent-purple hover:underline mx-1">{t.label}</button>
                      ))}
                    </div>
                  );
                }
                // Not in library at all — offer to add
                return (
                  <div className="mt-2 px-3 py-3 rounded-lg text-center" style={{ backgroundColor: 'rgba(167, 139, 250, 0.06)' }}>
                    <p className="text-sm text-text-muted mb-2">
                      &ldquo;{filters.search}&rdquo; isn&apos;t in your library yet.
                    </p>
                    <button
                      onClick={() => {
                        setAddModalInitialName(filters.search);
                        setAddModalOpen(true);
                      }}
                      className="px-4 py-2 text-xs font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] max-w-full truncate"
                      style={{ backgroundColor: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.25)' }}
                    >
                      + Add &ldquo;{filters.search.length > 30 ? filters.search.slice(0, 30) + '...' : filters.search}&rdquo; to your pile
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Up Next cap message */}
          {activeTab === 'up-next' && tabGames.length >= MAX_UP_NEXT && (
            <div className="mb-3 px-3 py-2 rounded-lg text-xs text-text-muted font-[family-name:var(--font-mono)]" style={{ backgroundColor: 'rgba(56, 189, 248, 0.06)' }}>
              Up Next is capped at {MAX_UP_NEXT}. These are games you&apos;re actually going to play, not a second backlog. Move something back to make room.
            </div>
          )}

          {/* Playing Now cap message */}
          {activeTab === 'now-playing' && tabGames.length >= MAX_PLAYING_NOW && (
            <div className="mb-3 px-3 py-2 rounded-lg text-xs text-text-muted font-[family-name:var(--font-mono)]" style={{ backgroundColor: 'rgba(245, 158, 11, 0.06)' }}>
              Playing Now is capped at {MAX_PLAYING_NOW}. The constraint is the feature. Finish or shelve something to make room.
            </div>
          )}

          {/* Empty tab states */}
          {tabGames.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-3xl mb-3">{activeTabDef.icon}</p>
              {activeTab === 'backlog' && (
                <>
                  <p className="text-sm text-text-muted">Backlog is empty. You did it.</p>
                  <p className="text-xs text-text-faint mt-1">Or import some games to get started.</p>
                </>
              )}
              {activeTab === 'up-next' && (
                <>
                  <p className="text-sm text-text-muted">Nothing queued up.</p>
                  <p className="text-xs text-text-faint mt-1">Move a game from your Backlog to get it on deck.</p>
                </>
              )}
              {activeTab === 'now-playing' && (
                <>
                  <p className="text-sm text-text-muted">Nothing playing right now.</p>
                  <p className="text-xs text-text-faint mt-1">Move something from Up Next and go play it.</p>
                </>
              )}
              {activeTab === 'completed' && (
                <>
                  <p className="text-sm text-text-muted">No games completed yet.</p>
                  <p className="text-xs text-text-faint mt-1">Finish a game and it lands here. We&apos;ll celebrate.</p>
                </>
              )}
            </div>
          )}

          {/* ── Game Cards ── */}
          {tabGames.length > 0 && (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {visibleGames.map((game, i) => (
                  <div key={game.id} className="card-enter" style={{ animationDelay: `${i * 30}ms`, opacity: activeTab === 'backlog' && game.ignored ? 0.45 : undefined }}>
                    <div className={recentlyMovedId === game.id ? 'row-pulse' : undefined}>
                      <GridCard game={game} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {visibleGames.map((game, i) => (
                  <div key={game.id} className="card-enter" style={{ animationDelay: `${i * 30}ms`, opacity: activeTab === 'backlog' && game.ignored ? 0.45 : undefined }}>
                    <div className={recentlyMovedId === game.id ? 'row-pulse' : undefined}>
                    <GameCard
                      game={game}
                      upNextIndex={activeTab === 'up-next' ? i + 1 : undefined}
                      hideStatusLabel={true}
                      progressAction={nextTabLabel ? {
                        label: `Move to ${nextTabLabel}`,
                        onClick: () => moveGameForward(game),
                      } : undefined}
                      regressAction={prevTabLabel ? {
                        label: `Back to ${prevTabLabel}`,
                        onClick: () => moveGameBack(game),
                      } : undefined}
                      onStatusChange={(newStatus) => {
                        const targetTab = TABS.find((t) => t.statuses.includes(newStatus));
                        if (targetTab) triggerTabFollow(targetTab.id, game.id);
                      }}
                    />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Load more button for backlog */}
          {hasMoreBacklog && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setBacklogLimit((prev) => prev + 10)}
                className="px-6 py-2.5 text-sm font-medium rounded-xl border border-border-subtle text-text-muted hover:text-text-primary hover:border-accent-purple transition-all"
              >
                Show more ({tabGames.length - backlogLimit} remaining)
              </button>
            </div>
          )}

          {/* Backlog "Best for You" explainer (first load only, smart sort) */}
          {activeTab === 'backlog' && tabGames.length > 0 && backlogLimit <= 10 && backlogSort === 'smart' && (
            <p className="text-xs text-text-faint text-center mt-3 font-[family-name:var(--font-mono)]">
              Sorted by what deserves your attention: games you&apos;re close to finishing, genres you gravitate toward, and buried gems worth resurfacing.
            </p>
          )}
        </div>
      )}

      {/* ── View Toggle + Stats + Help ── */}
      {!isEmpty && (
        <div className="flex items-center justify-between mt-4 mb-2">
          <ViewToggle />
          <div className="flex items-center gap-3">
            <a
              href="/about"
              className="text-xs text-text-faint hover:text-text-muted transition-colors font-[family-name:var(--font-mono)] py-3 sm:py-1"
            >
              About
            </a>
            <button
              onClick={() => setHelpOpen(true)}
              className="text-xs text-text-faint hover:text-text-muted transition-colors font-[family-name:var(--font-mono)] py-3 sm:py-1"
            >
              ? Help
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <AddGameModal open={addModalOpen} onClose={() => { setAddModalOpen(false); setAddModalInitialName(''); }} initialName={addModalInitialName} />
      <ImportHub open={importHubOpen} onClose={() => setImportHubOpen(false)} />
      <Reroll open={rerollOpen} onClose={() => { setRerollOpen(false); setRerollMode(undefined); }} initialMode={rerollMode} onJustFiveMinutes={() => { setRerollOpen(false); setRerollMode(undefined); justFiveRef.current?.startSession(); }} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <GamePassBrowse open={gamePassOpen} onClose={() => setGamePassOpen(false)} />
      {/* GridCard handles its own detail modal */}
      <CompletionCelebration
        game={celebrationGame}
        onClose={() => {
          closeCelebration();
          setActiveTab('completed');
        }}
        onConfirm={() => {
          if (celebrationGame) cycleStatus(celebrationGame.id);
        }}
      />
      <CloudSync />

      {/* ── Footer ── */}
      <footer className="mt-12 pb-6 text-center space-y-2">
        <a
          href="https://ko-fi.com/inventoryfull"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-full border transition-all hover:scale-[1.03] hover:border-accent-pink hover:text-accent-pink"
          style={{ borderColor: 'var(--color-border-active)', color: 'var(--color-text-secondary)' }}
        >
          🍕 Buy me a slice
        </a>
        <p className="text-xs text-text-faint font-[family-name:var(--font-mono)]">
          ❤️ Free forever. Tips keep the servers running and new features coming.
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <a href="/privacy" className="text-xs text-text-faint hover:text-text-dim transition-colors font-[family-name:var(--font-mono)] py-3 sm:py-1">Privacy</a>
          <a href="/terms" className="text-xs text-text-faint hover:text-text-dim transition-colors font-[family-name:var(--font-mono)] py-3 sm:py-1">Terms</a>
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
