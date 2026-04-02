'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Game } from '@/lib/types';
import { useToast } from './Toast';

interface JustFiveMinutesProps {
  games: Game[];
}

function pickFiveMinuteGame(games: Game[]): Game | null {
  // Eligible: backlog or on-deck games (not playing/played/bailed)
  const eligible = games.filter(
    (g) => g.status === 'buried' || g.status === 'on-deck'
  );
  if (eligible.length === 0) return null;

  // Weight toward: shorter games, games with some progress, recently added
  const weighted = eligible.map((g) => {
    let weight = 1;
    // Prefer shorter games (quick-hit, wind-down)
    if (g.timeTier === 'quick-hit') weight += 3;
    if (g.timeTier === 'wind-down') weight += 2;
    // Slightly prefer games with some playtime (familiar = lower barrier)
    if (g.hoursPlayed > 0 && g.hoursPlayed < 20) weight += 2;
    // Prefer recently added (fresh interest)
    const daysSinceAdded = (Date.now() - new Date(g.addedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceAdded < 30) weight += 1;
    return { game: g, weight };
  });

  // Weighted random pick
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return w.game;
  }
  return weighted[weighted.length - 1].game;
}

export default function JustFiveMinutes({ games }: JustFiveMinutesProps) {
  const [active, setActive] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();

  const startSession = useCallback(() => {
    const pick = pickFiveMinuteGame(games);
    if (!pick) {
      showToast('No games in your pile to try. Add some first!');
      return;
    }
    setGame(pick);
    setActive(true);
    setTimeLeft(300);
    setTimerRunning(false);
    setTimerDone(false);
  }, [games, showToast]);

  const startTimer = useCallback(() => {
    setTimerRunning(true);
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

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timerDone]);

  const handleKeepPlaying = () => {
    showToast(`Still going with ${game?.name}. That's the spirit. ⚡`);
    handleClose();
  };

  const handleDoneForNow = () => {
    showToast(`5 minutes done. You showed up. That counts. ✊`);
    handleClose();
  };

  const handleSkip = () => {
    const pick = pickFiveMinuteGame(games);
    if (pick) {
      setGame(pick);
      setTimeLeft(300);
      setTimerRunning(false);
      setTimerDone(false);
    }
  };

  const handleClose = () => {
    setActive(false);
    setGame(null);
    setTimerRunning(false);
    setTimerDone(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Just the button when not active
  if (!active) {
    return (
      <button
        onClick={startSession}
        className="flex-1 px-3 py-2.5 text-sm font-semibold rounded-xl text-white transition-all hover:-translate-y-0.5 active:scale-[0.97]"
        style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}
        title="Commit to just 5 minutes. That's it."
      >
        ⚡&nbsp; <span className="hidden sm:inline">Just </span>5 Min
      </button>
    );
  }

  // Active session card
  return (
    <div
      className="rounded-xl border p-4 space-y-3"
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
        <button
          onClick={handleClose}
          className="text-text-dim hover:text-text-muted text-xs"
        >
          ✕
        </button>
      </div>

      {/* Game suggestion */}
      <div className="flex items-center gap-3">
        {game?.coverUrl && (
          <img src={game.coverUrl} alt="" className="w-12 h-16 rounded-lg object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-text-primary truncate">{game?.name}</p>
          <p className="text-xs text-text-dim mt-0.5">
            {!timerRunning && !timerDone
              ? 'Give it just 5 minutes. No commitment.'
              : timerDone
              ? '5 minutes done. You showed up.'
              : 'Timer running. Go play.'}
          </p>
        </div>
      </div>

      {/* Timer */}
      {!timerDone && (
        <div className="flex items-center gap-3">
          {/* Progress ring */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" stroke="rgba(255,255,255,0.06)" strokeWidth="4" fill="none" />
              <circle
                cx="28" cy="28" r="24"
                stroke="#34d399"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (timeLeft / 300)}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-[family-name:var(--font-mono)] text-text-primary">
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="flex-1 flex gap-2">
            {!timerRunning ? (
              <>
                <button
                  onClick={startTimer}
                  className="flex-1 px-3 py-2 text-sm font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: 'rgba(5, 150, 105, 0.15)', color: '#34d399' }}
                >
                  ▶ Start timer
                </button>
                <button
                  onClick={handleSkip}
                  className="px-3 py-2 text-sm text-text-dim rounded-lg border border-border-subtle hover:text-text-muted transition-colors"
                >
                  🔄 Different game
                </button>
              </>
            ) : (
              <button
                onClick={handleDoneForNow}
                className="flex-1 px-3 py-2 text-sm text-text-dim rounded-lg border border-border-subtle hover:text-text-muted transition-colors"
              >
                Done early? That counts too.
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timer done — celebration */}
      {timerDone && (
        <div className="flex gap-2">
          <button
            onClick={handleKeepPlaying}
            className="flex-1 px-3 py-2.5 text-sm font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: 'rgba(5, 150, 105, 0.15)', color: '#34d399' }}
          >
            ⚡ Keep going
          </button>
          <button
            onClick={handleDoneForNow}
            className="flex-1 px-3 py-2.5 text-sm font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa' }}
          >
            ✊ Done for now
          </button>
        </div>
      )}
    </div>
  );
}
