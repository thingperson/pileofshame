'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { enrichGame } from '@/lib/enrichGame';
import { Game } from '@/lib/types';

/**
 * Auto-enrichment hook. Watches the game library for unenriched games
 * and processes them in the background after any import or manual add.
 *
 * Mounted once at the page level so it fires regardless of import source.
 */
export function useAutoEnrich() {
  const games = useStore((s) => s.games);
  const updateGame = useStore((s) => s.updateGame);
  const enrichingRef = useRef(false);
  const abortRef = useRef(false);
  const processedRef = useRef(new Set<string>());
  const progressRef = useRef({ done: 0, total: 0, active: false });

  // Expose progress via store so UI can read it
  const setEnrichmentProgress = useCallback((done: number, total: number, active: boolean) => {
    progressRef.current = { done, total, active };
    useStore.setState({
      enrichmentProgress: active ? { done, total } : null,
    });
  }, []);

  // Find games that need enrichment. Gate on enrichedAt alone — NOT on missing
  // description/moodTags/hltbMain. Those fields legitimately stay empty for games
  // RAWG/HLTB can't match; keying off them meant every page load (processedRef
  // resets on reload) re-selected and re-hammered those games forever. One attempt
  // per game, marked by enrichedAt (which persists), then it's left alone.
  const getUnenriched = useCallback((allGames: Game[]): Game[] => {
    return allGames.filter((g) =>
      !processedRef.current.has(g.id) && !g.enrichedAt
    );
  }, []);

  const runEnrichment = useCallback(async (batch: Game[]) => {
    if (enrichingRef.current || batch.length === 0) return;
    enrichingRef.current = true;
    abortRef.current = false;

    // Pause cloud sync for the whole run — each updateGame below bumps lastSaved,
    // and we don't want a full-library upsert per game. One sync fires on release.
    useStore.getState().beginBulkSync();

    const total = batch.length;
    setEnrichmentProgress(0, total, true);

    try {
      for (let i = 0; i < total; i++) {
        if (abortRef.current) break;

        const game = batch[i];
        processedRef.current.add(game.id);

        try {
          const result = await enrichGame(game);
          if (result) {
            updateGame(game.id, result as Partial<Game>);
          } else {
            // Nothing found, but mark as attempted so this game isn't re-selected
            // on the next page load. processedRef resets on reload; enrichedAt persists.
            updateGame(game.id, { enrichedAt: new Date().toISOString() });
          }
        } catch {
          // Skip failures silently — leave enrichedAt unset so a later run can retry.
        }

        setEnrichmentProgress(i + 1, total, true);

        // Rate limit: 300ms between games, 1s pause every 5 games
        if ((i + 1) % 5 === 0) {
          await new Promise((r) => setTimeout(r, 1000));
        } else if (i < total - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    } finally {
      enrichingRef.current = false;
      setEnrichmentProgress(0, 0, false);
      // Release the pause; when the ref-count hits zero CloudSync's effect
      // re-runs to push the final enriched library in a single upsert.
      useStore.getState().endBulkSync();
    }
  }, [updateGame, setEnrichmentProgress]);

  // Watch for new unenriched games
  useEffect(() => {
    // Debounce: wait 2 seconds after games change before starting enrichment.
    // This prevents firing on every individual addGame call during a bulk import.
    const timer = setTimeout(() => {
      const unenriched = getUnenriched(games);
      if (unenriched.length > 0 && !enrichingRef.current) {
        runEnrichment(unenriched);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [games, getUnenriched, runEnrichment]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);
}
