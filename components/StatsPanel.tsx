'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Game } from '@/lib/types';
import { useToast } from './Toast';

interface StatsPanelProps {
  games: Game[];
}

// Fallback MSRP estimate when CheapShark lookup fails
const FALLBACK_AVG_PRICE = 18;

function estimateValue(count: number, avgPrice: number): number {
  return Math.round(count * avgPrice);
}

function getOldestBacklogGame(games: Game[]): { name: string; days: number } | null {
  const backlog = games.filter(
    (g) => g.status === 'buried' || g.status === 'on-deck'
  );
  if (backlog.length === 0) return null;

  let oldest = backlog[0];
  for (const g of backlog) {
    if (g.addedAt < oldest.addedAt) oldest = g;
  }

  const days = Math.floor(
    (Date.now() - new Date(oldest.addedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  return { name: oldest.name, days };
}

function getCurrentStreak(games: Game[]): number {
  const sorted = games
    .filter((g) => g.status === 'played' || g.status === 'bailed')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  let streak = 0;
  for (const g of sorted) {
    if (g.status === 'played') streak++;
    else break;
  }
  return streak;
}

// Counting animation hook
function useCountUp(target: number, active: boolean, duration = 1500): number {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!active) { setCurrent(0); return; }

    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, active, duration]);

  return current;
}

// Pre-cooked roast templates — pick one based on stats
function generateShameText(stats: {
  backlogSize: number;
  gamesCleared: number;
  bailedCount: number;
  unplayedValue: number;
  playedValue: number;
  oldest: { name: string; days: number } | null;
  streak: number;
}): string {
  const lines: string[] = [];

  // Opening roast
  if (stats.backlogSize > 200) {
    lines.push(`I have ${stats.backlogSize} unplayed games. That's not a backlog, that's a graveyard.`);
  } else if (stats.backlogSize > 100) {
    lines.push(`${stats.backlogSize} games in my backlog and I keep buying more. Send help.`);
  } else if (stats.backlogSize > 50) {
    lines.push(`Only ${stats.backlogSize} games in my backlog. I'm practically a minimalist.`);
  } else if (stats.backlogSize > 0) {
    lines.push(`${stats.backlogSize} games in the pile. Getting there.`);
  } else {
    lines.push(`I actually cleared my backlog. Yes, I'm real.`);
  }

  // The money shot
  if (stats.unplayedValue > 0) {
    lines.push(`That's ~$${stats.unplayedValue.toLocaleString()} of games collecting digital dust.`);
  }

  // Victory lap
  if (stats.gamesCleared > 0) {
    lines.push(`${stats.gamesCleared} cleared${stats.playedValue > 0 ? ` ($${stats.playedValue.toLocaleString()} redeemed)` : ''}.`);
  }

  // Oldest shame
  if (stats.oldest && stats.oldest.days > 30) {
    lines.push(`${stats.oldest.name} has been sitting there for ${stats.oldest.days} days. It's fine.`);
  }

  // Streak flex
  if (stats.streak >= 5) {
    lines.push(`${stats.streak} games cleared without bailing. On a roll.`);
  }

  lines.push(`\nCheck your own shame → pileofsha.me`);

  return lines.join('\n');
}

function shareToTwitter(text: string) {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=550,height=420');
}

function shareToReddit(text: string) {
  const url = `https://reddit.com/submit?selftext=true&title=${encodeURIComponent('My Pile of Shame stats are... concerning')}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export default function StatsPanel({ games }: StatsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [avgPrice, setAvgPrice] = useState(FALLBACK_AVG_PRICE);
  const [priceSource, setPriceSource] = useState<'estimate' | 'cheapshark'>('estimate');
  const { showToast } = useToast();

  const stats = useMemo(() => {
    const backlogSize = games.filter(
      (g) => g.status === 'buried' || g.status === 'on-deck'
    ).length;
    const gamesCleared = games.filter((g) => g.status === 'played').length;
    const bailedCount = games.filter((g) => g.status === 'bailed').length;
    const nowPlaying = games.filter((g) => g.status === 'playing').length;
    const totalHours = games.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0);
    const streak = getCurrentStreak(games);
    const oldest = getOldestBacklogGame(games);

    return { backlogSize, gamesCleared, bailedCount, nowPlaying, totalHours, streak, oldest };
  }, [games]);

  const unplayedValue = estimateValue(stats.backlogSize, avgPrice);
  const playedValue = estimateValue(stats.gamesCleared + stats.nowPlaying, avgPrice);

  const countedUnplayed = useCountUp(unplayedValue, calculating);
  const countedPlayed = useCountUp(playedValue, calculating);

  const handleCalculate = useCallback(async () => {
    setCalculating(true);

    // Sample up to 20 random games for price lookup
    const sampleGames = [...games]
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);

    try {
      const titles = sampleGames.map((g) => g.name).join(',');
      const res = await fetch(`/api/deals?action=prices&titles=${encodeURIComponent(titles)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.prices && data.prices.length >= 3) {
          const avg = data.prices.reduce((sum: number, p: { retailPrice: number }) => sum + p.retailPrice, 0) / data.prices.length;
          if (avg > 0) {
            setAvgPrice(Math.round(avg * 100) / 100);
            setPriceSource('cheapshark');
          }
        }
      }
    } catch {
      // Fall back to estimate — no big deal
    }

    setTimeout(() => setCalculated(true), 1600);
  }, [games]);

  if (games.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-medium text-text-dim hover:text-text-muted transition-colors font-[family-name:var(--font-mono)]"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        📊 Your Stats
      </button>

      {expanded && (
        <div
          className="mt-3 rounded-xl border p-4"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-subtle)',
            animation: 'scaleIn 300ms ease-out',
          }}
        >
          {/* Victory Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <StatCard label="Cleared" value={stats.gamesCleared.toString()} icon="✅" color="#22c55e" />
            <StatCard label="Now Playing" value={stats.nowPlaying.toString()} icon="🔥" color="#f59e0b" />
            <StatCard label="Streak" value={stats.streak.toString()} icon="⚡" color="#a78bfa" sublabel="without bailing" />
            <StatCard
              label="Hours Logged"
              value={stats.totalHours > 0 ? stats.totalHours.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}
              icon="⏱️"
              color="#38bdf8"
            />
          </div>

          {/* Shame Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <StatCard label="Backlog" value={stats.backlogSize.toString()} icon="📚" color="#64748b" />
            <StatCard label="Bailed" value={stats.bailedCount.toString()} icon="🚪" color="#ef4444" />
            {stats.oldest ? (
              <StatCard
                label="Oldest"
                value={`${stats.oldest.days}d`}
                icon="⏳"
                color="#d97706"
                sublabel={stats.oldest.name.length > 18 ? stats.oldest.name.substring(0, 16) + '...' : stats.oldest.name}
              />
            ) : (
              <StatCard label="Oldest" value="—" icon="⏳" color="#d97706" />
            )}
            <StatCard label="Total" value={games.length.toString()} icon="🎮" color="#94a3b8" sublabel="games tracked" />
          </div>

          {/* The Big One — Backlog Value Calculator */}
          {!calculating && !calculated && (
            <button
              onClick={handleCalculate}
              className="w-full py-3 rounded-lg text-xs font-semibold font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
                border: '1px dashed rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
              }}
            >
              💸 Dare to calculate your backlog&apos;s value?
            </button>
          )}

          {(calculating || calculated) && (
            <div
              className="rounded-lg p-4 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.03))',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <div className="text-[10px] text-text-faint font-[family-name:var(--font-mono)] mb-1">
                💸 Estimated unplayed value
              </div>
              <div
                className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-mono)] tracking-tight"
                style={{ color: '#ef4444' }}
              >
                ~${countedUnplayed.toLocaleString()}
              </div>
              <div className="text-[10px] text-text-faint font-[family-name:var(--font-mono)] mt-1">
                {priceSource === 'cheapshark'
                  ? `based on $${avgPrice.toFixed(0)} avg retail price × ${stats.backlogSize} unplayed`
                  : `based on ~$${avgPrice} est. avg × ${stats.backlogSize} unplayed`
                }
              </div>
              {priceSource === 'cheapshark' && (
                <div className="text-[9px] text-text-faint font-[family-name:var(--font-mono)] mt-0.5 opacity-60">
                  prices via CheapShark (sampled from your library)
                </div>
              )}

              {calculated && playedValue > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="text-[10px] text-text-faint font-[family-name:var(--font-mono)] mb-0.5">
                    💰 Value recovered by playing
                  </div>
                  <div
                    className="text-lg font-bold font-[family-name:var(--font-mono)]"
                    style={{ color: '#22c55e' }}
                  >
                    ${countedPlayed.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Share Your Shame */}
          {calculated && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => shareToTwitter(generateShameText({ ...stats, unplayedValue, playedValue }))}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  backgroundColor: 'rgba(29, 161, 242, 0.1)',
                  border: '1px solid rgba(29, 161, 242, 0.2)',
                  color: '#1da1f2',
                }}
              >
                𝕏 Share your shame
              </button>
              <button
                onClick={() => shareToReddit(generateShameText({ ...stats, unplayedValue, playedValue }))}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  backgroundColor: 'rgba(255, 69, 0, 0.1)',
                  border: '1px solid rgba(255, 69, 0, 0.2)',
                  color: '#ff4500',
                }}
              >
                📮 Post to Reddit
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateShameText({ ...stats, unplayedValue, playedValue }));
                  showToast('Copied to clipboard. Go paste your shame.');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  backgroundColor: 'rgba(88, 101, 242, 0.1)',
                  border: '1px solid rgba(88, 101, 242, 0.2)',
                  color: '#5865f2',
                }}
              >
                📋 Copy for Discord
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  sublabel,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  sublabel?: string;
}) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      <div className="text-[10px] text-text-faint font-[family-name:var(--font-mono)] mb-0.5">
        {icon} {label}
      </div>
      <div
        className="text-lg font-bold font-[family-name:var(--font-mono)]"
        style={{ color }}
      >
        {value}
      </div>
      {sublabel && (
        <div className="text-[9px] text-text-faint font-[family-name:var(--font-mono)] mt-0.5 truncate">
          {sublabel}
        </div>
      )}
    </div>
  );
}
