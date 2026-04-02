'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Game } from '@/lib/types';
import { useStore } from '@/lib/store';
import { STATUS_CONFIG, REROLL_MESSAGES, TIME_TIER_CONFIG } from '@/lib/constants';
import { getGameDescriptor } from '@/lib/descriptors';
import { REROLL_MODES, RerollMode, getEligibleGames, pickRandom } from '@/lib/reroll';
import { useToast } from './Toast';
import { trackReroll, trackRerollCommit } from '@/lib/analytics';

interface RerollProps {
  open: boolean;
  onClose: () => void;
  initialMode?: RerollMode;
}

export default function Reroll({ open, onClose, initialMode }: RerollProps) {
  const [mode, setMode] = useState<RerollMode>('anything');
  const [currentPick, setCurrentPick] = useState<Game | null>(null);
  const [rolling, setRolling] = useState(false);
  const [showForced, setShowForced] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [skipModePicker, setSkipModePicker] = useState(false);

  const games = useStore((s) => s.games);
  const platformPreference = useStore((s) => s.settings.platformPreference) || 'any';
  const reroll = useStore((s) => s.reroll);
  const incrementReroll = useStore((s) => s.incrementReroll);
  const pushLastPick = useStore((s) => s.pushLastPick);
  const resetReroll = useStore((s) => s.resetReroll);
  const updateGame = useStore((s) => s.updateGame);
  const { showToast } = useToast();

  const doRoll = useCallback((overrideMode?: RerollMode) => {
    const rollMode = overrideMode || mode;
    const eligible = getEligibleGames(games, rollMode, platformPreference);
    const pick = pickRandom(eligible);
    if (!pick) {
      showToast('No games match this mode. Add some games first.');
      return;
    }

    // Push current pick to last three before rolling new one
    if (currentPick) {
      pushLastPick(currentPick);
    }

    incrementReroll();
    trackReroll(rollMode);
    const newCount = reroll.sessionCount + 1;

    // Check for reroll messages
    if (REROLL_MESSAGES[newCount]) {
      showToast(REROLL_MESSAGES[newCount]);
    }

    // Animate
    setRolling(true);
    setRevealed(false);

    setTimeout(() => {
      setCurrentPick(pick);
      setRolling(false);
      setRevealed(true);

      // Check if forced choice at roll 10
      if (newCount >= 10) {
        setTimeout(() => setShowForced(true), 600);
      }
    }, 500);
  }, [games, mode, currentPick, reroll.sessionCount, incrementReroll, pushLastPick, showToast]);

  const handleLetsGo = useCallback((game: Game) => {
    updateGame(game.id, { status: 'playing' });
    trackRerollCommit();
    showToast(`${game.name} → Playing 🔥 Let's go!`);
    resetReroll();
    setCurrentPick(null);
    setShowForced(false);
    setRevealed(false);
    onClose();
  }, [updateGame, resetReroll, showToast, onClose]);

  const handleNotNow = useCallback(() => {
    resetReroll();
    setCurrentPick(null);
    setShowForced(false);
    setRevealed(false);
    onClose();
  }, [resetReroll, onClose]);

  const handleFirstRoll = useCallback(() => {
    const eligible = getEligibleGames(games, mode, platformPreference);
    if (eligible.length === 0) {
      showToast('No games match this mode.');
      return;
    }
    doRoll();
  }, [games, mode, doRoll, showToast]);

  // Reset state when modal opens — if initialMode provided, auto-roll
  useEffect(() => {
    if (open) {
      setCurrentPick(null);
      setShowForced(false);
      setRevealed(false);
      if (initialMode) {
        setMode(initialMode);
        setSkipModePicker(true);
      } else {
        setMode('anything');
        setSkipModePicker(false);
      }
    }
  }, [open, initialMode]);

  // Auto-roll on open when mode is pre-selected
  useEffect(() => {
    if (open && skipModePicker && !currentPick && !rolling) {
      const eligible = getEligibleGames(games, mode, platformPreference);
      if (eligible.length > 0) {
        doRoll();
      } else {
        showToast('No games match this mode.');
        onClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, skipModePicker]);

  const modalRef = useRef<HTMLDivElement>(null);

  // Escape to close + focus trapping
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleNotNow();
        return;
      }

      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const modal = modalRef.current;
    if (modal) {
      const first = modal.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  const forcedPicks = reroll.lastThreePicks;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleNotNow}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="What Should I Play"
        className="relative w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
          animation: 'scaleIn 400ms ease-out',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 text-center">
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
            🎲 {currentPick ? 'Roll Again' : 'What Should I Play?'}
          </h2>
          {currentPick ? (
            <p className="text-xs text-text-dim mt-1 font-[family-name:var(--font-mono)]">
              Roll {reroll.sessionCount}
            </p>
          ) : (
            <p className="text-xs text-text-dim mt-1 font-[family-name:var(--font-mono)]">
              Pick a mode and roll
            </p>
          )}
        </div>

        {/* Mode Selector (only before first roll, skip if mode pre-selected) */}
        {!currentPick && !showForced && !skipModePicker && (
          <div className="px-5 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {REROLL_MODES.map(({ mode: m, label, icon, description }) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-2.5 rounded-xl text-left border transition-all ${
                    mode === m
                      ? 'border-accent-purple'
                      : 'border-border-subtle hover:border-border-active'
                  }`}
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <div className="text-sm font-medium text-text-primary">
                    {icon} {label}
                  </div>
                  <div className="text-[10px] text-text-dim mt-0.5">{description}</div>
                </button>
              ))}
            </div>
            <button
              onClick={handleFirstRoll}
              className="w-full mt-3 px-4 py-3 text-base font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--color-accent-purple)',
                color: '#0a0a0f',
              }}
            >
              🎲 Roll
            </button>
          </div>
        )}

        {/* Current Pick */}
        {currentPick && !showForced && (
          <div className={`px-5 pb-5 transition-all duration-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
            {/* Mode switcher pills */}
            <div className="flex justify-center gap-1.5 mb-4">
              {REROLL_MODES.map(({ mode: m, icon }) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); doRoll(m); }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium font-[family-name:var(--font-mono)] transition-all ${
                    mode === m
                      ? 'bg-white/10 text-text-primary'
                      : 'text-text-dim hover:text-text-muted hover:bg-white/5'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Game reveal */}
            <div
              className="rounded-xl border overflow-hidden mb-4 text-center"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-active)',
              }}
            >
              {/* Cover art hero */}
              {currentPick.coverUrl ? (
                <div className="relative w-full h-40 sm:h-48 overflow-hidden">
                  <img
                    src={currentPick.coverUrl}
                    alt={currentPick.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] via-transparent to-transparent" />
                </div>
              ) : (
                <div className="w-full h-24 flex items-center justify-center text-4xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  🎮
                </div>
              )}
              <div className="px-5 pb-5 pt-3">
              <h3 className="text-xl font-bold text-text-primary mb-2">
                {currentPick.name}
              </h3>
              <div className="flex justify-center gap-4 text-xs text-text-dim font-[family-name:var(--font-mono)]">
                <span>{TIME_TIER_CONFIG[currentPick.timeTier].icon} {TIME_TIER_CONFIG[currentPick.timeTier].label}</span>
                <span>{STATUS_CONFIG[currentPick.status].icon} {STATUS_CONFIG[currentPick.status].label}</span>
                {currentPick.hoursPlayed > 0 && <span>{currentPick.hoursPlayed}h logged</span>}
              </div>
              {/* Descriptor */}
              {(() => {
                const desc = getGameDescriptor(currentPick.name, currentPick.metacritic, currentPick.genres);
                return desc ? (
                  <p
                    className="text-sm mt-3 leading-relaxed italic"
                    style={{
                      color: desc.confidence === 'curated' ? '#a78bfa' : 'var(--color-text-muted)',
                    }}
                  >
                    &ldquo;{desc.line}&rdquo;
                  </p>
                ) : null;
              })()}
              {currentPick.notes && (
                <p className="text-xs text-text-muted mt-2 leading-relaxed">{currentPick.notes}</p>
              )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleNotNow}
                className="flex-1 px-3 py-2.5 text-sm font-medium text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
              >
                Not now
              </button>
              <button
                onClick={() => doRoll()}
                disabled={reroll.sessionCount >= 10}
                className="flex-1 px-3 py-2.5 text-sm font-medium rounded-xl border border-border-subtle text-text-secondary hover:border-accent-purple transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                🎲 Roll Again
              </button>
              <button
                onClick={() => handleLetsGo(currentPick)}
                className="flex-1 px-3 py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--color-accent-purple)',
                  color: '#0a0a0f',
                }}
              >
                Let&apos;s go
              </button>
            </div>
          </div>
        )}

        {/* Forced Choice (Roll 10) */}
        {showForced && (
          <div className="px-5 pb-5">
            <p className="text-center text-sm font-medium text-text-secondary mb-4">
              Pick one. No more rolls.
            </p>
            <div className="space-y-2">
              {forcedPicks.map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleLetsGo(game)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-accent-purple hover:scale-[1.01]"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border-subtle)',
                  }}
                >
                  {game.coverUrl && (
                    <img src={game.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  )}
                  <span className="flex-1 text-sm font-medium text-text-primary text-left truncate">
                    {game.name}
                  </span>
                  <span className="text-xs text-text-dim">
                    {TIME_TIER_CONFIG[game.timeTier].icon}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={handleNotNow}
              className="w-full mt-3 px-3 py-2 text-xs text-text-dim hover:text-text-muted transition-colors"
            >
              Fine, I&apos;ll pick later
            </button>
          </div>
        )}

        {/* Rolling animation overlay */}
        {rolling && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-5xl animate-bounce">🎲</div>
          </div>
        )}
      </div>
    </div>
  );
}
