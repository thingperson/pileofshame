'use client';

import { useState, useRef, useCallback } from 'react';
import { Game, GameStatus, TimeTier } from '@/lib/types';
import { useStore } from '@/lib/store';
import { STATUS_CONFIG, STATUS_CYCLE, TIME_TIER_CONFIG, SOURCE_LABELS, SOURCE_ICONS, DEFAULT_VIBES, DEFAULT_CATEGORIES, getVibeColor } from '@/lib/constants';
import { useToast } from './Toast';
import DealBadge from './DealBadge';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [ghostStatus, setGhostStatus] = useState<GameStatus | null>(null);
  const [showBailConfirm, setShowBailConfirm] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { cycleStatus, getNextStatus, setBailed, unBail, playAgain, newGamePlus, updateGame } = useStore();
  const { showToast } = useToast();
  const categories = useStore((s) => s.categories);

  const statusConfig = STATUS_CONFIG[game.status];
  const nextStatus = getNextStatus(game.status);
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
      setShowBailConfirm(true);
    }, 500);
  }, [game.status]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleBail = useCallback(() => {
    setBailed(game.id);
    setShowBailConfirm(false);
    showToast(`${game.name} → Bailed 🚪`);
  }, [game.id, game.name, setBailed, showToast]);

  const handlePlayAgain = useCallback(() => {
    playAgain(game.id);
    showToast(`Back for more? Let's go.`);
  }, [game.id, playAgain, showToast]);

  const handleNewGamePlus = useCallback(() => {
    newGamePlus(game.id);
    showToast(`${game.name} → New Game+ 🎯`);
  }, [game.id, game.name, newGamePlus, showToast]);

  const handleUnBail = useCallback(() => {
    unBail(game.id);
    showToast(`${game.name} → back in the pile 💀`);
  }, [game.id, game.name, unBail, showToast]);

  return (
    <div
      className="group relative rounded-xl border transition-all duration-150 hover:-translate-y-[1px]"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: expanded ? 'var(--color-border-active)' : 'var(--color-border-subtle)',
        borderLeftWidth: '3px',
        borderLeftColor: statusConfig.color,
      }}
    >
      {/* Compact View */}
      <div
        className="flex items-center gap-3 px-3.5 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status Badge */}
        <button
          onClick={handleStatusClick}
          onMouseEnter={() => nextStatus && setGhostStatus(nextStatus)}
          onMouseLeave={() => setGhostStatus(null)}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          className={`
            relative flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
            font-[family-name:var(--font-mono)] transition-transform duration-150
            ${game.status !== 'played' && game.status !== 'bailed' ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default'}
          `}
          style={{
            backgroundColor: statusConfig.bg,
            color: statusConfig.color,
          }}
          title={game.status === 'played' ? 'Played — expand card for options' : undefined}
        >
          <span>{statusConfig.icon}</span>
          <span>{statusConfig.label}</span>
          {/* Ghost preview */}
          {ghostStatus && game.status !== 'played' && game.status !== 'bailed' && (
            <span
              className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium opacity-0 animate-[fadeIn_200ms_200ms_forwards]"
              style={{
                backgroundColor: STATUS_CONFIG[ghostStatus].bg,
                color: STATUS_CONFIG[ghostStatus].color,
              }}
            >
              <span>{STATUS_CONFIG[ghostStatus].icon}</span>
              <span>{STATUS_CONFIG[ghostStatus].label}</span>
            </span>
          )}
        </button>

        {/* Game Name */}
        <span className="flex-1 text-sm font-medium text-text-primary truncate">
          {game.isWishlisted && <span className="text-yellow-400 mr-1" title="Wishlisted">⭐</span>}
          {game.name}
        </span>

        {/* Time Tier + Source Icons */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-sm" title={tierConfig.label}>
            {tierConfig.icon}
          </span>
          <span className="text-xs text-text-faint" title={SOURCE_LABELS[game.source]}>
            {SOURCE_ICONS[game.source]}
          </span>
        </div>

        {/* Expand indicator */}
        <svg
          className={`w-4 h-4 text-text-dim transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Bail Confirmation */}
      {showBailConfirm && (
        <div className="px-3.5 py-2 border-t flex items-center gap-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <span className="text-xs text-text-muted">Bail on this one?</span>
          <button
            onClick={handleBail}
            className="px-2 py-0.5 text-xs rounded-md font-medium"
            style={{ backgroundColor: STATUS_CONFIG.bailed.bg, color: STATUS_CONFIG.bailed.color }}
          >
            🚪 Bail
          </button>
          <button
            onClick={() => setShowBailConfirm(false)}
            className="px-2 py-0.5 text-xs rounded-md text-text-dim hover:text-text-muted"
          >
            Nah
          </button>
        </div>
      )}

      {/* Expanded View */}
      {expanded && (
        <div className="px-3.5 pb-3.5 border-t space-y-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
          {/* Cover Art + Vibes row */}
          <div className="flex gap-3 pt-3">
            {game.coverUrl && (
              <img
                src={game.coverUrl}
                alt=""
                className="w-24 h-14 rounded-lg object-cover shrink-0 bg-bg-primary"
              />
            )}
            <div className="flex-1 space-y-2">
              {/* Vibe Tags */}
              {game.vibes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {game.vibes.map((vibe) => (
                    <span
                      key={vibe}
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium font-[family-name:var(--font-mono)]"
                      style={{
                        backgroundColor: `${getVibeColor(vibe)}15`,
                        color: getVibeColor(vibe),
                        border: `1px solid ${getVibeColor(vibe)}30`,
                      }}
                    >
                      {vibe}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-dim font-[family-name:var(--font-mono)]">
                {game.hoursPlayed > 0 && (
                  <span className="text-text-muted">{game.hoursPlayed} hrs</span>
                )}
                <span>{SOURCE_LABELS[game.source]}</span>
                <span>{tierConfig.icon} {tierConfig.label}</span>
                {game.metacritic && <span>Metacritic: {game.metacritic}</span>}
                {game.genres && game.genres.length > 0 && (
                  <span>{game.genres.slice(0, 3).join(', ')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {game.notes && (
            <p className="text-xs text-text-muted leading-relaxed">{game.notes}</p>
          )}

          {/* Inline Edit Section */}
          <div className="space-y-2 pt-1">
            {/* Edit Notes */}
            <textarea
              value={game.notes}
              onChange={(e) => updateGame(game.id, { notes: e.target.value })}
              placeholder="Add notes..."
              className="w-full text-xs bg-bg-primary border border-border-subtle rounded-lg px-3 py-2 text-text-secondary placeholder-text-faint resize-none focus:outline-none focus:border-accent-purple"
              rows={2}
            />

            {/* Edit Vibes */}
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_VIBES.map((vibe) => (
                <button
                  key={vibe}
                  onClick={() => {
                    const newVibes = game.vibes.includes(vibe)
                      ? game.vibes.filter((v) => v !== vibe)
                      : [...game.vibes, vibe];
                    updateGame(game.id, { vibes: newVibes });
                  }}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium font-[family-name:var(--font-mono)] transition-opacity ${
                    game.vibes.includes(vibe) ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                  }`}
                  style={{
                    backgroundColor: `${getVibeColor(vibe)}15`,
                    color: getVibeColor(vibe),
                    border: `1px solid ${getVibeColor(vibe)}30`,
                  }}
                >
                  {vibe}
                </button>
              ))}
            </div>

            {/* Edit Category & Time Tier */}
            <div className="flex gap-2">
              <select
                value={game.category}
                onChange={(e) => updateGame(game.id, { category: e.target.value })}
                className="flex-1 text-xs bg-bg-primary border border-border-subtle rounded-lg px-2 py-1.5 text-text-secondary focus:outline-none focus:border-accent-purple"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={() =>
                  updateGame(game.id, {
                    timeTier: game.timeTier === 'wind-down' ? 'deep-cut' : 'wind-down',
                  })
                }
                className="px-3 py-1.5 text-xs rounded-lg border font-[family-name:var(--font-mono)]"
                style={{
                  borderColor: 'var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {TIME_TIER_CONFIG[game.timeTier].icon} {TIME_TIER_CONFIG[game.timeTier].label}
              </button>
            </div>
          </div>

          {/* Deals */}
          <DealBadge gameName={game.name} />

          {/* Launch button for Steam games */}
          {game.steamAppId && (
            <a
              href={`steam://run/${game.steamAppId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-bold rounded-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                color: 'white',
              }}
            >
              🚀 Launch in Steam
            </a>
          )}

          {/* Status-specific actions */}
          {game.status === 'played' && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={handlePlayAgain}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: STATUS_CONFIG.playing.bg,
                  color: STATUS_CONFIG.playing.color,
                }}
              >
                🔥 Play Again
              </button>
              <button
                onClick={handleNewGamePlus}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: STATUS_CONFIG['on-deck'].bg,
                  color: STATUS_CONFIG['on-deck'].color,
                }}
              >
                🎯 New Game +
              </button>
            </div>
          )}

          {game.status === 'bailed' && (
            <button
              onClick={handleUnBail}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: STATUS_CONFIG.buried.bg,
                color: STATUS_CONFIG.buried.color,
              }}
            >
              Give it another shot?
            </button>
          )}
        </div>
      )}
    </div>
  );
}
