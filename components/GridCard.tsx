'use client';

import { useState, useCallback } from 'react';
import { Game } from '@/lib/types';
import { useStore } from '@/lib/store';
import { STATUS_CONFIG, TIME_TIER_CONFIG, SOURCE_LABELS, SOURCE_SHORT, SOURCE_COLORS } from '@/lib/constants';
import { MOOD_TAG_CONFIG } from '@/lib/enrichment';
import { useToast } from './Toast';
import GameDetailModal from './GameDetailModal';
import { isSoftIgnored } from '@/lib/skipTracking';

function CoverImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center text-text-faint text-2xl">
        🎮
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-all duration-200 group-hover:brightness-110"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

interface GridCardProps {
  game: Game;
}

// Platform colors and labels imported from constants

export default function GridCard({ game }: GridCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const { cycleStatus, getNextStatus, showCelebration } = useStore();
  const { showToast } = useToast();

  const statusConfig = STATUS_CONFIG[game.status];
  const nextStatus = getNextStatus(game.status);
  const tierConfig = TIME_TIER_CONFIG[game.timeTier];

  // HLTB progress inference
  const hasProgress = game.hoursPlayed > 0 && game.hltbMain && game.hltbMain > 0;
  const progressPct = hasProgress ? Math.min(Math.round((game.hoursPlayed / game.hltbMain!) * 100), 100) : null;
  const remainingHours = hasProgress ? Math.max(game.hltbMain! - game.hoursPlayed, 0) : null;

  // Achievement progress
  const hasAchievements = game.achievements && game.achievements.total > 0;
  const achievementPct = hasAchievements
    ? Math.round((game.achievements!.earned / game.achievements!.total) * 100)
    : 0;
  const achievementsComplete = hasAchievements && game.achievements!.earned === game.achievements!.total;

  const handleStatusClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (game.status === 'played' || game.status === 'bailed') return;

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
        className={`relative group rounded-xl border overflow-hidden transition-all duration-150 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-black/20 cursor-pointer ${game.status === 'playing' ? 'now-playing-glow' : ''}`}
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
        {/* Cover Art — 16:9 landscape to match Steam header images (460x215 ≈ 2.14:1) */}
        <div className="aspect-video relative bg-bg-primary overflow-hidden">
          {game.coverUrl ? (
            <CoverImage src={game.coverUrl} alt={game.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-faint text-2xl">
              🎮
            </div>
          )}

          {/* Bottom gradient overlay for readability */}
          <div
            className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
            }}
          />

          {/* Status badge overlay — top left */}
          <button
            onClick={handleStatusClick}
            aria-label={nextStatus ? `${statusConfig.label}. Move to ${STATUS_CONFIG[nextStatus].label}` : statusConfig.label}
            className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] backdrop-blur-sm transition-all ${
              game.status !== 'played' && game.status !== 'bailed' ? 'hover:scale-105 active:scale-95 ring-1 ring-white/15' : ''
            }`}
            style={{
              backgroundColor: `${statusConfig.bg}dd`,
              color: statusConfig.color,
            }}
          >
            <span>{statusConfig.icon}</span>
            <span>{statusConfig.shortLabel || statusConfig.label}</span>
            {nextStatus && <span className="text-xs opacity-60">→</span>}
          </button>

          {/* Time tier — top right */}
          <span
            className="absolute top-2 right-2 text-sm backdrop-blur-sm rounded px-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            title={tierConfig.label}
          >
            {tierConfig.icon}
          </span>

          {/* Platform source — bottom left of cover */}
          <span
            className="absolute bottom-1.5 left-2 text-xs font-bold font-[family-name:var(--font-mono)] px-2 py-0.5 rounded backdrop-blur-sm z-10"
            style={{
              backgroundColor: SOURCE_COLORS[game.source].bg,
              color: SOURCE_COLORS[game.source].text,
              border: `1px solid ${SOURCE_COLORS[game.source].text}30`,
            }}
            title={SOURCE_LABELS[game.source]}
          >
            {SOURCE_SHORT[game.source]}
          </span>

          {/* Metacritic badge — bottom right of cover */}
          {game.metacritic && (
            <span
              className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded text-xs font-bold font-[family-name:var(--font-mono)] backdrop-blur-sm z-10"
              style={{
                backgroundColor: game.metacritic >= 75 ? '#22c55e33' : game.metacritic >= 50 ? '#f59e0b33' : '#ef444433',
                color: game.metacritic >= 75 ? '#22c55e' : game.metacritic >= 50 ? '#f59e0b' : '#ef4444',
              }}
            >
              {game.metacritic}
            </span>
          )}

          {/* Hover overlay with details button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDetailOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold font-[family-name:var(--font-mono)] backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'rgba(124, 58, 237, 0.6)',
                color: '#e9d5ff',
                border: '1px solid rgba(167, 139, 250, 0.4)',
              }}
            >
              Details
            </button>
          </div>
        </div>

        {/* Info area below cover */}
        <div className="px-2.5 py-2 space-y-1">
          {/* Title */}
          <p className="text-sm font-semibold text-text-primary truncate">
            {game.isWishlisted && <span className="text-yellow-400 mr-1" title="Wishlisted">⭐</span>}
            {game.ignored && <span className="text-text-faint mr-1" title="Ignored from recommendations">🚫</span>}
            {!game.ignored && isSoftIgnored(game.id) && <span className="text-text-faint mr-1" title="Skipped 5+ times. Hidden from picker. Reset in game details.">💤</span>}
            {game.name}
          </p>

          {/* Achievement mini-bar */}
          {hasAchievements && (
            <div
              className="w-full h-[3px] rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              title={`${game.achievements!.earned}/${game.achievements!.total} achievements (${achievementPct}%)${game.achievements!.earnedPlatinum ? ' - Platinum!' : ''}`}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${achievementPct}%`,
                  backgroundColor: achievementsComplete ? '#22c55e' : '#a78bfa',
                }}
              />
            </div>
          )}

          {/* Hours played + progress + mood tags row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {game.hoursPlayed > 0 && (
              <span className="text-xs font-[family-name:var(--font-mono)] text-text-muted">
                {game.hoursPlayed}h
              </span>
            )}
            {remainingHours !== null && remainingHours > 0 && remainingHours <= 8 && (
              <span
                className="text-xs font-[family-name:var(--font-mono)] px-1 py-0 rounded"
                style={{
                  backgroundColor: progressPct! >= 85 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                  color: progressPct! >= 85 ? '#4ade80' : '#fcd34d',
                }}
                title={`~${progressPct}% through (${game.hoursPlayed}h / ${game.hltbMain}h)`}
              >
                {progressPct! >= 85 ? '🏁' : '⏳'} ~{Math.round(remainingHours)}h left
              </span>
            )}
            {game.moodTags && game.moodTags.slice(0, 2).map((mood) => {
              const config = MOOD_TAG_CONFIG[mood];
              return config ? (
                <span
                  key={mood}
                  className="text-xs font-[family-name:var(--font-mono)] px-1 py-0 rounded"
                  style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                  }}
                  title={config.label}
                >
                  {config.icon}
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <GameDetailModal
        game={detailOpen ? game : null}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
