import { Game } from './types';

/**
 * "Best for You" sort algorithm.
 * Scores each game based on genre affinity, metacritic, playtime signals,
 * enrichment quality, completion proximity, and backlog age.
 * Returns games sorted highest-score-first.
 *
 * This should feel like the decision engine's "if we had to rank your whole
 * library right now, here's what deserves your attention most."
 */

interface GenreDistribution {
  counts: Record<string, number>;
  total: number;
}

/**
 * Calculate genre distribution from a user's library.
 * Returns how "over-indexed" each genre is vs. a flat distribution.
 */
export function getGenreDistribution(games: Game[]): GenreDistribution {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const game of games) {
    if (game.genres) {
      for (const genre of game.genres) {
        counts[genre] = (counts[genre] || 0) + 1;
        total++;
      }
    }
  }

  return { counts, total };
}

/**
 * Score a game for "Best for You" sorting.
 * Higher score = more likely the user should play this next.
 *
 * Scoring breakdown (max ~100 points):
 *   Genre affinity:         0-30  (what do they gravitate toward?)
 *   Metacritic:             0-20  (is this actually good?)
 *   Completion proximity:   0-20  (are they close to finishing?)
 *   Hours played signal:    0-15  (have they started and stopped?)
 *   Backlog age:            0-10  (has this been buried forever?)
 *   Enrichment quality:     0-5   (do we know enough to recommend it?)
 */
export function scoreGame(game: Game, genreDist: GenreDistribution): number {
  let score = 0;

  // ── Genre affinity (0-30) ──
  // How over-indexed is the user on this game's genres?
  if (game.genres && game.genres.length > 0 && genreDist.total > 0) {
    const uniqueGenres = Object.keys(genreDist.counts).length || 1;
    const expectedShare = 1 / uniqueGenres;

    let affinitySum = 0;
    for (const genre of game.genres) {
      const actualShare = (genreDist.counts[genre] || 0) / genreDist.total;
      affinitySum += actualShare / expectedShare;
    }
    const affinityScore = affinitySum / game.genres.length;
    score += Math.min(affinityScore * 30, 30);
  }

  // ── Metacritic (0-20) ──
  // Tiered, not linear. Great games deserve a real boost.
  if (game.metacritic) {
    if (game.metacritic >= 90) score += 20;
    else if (game.metacritic >= 80) score += 16;
    else if (game.metacritic >= 75) score += 12;
    else if (game.metacritic >= 60) score += 6;
    // Below 60: no boost. Not punishing, just not prioritizing.
  }

  // ── Completion proximity (0-20) ──
  // The closer you are to finishing, the higher you should be.
  // This is the HLTB inference — if they're 15h into a 20h game, surface it.
  if (game.hoursPlayed > 0 && game.hltbMain && game.hltbMain > 0) {
    const progress = game.hoursPlayed / game.hltbMain;
    const remainingHours = game.hltbMain - game.hoursPlayed;

    if (progress >= 0.85) {
      // Almost done — huge boost. "You're right there."
      score += 20;
    } else if (progress >= 0.6) {
      // Past the halfway point. Solid momentum.
      score += 15;
    } else if (progress >= 0.3) {
      // Meaningful progress. They know the game.
      score += 10;
    } else if (remainingHours < 5 && game.hoursPlayed >= 1) {
      // Short game, already started — quick win opportunity
      score += 12;
    }
  }

  // ── Hours played signal (0-15) ──
  // Started but didn't finish = high reactivation potential
  if (game.hoursPlayed > 0 && game.hoursPlayed <= 20) {
    score += 15; // Started, worth nudging back
  } else if (game.hoursPlayed > 20 && game.hoursPlayed <= 50) {
    score += 8; // Moderate play, still relevant
  }
  // 0 hours: no boost (unstarted)
  // 50+ hours: no boost (comfort game or already deep)

  // ── Backlog age (0-10) ──
  // Games buried for over a year deserve to surface.
  if (game.addedAt) {
    const ageMs = Date.now() - new Date(game.addedAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays > 365) score += 10;     // Over a year — forgotten gem territory
    else if (ageDays > 180) score += 6; // 6+ months — starting to collect dust
    else if (ageDays > 90) score += 3;  // 3+ months — mild nudge
  }

  // ── Enrichment quality (0-5) ──
  // Better-enriched games make better recs. Slight tiebreaker.
  if (game.description) score += 2;
  if (game.coverUrl) score += 1;
  if (game.moodTags && game.moodTags.length > 0) score += 1;
  if (game.hltbMain) score += 1;

  return score;
}

/**
 * Sort games by "Best for You" score.
 * Pass the full library to calculate genre distribution,
 * then sort the target games by score.
 */
export function sortBestForYou(gamesToSort: Game[], fullLibrary: Game[]): Game[] {
  const genreDist = getGenreDistribution(fullLibrary);

  const scored = gamesToSort.map((game) => ({
    game,
    score: scoreGame(game, genreDist),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.game);
}

/**
 * Smart status for Xbox imports — only auto-assigns 'played' when achievements
 * are 100% complete (unambiguous evidence). Up Next / Playing Now are user-only
 * statuses; the importer never guesses them.
 */
export function getSmartImportStatusFromAchievements(
  earned: number,
  total: number,
): 'buried' | 'played' {
  if (total > 0 && earned >= total) return 'played';
  return 'buried';
}
