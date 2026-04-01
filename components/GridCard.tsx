'use client';

import { useState, useCallback } from 'react';
import { Game } from '@/lib/types';
import { useStore } from '@/lib/store';
import { STATUS_CONFIG, TIME_TIER_CONFIG } from '@/lib/constants';
import { useToast } from './Toast';
import GameDetailModal from './GameDetailModal';

interface GridCardProps {
  game: Game;
}

export default function GridCard({ game }: GridCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const { cycleStatus, getNextStatus, showCelebration } = useStore();
  const { showToast } = useToast();

  const statusConfig = STATUS_CONFIG[game.status];
  const tierConfig = TIME_TIER_CONFIG[game.timeTier];

  const handleStatusClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (game.status === 'played' || game.status === 'bailed') return;

    // Intercept the transition TO played — show celebration instead
    const next = getNextStatus(game.status);
    if (next === 'played') {
      showCelebration(game);
      return;
    }

    const newStatus = cycleStatus(game.id);
    if (newStatus) {
      const cfg = STATUS_CONFIG[newStatus];
      showToast(`${game.name} → ${cfg.label} ${cfg.icon}`);
    }
  }, [game, cycleStatus, getNextStatus, showToast, showCelebration]);

  return (
    <>
      <div
        className={`relative group rounded-xl border overflow-hidden transition-all duration-150 hover:-translate-y-[1px] cursor-pointer ${game.status === 'playing' ? 'now-playing-glow' : ''}`}
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border-subtle)',
        }}
        role="button"
        tabIndex={0}
        aria-label={`${game.name}. Click for details`}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setDetailOpen(true);
          }
        }}
      >
        {/* Cover Art */}
        <div className="aspect-[16/9] relative bg-bg-primary overflow-hidden">
          {game.coverUrl ? (
            <img
              src={game.coverUrl}
              alt={game.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-faint text-2xl">
              🎮
            </div>
          )}

          {/* Status badge overlay */}
          <button
            onClick={handleStatusClick}
            className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium font-[family-name:var(--font-mono)] backdrop-blur-sm ${
              game.status !== 'played' && game.status !== 'bailed' ? 'hover:scale-105 active:scale-95' : ''
            }`}
            style={{
              backgroundColor: `${statusConfig.bg}cc`,
              color: statusConfig.color,
            }}
          >
            <span>{statusConfig.icon}</span>
            <span>{statusConfig.label}</span>
          </button>

          {/* Time tier */}
          <span
            className="absolute top-2 right-2 text-sm backdrop-blur-sm rounded px-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            title={tierConfig.label}
          >
            {tierConfig.icon}
          </span>

          {/* Metacritic badge */}
          {game.metacritic && (
            <span
              className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold font-[family-name:var(--font-mono)] backdrop-blur-sm"
              style={{
                backgroundColor: game.metacritic >= 75 ? '#22c55e33' : game.metacritic >= 50 ? '#f59e0b33' : '#ef444433',
                color: game.metacritic >= 75 ? '#22c55e' : game.metacritic >= 50 ? '#f59e0b' : '#ef4444',
              }}
            >
              {game.metacritic}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="px-2.5 py-2">
          <p className="text-sm font-semibold text-text-primary truncate">{game.name}</p>
          {game.genres && game.genres.length > 0 && (
            <p className="text-xs text-text-dim truncate mt-0.5">
              {game.genres.slice(0, 2).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Detail modal — full GameCard experience */}
      <GameDetailModal
        game={detailOpen ? game : null}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
