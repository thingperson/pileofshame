// Genre Cooldown — Decision Engine V3 Feature #3
//
// After completing a game, penalize the same genre for 7-14 days
// to encourage variety. Tracks last 3 completions in localStorage.

const STORAGE_KEY = 'if-genre-cooldowns';
const MAX_ENTRIES = 3;

interface GenreCooldownEntry {
  gameId: string;
  genres: string[];       // lowercased
  completedAt: string;    // ISO date
}

function getEntries(): GenreCooldownEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: GenreCooldownEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/**
 * Record a game completion for cooldown tracking.
 * Call this when a game moves to 'played' status.
 * Bailed games should NOT be recorded (bailing ≠ genre fatigue).
 */
export function recordCompletion(gameId: string, genres: string[]): void {
  if (!genres || genres.length === 0) return;

  const entries = getEntries();

  // Don't duplicate if already recorded
  if (entries.some(e => e.gameId === gameId)) return;

  const newEntry: GenreCooldownEntry = {
    gameId,
    genres: genres.map(g => g.toLowerCase()),
    completedAt: new Date().toISOString(),
  };

  // Newest first, max 3
  saveEntries([newEntry, ...entries].slice(0, MAX_ENTRIES));
}

/**
 * Get a weight multiplier based on genre cooldown.
 * Returns < 1 if the game shares genres with recent completions.
 *
 * - Completion within 7 days: 0.6x per genre overlap
 * - Completion 7-14 days ago: 0.8x per genre overlap
 * - After 14 days: no penalty
 */
export function getGenreCooldownMultiplier(gameGenres: string[]): number {
  if (!gameGenres || gameGenres.length === 0) return 1;

  const entries = getEntries();
  if (entries.length === 0) return 1;

  const now = Date.now();
  const lowerGenres = gameGenres.map(g => g.toLowerCase());
  let multiplier = 1;

  for (const entry of entries) {
    const daysSince = (now - new Date(entry.completedAt).getTime()) / (1000 * 60 * 60 * 24);

    // No penalty after 14 days
    if (daysSince > 14) continue;

    // Count genre overlap
    const overlap = lowerGenres.filter(g => entry.genres.includes(g)).length;
    if (overlap === 0) continue;

    // Apply penalty per overlap
    const penalty = daysSince <= 7 ? 0.6 : 0.8;
    for (let i = 0; i < overlap; i++) {
      multiplier *= penalty;
    }
  }

  // Floor at 0.1 so games aren't completely invisible
  return Math.max(0.1, multiplier);
}
