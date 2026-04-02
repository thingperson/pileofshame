'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Game } from '@/lib/types';
import { getAllMatchingArchetypes, PlayerArchetype } from '@/lib/archetypes';
import { useToast } from './Toast';

interface StatsPanelProps {
  games: Game[];
}

// --- Price & HLTB cache (localStorage-backed) ---

const PRICE_CACHE_KEY = 'pos-price-cache';
const HLTB_CACHE_KEY = 'pos-hltb-cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry<T> {
  value: T;
  ts: number;
}

function loadCache<T>(key: string): Map<string, T> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Map();
    const entries: Record<string, CacheEntry<T>> = JSON.parse(raw);
    const now = Date.now();
    const valid = new Map<string, T>();
    for (const [k, v] of Object.entries(entries)) {
      if (now - v.ts < CACHE_TTL) valid.set(k, v.value);
    }
    return valid;
  } catch {
    return new Map();
  }
}

function saveCache<T>(key: string, cache: Map<string, T>) {
  const entries: Record<string, CacheEntry<T>> = {};
  const now = Date.now();
  cache.forEach((value, k) => {
    entries[k] = { value, ts: now };
  });
  try {
    localStorage.setItem(key, JSON.stringify(entries));
  } catch {
    // quota exceeded — clear and retry
    localStorage.removeItem(key);
  }
}

function getCacheKey(name: string): string {
  return name.trim().toLowerCase();
}

// --- Pluralization helper ---
function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

// --- Stats helpers ---

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

// --- Share text ---

function generateShareText(stats: {
  backlogSize: number;
  gamesCleared: number;
  bailedCount: number;
  unplayedValue: number;
  playedValue: number;
  oldest: { name: string; days: number } | null;
  streak: number;
  backlogHours?: number | null;
  confidence?: number;
}): string {
  const lines: string[] = [];

  if (stats.backlogSize > 250) {
    lines.push(`${stats.backlogSize} games in my pile. That's not a backlog, that's a lifestyle.`);
  } else if (stats.backlogSize > 100) {
    lines.push(`${stats.backlogSize} games in my pile and I keep buying more. At least I'm self-aware now.`);
  } else if (stats.backlogSize > 50) {
    lines.push(`Only ${stats.backlogSize} games in my pile. Practically a minimalist.`);
  } else if (stats.backlogSize > 0) {
    lines.push(`${stats.backlogSize} games left in the pile. Getting there.`);
  } else {
    lines.push(`I actually cleared my gaming backlog. Yes, I'm real.`);
  }

  if (stats.unplayedValue > 0) {
    lines.push(`~$${stats.unplayedValue.toLocaleString()} of untapped gaming sitting right there.`);
  }

  if (stats.backlogHours && stats.backlogHours > 0) {
    if (stats.backlogHours > 5000) {
      const yrs = Math.round(stats.backlogHours / 24 / 365 * 10) / 10;
      lines.push(`${stats.backlogHours.toLocaleString()} hours to play them all. That's ${yrs} ${yrs === 1 ? 'year' : 'years'} of non-stop gaming. I'm set for life.`);
    } else {
      lines.push(`~${stats.backlogHours.toLocaleString()} hours to play them all. No big deal.`);
    }
  }

  if (stats.gamesCleared > 0) {
    lines.push(`${stats.gamesCleared} cleared${stats.playedValue > 0 ? ` ($${stats.playedValue.toLocaleString()} worth of value unlocked)` : ''}.`);
  }

  if (stats.bailedCount > 0) {
    lines.push(`Drew the line on ${stats.bailedCount}. That's progress too.`);
  }

  if (stats.oldest && stats.oldest.days > 30) {
    lines.push(`${stats.oldest.name} has been in the pile for ${plural(stats.oldest.days, 'day')}. It's fine.`);
  }

  if (stats.streak >= 5) {
    lines.push(`${plural(stats.streak, 'game')} cleared in a row. On a roll.`);
  }

  return lines.join('\n');
}

function getShareCTA(platform: 'twitter' | 'reddit' | 'discord'): string {
  switch (platform) {
    case 'twitter':
      // Twitter auto-links URLs
      return '\nCheck your own Pile Of Shame → https://pileofsha.me';
    case 'reddit':
      // Reddit markdown
      return '\n\nCheck your own **Pile Of Shame** → [pileofsha.me](https://pileofsha.me)';
    case 'discord':
      // Discord markdown
      return '\n\nCheck your own **Pile Of Shame** → <https://pileofsha.me>';
  }
}

function shareToTwitter(text: string) {
  const fullText = text + getShareCTA('twitter');
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`, '_blank', 'width=550,height=420');
}

function shareToReddit(text: string) {
  const fullText = text + getShareCTA('reddit');
  window.open(`https://reddit.com/submit?selftext=true&title=${encodeURIComponent('My gaming library stats — how does yours compare?')}&text=${encodeURIComponent(fullText)}`, '_blank');
}

function getDiscordText(text: string): string {
  return text + getShareCTA('discord');
}

// --- Batch fetch helpers ---

async function fetchPricesBatch(titles: string[]): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  if (titles.length === 0) return results;

  try {
    const res = await fetch(`/api/deals?action=prices&titles=${encodeURIComponent(titles.join(','))}`);
    if (res.ok) {
      const data = await res.json();
      if (data.prices) {
        for (const p of data.prices) {
          results.set(getCacheKey(p.title), p.retailPrice);
        }
      }
    }
  } catch { /* fail silently */ }

  return results;
}

async function fetchHltbBatch(titles: string[]): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  if (titles.length === 0) return results;

  try {
    const res = await fetch(`/api/hltb?action=batch&titles=${encodeURIComponent(titles.join(','))}`);
    if (res.ok) {
      const data = await res.json();
      if (data.results) {
        for (const r of data.results) {
          if (r.found && r.main > 0) {
            results.set(getCacheKey(r.title), r.main);
          }
        }
      }
    }
  } catch { /* fail silently */ }

  return results;
}

// --- Main Component ---

export default function StatsPanel({ games }: StatsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [enriching, setEnriching] = useState(false); // background enrichment running
  const [archetypeIndex, setArchetypeIndex] = useState(0);

  // Calculated values (weighted)
  const [unplayedValue, setUnplayedValue] = useState(0);
  const [playedValue, setPlayedValue] = useState(0);
  const [backlogHours, setBacklogHours] = useState<number | null>(null);
  const [priceConfidence, setPriceConfidence] = useState({ known: 0, total: 0 });
  const [hltbConfidence, setHltbConfidence] = useState({ known: 0, total: 0 });

  const { showToast } = useToast();
  const enrichAbortRef = useRef(false);

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

    // Achievement totals
    const gamesWithAchievements = games.filter((g) => g.achievements && g.achievements.total > 0);
    const totalAchievementsEarned = gamesWithAchievements.reduce((sum, g) => sum + (g.achievements?.earned || 0), 0);
    const totalAchievements = gamesWithAchievements.reduce((sum, g) => sum + (g.achievements?.total || 0), 0);
    const platinumsEarned = games.filter((g) => g.achievements?.earnedPlatinum).length;
    const perfectGames = gamesWithAchievements.filter((g) => g.achievements!.earned === g.achievements!.total).length;
    const totalGamerscore = games.reduce((sum, g) => sum + (g.achievements?.gamerscore || 0), 0);

    return {
      backlogSize, gamesCleared, bailedCount, nowPlaying, totalHours, streak, oldest,
      totalAchievementsEarned, totalAchievements, platinumsEarned, perfectGames,
      totalGamerscore, hasAchievementData: gamesWithAchievements.length > 0,
    };
  }, [games]);

  const countedUnplayed = useCountUp(unplayedValue, calculating);
  const countedPlayed = useCountUp(playedValue, calculating);
  const countedBacklogHours = useCountUp(backlogHours || 0, calculating && backlogHours !== null);

  // Compute weighted value from cache + fallback for unknowns
  const computeValues = useCallback((
    priceCache: Map<string, number>,
    hltbCache: Map<string, number>,
  ) => {
    const FALLBACK_PRICE = 18;
    const FALLBACK_HOURS = 12;

    const backlogGames = games.filter((g) => g.status === 'buried' || g.status === 'on-deck');
    const playedGames = games.filter((g) => g.status === 'played' || g.status === 'playing');

    // --- Prices ---
    let knownPriceSum = 0;
    let knownPriceCount = 0;
    const allRelevant = [...backlogGames, ...playedGames];

    for (const g of allRelevant) {
      const cached = priceCache.get(getCacheKey(g.name));
      if (cached !== undefined && cached > 0) {
        knownPriceSum += cached;
        knownPriceCount++;
      }
    }

    // Weighted avg: use known avg for unknowns, or fallback if we have nothing
    const knownAvg = knownPriceCount >= 3 ? knownPriceSum / knownPriceCount : FALLBACK_PRICE;
    const unknownCount = allRelevant.length - knownPriceCount;

    const backlogValue = backlogGames.reduce((sum, g) => {
      const cached = priceCache.get(getCacheKey(g.name));
      return sum + (cached && cached > 0 ? cached : knownAvg);
    }, 0);

    const playedVal = playedGames.reduce((sum, g) => {
      const cached = priceCache.get(getCacheKey(g.name));
      return sum + (cached && cached > 0 ? cached : knownAvg);
    }, 0);

    setUnplayedValue(Math.round(backlogValue));
    setPlayedValue(Math.round(playedVal));
    setPriceConfidence({ known: knownPriceCount, total: allRelevant.length });

    // --- HLTB ---
    let knownHoursSum = 0;
    let knownHoursCount = 0;

    for (const g of backlogGames) {
      const cached = hltbCache.get(getCacheKey(g.name));
      if (cached !== undefined && cached > 0) {
        knownHoursSum += cached;
        knownHoursCount++;
      }
    }

    const hoursAvg = knownHoursCount >= 3 ? knownHoursSum / knownHoursCount : FALLBACK_HOURS;
    const totalHours = backlogGames.reduce((sum, g) => {
      const cached = hltbCache.get(getCacheKey(g.name));
      return sum + (cached && cached > 0 ? cached : hoursAvg);
    }, 0);

    if (knownHoursCount > 0 || backlogGames.length > 0) {
      setBacklogHours(Math.round(totalHours));
      setHltbConfidence({ known: knownHoursCount, total: backlogGames.length });
    }
  }, [games]);

  // Background enrichment — fetch uncached games in batches
  const enrichInBackground = useCallback(async (
    priceCache: Map<string, number>,
    hltbCache: Map<string, number>,
  ) => {
    enrichAbortRef.current = false;
    setEnriching(true);

    const allGames = games.filter((g) => g.name.length > 2);

    // Find uncached games
    const uncachedForPrice = allGames.filter((g) => !priceCache.has(getCacheKey(g.name)));
    const uncachedForHltb = allGames
      .filter((g) => g.status === 'buried' || g.status === 'on-deck')
      .filter((g) => !hltbCache.has(getCacheKey(g.name)));

    // Fetch prices in batches of 15
    for (let i = 0; i < uncachedForPrice.length; i += 15) {
      if (enrichAbortRef.current) break;
      const batch = uncachedForPrice.slice(i, i + 15).map((g) => g.name);
      const results = await fetchPricesBatch(batch);
      results.forEach((v, k) => priceCache.set(k, v));
      saveCache(PRICE_CACHE_KEY, priceCache);
      computeValues(priceCache, hltbCache);
      // Throttle between batches
      await new Promise((r) => setTimeout(r, 500));
    }

    // Fetch HLTB in batches of 10
    for (let i = 0; i < uncachedForHltb.length; i += 10) {
      if (enrichAbortRef.current) break;
      const batch = uncachedForHltb.slice(i, i + 10).map((g) => g.name);
      const results = await fetchHltbBatch(batch);
      results.forEach((v, k) => hltbCache.set(k, v));
      saveCache(HLTB_CACHE_KEY, hltbCache);
      computeValues(priceCache, hltbCache);
      await new Promise((r) => setTimeout(r, 500));
    }

    setEnriching(false);
  }, [games, computeValues]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { enrichAbortRef.current = true; };
  }, []);

  const handleCalculate = useCallback(async () => {
    setCalculating(true);

    // Load caches
    const priceCache = loadCache<number>(PRICE_CACHE_KEY);
    const hltbCache = loadCache<number>(HLTB_CACHE_KEY);

    const allGames = games.filter((g) => g.name.length > 2);

    // Find uncached games and fetch an initial batch
    const uncachedForPrice = allGames
      .filter((g) => !priceCache.has(getCacheKey(g.name)))
      .sort(() => Math.random() - 0.5)
      .slice(0, 15);

    const backlogUncachedForHltb = allGames
      .filter((g) => g.status === 'buried' || g.status === 'on-deck')
      .filter((g) => !hltbCache.has(getCacheKey(g.name)))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    // Fetch initial batches in parallel
    const [priceResults, hltbResults] = await Promise.allSettled([
      fetchPricesBatch(uncachedForPrice.map((g) => g.name)),
      fetchHltbBatch(backlogUncachedForHltb.map((g) => g.name)),
    ]);

    // Merge into cache
    if (priceResults.status === 'fulfilled') {
      priceResults.value.forEach((v, k) => priceCache.set(k, v));
      saveCache(PRICE_CACHE_KEY, priceCache);
    }
    if (hltbResults.status === 'fulfilled') {
      hltbResults.value.forEach((v, k) => hltbCache.set(k, v));
      saveCache(HLTB_CACHE_KEY, hltbCache);
    }

    // Compute with everything we have
    computeValues(priceCache, hltbCache);

    setTimeout(() => {
      setCalculated(true);
      // Continue enriching in background
      enrichInBackground(priceCache, hltbCache);
    }, 1600);
  }, [games, computeValues, enrichInBackground]);

  // Player archetype (must be before early returns — hooks can't be conditional)
  const archetypes = useMemo(() => getAllMatchingArchetypes(games), [games]);
  const currentArchetype = archetypes[archetypeIndex % archetypes.length];

  const handleRerollArchetype = useCallback(() => {
    if (archetypes.length <= 1) return;
    setArchetypeIndex((i) => (i + 1) % archetypes.length);
  }, [archetypes.length]);

  if (games.length === 0) return null;

  const confidencePct = priceConfidence.total > 0
    ? Math.round((priceConfidence.known / priceConfidence.total) * 100)
    : 0;

  const hltbPct = hltbConfidence.total > 0
    ? Math.round((hltbConfidence.known / hltbConfidence.total) * 100)
    : 0;

  const shareData = { ...stats, unplayedValue, playedValue, backlogHours, confidence: confidencePct };

  // Quick stats for the always-visible teaser
  const totalGames = games.length;
  const explorationPct = totalGames > 0 ? Math.round(((stats.gamesCleared + stats.bailedCount) / totalGames) * 100) : 0;

  return (
    <div className="mb-6">
      {/* Always-visible stats teaser strip */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full rounded-xl border px-4 py-3 transition-all hover:border-accent-purple group cursor-pointer"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: expanded ? 'var(--color-border-active)' : 'var(--color-border-subtle)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
            {/* Key stats always visible */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-sm">🎮</span>
              <span className="text-sm font-bold text-text-primary font-[family-name:var(--font-mono)]">{totalGames}</span>
              <span className="text-xs text-text-dim hidden sm:inline">tracked</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-sm">✅</span>
              <span className="text-sm font-bold font-[family-name:var(--font-mono)]" style={{ color: '#22c55e' }}>{stats.gamesCleared}</span>
              <span className="text-xs text-text-dim hidden sm:inline">cleared</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-sm">📚</span>
              <span className="text-sm font-bold font-[family-name:var(--font-mono)]" style={{ color: '#64748b' }}>{stats.backlogSize}</span>
              <span className="text-xs text-text-dim hidden sm:inline">to explore</span>
            </div>
            {stats.totalHours > 0 && (
              <div className="flex items-center gap-1.5 shrink-0 hidden sm:flex">
                <span className="text-sm">⏱️</span>
                <span className="text-sm font-bold font-[family-name:var(--font-mono)]" style={{ color: '#38bdf8' }}>{stats.totalHours.toLocaleString(undefined, { maximumFractionDigits: 0 })}h</span>
              </div>
            )}
            {/* Exploration progress — the teaser for the calculator */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${explorationPct}%`, backgroundColor: '#a78bfa' }}
                />
              </div>
              <span className="text-xs font-bold font-[family-name:var(--font-mono)]" style={{ color: '#a78bfa' }}>{explorationPct}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-xs text-text-dim group-hover:text-accent-purple transition-colors font-[family-name:var(--font-mono)]">
              {expanded ? 'less' : 'more'}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-text-dim group-hover:text-accent-purple transition-all duration-200 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
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
              sublabel={stats.totalHours === 0 ? 'via Steam import' : undefined}
            />
          </div>

          {/* Trophy Case Row */}
          {stats.hasAchievementData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <StatCard
                label="Trophies"
                value={stats.totalAchievementsEarned.toLocaleString()}
                icon="🏆"
                color="#f59e0b"
                sublabel={stats.totalAchievements > 0 ? `of ${stats.totalAchievements.toLocaleString()} total` : undefined}
              />
              {stats.platinumsEarned > 0 && (
                <StatCard label="Platinums" value={stats.platinumsEarned.toString()} icon="💎" color="#e2e8f0" />
              )}
              {stats.perfectGames > 0 && (
                <StatCard label="100% Complete" value={stats.perfectGames.toString()} icon="⭐" color="#22c55e" />
              )}
              {stats.totalGamerscore > 0 && (
                <StatCard label="Gamerscore" value={stats.totalGamerscore.toLocaleString()} icon="🟢" color="#22c55e" sublabel="Xbox" />
              )}
            </div>
          )}

          {/* Library Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <StatCard label="To Explore" value={stats.backlogSize.toString()} icon="📚" color="#64748b" />
            <StatCard label="Lines Drawn" value={stats.bailedCount.toString()} icon="✊" color="#94a3b8" />
            {stats.oldest ? (
              <StatCard
                label="Oldest"
                value={`${stats.oldest.days}d`}
                icon="⏳"
                color="#d97706"
                sublabel={stats.oldest.name.length > 18 ? stats.oldest.name.substring(0, 16) + '...' : stats.oldest.name}
              />
            ) : (
              <StatCard label="Oldest" value="✓" icon="⏳" color="#22c55e" sublabel="no backlog!" />
            )}
            <StatCard label="Total" value={games.length.toString()} icon="🎮" color="#94a3b8" sublabel="games tracked" />
          </div>

          {/* Player Archetype */}
          {games.length >= 3 && (
            <div
              className="rounded-lg p-4 mb-3 relative overflow-hidden"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: `1px solid ${
                  currentArchetype.tone === 'roast' ? 'rgba(239, 68, 68, 0.3)'
                  : currentArchetype.tone === 'respect' ? 'rgba(34, 197, 94, 0.3)'
                  : 'rgba(167, 139, 250, 0.3)'
                }`,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl shrink-0">{currentArchetype.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold text-text-primary">{currentArchetype.title}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-[family-name:var(--font-mono)]"
                      style={{
                        backgroundColor: currentArchetype.tone === 'roast' ? 'rgba(239, 68, 68, 0.15)'
                          : currentArchetype.tone === 'respect' ? 'rgba(34, 197, 94, 0.15)'
                          : 'rgba(167, 139, 250, 0.15)',
                        color: currentArchetype.tone === 'roast' ? '#ef4444'
                          : currentArchetype.tone === 'respect' ? '#22c55e'
                          : '#a78bfa',
                      }}
                    >
                      {currentArchetype.tone === 'roast' ? '🔥 roast' : currentArchetype.tone === 'respect' ? '👑 respect' : '🔮 reading'}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {currentArchetype.description}
                  </p>
                </div>
              </div>
              {archetypes.length > 1 && (
                <button
                  onClick={handleRerollArchetype}
                  className="mt-3 w-full py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    backgroundColor: 'rgba(167, 139, 250, 0.08)',
                    border: '1px solid rgba(167, 139, 250, 0.2)',
                    color: '#a78bfa',
                  }}
                >
                  🔮 Read me again ({archetypeIndex % archetypes.length + 1}/{archetypes.length})
                </button>
              )}
            </div>
          )}

          {/* The Big One — Backlog Value Calculator */}
          {!calculating && !calculated && (
            <button
              onClick={handleCalculate}
              className="w-full py-3 rounded-lg text-sm font-semibold font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                background: 'linear-gradient(135deg, var(--color-bg-elevated), rgba(167, 139, 250, 0.08))',
                border: '1px dashed rgba(167, 139, 250, 0.35)',
                color: '#a78bfa',
              }}
            >
              💎 What&apos;s your library worth?
            </button>
          )}

          {(calculating || calculated) && (
            <div
              className="rounded-lg p-4 text-center"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                background: 'linear-gradient(135deg, var(--color-bg-elevated), rgba(167, 139, 250, 0.06))',
                border: '1px solid rgba(167, 139, 250, 0.25)',
              }}
            >
              <div className="text-xs text-text-muted font-[family-name:var(--font-mono)] mb-1">
                💎 Untapped library value
              </div>
              <div
                className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-mono)] tracking-tight"
                style={{ color: '#a78bfa' }}
              >
                ~${countedUnplayed.toLocaleString()}
              </div>

              {/* Confidence indicator */}
              {calculated && priceConfidence.total > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${confidencePct}%`,
                          backgroundColor: confidencePct > 75 ? '#22c55e' : confidencePct > 40 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                    <span className="text-xs text-text-dim font-[family-name:var(--font-mono)]">
                      {priceConfidence.known} of {priceConfidence.total} priced
                    </span>
                  </div>
                  <div className="text-[11px] text-text-faint font-[family-name:var(--font-mono)]">
                    {confidencePct >= 80
                      ? 'high confidence: most games priced via retail data'
                      : confidencePct >= 40
                      ? 'moderate confidence: rest estimated from your library avg'
                      : enriching
                      ? 'improving... fetching more prices in background'
                      : 'low confidence: tap again to fetch more prices'
                    }
                  </div>
                </div>
              )}

              {calculated && playedValue > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="text-xs text-text-dim font-[family-name:var(--font-mono)] mb-0.5">
                    💰 Value unlocked by playing
                  </div>
                  <div
                    className="text-xl font-bold font-[family-name:var(--font-mono)]"
                    style={{ color: '#22c55e' }}
                  >
                    ${countedPlayed.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Time to clear backlog */}
              {calculated && backlogHours !== null && backlogHours > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="text-xs text-text-dim font-[family-name:var(--font-mono)] mb-0.5">
                    ⏳ Time to clear your backlog
                  </div>
                  <div
                    className="text-xl font-bold font-[family-name:var(--font-mono)]"
                    style={{ color: '#f59e0b' }}
                  >
                    ~{countedBacklogHours.toLocaleString()} hours
                  </div>

                  {/* HLTB confidence */}
                  {hltbConfidence.total > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-1.5">
                      <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${hltbPct}%`,
                            backgroundColor: hltbPct > 75 ? '#22c55e' : hltbPct > 40 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-text-faint font-[family-name:var(--font-mono)]">
                        {hltbConfidence.known} of {hltbConfidence.total} timed
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-text-faint font-[family-name:var(--font-mono)] mt-1.5 italic">
                    {backlogHours > 5000
                      ? `That's ${(backlogHours / 24 / 365).toFixed(1)} years of non-stop gaming. You're set for life. Possibly several lives.`
                      : backlogHours > 1000
                      ? `At 2 hours a day, that's ${plural(Math.round(backlogHours / 2 / 30), 'month')}. Better get started.`
                      : backlogHours > 200
                      ? `Totally doable. At 2 hours a day, that's ${plural(Math.round(backlogHours / 2 / 7), 'week')}.`
                      : `Actually manageable. You could knock this out in ${plural(Math.round(backlogHours / 2 / 7), 'week')}.`
                    }
                  </div>
                  <div className="text-[10px] text-text-faint font-[family-name:var(--font-mono)] mt-0.5 opacity-60">
                    completion times via HowLongToBeat
                  </div>
                </div>
              )}

              {/* Enrichment status */}
              {enriching && (
                <div className="mt-2 text-[11px] text-accent-purple font-[family-name:var(--font-mono)] animate-pulse">
                  🔄 Fetching more data... estimates updating live
                </div>
              )}
            </div>
          )}

          {/* Recalculate button — shown after first calc to improve accuracy */}
          {calculated && !enriching && confidencePct < 90 && (
            <button
              onClick={() => {
                setCalculated(false);
                setCalculating(false);
                setTimeout(() => handleCalculate(), 50);
              }}
              className="w-full mt-2 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: 'rgba(167, 139, 250, 0.08)',
                border: '1px solid rgba(167, 139, 250, 0.2)',
                color: '#a78bfa',
              }}
            >
              🔄 Refine estimate ({priceConfidence.known}/{priceConfidence.total} games priced)
            </button>
          )}

          {/* Share Your Shame */}
          {calculated && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => shareToTwitter(generateShareText(shareData))}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  backgroundColor: 'rgba(29, 161, 242, 0.1)',
                  border: '1px solid rgba(29, 161, 242, 0.2)',
                  color: '#1da1f2',
                }}
              >
                𝕏 Share your stats
              </button>
              <button
                onClick={() => shareToReddit(generateShareText(shareData))}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
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
                  navigator.clipboard.writeText(getDiscordText(generateShareText(shareData)));
                  showToast('Copied to clipboard — go share it!');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
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
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      <div className="text-xs text-text-dim font-[family-name:var(--font-mono)] mb-0.5">
        {icon} {label}
      </div>
      <div
        className="text-xl font-bold font-[family-name:var(--font-mono)]"
        style={{ color }}
      >
        {value}
      </div>
      {sublabel && (
        <div className="text-[11px] text-text-faint font-[family-name:var(--font-mono)] mt-0.5 truncate">
          {sublabel}
        </div>
      )}
    </div>
  );
}
