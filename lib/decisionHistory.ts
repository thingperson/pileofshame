import { Game, MoodTag, TimeTier } from './types';
import { RerollMode, EnergyLevel } from './reroll';

const STORAGE_KEY = 'if-decision-history';
const MAX_ENTRIES = 100;

export interface DecisionRecord {
  gameId: string;
  gameName: string;
  mode: RerollMode;
  action: 'accept' | 'skip';
  moodFilters: MoodTag[];
  energy: EnergyLevel;
  genres: string[];
  timeTier: TimeTier;
  timestamp: string;
}

export function getDecisionHistory(): DecisionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function recordDecision(record: DecisionRecord): void {
  const history = getDecisionHistory();
  history.push(record);
  // Keep only the last MAX_ENTRIES
  if (history.length > MAX_ENTRIES) {
    history.splice(0, history.length - MAX_ENTRIES);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearDecisionHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Behavioral Learning (V3 #6) ─────────────────────────────────

/**
 * Compute genre affinity multiplier for a game based on decision history.
 * Compares per-genre accept rate to overall average accept rate.
 */
export function computeGenreAffinity(game: Game, history: DecisionRecord[]): number {
  const gameGenres = (game.genres || []).map(g => g.toLowerCase());
  if (gameGenres.length === 0) return 1.0;

  const totalAccepts = history.filter(d => d.action === 'accept').length;
  const avgRate = totalAccepts / history.length;
  if (avgRate === 0) return 1.0;

  const isDampened = history.length < 25;

  const affinities: number[] = [];

  for (const genre of gameGenres) {
    const genreDecisions = history.filter(d => d.genres.includes(genre));
    if (genreDecisions.length < 3) {
      affinities.push(1.0);
      continue;
    }
    const genreAccepts = genreDecisions.filter(d => d.action === 'accept').length;
    const genreRate = genreAccepts / genreDecisions.length;
    let affinity = Math.max(0.5, Math.min(genreRate / avgRate, 2.0));

    if (isDampened) {
      affinity = 1.0 + (affinity - 1.0) * 0.5;
    }

    affinities.push(affinity);
  }

  return affinities.reduce((sum, a) => sum + a, 0) / affinities.length;
}

/**
 * Compute time tier preference multiplier based on decision history.
 */
export function computeTierPreference(game: Game, history: DecisionRecord[]): number {
  const tier = game.timeTier;
  if (!tier) return 1.0;

  const totalAccepts = history.filter(d => d.action === 'accept').length;
  const avgRate = totalAccepts / history.length;
  if (avgRate === 0) return 1.0;

  const tierDecisions = history.filter(d => d.timeTier === tier);
  if (tierDecisions.length < 3) return 1.0;

  const tierAccepts = tierDecisions.filter(d => d.action === 'accept').length;
  const tierRate = tierAccepts / tierDecisions.length;
  let pref = Math.max(0.5, Math.min(tierRate / avgRate, 2.0));

  if (history.length < 25) {
    pref = 1.0 + (pref - 1.0) * 0.5;
  }

  return pref;
}

/**
 * Compute Shannon entropy over genre distribution of accepted games.
 * Returns clamp range for genre affinity based on variety preference.
 */
export function computeVarietyFactor(history: DecisionRecord[]): { min: number; max: number } {
  const accepted = history.filter(d => d.action === 'accept');
  if (accepted.length === 0) return { min: 0.5, max: 2.0 };

  // Count genre frequency across accepted games
  const genreCounts: Record<string, number> = {};
  let totalGenreOccurrences = 0;

  for (const d of accepted) {
    for (const g of d.genres) {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
      totalGenreOccurrences++;
    }
  }

  if (totalGenreOccurrences === 0) return { min: 0.5, max: 2.0 };

  // Shannon entropy: -sum(p * log2(p))
  let entropy = 0;
  for (const count of Object.values(genreCounts)) {
    const p = count / totalGenreOccurrences;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  if (entropy > 2.0) return { min: 0.7, max: 1.5 };
  if (entropy < 1.0) return { min: 0.5, max: 2.0 };
  return { min: 0.6, max: 1.8 };
}

/**
 * Main entry point for behavioral weight. Called from calculateWeight.
 * Returns a multiplier (default 1.0 with < 10 decisions).
 */
export function getBehavioralWeight(game: Game): number {
  const history = getDecisionHistory();
  if (history.length < 10) return 1.0;

  const genreAffinity = computeGenreAffinity(game, history);
  const tierPref = computeTierPreference(game, history);
  let weight = genreAffinity * tierPref;

  // Apply variety factor clamping
  const variety = computeVarietyFactor(history);
  weight = Math.max(variety.min, Math.min(weight, variety.max));

  return weight;
}

const TIME_TIER_LABELS: Record<TimeTier, string> = {
  'quick-hit': 'under 10 hours',
  'wind-down': '10-20 hours',
  'deep-cut': '20-40 hours',
  'marathon': '40+ hours',
};

/**
 * Returns summary stats for the Stats panel.
 * Returns null if fewer than 10 decisions recorded.
 */
export function getDecisionStats(): {
  topGenres: string[];
  skipGenres: string[];
  sweetSpot: string;
  count: number;
} | null {
  const history = getDecisionHistory();
  if (history.length < 10) return null;

  const totalAccepts = history.filter(d => d.action === 'accept').length;
  const avgRate = history.length > 0 ? totalAccepts / history.length : 0;

  // Genre accept rates
  const genreStats: Record<string, { accepts: number; total: number }> = {};
  for (const d of history) {
    for (const g of d.genres) {
      if (!genreStats[g]) genreStats[g] = { accepts: 0, total: 0 };
      genreStats[g].total++;
      if (d.action === 'accept') genreStats[g].accepts++;
    }
  }

  // Filter to genres with 3+ decisions, compute accept rate
  const qualifiedGenres = Object.entries(genreStats)
    .filter(([, s]) => s.total >= 3)
    .map(([genre, s]) => ({ genre, rate: s.accepts / s.total }))
    .sort((a, b) => b.rate - a.rate);

  const topGenres = qualifiedGenres.slice(0, 2).map(g => g.genre);
  const skipGenres = qualifiedGenres.length >= 2
    ? qualifiedGenres.slice(-2).reverse().map(g => g.genre)
    : [];

  // Time tier preference
  const tierStats: Record<string, { accepts: number; total: number }> = {};
  for (const d of history) {
    if (!d.timeTier) continue;
    if (!tierStats[d.timeTier]) tierStats[d.timeTier] = { accepts: 0, total: 0 };
    tierStats[d.timeTier].total++;
    if (d.action === 'accept') tierStats[d.timeTier].accepts++;
  }

  let bestTier: TimeTier = 'wind-down';
  let bestTierRate = -1;
  for (const [tier, s] of Object.entries(tierStats)) {
    if (s.total >= 3) {
      const rate = s.accepts / s.total;
      if (rate > bestTierRate) {
        bestTierRate = rate;
        bestTier = tier as TimeTier;
      }
    }
  }

  return {
    topGenres,
    skipGenres,
    sweetSpot: TIME_TIER_LABELS[bestTier] || '10-20 hours',
    count: history.length,
  };
}
