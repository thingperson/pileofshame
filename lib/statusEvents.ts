'use client';

/**
 * Append-only status-event log — Year in Pile data layer (Phase 1).
 *
 * Every status transition a user makes is recorded here, append-only, so that
 * December's "Year in Pile" can compute things `updatedAt` can't (it's
 * overwritten on every edit): Moved On *this year*, longest run between
 * `playing` and `played`/`bailed`, etc. See docs/year-in-pile-spec.md §3, §7.
 *
 * THIS IS PERISHABLE DATA. Status events cannot be backfilled — the day we
 * start logging is the earliest day Year-in-Pile can ever report on. That's
 * why this ships ahead of the rest of the feature.
 *
 * Storage: its own localStorage key (`if-status-events`), deliberately NOT
 * folded into the Zustand `getplaying-library` blob — an append-only log
 * should be decoupled from store versioning/migrations and partialize churn.
 *
 * Local-only for now. Supabase `status_events` mirror is the documented
 * fast-follow (needs a Privacy Policy update first — see legal-compliance.md:
 * moving any data client→server requires a policy update before shipping).
 *
 * Logging must NEVER break a status change: every localStorage touch is
 * wrapped and fails silent.
 */

import { v4 as uuidv4 } from 'uuid';
import type { GameStatus } from './types';

const STORAGE_KEY = 'if-status-events';
const MAX_EVENTS = 5000; // ~enough for a year of activity; FIFO past this.

export interface StatusEvent {
  id: string;
  gameId: string;
  from: GameStatus;
  to: GameStatus;
  at: string; // ISO timestamp
}

function read(): StatusEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StatusEvent[]) : [];
  } catch {
    return [];
  }
}

function write(events: StatusEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // localStorage can throw in private mode or on quota — never let logging
    // break the status change that triggered it.
  }
}

/**
 * Record a single status transition. No-op if `from === to` (nothing moved).
 * Pass the same `at` the store already computed for `updatedAt` so the event
 * and the game record agree to the millisecond.
 */
export function recordStatusEvent(
  gameId: string,
  from: GameStatus,
  to: GameStatus,
  at: string = new Date().toISOString(),
): void {
  if (from === to) return;
  const events = read();
  events.push({ id: uuidv4(), gameId, from, to, at });
  // FIFO eviction: keep the most recent MAX_EVENTS.
  write(events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events);
}

/** Full append-only log, oldest first. Consumed by lib/yearInPile.ts (Phase 1, later). */
export function getStatusEvents(): StatusEvent[] {
  return read();
}

/** Events whose `at` falls within the given calendar year (local time). */
export function getStatusEventsForYear(year: number): StatusEvent[] {
  return read().filter((e) => new Date(e.at).getFullYear() === year);
}
