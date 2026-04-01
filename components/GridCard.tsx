'use client';

import { useState, useRef, useCallback } from 'react';
import { Game, GameStatus } from '@/lib/types';
import { useStore } from '@/lib/store';
import { STATUS_CONFIG, TIME_TIER_CONFIG } from '@/lib/constants';
import { useToast } from './Toast';

interface GridCardProps {
  game: Game;
}

export default function GridCard({ game }: GridCardProps) {
  const [showActions, setShowActions] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { cycleStatus, getNextStatus, setBailed } = useStore();
  const { showToast } = useToast();

  const statusConfig = STATUS_CONFIG[game.status];
  const tierConfig = TIME_TIER_CONFIG[game.timeTier];

  const handleStatusClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (game.status === 'played' || game.status === 'bailed') return;
    const newStatus = cycleStatus(game.id);
    if (newStatus) {
      const cfg = STATUS_CONFIG[newStatus];
      showToast(`${game.name} → ${cfg.label} ${cfg.icon}`);
    }
  }, [game.id, game.name, game.status, cycleStatus, showToast]);

  const handleLongPressStart = useCallback(() => {
    if (game.status === 'played') return;
    longPressTimer.current = setTimeout(() => {
      setShowActions(true);
    }, 500);
  }, [game.status]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleBail = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setBailed(game.id);
    setShowActions(false);
    showToast(`${game.name} → Bailed 🚪`);
  }, [game.id, game.name, setBailed, showToast]);

  return (
    <div
      className="relative group rounded-xl border overflow-hidden transition-all duration-150 hover:-translate-y-[1px] cursor-pointer"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border-subtle)',
      }}
      onClick={() => setShowActions(!showActions)}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
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
          className={`absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium font-[family-name:var(--font-mono)] backdrop-blur-sm ${
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
        <p className="text-xs font-medium text-text-primary truncate">{game.name}</p>
        {game.genres && game.genres.length > 0 && (
          <p className="text-[10px] text-text-dim truncate mt-0.5">
            {game.genres.slice(0, 2).join(', ')}
          </p>
        )}
      </div>

      {/* Quick actions overlay */}
      {showActions && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 backdrop-blur-sm rounded-xl"
          style={{ backgroundColor: 'rgba(10,10,15,0.85)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {game.status !== 'played' && game.status !== 'bailed' && (
            <button
              onClick={handleStatusClick}
              className="px-4 py-1.5 text-xs font-medium rounded-lg"
              style={{
                backgroundColor: STATUS_CONFIG[getNextStatus(game.status) || game.status].bg,
                color: STATUS_CONFIG[getNextStatus(game.status) || game.status].color,
              }}
            >
              → {STATUS_CONFIG[getNextStatus(game.status) || game.status].label}
            </button>
          )}
          {game.status !== 'played' && (
            <button
              onClick={handleBail}
              className="px-4 py-1.5 text-xs font-medium rounded-lg"
              style={{ backgroundColor: STATUS_CONFIG.bailed.bg, color: STATUS_CONFIG.bailed.color }}
            >
              🚪 Bail
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
            className="px-4 py-1.5 text-xs text-text-dim hover:text-text-muted"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
