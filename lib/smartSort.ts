import { Game } from './types';

/**
 * "Best for You" sort algorithm.
 * Scores each game based on genre affinity, metacritic, playtime signals, and enrichment quality.
 * Returns games sorted highest-score-first.
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
 * Higher score = more likely the user would enjoy this.
 */
export function scoreGame(game: Game, genreDist: GenreDistribution): number {
  let score = 0;

  // Genre affinity (0.4 weight) — how over-indexed is the user on this game's genres?
  if (game.genres && game.genres.length > 0 && genreDist.total > 0) {
    const uniqueGenres = Object.keys(genreDist.counts).length || 1;
    const expectedShare = 1 / uniqueGenres; // flat distribution baseline

    let affinitySum = 0;
    for (const genre of game.genres) {
      const actualShare = (genreDist.counts[genre] || 0) / genreDist.total;
      // How much more (or less) of this genre vs expected
      affinitySum += actualShare / expectedShare;
    }
    // Normalize by number of genres on this game
    const affinityScore = affinitySum / game.genres.length;
    score += affinityScore * 40; // Scale to ~0-40 range
  }

  // Metacritic (0.3 weight) — normalized 0-30
  if (game.metacritic) {
    score += (game.metacritic / 100) * 30;
  }

  // Hours signal (0.2 weight)
  if (game.hoursPlayed > 0 && game.hoursPlayed <= 20) {
    // Started but not deep — they were interested, nudge them back
    score += 20;
  } else if (game.hoursPlayed > 20 && game.hoursPlayed <= 50) {
    score += 10; // Moderate play, still relevant
  }
  // 0 hours or 50+ hours: no boost (unstarted or comfort game)

  // Enrichment quality (0.1 weight) — better-enriched games make better recs
  if (game.description) score += 4;
  if (game.coverUrl) score += 3;
  if (game.moodTags && game.moodTags.length > 0) score += 3;

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
 * Determine smart status for a game on import based on playtime + HLTB data.
 * Returns the status the game should be assigned to.
 */
export function getSmartImportStatus(
  hoursPlayed: number,
  hltbMain: number | undefined,
  isNonFinishable: boolean | undefined,
  genres?: string[],
): 'buried' | 'on-deck' | 'played' {
  // No playtime = pure backlog
  if (!hoursPlayed || hoursPlayed === 0) return 'buried';

  // Non-finishable games (multiplayer, roguelikes, sandboxes) with significant hours = completed
  if (isNonFinishable && hoursPlayed >= 50) return 'played';

  // Genre-based non-finishable detection (backup if isNonFinishable isn't set)
  const nonFinishableGenres = ['Massively Multiplayer', 'MMO', 'Battle Royale'];
  if (genres && genres.some((g) => nonFinishableGenres.includes(g)) && hoursPlayed >= 50) {
    return 'played';
  }

  // If we have HLTB data, use 1.3x threshold for completion
  if (hltbMain && hltbMain > 0) {
    const completionThreshold = hltbMain * 1.3;
    if (hoursPlayed >= completionThreshold) return 'played';
  }

  // 5+ hours = started, worth surfacing as Up Next candidate
  if (hoursPlayed >= 5) return 'on-deck';

  // 1-5 hours = tried it, still backlog but will be flagged as "started"
  return 'buried';
}
