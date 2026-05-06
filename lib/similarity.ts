import type { Game } from './types';

const TIME_TIERS = ['quick-hit', 'wind-down', 'deep-cut', 'marathon'] as const;

function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const item of setA) if (setB.has(item)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function timeTierProximity(a: string, b: string): number {
  const idxA = TIME_TIERS.indexOf(a as typeof TIME_TIERS[number]);
  const idxB = TIME_TIERS.indexOf(b as typeof TIME_TIERS[number]);
  if (idxA === -1 || idxB === -1) return 0;
  const diff = Math.abs(idxA - idxB);
  if (diff === 0) return 1;
  if (diff === 1) return 0.5;
  return 0;
}

function metacriticBracket(a?: number, b?: number): number {
  if (a == null || b == null) return 0.5;
  const bothHigh = a >= 75 && b >= 75;
  const bothLow = a < 75 && b < 75;
  if (bothHigh || bothLow) return 1;
  if (Math.abs(a - b) > 25) return 0.5;
  return 0.75;
}

function scoreSimilarity(target: Game, candidate: Game): number {
  const genreScore = jaccard(target.genres || [], candidate.genres || []) * 0.4;
  const moodScore = jaccard(
    (target.moodTags || []) as string[],
    (candidate.moodTags || []) as string[]
  ) * 0.25;
  const timeScore = timeTierProximity(target.timeTier || '', candidate.timeTier || '') * 0.2;
  const metaScore = metacriticBracket(target.metacritic, candidate.metacritic) * 0.15;
  return genreScore + moodScore + timeScore + metaScore;
}

/**
 * Find games similar to the target from the user's completed library.
 * Only looks at other completed games. Returns up to `limit` results.
 */
export function findSimilarGames(target: Game, allGames: Game[], limit = 5): Game[] {
  const candidates = allGames.filter(
    (g) => g.id !== target.id && g.status === 'played'
  );

  if (candidates.length < 2) return [];

  const scored = candidates.map((g) => ({
    game: g,
    score: scoreSimilarity(target, g),
  }));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Filter out very low scores, then take top N
  const threshold = 0.15;
  const results = scored.filter((s) => s.score > threshold).slice(0, limit);

  // Fallback: if nothing scored high enough, return most recent completions
  if (results.length === 0) {
    return candidates
      .filter((g) => g.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, limit);
  }

  return results.map((r) => r.game);
}
