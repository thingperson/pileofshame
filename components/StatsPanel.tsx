'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Game } from '@/lib/types';
import { getAllMatchingArchetypes, getThemeUsage } from '@/lib/archetypes';
import { useToast } from './Toast';
import { trackStatsExpand } from '@/lib/analytics';
import {
  loadCache, saveCache, getCacheKey,
  getCurrentStreak, getOldestBacklogGame,
  fetchPricesBatch, fetchHltbBatch,
  PRICE_CACHE_KEY, HLTB_CACHE_KEY,
} from '@/lib/statsHelpers';
import StatCard from './StatCard';
import ArchetypeCard from './ArchetypeCard';
import ValueCalculator from './ValueCalculator';

interface StatsPanelProps {
  games: Game[];
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

// --- Main Component ---

export default function StatsPanel({ games }: StatsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [enriching, setEnriching] = useState(false);
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

    // Games in motion = on-deck + playing (progress without clearing)
    const inMotion = games.filter((g) => g.status === 'on-deck' || g.status === 'playing').length;

    // Non-finishable games that are playing count as "explored"
    const nonFinishablePlaying = games.filter((g) => g.isNonFinishable && g.status === 'playing').length;

    return {
      backlogSize, gamesCleared, bailedCount, nowPlaying, totalHours, streak, oldest,
      inMotion, nonFinishablePlaying,
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

    const knownAvg = knownPriceCount >= 3 ? knownPriceSum / knownPriceCount : FALLBACK_PRICE;

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

  // Background enrichment -- fetch uncached games in batches
  const enrichInBackground = useCallback(async (
    priceCache: Map<string, number>,
    hltbCache: Map<string, number>,
  ) => {
    enrichAbortRef.current = false;
    setEnriching(true);

    const allGames = games.filter((g) => g.name.length > 2);

    const uncachedForPrice = allGames.filter((g) => !priceCache.has(getCacheKey(g.name)));
    const uncachedForHltb = allGames
      .filter((g) => g.status === 'buried' || g.status === 'on-deck')
      .filter((g) => !hltbCache.has(getCacheKey(g.name)));

    for (let i = 0; i < uncachedForPrice.length; i += 15) {
      if (enrichAbortRef.current) break;
      const batch = uncachedForPrice.slice(i, i + 15).map((g) => g.name);
      const results = await fetchPricesBatch(batch);
      results.forEach((v, k) => priceCache.set(k, v));
      saveCache(PRICE_CACHE_KEY, priceCache);
      computeValues(priceCache, hltbCache);
      await new Promise((r) => setTimeout(r, 500));
    }

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

    const priceCache = loadCache<number>(PRICE_CACHE_KEY);
    const hltbCache = loadCache<number>(HLTB_CACHE_KEY);

    const allGames = games.filter((g) => g.name.length > 2);

    const uncachedForPrice = allGames
      .filter((g) => !priceCache.has(getCacheKey(g.name)))
      .sort(() => Math.random() - 0.5)
      .slice(0, 15);

    const backlogUncachedForHltb = allGames
      .filter((g) => g.status === 'buried' || g.status === 'on-deck')
      .filter((g) => !hltbCache.has(getCacheKey(g.name)))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    const [priceResults, hltbResults] = await Promise.allSettled([
      fetchPricesBatch(uncachedForPrice.map((g) => g.name)),
      fetchHltbBatch(backlogUncachedForHltb.map((g) => g.name)),
    ]);

    if (priceResults.status === 'fulfilled') {
      priceResults.value.forEach((v, k) => priceCache.set(k, v));
      saveCache(PRICE_CACHE_KEY, priceCache);
    }
    if (hltbResults.status === 'fulfilled') {
      hltbResults.value.forEach((v, k) => hltbCache.set(k, v));
      saveCache(HLTB_CACHE_KEY, hltbCache);
    }

    computeValues(priceCache, hltbCache);

    setTimeout(() => {
      setCalculated(true);
      enrichInBackground(priceCache, hltbCache);
    }, 1600);
  }, [games, computeValues, enrichInBackground]);

  const handleRecalculate = useCallback(() => {
    setCalculated(false);
    setCalculating(false);
    setTimeout(() => handleCalculate(), 50);
  }, [handleCalculate]);

  // Player archetype
  const themeUsage = useMemo(() => getThemeUsage(), []);
  const archetypes = useMemo(() => getAllMatchingArchetypes(games, themeUsage), [games, themeUsage]);
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

  const totalGames = games.length;
  // Non-finishable games count as "explored" once actively playing
  const explorationPct = totalGames > 0 ? Math.round(((stats.gamesCleared + stats.bailedCount + stats.nonFinishablePlaying) / totalGames) * 100) : 0;

  return (
    <div className="mb-6">
      {/* Always-visible stats teaser strip */}
      <button
        onClick={() => { if (!expanded) trackStatsExpand(); setExpanded(!expanded); }}
        className="w-full rounded-xl border px-4 py-3 transition-all hover:border-accent-purple group cursor-pointer"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: expanded ? 'var(--color-border-active)' : 'var(--color-border-subtle)',
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left: label + expand button */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm sm:text-base font-extrabold text-text-primary tracking-tight">My Progress</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
              style={{ backgroundColor: expanded ? 'var(--color-accent-purple)' : 'rgba(167, 139, 250, 0.12)' }}
            >
              <span className={`text-xs font-semibold font-[family-name:var(--font-mono)] transition-colors ${expanded ? 'text-bg-primary' : 'text-accent-purple'}`}>
                {expanded ? 'less' : 'more'}
              </span>
              <svg
                className={`w-3.5 h-3.5 transition-all duration-200 ${expanded ? 'rotate-180 text-bg-primary' : 'text-accent-purple'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {/* Right: stats */}
          <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto">
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
            {stats.inMotion > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-sm">🚀</span>
                <span className="text-sm font-bold font-[family-name:var(--font-mono)]" style={{ color: '#f59e0b' }}>{stats.inMotion}</span>
                <span className="text-xs text-text-dim hidden sm:inline">in motion</span>
              </div>
            )}
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
            <div className="flex items-center gap-2 shrink-0 hidden sm:flex">
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${explorationPct}%`, backgroundColor: '#a78bfa' }}
                />
              </div>
              <span className="text-xs font-bold font-[family-name:var(--font-mono)]" style={{ color: '#a78bfa' }}>{explorationPct}%</span>
            </div>
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
            <StatCard label="In Motion" value={stats.inMotion.toString()} icon="🚀" color="#f59e0b" sublabel="on-deck + playing" />
            <StatCard label="Streak" value={stats.streak.toString()} icon="⚡" color="#a78bfa" sublabel="without bailing" />
            <StatCard
              label="Hours Logged"
              value={stats.totalHours > 0 ? stats.totalHours.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
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
            <ArchetypeCard
              currentArchetype={currentArchetype}
              archetypeIndex={archetypeIndex}
              archetypesLength={archetypes.length}
              onReroll={handleRerollArchetype}
            />
          )}

          {/* Value Calculator */}
          <ValueCalculator
            calculating={calculating}
            calculated={calculated}
            enriching={enriching}
            countedUnplayed={countedUnplayed}
            countedPlayed={countedPlayed}
            countedBacklogHours={countedBacklogHours}
            backlogHours={backlogHours}
            playedValue={playedValue}
            priceConfidence={priceConfidence}
            hltbConfidence={hltbConfidence}
            confidencePct={confidencePct}
            hltbPct={hltbPct}
            handleCalculate={handleCalculate}
            handleRecalculate={handleRecalculate}
            stats={stats}
            explorationPct={explorationPct}
            currentArchetype={currentArchetype}
            showToast={showToast}
          />
        </div>
      )}
    </div>
  );
}
