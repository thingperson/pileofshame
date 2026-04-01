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

  // Find games that need enrichment
  const getUnenriched = useCallback((allGames: Game[]): Game[] => {
    return allGames.filter((g) =>
      !processedRef.current.has(g.id) && (
        !g.enrichedAt ||
        !g.description ||
        !g.moodTags || g.moodTags.length === 0 ||
        !g.hltbMain
      )
    );
  }, []);

  const runEnrichment = useCallback(async (batch: Game[]) => {
    if (enrichingRef.current || batch.length === 0) return;
    enrichingRef.current = true;
    abortRef.current = false;

    const total = batch.length;
    setEnrichmentProgress(0, total, true);

    for (let i = 0; i < total; i++) {
      if (abortRef.current) break;

      const game = batch[i];
      processedRef.current.add(game.id);

      try {
        const result = await enrichGame(game);
        if (result) {
          updateGame(game.id, result as Partial<Game>);
        }
      } catch {
        // Skip failures silently
      }

      setEnrichmentProgress(i + 1, total, true);

      // Rate limit: 300ms between games, 1s pause every 5 games
      if ((i + 1) % 5 === 0) {
        await new Promise((r) => setTimeout(r, 1000));
      } else if (i < total - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    enrichingRef.current = false;
    setEnrichmentProgress(0, 0, false);
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
