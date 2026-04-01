'use client';

import { useState, useMemo, useCallback } from 'react';
import { Game } from '@/lib/types';
import { useToast } from './Toast';
import GameCard from './GameCard';

interface ClearedSectionProps {
  games: Game[];
}

// --- Rank system ---
interface ClearedRank {
  title: string;
  icon: string;
  minGames: number;
  color: string;
}

const RANKS: ClearedRank[] = [
  { title: 'Pile Initiate', icon: '🌱', minGames: 0, color: '#6b7280' },
  { title: 'Shame Slayer', icon: '⚔️', minGames: 3, color: '#22c55e' },
  { title: 'Backlog Buster', icon: '💥', minGames: 5, color: '#3b82f6' },
  { title: 'Clear Streak', icon: '🔥', minGames: 10, color: '#f59e0b' },
  { title: 'Pile Driver', icon: '🏗️', minGames: 15, color: '#ef4444' },
  { title: 'Shame Breaker', icon: '⚡', minGames: 25, color: '#a78bfa' },
  { title: 'Pile Destroyer', icon: '☄️', minGames: 40, color: '#ec4899' },
  { title: 'Backlog Legend', icon: '👑', minGames: 60, color: '#f59e0b' },
  { title: 'Shame Ender', icon: '🏆', minGames: 80, color: '#22c55e' },
  { title: 'Marie Kondo of Gaming', icon: '✨', minGames: 100, color: '#00f0ff' },
];

function getRank(clearedCount: number): { current: ClearedRank; next: ClearedRank | null; progress: number } {
  let current = RANKS[0];
  let nextRank: ClearedRank | null = null;

  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (clearedCount >= RANKS[i].minGames) {
      current = RANKS[i];
      nextRank = i < RANKS.length - 1 ? RANKS[i + 1] : null;
      break;
    }
  }

  const progress = nextRank
    ? (clearedCount - current.minGames) / (nextRank.minGames - current.minGames)
    : 1;

  return { current, next: nextRank, progress };
}

// --- Helpers ---
function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

// Price cache reader (same cache StatsPanel uses)
function loadPriceCache(): Map<string, number> {
  try {
    const raw = localStorage.getItem('pos-price-cache');
    if (!raw) return new Map();
    const entries = JSON.parse(raw);
    const cache = new Map<string, number>();
    const now = Date.now();
    const TTL = 7 * 24 * 60 * 60 * 1000;
    for (const [k, v] of Object.entries(entries)) {
      const entry = v as { value: number; ts: number };
      if (now - entry.ts < TTL) cache.set(k, entry.value);
    }
    return cache;
  } catch {
    return new Map();
  }
}

function getClearedThisMonth(games: Game[]): Game[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  return games.filter((g) => {
    const completedDate = g.completedAt || g.updatedAt;
    return completedDate >= monthStart;
  });
}

function getClearedValue(games: Game[], priceCache: Map<string, number>): number {
  let total = 0;
  for (const g of games) {
    const key = g.name.trim().toLowerCase();
    const price = priceCache.get(key);
    if (price && price > 0) total += price;
  }
  return Math.round(total);
}

// --- Share text ---
function generateClearedShareText(stats: {
  totalCleared: number;
  clearedThisMonth: number;
  valueReclaimed: number;
  rank: ClearedRank;
  pileProgress: number;
  avgRating: number;
  topGame?: string;
}): string {
  const lines: string[] = [];

  // Opening line
  if (stats.clearedThisMonth > 0) {
    lines.push(`I cleared ${plural(stats.clearedThisMonth, 'game')} from my Pile Of Shame this month. That's probably more progress than I've made in years.`);
  } else {
    lines.push(`I've cleared ${plural(stats.totalCleared, 'game')} from my Pile Of Shame.`);
  }

  // Value reclaimed
  if (stats.valueReclaimed > 0) {
    lines.push(`That's ~$${stats.valueReclaimed.toLocaleString()} worth of games that were simply staring at me, wondering why they exist at all.`);
  }

  // Progress
  if (stats.pileProgress > 0) {
    lines.push(`${Math.round(stats.pileProgress)}% of my pile, conquered.`);
  }

  // Rank
  lines.push(`Current rank: ${stats.rank.icon} ${stats.rank.title}`);

  // Rating
  if (stats.avgRating > 0) {
    lines.push(`Average rating: ${'⭐'.repeat(Math.round(stats.avgRating))} (${stats.avgRating.toFixed(1)}/5)`);
  }

  // Top game
  if (stats.topGame) {
    lines.push(`Best game cleared: ${stats.topGame}`);
  }

  return lines.join('\n');
}

function getShareCTA(platform: 'twitter' | 'reddit' | 'discord'): string {
  switch (platform) {
    case 'twitter':
      return '\n\nGame to tame your shame? → https://pileofsha.me';
    case 'reddit':
      return '\n\nGame to tame your shame? → [Pile Of Shame](https://pileofsha.me)';
    case 'discord':
      return '\n\nGame to tame your shame? → <https://pileofsha.me>';
  }
}

export default function ClearedSection({ games }: ClearedSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const { showToast } = useToast();

  const clearedGames = useMemo(() => {
    return games
      .filter((g) => g.status === 'played')
      .sort((a, b) => {
        const aDate = a.completedAt || a.updatedAt;
        const bDate = b.completedAt || b.updatedAt;
        return bDate.localeCompare(aDate);
      });
  }, [games]);

  // Stats
  const totalGames = games.length;
  const clearedCount = clearedGames.length;
  const pileProgress = totalGames > 0 ? (clearedCount / totalGames) * 100 : 0;
  const ratedGames = clearedGames.filter((g) => g.rating && g.rating > 0);
  const avgRating = ratedGames.length > 0
    ? (ratedGames.reduce((sum, g) => sum + (g.rating || 0), 0) / ratedGames.length)
    : 0;
  const topGame = ratedGames.length > 0
    ? ratedGames.reduce((best, g) => (g.rating || 0) > (best.rating || 0) ? g : best).name
    : undefined;

  const clearedThisMonth = useMemo(() => getClearedThisMonth(clearedGames), [clearedGames]);
  const { current: rank, next: nextRank, progress: rankProgress } = getRank(clearedCount);

  // Value
  const valueReclaimed = useMemo(() => {
    try {
      const cache = loadPriceCache();
      return getClearedValue(clearedGames, cache);
    } catch {
      return 0;
    }
  }, [clearedGames]);

  const handleShare = useCallback((platform: 'twitter' | 'reddit' | 'discord') => {
    const text = generateClearedShareText({
      totalCleared: clearedCount,
      clearedThisMonth: clearedThisMonth.length,
      valueReclaimed,
      rank,
      pileProgress,
      avgRating,
      topGame,
    });

    const fullText = text + getShareCTA(platform);

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`, '_blank', 'width=550,height=420');
    } else if (platform === 'reddit') {
      window.open(`https://reddit.com/submit?selftext=true&title=${encodeURIComponent(`Cleared ${clearedCount} games from my Pile Of Shame`)}&text=${encodeURIComponent(fullText)}`, '_blank');
    } else {
      navigator.clipboard.writeText(fullText);
      showToast('Copied to clipboard. Go flex that cleared list.');
    }
  }, [clearedCount, clearedThisMonth.length, valueReclaimed, rank, pileProgress, avgRating, topGame, showToast]);

  if (clearedGames.length === 0) return null;

  return (
    <div id="cleared-section" className="mt-8">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full group"
      >
        <svg
          className={`w-3.5 h-3.5 text-text-dim transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        <span className="text-xl">🏆</span>
        <h2 className="text-lg font-bold tracking-tight" style={{ color: '#22c55e' }}>
          Cleared
        </h2>
        <span className="text-sm font-bold font-[family-name:var(--font-mono)]" style={{ color: '#22c55e' }}>
          {clearedGames.length}
        </span>
        {avgRating > 0 && (
          <span className="text-xs text-text-dim font-[family-name:var(--font-mono)] ml-1">
            · avg {'⭐'.repeat(Math.round(avgRating))} {avgRating.toFixed(1)}
          </span>
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Cleared Stats Banner */}
          <div
            className="rounded-xl border p-4"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'rgba(34, 197, 94, 0.2)',
            }}
          >
            {/* Rank + Progress */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl"
                style={{ backgroundColor: `${rank.color}15`, border: `1px solid ${rank.color}30` }}
              >
                {rank.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold" style={{ color: rank.color }}>
                    {rank.title}
                  </span>
                  <span className="text-xs text-text-dim font-[family-name:var(--font-mono)]">
                    Lv.{RANKS.indexOf(rank) + 1}
                  </span>
                </div>
                {nextRank && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.round(rankProgress * 100)}%`,
                          backgroundColor: rank.color,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-text-faint font-[family-name:var(--font-mono)] shrink-0">
                      {nextRank.icon} {nextRank.minGames - clearedCount} to go
                    </span>
                  </div>
                )}
                {!nextRank && (
                  <div className="text-xs text-text-dim font-[family-name:var(--font-mono)] mt-0.5 italic">
                    When your mom told you to clean your room, you were one of the rare kids who actually did.
                  </div>
                )}
              </div>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <MiniStat
                label="Cleared"
                value={clearedCount.toString()}
                color="#22c55e"
              />
              <MiniStat
                label="Pile Progress"
                value={`${Math.round(pileProgress)}%`}
                color="#a78bfa"
              />
              <MiniStat
                label="This Month"
                value={clearedThisMonth.length.toString()}
                color="#f59e0b"
              />
              <MiniStat
                label="Value Reclaimed"
                value={valueReclaimed > 0 ? `$${valueReclaimed.toLocaleString()}` : '—'}
                color="#22c55e"
              />
            </div>

            {/* Progress bar — pile cleared */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] text-text-dim font-[family-name:var(--font-mono)] mb-1">
                <span>Pile progress</span>
                <span>{clearedCount} / {totalGames} games</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                  style={{
                    width: `${Math.max(2, pileProgress)}%`,
                    background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                  }}
                >
                  {pileProgress > 10 && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                        animation: 'shimmer 2s infinite',
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="text-[11px] text-text-faint font-[family-name:var(--font-mono)] mt-1 italic">
                {pileProgress === 0
                  ? 'The journey of a thousand games begins with a single clear.'
                  : pileProgress < 10
                  ? 'Every mountain was once a backlog. You\'ve started climbing.'
                  : pileProgress < 25
                  ? 'Making real progress. The pile notices. The pile is nervous.'
                  : pileProgress < 50
                  ? 'Quarter down. The pile trembles. It knows what\'s coming.'
                  : pileProgress < 75
                  ? 'Over halfway. You can see the finish line from here.'
                  : pileProgress < 100
                  ? 'Almost there. This is the endgame now.'
                  : 'You cleared your entire pile. You are free. Go outside.'
                }
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleShare('twitter')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  backgroundColor: 'rgba(29, 161, 242, 0.1)',
                  border: '1px solid rgba(29, 161, 242, 0.2)',
                  color: '#1da1f2',
                }}
              >
                𝕏 Share cleared list
              </button>
              <button
                onClick={() => handleShare('reddit')}
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
                onClick={() => handleShare('discord')}
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
          </div>

          {/* Game List */}
          <div className="space-y-1.5 pl-0.5">
            {clearedGames.map((game) => (
              <div key={game.id} className="relative">
                <GameCard game={game} />
                {game.rating && game.rating > 0 && (
                  <div
                    className="absolute top-3 right-12 text-[11px] font-[family-name:var(--font-mono)] pointer-events-none"
                    style={{ color: '#f59e0b' }}
                  >
                    {'★'.repeat(game.rating)}{'☆'.repeat(5 - game.rating)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!expanded && (
        <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
          {/* Rank badge when collapsed */}
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-[family-name:var(--font-mono)]"
            style={{
              backgroundColor: `${rank.color}15`,
              color: rank.color,
              border: `1px solid ${rank.color}30`,
            }}
          >
            {rank.icon} {rank.title}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-medium font-[family-name:var(--font-mono)]"
            style={{
              backgroundColor: 'rgba(167, 139, 250, 0.1)',
              color: '#a78bfa',
              border: '1px solid rgba(167, 139, 250, 0.2)',
            }}
          >
            {Math.round(pileProgress)}% cleared
          </span>
          {clearedGames.slice(0, 6).map((game) => (
            <span
              key={game.id}
              className="px-2 py-0.5 rounded-full text-[11px] font-medium font-[family-name:var(--font-mono)]"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                border: '1px solid rgba(34, 197, 94, 0.2)',
              }}
              title={game.rating ? `${game.rating}/5` : undefined}
            >
              {game.rating ? '★'.repeat(game.rating) + ' ' : '✓ '}{game.name.length > 20 ? game.name.substring(0, 18) + '…' : game.name}
            </span>
          ))}
          {clearedGames.length > 6 && (
            <span className="text-[11px] text-text-faint font-[family-name:var(--font-mono)] self-center">
              +{clearedGames.length - 6} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      <div className="text-[11px] text-text-dim font-[family-name:var(--font-mono)]">
        {label}
      </div>
      <div
        className="text-lg font-bold font-[family-name:var(--font-mono)]"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}
