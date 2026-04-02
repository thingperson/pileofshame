import { Game } from './types';

/**
 * Recommend games from the user's library based on a completed game.
 * Uses genre overlap + mood tag overlap to find similar unplayed games.
 * Never recommends games the user has already played or bailed on.
 */

interface ScoredGame {
  game: Game;
  score: number;
  reason: string;
}

export function getCompletionRecommendations(
  completedGame: Game,
  allGames: Game[],
  maxResults = 3
): ScoredGame[] {
  const completedGenres = new Set(completedGame.genres || []);
  const completedMoods = new Set(completedGame.moodTags || []);

  // Only consider games in the backlog (buried or on-deck), not played/bailed
  const candidates = allGames.filter(
    (g) =>
      g.id !== completedGame.id &&
      (g.status === 'buried' || g.status === 'on-deck') &&
      !g.isWishlisted // wishlisted games are unowned, handle separately
  );

  const scored: ScoredGame[] = candidates
    .map((game) => {
      let score = 0;
      const reasons: string[] = [];

      // Genre overlap (strongest signal)
      const gameGenres = new Set(game.genres || []);
      const genreOverlap = [...completedGenres].filter((g) => gameGenres.has(g));
      if (genreOverlap.length > 0) {
        score += genreOverlap.length * 3;
        if (genreOverlap.length >= 2) {
          reasons.push(`shares ${genreOverlap.slice(0, 2).join(' + ')}`);
        } else {
          reasons.push(`also ${genreOverlap[0]}`);
        }
      }

      // Mood tag overlap
      const gameMoods = new Set(game.moodTags || []);
      const moodOverlap = [...completedMoods].filter((m) => gameMoods.has(m));
      if (moodOverlap.length > 0) {
        score += moodOverlap.length * 2;
      }

      // Boost games that are already on-deck (user showed intent)
      if (game.status === 'on-deck') {
        score += 2;
        reasons.push('already queued');
      }

      // Slight boost for games with similar playtime tier
      if (game.timeTier === completedGame.timeTier) {
        score += 1;
      }

      // Slight boost for higher-rated games (metacritic)
      if (game.metacritic && game.metacritic >= 75) {
        score += 1;
      }

      const reason = reasons.length > 0 ? reasons[0] : 'from your backlog';

      return { game, score, reason };
    })
    .filter((s) => s.score >= 3) // minimum relevance threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scored;
}

/**
 * Get wishlisted games that might interest the user after completing a game.
 * These are games they want but don't own yet — deal opportunities.
 */
export function getWishlistRecommendations(
  completedGame: Game,
  allGames: Game[],
  maxResults = 2
): ScoredGame[] {
  const completedGenres = new Set(completedGame.genres || []);

  const wishlisted = allGames.filter(
    (g) => g.isWishlisted && g.status === 'buried'
  );

  const scored: ScoredGame[] = wishlisted
    .map((game) => {
      let score = 0;
      const reasons: string[] = [];

      const gameGenres = new Set(game.genres || []);
      const genreOverlap = [...completedGenres].filter((g) => gameGenres.has(g));
      if (genreOverlap.length > 0) {
        score += genreOverlap.length * 3;
        reasons.push(`similar to ${completedGame.name}`);
      } else {
        score += 1; // still show wishlisted games even without overlap
        reasons.push('on your wishlist');
      }

      return { game, score, reason: reasons[0] || 'on your wishlist' };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return scored;
}
