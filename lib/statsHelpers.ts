import { Game } from '@/lib/types';

// --- Cache constants ---

export const PRICE_CACHE_KEY = 'pos-price-cache';
export const HLTB_CACHE_KEY = 'pos-hltb-cache';
export const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry<T> {
  value: T;
  ts: number;
}

// --- Cache utilities ---

export function loadCache<T>(key: string): Map<string, T> {
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

export function saveCache<T>(key: string, cache: Map<string, T>) {
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

export function getCacheKey(name: string): string {
  return name.trim().toLowerCase();
}

// --- Pluralization helper ---

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

// --- Stats helpers ---

export function getOldestBacklogGame(games: Game[]): { name: string; days: number } | null {
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

export function getCurrentStreak(games: Game[]): number {
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

// --- Share text ---

export function generateShareText(stats: {
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
    lines.push(`${stats.backlogSize} games in my pile. At this point it's a lifestyle.`);
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
    lines.push(`${stats.gamesCleared} cleared${stats.playedValue > 0 ? ` ($${stats.playedValue.toLocaleString()} reclaimed from the backlog)` : ''}.`);
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

export function getShareCTA(platform: 'twitter' | 'reddit' | 'discord'): string {
  switch (platform) {
    case 'twitter':
      return '\nClear some space → https://inventoryfull.gg';
    case 'reddit':
      return '\n\nClear some space → [inventoryfull.gg](https://inventoryfull.gg)';
    case 'discord':
      return '\n\nClear some space → <https://inventoryfull.gg>';
  }
}

export function shareToTwitter(text: string) {
  const fullText = text + getShareCTA('twitter');
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`, '_blank', 'width=550,height=420');
}

export function shareToReddit(text: string) {
  const fullText = text + getShareCTA('reddit');
  window.open(`https://reddit.com/submit?selftext=true&title=${encodeURIComponent('My gaming library stats. How does yours compare?')}&text=${encodeURIComponent(fullText)}`, '_blank');
}

export function getDiscordText(text: string): string {
  return text + getShareCTA('discord');
}

// --- Batch fetch helpers ---

export async function fetchPricesBatch(titles: string[]): Promise<Map<string, number>> {
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

export async function fetchHltbBatch(titles: string[]): Promise<Map<string, number>> {
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
