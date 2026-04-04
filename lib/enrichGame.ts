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
  isNonFinishable?: boolean;
  enrichedAt: string;
}

/**
 * Normalize a game name for API lookups.
 * Strips edition suffixes, parenthetical info, and trademark symbols.
 */
function normalizeGameName(name: string): string {
  return name
    // Remove trademark/registered symbols
    .replace(/[™®©]/g, '')
    // Remove edition suffixes (Deluxe, GOTY, Remastered, etc.)
    .replace(/\s*[-–:]\s*(definitive|complete|goty|game of the year|remastered|remaster|deluxe|ultimate|enhanced|special|legendary|premium|gold|collector'?s?|anniversary|director'?s?\s*cut|standard)\s*(edition|version|cut)?$/i, '')
    // Remove parenthetical info like (2020), (PC), (Early Access)
    .replace(/\s*\([^)]*\)\s*$/g, '')
    // Remove trailing "- " fragments (e.g., "Game - DLC Name" → "Game")
    // Only if the part after the dash looks like an edition/platform tag
    .replace(/\s*-\s*(pc|xbox|playstation|ps[45]|switch|mac|linux|windows)$/i, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a RAWG/HLTB result name is a reasonable match for our game.
 * Returns a confidence score 0-1.
 */
function matchConfidence(searchName: string, resultName: string): number {
  const a = searchName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const b = resultName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  // Exact match after normalization
  if (a === b) return 1;

  // One contains the other
  if (a.includes(b) || b.includes(a)) return 0.85;

  // Check word overlap (Jaccard similarity on words)
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  const jaccard = union > 0 ? intersection / union : 0;

  return jaccard;
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
        // Search by normalized name for better matches
        const cleanName = normalizeGameName(game.name);
        const res = await fetch(`/api/rawg?search=${encodeURIComponent(cleanName)}`);
        if (res.ok) {
          const data = await res.json();
          // Pick the best match by name similarity, not just the first result
          const results = data.results || [];
          if (results.length > 0) {
            let bestMatch = results[0];
            let bestScore = matchConfidence(cleanName, results[0].name || '');
            for (let i = 1; i < results.length; i++) {
              const score = matchConfidence(cleanName, results[i].name || '');
              if (score > bestScore) {
                bestScore = score;
                bestMatch = results[i];
              }
            }
            // Only use result if it's a reasonable match (> 0.4 Jaccard)
            if (bestScore >= 0.4) {
              rawgData = bestMatch;
            }
          }
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
      const cleanName = normalizeGameName(game.name);
      const res = await fetch(`/api/hltb?title=${encodeURIComponent(cleanName)}`);
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

  // Step 4: Auto-detect non-finishable games
  if (game.isNonFinishable === undefined) {
    const nonFinishableGenres = ['massively multiplayer', 'mmo', 'mmorpg', 'battle royale'];
    const likelyNonFinishable = ['sandbox', 'simulation'];
    const allGenres = (result.genres || game.genres || []).map(g => g.toLowerCase());

    const hasNonFinishableGenre = allGenres.some(g => nonFinishableGenres.some(nf => g.includes(nf)));
    const hasSandboxOnly = allGenres.some(g => likelyNonFinishable.some(nf => g.includes(nf)))
      && !allGenres.some(g => g.includes('adventure') || g.includes('rpg'));
    const noStoryTime = !result.hltbMain && !game.hltbMain;
    const isMultiplayerOnly = noStoryTime && allGenres.some(g =>
      g.includes('shooter') || g.includes('sports') || g.includes('racing') || g.includes('fighting')
    );

    if (hasNonFinishableGenre || hasSandboxOnly || isMultiplayerOnly) {
      result.isNonFinishable = true;
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
