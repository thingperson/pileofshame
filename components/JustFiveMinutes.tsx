'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Game, GameStatus } from '@/lib/types';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';
import { trackJust5Min } from '@/lib/analytics';

const TIMER_SECONDS = 300; // 5 minutes

interface JustFiveMinutesProps {
  games: Game[];
}

function pickFiveMinuteGame(games: Game[]): Game | null {
  const eligible = games.filter(
    (g) => g.status === 'buried' || g.status === 'on-deck'
  );
  if (eligible.length === 0) return null;

  const weighted = eligible.map((g) => {
    let weight = 1;
    if (g.timeTier === 'quick-hit') weight += 3;
    if (g.timeTier === 'wind-down') weight += 2;
    if (g.hoursPlayed > 0 && g.hoursPlayed < 20) weight += 2;
    const daysSinceAdded = (Date.now() - new Date(g.addedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceAdded < 30) weight += 1;
    return { game: g, weight };
  });

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return w.game;
  }
  return weighted[weighted.length - 1].game;
}

type TriageStep = 'suggest' | 'timing' | 'triage';

export default function JustFiveMinutes({ games }: JustFiveMinutesProps) {
  const [active, setActive] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [step, setStep] = useState<TriageStep>('suggest');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();
  const updateGame = useStore((s) => s.updateGame);
  const setBailed = useStore((s) => s.setBailed);

  const resetTimer = useCallback(() => {
    setTimeLeft(TIMER_SECONDS);
    setTimerRunning(false);
    setTimerDone(false);
    setStep('suggest');
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const startSession = useCallback(() => {
    const pick = pickFiveMinuteGame(games);
    if (!pick) {
      showToast('No games in your pile to try. Add some first!');
      return;
    }
    setGame(pick);
    setActive(true);
    trackJust5Min();
    resetTimer();
  }, [games, showToast, resetTimer]);

  const startTimer = useCallback(() => {
    setTimerRunning(true);
    setStep('timing');
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timerRunning || timerDone) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerDone(true);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, timerDone]);

  // When timer finishes, move to triage
  useEffect(() => {
    if (timerDone) setStep('triage');
  }, [timerDone]);

  const handleTriage = (action: 'playing' | 'on-deck' | 'pile' | 'bail') => {
    if (!game) return;
    switch (action) {
      case 'playing': {
        const { games: allGames } = useStore.getState();
        const nowPlayingCount = allGames.filter((g) => g.status === 'playing').length;
        if (nowPlayingCount >= 3) {
          showToast('Now Playing is capped at 3. Finish or shelve something first.');
          return;
        }
        updateGame(game.id, { status: 'playing' as GameStatus });
        showToast(`🙌 ${game.name} → Now Playing. You tried it, you liked it, you're in.`);
      }
        break;
      case 'on-deck':
        updateGame(game.id, { status: 'on-deck' as GameStatus });
        showToast(`🙌 ${game.name} → Play Next. Tried it, shelved it, you know exactly when you'll want it.`);
        break;
      case 'pile':
        showToast(`🙌 ${game.name} stays in The Pile. You tried it. Now you know what it feels like. That's not nothing.`);
        break;
      case 'bail':
        setBailed(game.id);
        showToast(`🙌 ${game.name} → Not for you. 5 minutes saved you hours. That's a win.`);
        break;
    }
    handleClose();
  };

  const handleSkip = () => {
    const pick = pickFiveMinuteGame(games);
    if (pick) {
      setGame(pick);
      resetTimer();
    }
  };

  const handleEarlyTriage = () => {
    setTimerRunning(false);
    setTimerDone(true);
    setStep('triage');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleClose = () => {
    setActive(false);
    setGame(null);
    resetTimer();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const pct = ((300 - timeLeft) / TIMER_SECONDS) * 100;

  return (
    <>
      {/* Button — always rendered in the mode button row */}
      <button
        onClick={startSession}
        className="shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 active:scale-[0.97] whitespace-nowrap"
        style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}
        title="Try a game for 5 minutes. Then decide where it goes."
      >
        ⚡ Just 5 Min
      </button>

      {/* Main card — bottom-sheet overlay for suggest and triage phases */}
      {active && (step === 'suggest' || step === 'triage') && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />
          <div
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border p-4 space-y-3"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'rgba(5, 150, 105, 0.3)',
              background: 'linear-gradient(135deg, var(--color-bg-card), rgba(5, 150, 105, 0.05))',
              animation: 'scaleIn 300ms ease-out',
            }}
          >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider" style={{ color: '#34d399' }}>
              ⚡ Just 5 Minutes
            </span>
            <button onClick={handleClose} aria-label="Close Just 5 Minutes" className="text-text-dim hover:text-text-muted text-xs">✕</button>
          </div>

          {/* Game */}
          <div className="flex items-center gap-3">
            {game?.coverUrl && (
              <img src={game.coverUrl} alt={`${game.name} cover art`} className="w-12 h-16 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-text-primary truncate">{game?.name}</p>
              <p className="text-xs text-text-dim mt-0.5">
                {step === 'suggest' && 'Give it 5 minutes. Then decide where it goes.'}
                {step === 'triage' && 'You tried it. Now you know. Where does it belong?'}
              </p>
            </div>
          </div>

          {/* Suggest phase — start timer or skip */}
          {step === 'suggest' && (
            <div className="flex gap-2">
              <button
                onClick={startTimer}
                className="flex-1 px-3 py-2.5 text-sm font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: 'rgba(5, 150, 105, 0.15)', color: '#34d399' }}
              >
                ▶ Start 5 min timer
              </button>
              <button
                onClick={handleSkip}
                className="px-3 py-2.5 text-sm text-text-dim rounded-lg border border-border-subtle hover:text-text-muted transition-colors"
              >
                🔄 Skip
              </button>
            </div>
          )}

          {/* Triage phase — decide where this game goes */}
          {step === 'triage' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTriage('playing')}
                  className="px-3 py-2.5 text-sm font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}
                >
                  🔥 Playing this now
                </button>
                <button
                  onClick={() => handleTriage('on-deck')}
                  className="px-3 py-2.5 text-sm font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa' }}
                >
                  📋 Play Next
                </button>
                <button
                  onClick={() => handleTriage('pile')}
                  className="px-3 py-2.5 text-sm font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}
                >
                  📚 Back to The Pile
                </button>
                <button
                  onClick={() => handleTriage('bail')}
                  className="px-3 py-2.5 text-sm font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-text-dim)' }}
                >
                  🚪 Not for me
                </button>
              </div>
              <button
                onClick={startSession}
                className="w-full px-3 py-2 text-xs text-text-dim rounded-lg border border-border-subtle hover:text-text-muted transition-colors font-[family-name:var(--font-mono)]"
              >
                ⚡ Try another game instead
              </button>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Floating timer pill — shows during timing phase, sticks to bottom */}
      {active && step === 'timing' && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 pl-3 pr-2 py-2 rounded-full shadow-xl shadow-black/40"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid rgba(5, 150, 105, 0.4)',
            animation: 'scaleIn 300ms ease-out',
            maxWidth: 'calc(100vw - 2rem)',
          }}
        >
          {/* Mini progress ring */}
          <div className="relative w-10 h-10 shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
              <circle
                cx="20" cy="20" r="16"
                stroke="#34d399"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 16}
                strokeDashoffset={2 * Math.PI * 16 * (1 - pct / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-[family-name:var(--font-mono)] text-text-primary" aria-live="off" aria-label={`${formatTime(timeLeft)} remaining`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Game name */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{game?.name}</p>
            <p className="text-xs text-text-dim font-[family-name:var(--font-mono)]">go play. we&apos;ll wait</p>
          </div>

          {/* Quick actions */}
          <button
            onClick={handleEarlyTriage}
            className="px-3 py-1.5 text-xs font-bold rounded-full transition-all hover:scale-[1.05] active:scale-[0.95] shrink-0"
            style={{ backgroundColor: 'rgba(5, 150, 105, 0.15)', color: '#34d399' }}
          >
            I&apos;ve decided
          </button>
          <button
            onClick={handleClose}
            aria-label="Close timer"
            className="w-8 h-8 flex items-center justify-center rounded-full text-text-dim hover:text-text-muted text-xs shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
