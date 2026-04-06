'use client';

import { useState, useMemo, useCallback } from 'react';
import { Game } from '@/lib/types';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';

/**
 * "Did you finish this?" Nudge — surfaces one game per session that
 * looks like the user may have finished based on HLTB progress.
 *
 * Criteria:
 *   - hoursPlayed >= hltbMain * 0.85 (85%+ through the main story)
 *   - hltbMain exists and > 0
 *   - status is NOT 'played' or 'bailed' (they haven't marked it)
 *   - not ignored
 *   - not dismissed 3+ times for this game
 *
 * Separate from StalledGameNudge. Both can show in a session but
 * this one fires second (below the stalled nudge in the DOM).
 */

const DISMISS_KEY = 'if-finish-check-dismissals';
const SESSION_KEY = 'if-finish-check-session';

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

function getFinishCandidates(games: Game[]): Game[] {
  const dismissals = getDismissals();

  return games.filter((g) => {
    // Must have HLTB data
    if (!g.hltbMain || g.hltbMain <= 0) return false;
    // Must have meaningful playtime at 85%+ of main story
    if (g.hoursPlayed < g.hltbMain * 0.85) return false;
    // Must not already be marked finished or bailed
    if (g.status === 'played' || g.status === 'bailed') return false;
    // Must not be ignored
    if (g.ignored) return false;
    // Not dismissed 3+ times
    if ((dismissals[g.id] || 0) >= 3) return false;

    return true;
  }).sort((a, b) => {
    // Prioritize by completion percentage (highest first)
    const pctA = a.hltbMain ? a.hoursPlayed / a.hltbMain : 0;
    const pctB = b.hltbMain ? b.hoursPlayed / b.hltbMain : 0;
    return pctB - pctA;
  });
}

function getFinishMessage(game: Game): { question: string; subtext: string } {
  const pct = game.hltbMain ? Math.round((game.hoursPlayed / game.hltbMain) * 100) : 0;
  const hours = game.hoursPlayed;

  if (pct >= 130) {
    return {
      question: `You've got ${hours} hours in this. Most people finish in ${game.hltbMain}h.`,
      subtext: 'Did you actually get through it? That would be worth celebrating.',
    };
  }
  if (pct >= 100) {
    return {
      question: `${hours} hours played, ${game.hltbMain}h average completion. Looks like you might be done.`,
      subtext: 'Credits roll? Or still going?',
    };
  }
  // 85-99%
  return {
    question: `You're about ${pct}% through this one. Only ~${Math.round(game.hltbMain! - game.hoursPlayed)}h left.`,
    subtext: 'That is a win sitting right there.',
  };
}

interface FinishCheckNudgeProps {
  games: Game[];
}

export default function FinishCheckNudge({ games }: FinishCheckNudgeProps) {
  const [dismissed, setDismissed] = useState(isSessionDismissed);
  const { showCelebration } = useStore();
  const updateGame = useStore((s) => s.updateGame);
  const { showToast } = useToast();

  const candidates = useMemo(() => getFinishCandidates(games), [games]);

  // Pick one per session, rotate by day
  const nudgeGame = useMemo(() => {
    if (candidates.length === 0) return null;
    const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    // Offset by 7 so it doesn't sync with StalledGameNudge rotation
    return candidates[(dayOfYear + 7) % candidates.length];
  }, [candidates]);

  const handleDismiss = useCallback(() => {
    if (nudgeGame) {
      saveDismissal(nudgeGame.id);
    }
    setSessionDismissed();
    setDismissed(true);
  }, [nudgeGame]);

  const handleYesFinished = useCallback(() => {
    if (!nudgeGame) return;
    // Mark as completed and trigger celebration
    updateGame(nudgeGame.id, {
      status: 'played',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    showCelebration(nudgeGame);
    setSessionDismissed();
    setDismissed(true);
  }, [nudgeGame, updateGame, showCelebration]);

  const handleNotYet = useCallback(() => {
    if (!nudgeGame) return;
    // Move to Now Playing to encourage finishing
    updateGame(nudgeGame.id, {
      status: 'playing',
      updatedAt: new Date().toISOString(),
    });
    showToast(`${nudgeGame.name} -> Now Playing. You're so close.`);
    setSessionDismissed();
    setDismissed(true);
  }, [nudgeGame, updateGame, showToast]);

  if (dismissed || !nudgeGame) return null;

  const { question, subtext } = getFinishMessage(nudgeGame);

  return (
    <div
      className="rounded-xl border overflow-hidden mb-3 animate-[fadeIn_300ms_ease-out]"
      style={{
        backgroundColor: 'rgba(34, 197, 94, 0.06)',
        borderColor: 'rgba(34, 197, 94, 0.2)',
      }}
    >
      <div className="px-4 py-3.5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏁</span>
            <span className="text-xs font-semibold text-text-primary font-[family-name:var(--font-mono)]">
              Did you finish this?
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
              {question}
            </p>
            <p className="text-[11px] text-text-dim mt-1 leading-relaxed">
              {subtext}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleYesFinished}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold font-[family-name:var(--font-mono)] transition-all hover:brightness-110 active:scale-[0.97]"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
            }}
          >
            🎉 Yes, I finished it
          </button>
          <button
            onClick={handleNotYet}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold font-[family-name:var(--font-mono)] transition-all hover:brightness-110 active:scale-[0.97]"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#fcd34d',
            }}
          >
            ⏳ Not yet
          </button>
          <button
            onClick={handleDismiss}
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
