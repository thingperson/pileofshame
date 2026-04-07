/**
 * Skip Reasons — Tracks WHY users skip games in the decision engine.
 *
 * Additive to skipTracking.ts (which tracks raw skip counts).
 * This module captures the reason behind the skip to improve
 * future recommendations.
 *
 * Stored in localStorage. Client-side only.
 */

const STORAGE_KEY = 'if-skip-reasons';

export type SkipReasonKey = 'not-in-mood' | 'too-long' | 'played-recently' | 'hit-a-wall' | 'not-interested';

export interface SkipReasonData {
  reasons: Partial<Record<SkipReasonKey, number>>;
  lastReason: SkipReasonKey;
  lastReasonAt: string; // ISO date
}

export function getAllSkipReasons(): Record<string, SkipReasonData> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getSkipReasonData(gameId: string): SkipReasonData | null {
  return getAllSkipReasons()[gameId] || null;
}

export function recordSkipReason(gameId: string, reason: SkipReasonKey): void {
  const all = getAllSkipReasons();
  const existing = all[gameId] || { reasons: {}, lastReason: reason, lastReasonAt: '' };

  existing.reasons[reason] = (existing.reasons[reason] || 0) + 1;
  existing.lastReason = reason;
  existing.lastReasonAt = new Date().toISOString();

  all[gameId] = existing;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/** Returns true if the user has said "not interested" 2+ times for this game */
export function isNotInterestedIgnored(gameId: string): boolean {
  const data = getSkipReasonData(gameId);
  if (!data) return false;
  return (data.reasons['not-interested'] || 0) >= 2;
}

/** Returns true if "hit a wall" was the last reason and it was within the last 7 days */
export function isHitAWallSuppressed(gameId: string): boolean {
  const data = getSkipReasonData(gameId);
  if (!data) return false;
  if (data.lastReason !== 'hit-a-wall') return false;

  const lastAt = new Date(data.lastReasonAt).getTime();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return lastAt >= sevenDaysAgo;
}
