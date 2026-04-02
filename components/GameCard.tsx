'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Game, GameStatus, TimeTier } from '@/lib/types';
import { useStore } from '@/lib/store';
import { STATUS_CONFIG, TIME_TIER_CONFIG, SOURCE_LABELS, SOURCE_ICONS } from '@/lib/constants';
import { useToast } from './Toast';
import DealBadge from './DealBadge';
import { getGameDescriptor } from '@/lib/descriptors';
import { MOOD_TAG_CONFIG, getPlaytimeRoast } from '@/lib/enrichment';

interface GameCardProps {
  game: Game;
  upNextIndex?: number; // 1-based index for Play Next games
  forceExpanded?: boolean; // Used by GameDetailModal to render expanded without click
}

export default function GameCard({ game, upNextIndex, forceExpanded }: GameCardProps) {
  const [expanded, setExpanded] = useState(forceExpanded ?? false);
  const [ghostStatus, setGhostStatus] = useState<GameStatus | null>(null);
  const [showBailConfirm, setShowBailConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { cycleStatus, getNextStatus, setBailed, unBail, shelveGame, playAgain, newGamePlus, updateGame, deleteGame, showCelebration } = useStore();
  const { showToast } = useToast();
  const categories = useStore((s) => s.categories);

  const statusConfig = STATUS_CONFIG[game.status];
  const nextStatus = getNextStatus(game.status);
  const tierConfig = TIME_TIER_CONFIG[game.timeTier];

  // Status badge discoverability: show hint until user has tapped one
  const [showBadgeHint, setShowBadgeHint] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasTapped = localStorage.getItem('pos-status-tapped');
    if (!hasTapped && nextStatus) {
      setShowBadgeHint(true);
    }
  }, [nextStatus]);
  const descriptor = getGameDescriptor(game.name, game.metacritic, game.genres);

  const handleStatusClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (game.status === 'played' || game.status === 'bailed') return;

    // Mark badge as discovered
    if (showBadgeHint) {
      localStorage.setItem('pos-status-tapped', '1');
      setShowBadgeHint(false);
    }

    // Intercept the transition TO played — show celebration instead
    const next = getNextStatus(game.status);
    if (next === 'played') {
      showCelebration(game);
      return;
    }

    const newStatus = cycleStatus(game.id);
    if (newStatus) {
      const cfg = STATUS_CONFIG[newStatus];
      // First-time Play Next celebration
      if (newStatus === 'on-deck' && !localStorage.getItem('pos-first-playnext')) {
        localStorage.setItem('pos-first-playnext', '1');
        showToast(`${game.name} → Play Next 🎯 Nice. You just committed. That's the hard part.`);
      } else {
        showToast(`${game.name} → ${cfg.label} ${cfg.icon}`);
      }
    }
  }, [game.id, game.name, game.status, cycleStatus, getNextStatus, showToast, showBadgeHint]);

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

  const canBail = game.status !== 'played' && game.status !== 'bailed';

  const bailAffirmations = [
    'You drew a line. That takes guts.',
    'Knowing when to walk away is a superpower.',
    'One less thing weighing on you. Nice.',
    'Boundaries set. Pile shrunk. Progress.',
    'That decision? Already worth more than 10 more hours sunk.',
  ];

  const handleBail = useCallback(() => {
    setBailed(game.id);
    setShowBailConfirm(false);
    const affirmation = bailAffirmations[Math.floor(Math.random() * bailAffirmations.length)];
    showToast(`${game.name} → Done ✊ ${affirmation}`);
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
    showToast(`${game.name} → back in the backlog 📚`);
  }, [game.id, game.name, unBail, showToast]);

  const handleShelve = useCallback(() => {
    shelveGame(game.id);
    showToast(`${game.name} → returned to The Pile 📚`);
  }, [game.id, game.name, shelveGame, showToast]);

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-150 hover:-translate-y-[1px] ${game.status === 'playing' ? 'now-playing-glow' : ''}`}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: expanded ? 'var(--color-border-active)' : 'var(--color-border-subtle)',
        borderLeftWidth: '3px',
        borderLeftColor: statusConfig.color,
      }}
    >
      {/* Compact View */}
      <div
        className={`flex items-center gap-3 px-3.5 py-3 select-none ${forceExpanded ? '' : 'cursor-pointer'}`}
        role={forceExpanded ? undefined : 'button'}
        tabIndex={forceExpanded ? undefined : 0}
        aria-expanded={forceExpanded ? undefined : expanded}
        onClick={forceExpanded ? undefined : () => setExpanded(!expanded)}
        onKeyDown={forceExpanded ? undefined : (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        {/* Status Badge */}
        <div className="relative flex items-center">
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
              font-[family-name:var(--font-mono)] transition-all duration-150
              ${game.status !== 'played' && game.status !== 'bailed'
                ? 'hover:ring-1 hover:ring-white/20 hover:brightness-110 active:scale-95 cursor-pointer'
                : 'cursor-default'}
              ${showBadgeHint ? 'animate-[pulse_2s_ease-in-out_3]' : ''}
            `}
            style={{
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
            }}
            aria-label={`Status: ${statusConfig.label}${nextStatus ? `. Tap to move to ${STATUS_CONFIG[nextStatus].label}` : ''}`}
            title={
              game.status === 'played'
                ? 'Played. Expand card for options'
                : game.status === 'bailed'
                ? 'You drew the line. Expand card to reconsider'
                : nextStatus
                ? `Tap to move → ${STATUS_CONFIG[nextStatus].label}`
                : undefined
            }
          >
            <span className="emoji-icon">{statusConfig.icon}</span>
            <span className="ascii-icon hidden">{statusConfig.asciiIcon}</span>
            <span className="hidden sm:inline">{statusConfig.label}</span>
            {/* Chevron hint — shows this badge is tappable */}
            {nextStatus && (
              <span className="text-[10px] opacity-50 ml-0.5 hidden sm:inline">›</span>
            )}
          </button>
          {/* First-time hint — visible until user taps a status badge */}
          {showBadgeHint && nextStatus && (
            <span className="text-[10px] text-text-faint font-[family-name:var(--font-mono)] ml-1.5 animate-[fadeIn_500ms_ease-out] whitespace-nowrap">
              tap to advance →
            </span>
          )}
          {/* Hover hint — shows what tapping does */}
          {ghostStatus && game.status !== 'played' && game.status !== 'bailed' && (
            <span
              className="absolute left-full ml-1.5 whitespace-nowrap flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium font-[family-name:var(--font-mono)] opacity-0 animate-[fadeIn_150ms_100ms_forwards] pointer-events-none z-10"
              style={{
                backgroundColor: STATUS_CONFIG[ghostStatus].bg,
                color: STATUS_CONFIG[ghostStatus].color,
              }}
            >
              → {STATUS_CONFIG[ghostStatus].label}
            </span>
          )}
        </div>

        {/* Game Name */}
        <span className="flex-1 text-base font-semibold text-text-primary truncate">
          {upNextIndex && (
            <span className="text-accent-purple font-bold font-[family-name:var(--font-mono)] mr-1.5 text-sm">
              {upNextIndex}.
            </span>
          )}
          {game.isWishlisted && <span className="text-yellow-400 mr-1" title="Wishlisted">⭐</span>}
          {game.name}
        </span>

        {/* Achievement mini + Time Tier + Source Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {game.achievements && game.achievements.total > 0 && (
            <span
              className="text-[10px] font-bold font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded"
              title={`${game.achievements.earned}/${game.achievements.total}${game.achievements.earnedPlatinum ? ' 🏆' : ''}`}
              style={{
                backgroundColor: game.achievements.earned === game.achievements.total
                  ? 'rgba(34,197,94,0.15)' : 'rgba(167,139,250,0.12)',
                color: game.achievements.earned === game.achievements.total
                  ? '#22c55e' : '#a78bfa',
              }}
            >
              {game.achievements.earnedPlatinum ? '🏆' : `${Math.round((game.achievements.earned / game.achievements.total) * 100)}%`}
            </span>
          )}
          <span className="text-sm" title={tierConfig.label}>
            {tierConfig.icon}
          </span>
          <span className="text-xs text-text-faint" title={SOURCE_LABELS[game.source]}>
            {SOURCE_ICONS[game.source]}
          </span>
        </div>

        {/* Expand indicator — hidden when forced open in modal */}
        {!forceExpanded && (
          <svg
            aria-hidden="true"
            className={`w-4 h-4 text-text-dim transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {/* Bail Confirmation — inline strip */}
      {showBailConfirm && !expanded && (
        <div className="px-3.5 py-2 border-t flex items-center gap-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <span className="text-xs text-text-muted">Drawing the line?</span>
          <button
            onClick={handleBail}
            className="px-2 py-0.5 text-xs rounded-md font-medium"
            style={{ backgroundColor: STATUS_CONFIG.bailed.bg, color: STATUS_CONFIG.bailed.color }}
          >
            ✊ Done
          </button>
          <button
            onClick={() => setShowBailConfirm(false)}
            className="px-2 py-0.5 text-xs rounded-md text-text-dim hover:text-text-muted"
          >
            Maybe later
          </button>
        </div>
      )}

      {/* Expanded View */}
      {expanded && (
        <div className="px-3.5 pb-3.5 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          {/* Row 1: Cover + Info Grid */}
          <div className="flex gap-3 pt-3">
            {game.coverUrl && (
              <img
                src={game.coverUrl}
                alt=""
                className="w-20 h-28 rounded-lg object-cover shrink-0 bg-bg-primary"
              />
            )}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Quick stats row */}
              <div className="flex flex-wrap items-center gap-2 text-sm font-[family-name:var(--font-mono)]">
                {game.hoursPlayed > 0 && (
                  <span className="text-text-primary font-semibold">{game.hoursPlayed}h played</span>
                )}
                <span className="text-text-muted">{SOURCE_LABELS[game.source]}</span>
                {game.metacritic && (
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-bold"
                    style={{
                      backgroundColor: game.metacritic >= 75 ? 'rgba(34,197,94,0.15)' : game.metacritic >= 50 ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                      color: game.metacritic >= 75 ? '#22c55e' : game.metacritic >= 50 ? '#eab308' : '#ef4444',
                    }}
                  >
                    {game.metacritic}
                  </span>
                )}
              </div>

              {/* Achievement / Trophy Progress */}
              {game.achievements && game.achievements.total > 0 && (() => {
                const pct = Math.round((game.achievements.earned / game.achievements.total) * 100);
                const isComplete = game.achievements.earned === game.achievements.total;
                return (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${game.source === 'playstation' ? 'Trophy' : 'Achievement'} progress: ${pct}%`} style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: isComplete ? '#22c55e' : '#a78bfa',
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-bold font-[family-name:var(--font-mono)] shrink-0" style={{ color: isComplete ? '#22c55e' : '#a78bfa' }}>
                        {game.achievements.earned}/{game.achievements.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-text-dim font-[family-name:var(--font-mono)]">
                      <span>
                        {game.source === 'playstation' ? '🏆 Trophies' : '🏆 Achievements'}
                      </span>
                      {game.achievements.earnedPlatinum && (
                        <span className="text-yellow-400 font-bold">Platinum earned!</span>
                      )}
                      {game.achievements.gamerscore !== undefined && game.achievements.gamerscore > 0 && (
                        <span>{game.achievements.gamerscore}/{game.achievements.totalGamerscore} G</span>
                      )}
                      {isComplete && !game.achievements.earnedPlatinum && (
                        <span className="text-green-400 font-bold">100% complete!</span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Genres */}
              {game.genres && game.genres.length > 0 && (
                <div className="text-xs text-text-dim font-[family-name:var(--font-mono)]">
                  {game.genres.slice(0, 3).join(' · ')}
                </div>
              )}

              {/* Synopsis — from RAWG */}
              {game.description && (
                <p className="text-xs text-text-muted leading-relaxed">
                  {game.description}
                </p>
              )}

              {/* Descriptor — opinionated one-liner */}
              {descriptor && (
                <div
                  className="text-sm leading-relaxed italic"
                  style={{
                    color: descriptor.confidence === 'curated' ? '#a78bfa'
                      : descriptor.confidence === 'scored' ? 'var(--color-text-muted)'
                      : 'var(--color-text-dim)',
                  }}
                >
                  &ldquo;{descriptor.line}&rdquo;
                </div>
              )}

              {/* HLTB + Mood Tags row */}
              {(game.hltbMain || (game.moodTags && game.moodTags.length > 0)) && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {game.hltbMain && (
                    <span className="text-[11px] font-[family-name:var(--font-mono)] text-text-dim px-1.5 py-0.5 rounded bg-bg-primary border border-border-subtle">
                      🕐 ~{game.hltbMain}h to beat
                    </span>
                  )}
                  {game.moodTags?.map((mood) => {
                    const config = MOOD_TAG_CONFIG[mood];
                    return config ? (
                      <span
                        key={mood}
                        className="text-[11px] font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${config.color}15`,
                          color: config.color,
                          border: `1px solid ${config.color}25`,
                        }}
                      >
                        {config.icon} {config.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Playtime insight */}
              {game.hoursPlayed > 0 && (() => {
                const insight = getPlaytimeRoast(game.name, game.hoursPlayed);
                return insight ? (
                  <p className="text-[11px] text-amber-300/70 italic font-[family-name:var(--font-mono)]">
                    {insight}
                  </p>
                ) : null;
              })()}

              {/* Notes — single editable field, auto-saves */}
              <div className="relative">
                <textarea
                  value={game.notes}
                  onChange={(e) => {
                    updateGame(game.id, { notes: e.target.value });
                    setNotesSaved(true);
                    setTimeout(() => setNotesSaved(false), 2000);
                  }}
                  placeholder="Add notes..."
                  aria-label="Game notes"
                  className="w-full text-sm bg-bg-primary border border-border-subtle rounded-lg px-3 py-2 text-text-secondary placeholder-text-faint resize-none focus:outline-none focus:border-accent-purple"
                  rows={2}
                />
                {notesSaved && (
                  <span className="absolute right-2 bottom-2 text-[10px] text-green-400/70 font-[family-name:var(--font-mono)] animate-[fadeIn_150ms_ease-out]">
                    saved ✓
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Category, Time Tier, Launch — all inline */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 min-w-0">
              <label htmlFor={`shelf-${game.id}`} className="block text-[10px] text-text-faint font-[family-name:var(--font-mono)] mb-0.5 ml-1">Shelf</label>
              <select
                id={`shelf-${game.id}`}
                value={game.category}
                onChange={(e) => updateGame(game.id, { category: e.target.value })}
                className="w-full text-sm bg-bg-primary border border-border-subtle rounded-lg px-2.5 py-2 text-text-secondary focus:outline-none focus:border-accent-purple"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="shrink-0">
              <label htmlFor={`session-${game.id}`} className="block text-[10px] text-text-faint font-[family-name:var(--font-mono)] mb-0.5 ml-1">Session</label>
              <select
                id={`session-${game.id}`}
                value={game.timeTier}
                onChange={(e) => updateGame(game.id, { timeTier: e.target.value as TimeTier })}
                className="text-sm bg-bg-primary border border-border-subtle rounded-lg px-2.5 py-2 text-text-secondary font-[family-name:var(--font-mono)] focus:outline-none focus:border-accent-purple"
              >
                {(Object.entries(TIME_TIER_CONFIG) as [TimeTier, typeof TIME_TIER_CONFIG[TimeTier]][]).map(
                  ([tier, config]) => (
                    <option key={tier} value={tier}>{config.icon} {config.label}</option>
                  )
                )}
              </select>
            </div>
            {game.steamAppId && (
              <a
                href={`steam://run/${game.steamAppId}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'rgba(124, 58, 237, 0.15)',
                  color: '#a78bfa',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                }}
              >
                🚀 Launch
              </a>
            )}
          </div>

          {/* Row 4: Deals */}
          <div className="mt-2">
            <DealBadge gameName={game.name} />
          </div>

          {/* Row 5: Status-specific actions + bail + delete */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
            {game.status === 'played' && (
              <>
                <button
                  onClick={handlePlayAgain}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                  }}
                >
                  🔥 Replay?
                </button>
                <button
                  onClick={handleNewGamePlus}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  🎯 DLC / New Game+?
                </button>
              </>
            )}

            {(game.status === 'playing' || game.status === 'on-deck') && (
              <button
                onClick={handleShelve}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                style={{
                  backgroundColor: STATUS_CONFIG.buried.bg,
                  color: STATUS_CONFIG.buried.color,
                  border: `1px solid ${STATUS_CONFIG.buried.color}40`,
                }}
              >
                📚 Return to The Pile
              </button>
            )}

            {game.status === 'bailed' && (
              <button
                onClick={handleUnBail}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: STATUS_CONFIG.buried.bg,
                  color: STATUS_CONFIG.buried.color,
                }}
              >
                Give it another shot?
              </button>
            )}

            {/* Bail / Eject — visible button for non-played, non-bailed games */}
            {canBail && !showBailConfirm && (
              <button
                onClick={() => setShowBailConfirm(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:scale-[1.02] active:scale-[0.97]"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  color: '#ef4444',
                  border: '1px dashed rgba(239, 68, 68, 0.3)',
                }}
                title="Draw the line on this one"
              >
                🚪 Give up on this one
              </button>
            )}

            {/* Bail confirmation inline */}
            {canBail && showBailConfirm && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-[family-name:var(--font-mono)]">Drawing the line?</span>
                <button
                  onClick={handleBail}
                  className="px-2.5 py-1 text-xs font-bold rounded-md transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  ✊ Yeah, I&apos;m done
                </button>
                <button
                  onClick={() => setShowBailConfirm(false)}
                  className="px-2 py-1 text-xs text-text-dim hover:text-text-muted transition-colors"
                >
                  Maybe later
                </button>
              </div>
            )}

            {/* Delete — pushed to the right */}
            <div className="flex-1" />
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-text-faint hover:text-red-400 transition-colors font-[family-name:var(--font-mono)]"
              >
                Remove
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-[family-name:var(--font-mono)]">Remove forever? You&apos;d need to re-import or re-add this game manually.</span>
                <button
                  onClick={() => {
                    deleteGame(game.id);
                    showToast(`${game.name} removed. It was never here.`);
                  }}
                  className="px-2 py-1 text-xs font-medium rounded-md bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                >
                  Remove
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-1 text-xs text-text-dim hover:text-text-muted transition-colors"
                >
                  Maybe later
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
