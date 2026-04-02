import { Game, MoodTag, TimeTier } from './types';
import { inferMoodTags, inferTimeTier } from './enrichment';

interface EnrichmentResult {
  coverUrl?: string;
  rawgSlug?: string;
  metacritic?: number;
  genres?: string[];
  description?: string;
  moodTags?: MoodTag[];
  hltbMain?: number;
  hltbComplete?: number;
  timeTier?: TimeTier;
  enrichedAt: string;
}

/**
 * Enrich a single game with data from RAWG and HLTB.
 * Returns partial Game update fields.
 */
export async function enrichGame(game: Game): Promise<EnrichmentResult | null> {
  const result: EnrichmentResult = {
    enrichedAt: new Date().toISOString(),
  };

  let genres = game.genres || [];

  // Step 1: RAWG — fetch metadata if we don't have it or need description
  if (!game.description || !game.coverUrl || !game.metacritic) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let rawgData: Record<string, any> | null = null;

      if (game.rawgSlug) {
        // Fetch by slug (most accurate)
        const res = await fetch(`/api/rawg?slug=${encodeURIComponent(game.rawgSlug)}`);
        if (res.ok) {
          const data = await res.json();
          rawgData = data.game;
        }
      } else {
        // Search by name
        const res = await fetch(`/api/rawg?search=${encodeURIComponent(game.name)}`);
        if (res.ok) {
          const data = await res.json();
          rawgData = data.results?.[0];
        }
      }

      if (rawgData) {
        if (!game.coverUrl && rawgData.coverUrl) result.coverUrl = rawgData.coverUrl;
        if (!game.rawgSlug && rawgData.slug) result.rawgSlug = rawgData.slug;
        if (!game.metacritic && rawgData.metacritic) result.metacritic = rawgData.metacritic;
        if ((!game.genres || game.genres.length === 0) && rawgData.genres?.length > 0) {
          result.genres = rawgData.genres;
          genres = rawgData.genres;
        }
        if (rawgData.description) result.description = rawgData.description;

        // If we got a slug from search but don't have a description yet,
        // do a follow-up slug fetch for the full description
        if (!rawgData.description && rawgData.slug && !game.rawgSlug) {
          try {
            const slugRes = await fetch(`/api/rawg?slug=${encodeURIComponent(rawgData.slug)}`);
            if (slugRes.ok) {
              const slugData = await slugRes.json();
              if (slugData.game?.description) {
                result.description = slugData.game.description;
              }
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      // RAWG failed, continue with HLTB
    }
  }

  // Step 2: Infer mood tags from genres
  const effectiveGenres = genres.length > 0 ? genres : game.genres;
  if (!game.moodTags || game.moodTags.length === 0) {
    const moods = inferMoodTags(game.name, effectiveGenres);
    if (moods.length > 0) result.moodTags = moods;
  }

  // Step 3: HLTB — fetch completion time if we don't have it
  if (!game.hltbMain) {
    try {
      const res = await fetch(`/api/hltb?title=${encodeURIComponent(game.name)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.main > 0) {
          result.hltbMain = data.main;
          result.hltbComplete = data.completionist || undefined;

          // Auto-assign time tier from HLTB data
          result.timeTier = inferTimeTier(data.main);
        }
      }
    } catch {
      // HLTB failed, continue
    }
  }

  // Check if we actually got any new data
  const hasNewData = Object.keys(result).length > 1; // > 1 because enrichedAt is always set
  return hasNewData ? result : null;
}

/**
 * Enrich multiple games in batches.
 * Calls onProgress after each game is enriched.
 */
export async function enrichBatch(
  games: Game[],
  updateGame: (id: string, updates: Partial<Game>) => void,
  onProgress?: (done: number, total: number) => void,
  batchSize = 5,
): Promise<number> {
  // Filter to games that need enrichment
  const needsEnrichment = games.filter((g) =>
    !g.enrichedAt || !g.description || !g.moodTags || g.moodTags.length === 0 || !g.hltbMain
  );

  let enriched = 0;
  const total = needsEnrichment.length;

  for (let i = 0; i < total; i++) {
    const game = needsEnrichment[i];

    try {
      const result = await enrichGame(game);
      if (result) {
        updateGame(game.id, result as Partial<Game>);
        enriched++;
      }
    } catch {
      // Skip failures
    }

    onProgress?.(i + 1, total);

    // Rate limit: pause between games, longer pause between batches
    if ((i + 1) % batchSize === 0) {
      await new Promise((r) => setTimeout(r, 1000));
    } else {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return enriched;
}
