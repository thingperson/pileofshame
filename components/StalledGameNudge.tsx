'use client';

import { useState, useMemo, useCallback } from 'react';
import { Game } from '@/lib/types';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';

/**
 * Stalled Game Nudge — surfaces one game per session that the user
 * started but dropped off their radar. Non-intrusive, dismissable,
 * backs off after 3 dismissals for the same game.
 *
 * Stall criteria:
 *   - hoursPlayed > 2 (they got past the intro)
 *   - hoursPlayed < hltbMain * 0.85 (they didn't finish)
 *   - status is buried or on-deck (not consciously playing or completed)
 *   - updatedAt > 14 days ago (fell off the radar)
 *   - not ignored
 *   - not dismissed 3+ times
 */

const DISMISS_KEY = 'if-nudge-dismissals';
const SESSION_KEY = 'if-nudge-session-dismissed';

function getDismissals(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveDismissal(gameId: string) {
  const d = getDismissals();
  d[gameId] = (d[gameId] || 0) + 1;
  localStorage.setItem(DISMISS_KEY, JSON.stringify(d));
}

function isSessionDismissed(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

function setSessionDismissed() {
  sessionStorage.setItem(SESSION_KEY, 'true');
}

function getStalledGames(games: Game[]): Game[] {
  const dismissals = getDismissals();
  const now = Date.now();
  const fourteenDays = 14 * 24 * 60 * 60 * 1000;

  return games.filter((g) => {
    // Must have meaningful playtime
    if (g.hoursPlayed < 2) return false;
    // Must not be finished, bailed, or ignored
    if (g.status === 'played' || g.status === 'bailed') return false;
    if (g.ignored) return false;
    // Must not be actively playing
    if (g.status === 'playing') return false;
    // Must have fallen off the radar (14+ days since last update)
    const lastActivity = new Date(g.updatedAt).getTime();
    if (now - lastActivity < fourteenDays) return false;
    // If we have HLTB data, they shouldn't be near completion already
    // (those get surfaced by the progress badge instead)
    if (g.hltbMain && g.hoursPlayed >= g.hltbMain * 0.85) return false;
    // Not dismissed 3+ times
    if ((dismissals[g.id] || 0) >= 3) return false;

    return true;
  }).sort((a, b) => {
    // Prioritize by hours played (more invested = higher reactivation value)
    return b.hoursPlayed - a.hoursPlayed;
  });
}

function getStallMessage(game: Game): string {
  const hours = game.hoursPlayed;

  // Check genre-based messaging
  const genres = (game.genres || []).map(g => g.toLowerCase());
  const isStoryRich = genres.some(g => g.includes('rpg') || g.includes('adventure'));
  const isDifficult = genres.some(g => g.includes('souls') || g.includes('roguelike'));
  const isOpenWorld = genres.some(g => g.includes('open world') || g.includes('sandbox'));

  if (hours >= 15 && isStoryRich) {
    return `You put ${hours} hours into this one. That's real investment. Worth picking back up?`;
  }
  if (hours >= 5 && isDifficult) {
    return `${hours} hours in. You were making progress. Ready for another run?`;
  }
  if (hours >= 5 && isOpenWorld) {
    return `${hours} hours explored. Just pick one quest and go. 30 minutes is all it takes.`;
  }
  if (hours >= 5) {
    return `You put ${hours} hours into this before it fell off your radar. Worth another look?`;
  }
  // 2-4h tier: got through the intro
  return `You got ${hours} hours in. Past the intro, controls learned, world opened up. Then life happened. Pick it back up?`;
}

function getRemainingText(game: Game): string | null {
  if (!game.hltbMain || game.hltbMain <= 0) return null;
  const remaining = Math.max(game.hltbMain - game.hoursPlayed, 0);
  if (remaining <= 0) return null;
  return `~${Math.round(remaining)}h to finish`;
}

interface StalledGameNudgeProps {
  games: Game[];
  onTabSwitch?: (tabId: string) => void;
}

export default function StalledGameNudge({ games, onTabSwitch }: StalledGameNudgeProps) {
  const [dismissed, setDismissed] = useState(isSessionDismissed);
  const { cycleStatus, showCelebration } = useStore();
  const updateGame = useStore((s) => s.updateGame);
  const { showToast } = useToast();

  const stalledGames = useMemo(() => getStalledGames(games), [games]);

  // Pick one per session — rotate based on day of year
  const nudgeGame = useMemo(() => {
    if (stalledGames.length === 0) return null;
    const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return stalledGames[dayOfYear % stalledGames.length];
  }, [stalledGames]);

  const handleDismiss = useCallback(() => {
    if (nudgeGame) {
      saveDismissal(nudgeGame.id);
    }
    setSessionDismissed();
    setDismissed(true);
  }, [nudgeGame]);

  const handleAction = useCallback((action: 'playing' | 'on-deck' | 'buried') => {
    if (!nudgeGame) return;

    if (action === 'playing') {
      // Now Playing cap check
      const { games } = useStore.getState();
      const nowPlayingCount = games.filter((g) => g.status === 'playing').length;
      if (nowPlayingCount >= 3) {
        showToast('Now Playing is capped at 3. Finish or shelve something first.');
        return;
      }
      updateGame(nudgeGame.id, { status: 'playing', updatedAt: new Date().toISOString() });
      showToast(`${nudgeGame.name} → Now Playing 🔥`);
      onTabSwitch?.('now-playing');
    } else if (action === 'on-deck') {
      updateGame(nudgeGame.id, { status: 'on-deck', updatedAt: new Date().toISOString() });
      showToast(`${nudgeGame.name} → Up Next 🎯`);
      onTabSwitch?.('up-next');
    }
    // 'buried' = leave it where it is, just dismiss the nudge

    setSessionDismissed();
    setDismissed(true);
  }, [nudgeGame, updateGame, showToast, onTabSwitch]);

  if (dismissed || !nudgeGame) return null;

  const remaining = getRemainingText(nudgeGame);

  return (
    <div
      className="rounded-xl border overflow-hidden mb-3 animate-[fadeIn_300ms_ease-out]"
      style={{
        backgroundColor: 'rgba(124, 58, 237, 0.06)',
        borderColor: 'rgba(124, 58, 237, 0.2)',
      }}
    >
      <div className="px-4 py-3.5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔄</span>
            <span className="text-xs font-semibold text-text-primary font-[family-name:var(--font-mono)]">
              Pick up where you left off?
            </span>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss suggestion"
            className="shrink-0 text-text-faint hover:text-text-muted transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Game info */}
        <div className="flex gap-3 mb-3">
          {nudgeGame.coverUrl && (
            <img
              src={nudgeGame.coverUrl}
              alt=""
              className="w-14 h-20 rounded-lg object-cover shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate mb-1">
              {nudgeGame.name}
            </p>
            <p className="text-xs text-text-muted leading-relaxed">
              {getStallMessage(nudgeGame)}
            </p>
            {remaining && (
              <p className="text-[11px] font-[family-name:var(--font-mono)] mt-1" style={{ color: '#fcd34d' }}>
                ⏳ {remaining}
              </p>
            )}
          </div>
        </div>

        {/* Action label + buttons */}
        <p className="text-[10px] text-text-dim font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1.5">
          Move this game to:
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleAction('playing')}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold font-[family-name:var(--font-mono)] transition-all hover:brightness-110 active:scale-[0.97]"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
            }}
          >
            🔥 Now Playing
          </button>
          <button
            onClick={() => handleAction('on-deck')}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold font-[family-name:var(--font-mono)] transition-all hover:brightness-110 active:scale-[0.97]"
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
            }}
          >
            🎯 Up Next
          </button>
          <button
            onClick={() => handleAction('buried')}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold font-[family-name:var(--font-mono)] transition-all hover:brightness-110 active:scale-[0.97]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--color-text-dim)',
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
