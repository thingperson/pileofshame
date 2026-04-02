'use client';

import { useState, useMemo } from 'react';
import { Game } from '@/lib/types';
import { useToast } from './Toast';
import { trackShareStats } from '@/lib/analytics';
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

// --- Cleared share composer ---

interface ClearedStatLine {
  id: string;
  label: string;
  available: (s: ClearedShareData) => boolean;
  text: (s: ClearedShareData) => string;
  defaultOn?: boolean;
}

interface ClearedShareData {
  totalCleared: number;
  clearedThisMonth: number;
  valueReclaimed: number;
  rank: ClearedRank;
  pileProgress: number;
  avgRating: number;
  topGame?: string;
}

const CLEARED_STAT_LINES: ClearedStatLine[] = [
  {
    id: 'cleared-count',
    label: 'Games cleared',
    available: (s) => s.totalCleared > 0,
    text: (s) => s.totalCleared >= 10
      ? `${s.totalCleared} games cleared from my backlog. Actually finishing games hits different.`
      : `${s.totalCleared} cleared and counting. The pile is shrinking.`,
    defaultOn: true,
  },
  {
    id: 'this-month',
    label: 'Cleared this month',
    available: (s) => s.clearedThisMonth > 0,
    text: (s) => `${plural(s.clearedThisMonth, 'game')} cleared this month alone.`,
    defaultOn: true,
  },
  {
    id: 'value-reclaimed',
    label: 'Value reclaimed',
    available: (s) => s.valueReclaimed > 0,
    text: (s) => `~$${s.valueReclaimed.toLocaleString()} worth of games I actually played instead of letting them collect dust.`,
    defaultOn: true,
  },
  {
    id: 'progress',
    label: 'Pile progress',
    available: (s) => s.pileProgress > 0,
    text: (s) => `${Math.round(s.pileProgress)}% of the pile, conquered.`,
  },
  {
    id: 'rank',
    label: 'Current rank',
    available: () => true,
    text: (s) => `Rank: ${s.rank.icon} ${s.rank.title}`,
  },
  {
    id: 'avg-rating',
    label: 'Average rating',
    available: (s) => s.avgRating > 0,
    text: (s) => `Average rating: ${'⭐'.repeat(Math.round(s.avgRating))} (${s.avgRating.toFixed(1)}/5)`,
  },
  {
    id: 'top-game',
    label: 'Best game cleared',
    available: (s) => !!s.topGame,
    text: (s) => `Best game cleared: ${s.topGame}`,
  },
];

const CLEARED_FUN_CLOSERS = [
  'The pile is real.',
  'Mood-based matching is weirdly effective.',
  'Check what your library is worth.',
  'Turns out finishing games feels good. Who knew.',
  'The backlog fears me now.',
];

function ClearedShareComposer({
  stats,
  showToast,
}: {
  stats: ClearedShareData;
  showToast: (msg: string) => void;
}) {
  const availableLines = useMemo(() => CLEARED_STAT_LINES.filter(l => l.available(stats)), [stats]);

  const [selected, setSelected] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    for (const line of availableLines) {
      if (defaults.size >= 3) break;
      if (line.defaultOn) defaults.add(line.id);
    }
    if (defaults.size < 2) {
      for (const line of availableLines) {
        if (defaults.size >= 2) break;
        defaults.add(line.id);
      }
    }
    return defaults;
  });

  const [closerIndex, setCloserIndex] = useState(() => Math.floor(Math.random() * CLEARED_FUN_CLOSERS.length));
  const [includeCloser, setIncludeCloser] = useState(true);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rerollCloser = () => {
    setCloserIndex(prev => (prev + 1) % CLEARED_FUN_CLOSERS.length);
  };

  const funCloser = CLEARED_FUN_CLOSERS[closerIndex];

  const compose = (platform: 'twitter' | 'reddit' | 'copy'): string => {
    const lines: string[] = [];
    for (const line of availableLines) {
      if (selected.has(line.id)) lines.push(line.text(stats));
    }
    if (lines.length === 0) lines.push(`${stats.totalCleared} games cleared from my backlog.`);
    if (includeCloser) lines.push('\n' + funCloser);

    switch (platform) {
      case 'twitter': lines.push('\ninventoryfull.gg'); break;
      case 'reddit': lines.push('\n[inventoryfull.gg](https://inventoryfull.gg)'); break;
      case 'copy': lines.push('\nhttps://inventoryfull.gg'); break;
    }
    return lines.join('\n');
  };

  const previewText = compose('copy').replace('\nhttps://inventoryfull.gg', '').trim();

  return (
    <div
      className="rounded-lg p-3.5 space-y-2.5"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid rgba(34, 197, 94, 0.15)',
      }}
    >
      <div className="text-xs font-semibold text-text-primary font-[family-name:var(--font-mono)]">
        📣 Share your cleared list
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {availableLines.map((line) => (
          <button
            key={line.id}
            onClick={() => toggle(line.id)}
            className={`text-left px-2.5 py-1.5 rounded-lg text-[11px] font-[family-name:var(--font-mono)] transition-all ${
              selected.has(line.id)
                ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                : 'bg-bg-card text-text-faint border border-transparent hover:text-text-dim'
            }`}
          >
            <span className="mr-1">{selected.has(line.id) ? '✓' : '○'}</span>
            {line.label}
          </button>
        ))}
      </div>

      {/* Fun closer with re-roll */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setIncludeCloser(!includeCloser)}
          className={`flex-1 text-left px-2.5 py-1.5 rounded-lg text-[11px] font-[family-name:var(--font-mono)] transition-all ${
            includeCloser
              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : 'bg-bg-card text-text-faint border border-transparent hover:text-text-dim'
          }`}
        >
          <span className="mr-1">{includeCloser ? '✓' : '○'}</span>
          &quot;{funCloser}&quot;
        </button>
        <button
          onClick={rerollCloser}
          className="px-2 py-1.5 rounded-lg text-[11px] font-[family-name:var(--font-mono)] text-text-dim hover:text-text-muted transition-all"
          style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)' }}
          title="Try a different closer"
        >
          🔄
        </button>
      </div>

      <div
        className="rounded-lg p-2.5 text-xs text-text-muted leading-relaxed font-[family-name:var(--font-mono)] whitespace-pre-line"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="text-[10px] text-text-faint mb-1">Preview:</div>
        {previewText || <span className="text-text-faint italic">Pick some stats above</span>}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => {
            trackShareStats('twitter');
            const text = compose('twitter');
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: 'rgba(29, 161, 242, 0.1)',
            border: '1px solid rgba(29, 161, 242, 0.2)',
            color: '#1da1f2',
          }}
        >
          𝕏 Post
        </button>
        <button
          onClick={() => {
            trackShareStats('reddit');
            const text = compose('reddit');
            window.open(`https://reddit.com/submit?selftext=true&title=${encodeURIComponent(`Cleared ${stats.totalCleared} games from my backlog`)}&text=${encodeURIComponent(text)}`, '_blank');
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: 'rgba(255, 69, 0, 0.1)',
            border: '1px solid rgba(255, 69, 0, 0.2)',
            color: '#ff4500',
          }}
        >
          📮 Reddit
        </button>
        <button
          onClick={() => {
            trackShareStats('copy');
            navigator.clipboard.writeText(compose('copy'));
            showToast('Copied! Go flex that cleared list.');
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: 'rgba(88, 101, 242, 0.1)',
            border: '1px solid rgba(88, 101, 242, 0.2)',
            color: '#5865f2',
          }}
        >
          📋 Copy
        </button>
      </div>
    </div>
  );
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

  const clearedShareStats = useMemo(() => ({
    totalCleared: clearedCount,
    clearedThisMonth: clearedThisMonth.length,
    valueReclaimed,
    rank,
    pileProgress,
    avgRating,
    topGame,
  }), [clearedCount, clearedThisMonth.length, valueReclaimed, rank, pileProgress, avgRating, topGame]);

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
                  ? 'A thousand games. One clear. This is how it starts.'
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

            {/* Share Composer */}
            <ClearedShareComposer stats={clearedShareStats} showToast={showToast} />
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
