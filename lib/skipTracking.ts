/**
 * Skip Tracking — Persistent memory of games the user skips in the decision engine.
 *
 * Stored in localStorage. Syncs to Supabase if user is signed in (future).
 *
 * Thresholds:
 *   - 1-2 skips: no penalty (normal browsing)
 *   - 3-4 skips: 50% weight reduction in pickWeighted
 *   - 5+ skips: soft-ignore (filtered from suggestions, stays in library)
 *
 * Users can reset skip count from the game detail modal.
 * Soft-ignored is NOT the same as hard-ignored (user-toggled "Ignore this title").
 */

const STORAGE_KEY = 'if-skip-counts';

export interface SkipData {
  count: number;
  lastSkippedAt: string; // ISO date
}

export function getSkipCounts(): Record<string, SkipData> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getSkipCount(gameId: string): number {
  return getSkipCounts()[gameId]?.count || 0;
}

export function recordSkip(gameId: string): number {
  const counts = getSkipCounts();
  const current = counts[gameId]?.count || 0;
  counts[gameId] = {
    count: current + 1,
    lastSkippedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  return counts[gameId].count;
}

export function resetSkipCount(gameId: string): void {
  const counts = getSkipCounts();
  delete counts[gameId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
}

export function isSoftIgnored(gameId: string): boolean {
  return getSkipCount(gameId) >= 5;
}

/**
 * Get the weight multiplier for a game based on skip history.
 * Returns 1.0 for no/low skips, 0.5 for 3-4 skips, 0 for 5+ (soft-ignored).
 */
export function getSkipWeightMultiplier(gameId: string): number {
  const count = getSkipCount(gameId);
  if (count >= 5) return 0; // Soft-ignored — filtered out in getEligibleGames
  if (count >= 3) return 0.5; // Reduced weight
  return 1; // No penalty
}
