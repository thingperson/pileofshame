'use client';

import { useState, useCallback, useEffect } from 'react';
import { Game } from '@/lib/types';
import { useStore } from '@/lib/store';
import { STATUS_CONFIG, REROLL_MESSAGES, TIME_TIER_CONFIG, getVibeColor } from '@/lib/constants';
import { REROLL_MODES, RerollMode, getEligibleGames, pickRandom } from '@/lib/reroll';
import { useToast } from './Toast';

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
  const reroll = useStore((s) => s.reroll);
  const incrementReroll = useStore((s) => s.incrementReroll);
  const pushLastPick = useStore((s) => s.pushLastPick);
  const resetReroll = useStore((s) => s.resetReroll);
  const updateGame = useStore((s) => s.updateGame);
  const { showToast } = useToast();

  const doRoll = useCallback((overrideMode?: RerollMode) => {
    const rollMode = overrideMode || mode;
    const eligible = getEligibleGames(games, rollMode);
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
    const eligible = getEligibleGames(games, mode);
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
      const eligible = getEligibleGames(games, mode);
      if (eligible.length > 0) {
        doRoll();
      } else {
        showToast('No games match this mode.');
        onClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, skipModePicker]);

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
            🎲 Reroll
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
              className="rounded-xl border p-5 mb-4 text-center"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-active)',
              }}
            >
              <h3 className="text-xl font-bold text-text-primary mb-2">
                {currentPick.name}
              </h3>
              <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                {currentPick.vibes.map((vibe) => (
                  <span
                    key={vibe}
                    className="px-2 py-0.5 rounded-full text-[11px] font-medium font-[family-name:var(--font-mono)]"
                    style={{
                      backgroundColor: `${getVibeColor(vibe)}15`,
                      color: getVibeColor(vibe),
                      border: `1px solid ${getVibeColor(vibe)}30`,
                    }}
                  >
                    {vibe}
                  </span>
                ))}
              </div>
              <div className="flex justify-center gap-4 text-xs text-text-dim font-[family-name:var(--font-mono)]">
                <span>{TIME_TIER_CONFIG[currentPick.timeTier].icon} {TIME_TIER_CONFIG[currentPick.timeTier].label}</span>
                <span>{STATUS_CONFIG[currentPick.status].icon} {STATUS_CONFIG[currentPick.status].label}</span>
                {currentPick.hoursPlayed > 0 && <span>{currentPick.hoursPlayed}h logged</span>}
              </div>
              {currentPick.notes && (
                <p className="text-xs text-text-muted mt-3 leading-relaxed">{currentPick.notes}</p>
              )}
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
                🎲 Reroll
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
                  <span
                    className="px-2 py-0.5 rounded-md text-xs font-medium font-[family-name:var(--font-mono)]"
                    style={{
                      backgroundColor: STATUS_CONFIG[game.status].bg,
                      color: STATUS_CONFIG[game.status].color,
                    }}
                  >
                    {STATUS_CONFIG[game.status].icon}
                  </span>
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
