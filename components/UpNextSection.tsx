'use client';

import { useMemo, useCallback, useRef } from 'react';
import { Game } from '@/lib/types';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';
import GameCard from './GameCard';

interface UpNextSectionProps {
  games: Game[];
}

/**
 * Pick a good suggestion from the backlog.
 * Prioritizes: enriched > well-reviewed > shorter > recently added.
 */
function pickSuggestion(games: Game[]): Game | null {
  const candidates = games.filter(
    (g) => g.status === 'buried' && g.name
  );

  if (candidates.length === 0) return null;

  // Score each candidate
  const scored = candidates.map((g) => {
    let score = 0;

    // Enriched games are better suggestions (we can show why)
    if (g.description) score += 3;
    if (g.moodTags && g.moodTags.length > 0) score += 2;

    // Well-reviewed games are easier to commit to
    if (g.metacritic && g.metacritic >= 85) score += 4;
    else if (g.metacritic && g.metacritic >= 75) score += 2;

    // Shorter games are less intimidating for a first pick
    if (g.hltbMain && g.hltbMain <= 15) score += 3;
    else if (g.hltbMain && g.hltbMain <= 30) score += 1;

    // Has cover art (looks better in the suggestion)
    if (g.coverUrl) score += 1;

    return { game: g, score };
  });

  // Sort by score descending, then add some randomness among top picks
  scored.sort((a, b) => b.score - a.score);

  // Pick randomly from the top 5 to keep it fresh
  const topN = Math.min(5, scored.length);
  const idx = Math.floor(Math.random() * topN);
  return scored[idx].game;
}

export default function UpNextSection({ games }: UpNextSectionProps) {
  const upNextGames = useMemo(() => {
    return games
      .filter((g) => g.status === 'on-deck')
      .sort((a, b) => a.priority - b.priority);
  }, [games]);

  const nowPlayingGames = useMemo(() => {
    return games.filter((g) => g.status === 'playing');
  }, [games]);

  const updateGame = useStore((s) => s.updateGame);
  const { showToast } = useToast();

  // Suggest a game when queue is empty — stabilize so it doesn't flicker during enrichment
  const suggestionRef = useRef<Game | null>(null);
  const suggestion = useMemo(() => {
    if (upNextGames.length > 0) {
      suggestionRef.current = null;
      return null;
    }
    // If we already have a valid suggestion and that game still exists in the library, keep it
    if (suggestionRef.current && games.some(g => g.id === suggestionRef.current!.id && g.status === 'buried')) {
      return suggestionRef.current;
    }
    const pick = pickSuggestion(games);
    suggestionRef.current = pick;
    return pick;
  }, [games, upNextGames.length]);

  const handleAddSuggestion = useCallback(() => {
    if (!suggestion) return;
    updateGame(suggestion.id, { status: 'on-deck' });
    showToast(`${suggestion.name} → Play Next 🎯`);
  }, [suggestion, updateGame, showToast]);

  // Don't show if nothing relevant and user has < 3 games total
  if (games.length < 3 && upNextGames.length === 0 && nowPlayingGames.length === 0) return null;

  return (
    <div className="mb-7">
      {/* Now Playing */}
      {nowPlayingGames.length > 0 && (
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary tracking-tight mb-2.5">
            <span className="text-lg">🔥</span> Now Playing
            <span className="text-sm text-text-muted font-[family-name:var(--font-mono)]">
              {nowPlayingGames.length}
            </span>
          </h2>
          <div className="space-y-1.5">
            {nowPlayingGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Play Next Queue */}
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-secondary tracking-wide mb-2">
          <span className="text-lg">📋</span> Play Next
          {upNextGames.length > 0 && (
            <span className="text-sm text-text-muted font-[family-name:var(--font-mono)]">
              {upNextGames.length}
            </span>
          )}
        </h2>

        {upNextGames.length > 0 ? (
          <div className="space-y-1.5">
            {upNextGames.map((game, i) => (
              <GameCard key={game.id} game={game} upNextIndex={i + 1} />
            ))}
          </div>
        ) : suggestion ? (
          /* Smart suggestion when queue is empty */
          <div
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: 'rgba(167, 139, 250, 0.25)',
              backgroundColor: 'rgba(167, 139, 250, 0.04)',
            }}
          >
            <div className="flex items-start gap-3 px-4 py-3">
              {suggestion.coverUrl && (
                <img
                  src={suggestion.coverUrl}
                  alt=""
                  className="w-16 h-10 rounded object-cover shrink-0 mt-0.5"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-dim font-[family-name:var(--font-mono)] mb-1">
                  We picked one for you
                </p>
                <p className="text-sm font-semibold text-text-primary truncate">
                  {suggestion.name}
                </p>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                  {suggestion.description
                    || (suggestion.metacritic && suggestion.metacritic >= 75
                      ? `Metacritic ${suggestion.metacritic}. Highly rated.`
                      : suggestion.genres?.slice(0, 2).join(', ')
                    )
                    || 'Sitting in your pile. Why not this one?'
                  }
                </p>
                {(suggestion.hltbMain || suggestion.metacritic) && (
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] font-[family-name:var(--font-mono)] text-text-dim">
                    {suggestion.hltbMain && (
                      <span>🕐 ~{suggestion.hltbMain}h</span>
                    )}
                    {suggestion.metacritic && (
                      <span style={{
                        color: suggestion.metacritic >= 75 ? '#22c55e' : suggestion.metacritic >= 50 ? '#f59e0b' : '#ef4444',
                      }}>
                        {suggestion.metacritic} metacritic
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="px-4 pb-3 flex gap-2">
              <button
                onClick={handleAddSuggestion}
                className="flex-1 px-3 py-2 text-sm font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.97]"
                style={{
                  backgroundColor: 'var(--color-accent-purple)',
                  color: '#0a0a0f',
                }}
              >
                🎯 Add to Play Next
              </button>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed"
            style={{
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'rgba(167, 139, 250, 0.03)',
            }}
          >
            <span className="text-text-faint text-lg">📋</span>
            <div className="flex-1">
              <p className="text-sm text-text-muted">
                No games queued up yet.
              </p>
              <p className="text-xs text-text-faint mt-0.5">
                Tap a game&apos;s status badge to move it to <span className="text-accent-purple font-medium">Play Next</span>. Your personal play order.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
