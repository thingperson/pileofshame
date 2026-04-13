'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Game } from '@/lib/types';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';
import { trackGameCleared, trackShareClear } from '@/lib/analytics';

interface CompletionCelebrationProps {
  game: Game | null;
  onClose: () => void;
  onConfirm: () => void;
}

// Confetti particle
interface Particle {
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle';
}

const COLORS = ['#a78bfa', '#f9a8d4', '#22c55e', '#f59e0b', '#38bdf8', '#ef4444', '#fbbf24', '#818cf8', '#4ade80'];

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full viewport
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * 2;
    canvas.height = h * 2;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(2, 2);

    // Create particles from top center, spreading out
    particlesRef.current = Array.from({ length: 120 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 200,
      y: h * 0.3 + (Math.random() - 0.5) * 50,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 8,
      speedX: (Math.random() - 0.5) * 18,
      speedY: -6 - Math.random() * 14,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;

      for (const p of particlesRef.current) {
        p.x += p.speedX * 0.4;
        p.y += p.speedY * 0.4;
        p.speedY += 0.2; // gravity
        p.speedX *= 0.99; // drag
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.004;

        if (p.opacity <= 0) continue;
        alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (alive) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    // Small delay so the modal renders first
    setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, 100);

    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 60 }}
    />
  );
}

// --- Composable share card builder ---

const CLEAR_FLAVORS = [
  (name: string, days: number | null) => days && days > 365 ? `Finally cleared ${name} after ${Math.floor(days / 365)}+ years in the pile.` : `${name}: cleared. The pile gets lighter.`,
  (name: string) => `${name}: done. One less game haunting the pile.`,
  (name: string) => `Finished ${name}. Actually played something I own.`,
  (name: string) => `Knocked out ${name}. Feels good.`,
  (name: string, days: number | null) => days && days > 180 ? `${name} spent ${Math.floor(days / 30)} months in my backlog. Not anymore.` : `${name}: off the pile. Next.`,
];

interface ShareToggle {
  key: string;
  label: string;
  available: boolean;
  enabled: boolean;
}

function GameClearShare({
  game,
  rating,
  gamesCleared,
  backlogSize,
  hoursOnGame,
  showToast,
}: {
  game: Game;
  rating: number;
  gamesCleared: number;
  backlogSize: number;
  hoursOnGame: number;
  showToast: (msg: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Toggle states for composable card
  const [showHours, setShowHours] = useState(hoursOnGame > 0);
  const [showHltb, setShowHltb] = useState(!!(game.hltbMain && hoursOnGame > 0));
  const [showPileTime, setShowPileTime] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showRating, setShowRating] = useState(false);

  // Update rating toggle when user rates
  useEffect(() => {
    if (rating > 0) setShowRating(true);
  }, [rating]);

  const timeInPileDays = useMemo(() => {
    if (!game.addedAt) return null;
    const added = new Date(game.addedAt).getTime();
    const now = Date.now();
    return Math.floor((now - added) / (1000 * 60 * 60 * 24));
  }, [game.addedAt]);

  const flavorText = useMemo(() => {
    const fn = CLEAR_FLAVORS[Math.floor(Math.random() * CLEAR_FLAVORS.length)];
    return fn(game.name, timeInPileDays);
  }, [game.name, timeInPileDays]);

  // HLTB comparison: percentage faster/slower
  const hltbLabel = useMemo(() => {
    if (!game.hltbMain || !hoursOnGame || game.hltbMain <= 0) return '';
    const diff = game.hltbMain - hoursOnGame;
    const pct = Math.round(Math.abs(diff) / game.hltbMain * 100);
    if (diff > 0) return `${pct}% faster than average (${Math.round(game.hltbMain)}h)`;
    if (diff < 0) return `${pct}% more thorough than average`;
    return 'Right on the average completion time';
  }, [game.hltbMain, hoursOnGame]);

  const toggles: ShareToggle[] = [
    { key: 'hours', label: `${hoursOnGame}h invested`, available: hoursOnGame > 0, enabled: showHours },
    { key: 'hltb', label: hltbLabel, available: !!(game.hltbMain && hoursOnGame > 0 && hltbLabel), enabled: showHltb },
    { key: 'pile', label: timeInPileDays ? `${timeInPileDays > 365 ? Math.floor(timeInPileDays / 365) + 'y' : timeInPileDays > 30 ? Math.floor(timeInPileDays / 30) + 'mo' : timeInPileDays + 'd'} in the pile` : 'Time in pile', available: !!timeInPileDays, enabled: showPileTime },
    { key: 'stats', label: `Game #${gamesCleared + 1}, ${backlogSize} left in the pile`, available: true, enabled: showStats },
    { key: 'rating', label: rating > 0 ? `${rating}/5 stars` : 'My rating', available: rating > 0, enabled: showRating },
  ];

  const handleToggle = (key: string) => {
    switch (key) {
      case 'hours': setShowHours(v => !v); break;
      case 'hltb': setShowHltb(v => !v); break;
      case 'pile': setShowPileTime(v => !v); break;
      case 'stats': setShowStats(v => !v); break;
      case 'rating': setShowRating(v => !v); break;
    }
  };

  const handleCreateCard = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameName: game.name,
          coverUrl: game.coverUrl || null,
          rating: showRating ? rating : 0,
          hoursPlayed: hoursOnGame || null,
          hltbMain: game.hltbMain || null,
          timeInPileDays: timeInPileDays,
          totalCleared: gamesCleared + 1,
          backlogRemaining: backlogSize,
          showHours,
          showHltbCompare: showHltb,
          showPileTime,
          showStats,
          flavorText,
        }),
      });
      const data = await res.json();
      if (data.url) {
        setShareUrl(data.url);
        trackShareClear('card_created', game.name);
      }
    } catch {
      showToast('Could not create share card. Try copying instead.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      trackShareClear('copy_link', game.name);
      showToast('Link copied! Paste it anywhere and it unfurls.');
    }
  };

  return (
    <div
      className="mb-4 rounded-xl p-3.5 space-y-3"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid rgba(167, 139, 250, 0.2)',
      }}
    >
      <p className="text-xs text-text-faint font-[family-name:var(--font-mono)]">
        Pick what to include. This creates a link that unfurls with a card when pasted.
      </p>

      {/* Flavor text preview */}
      <div
        className="rounded-lg p-2.5 text-sm text-text-muted italic leading-relaxed"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        {flavorText}
      </div>

      {/* Toggle checkboxes */}
      <div className="space-y-1.5">
        {toggles.filter(t => t.available).map((t) => (
          <label
            key={t.key}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={t.enabled}
              onChange={() => handleToggle(t.key)}
              className="w-4 h-4 rounded accent-purple-500"
            />
            <span className={`text-xs font-[family-name:var(--font-mono)] ${t.enabled ? 'text-text-secondary' : 'text-text-faint'} group-hover:text-text-muted transition-colors`}>
              {t.label}
            </span>
          </label>
        ))}
      </div>

      {/* Action buttons */}
      {!shareUrl ? (
        <button
          onClick={handleCreateCard}
          disabled={creating}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-bold font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
          style={{
            backgroundColor: 'rgba(167, 139, 250, 0.15)',
            border: '1px solid rgba(167, 139, 250, 0.3)',
            color: '#a78bfa',
          }}
        >
          {creating ? 'Creating...' : '🔗 Create share link'}
        </button>
      ) : (
        <div className="space-y-2">
          {/* Generated URL */}
          <div
            className="rounded-lg px-3 py-2 text-xs font-[family-name:var(--font-mono)] text-accent-purple truncate cursor-pointer hover:bg-white/5 transition-colors"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(167, 139, 250, 0.2)' }}
            onClick={handleCopyLink}
            title="Click to copy"
          >
            {shareUrl}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: 'rgba(88, 101, 242, 0.1)',
                border: '1px solid rgba(88, 101, 242, 0.2)',
                color: '#5865f2',
              }}
            >
              📋 Copy link
            </button>
            <button
              onClick={() => {
                trackShareClear('twitter', game.name);
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(flavorText)}&url=${encodeURIComponent(shareUrl)}`,
                  '_blank',
                  'width=550,height=420',
                );
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: 'rgba(29, 161, 242, 0.1)',
                border: '1px solid rgba(29, 161, 242, 0.2)',
                color: '#1da1f2',
              }}
            >
              𝕏 Post
            </button>
            <button
              onClick={() => {
                trackShareClear('reddit', game.name);
                window.open(
                  `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`Just cleared ${game.name} off my backlog`)}`,
                  '_blank',
                );
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium font-[family-name:var(--font-mono)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: 'rgba(255, 69, 0, 0.1)',
                border: '1px solid rgba(255, 69, 0, 0.2)',
                color: '#ff4500',
              }}
            >
              📮 Reddit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompletionCelebration({ game, onClose, onConfirm }: CompletionCelebrationProps) {
  const [stage, setStage] = useState<'confirm' | 'celebrate'>('confirm');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const games = useStore((s) => s.games);
  const updateGame = useStore((s) => s.updateGame);
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stats for context
  const gamesCleared = games.filter((g) => g.status === 'played').length;
  const backlogSize = games.filter((g) => g.status === 'buried' || g.status === 'on-deck').length;
  const hoursOnGame = game?.hoursPlayed || 0;

  const handleConfirm = useCallback(() => {
    onConfirm();
    trackGameCleared();
    setStage('celebrate');
  }, [onConfirm]);

  const handleClose = useCallback(() => {
    if (rating > 0 && game) {
      updateGame(game.id, { rating });
    }
    setStage('confirm');
    setRating(0);
    onClose();
  }, [onClose, rating, game, updateGame]);

  const handleShowCleared = useCallback(() => {
    if (rating > 0 && game) {
      updateGame(game.id, { rating });
    }
    setStage('confirm');
    setRating(0);
    onClose();
    // Scroll to cleared section
    setTimeout(() => {
      document.getElementById('cleared-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [onClose, rating, game, updateGame]);

  const modalRef = useRef<HTMLDivElement>(null);

  // Escape to close + focus trapping
  useEffect(() => {
    if (!game || !mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const modal = modalRef.current;
    if (modal) {
      const first = modal.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [game, mounted]);

  if (!game || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 55 }}
      onClick={handleClose}
    >
      {stage === 'celebrate' && <ConfettiCanvas />}

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Game completion celebration"
        className="relative w-full max-w-md max-h-[85dvh] rounded-2xl border overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: stage === 'celebrate' ? '#22c55e' : 'var(--color-border-active)',
          boxShadow: stage === 'celebrate' ? '0 0 40px rgba(34, 197, 94, 0.15)' : 'none',
          animation: 'scaleIn 400ms ease-out',
          zIndex: 56,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative z-20 p-6 sm:p-8 text-center">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-text-dim hover:text-text-muted hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            ✕
          </button>
          {stage === 'confirm' && (
            <>
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                You beat {game.name}?
              </h2>
              <p className="text-base text-text-muted mb-8">
                For real? Like, credits rolled and everything? This is a big deal.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleConfirm}
                  className="px-8 py-3 text-base font-bold rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                    color: '#0a0a0f',
                    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  I crushed it
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 text-base font-medium rounded-xl border transition-all hover:bg-white/5"
                  style={{ borderColor: 'var(--color-border-active)', color: 'var(--color-text-muted)' }}
                >
                  Not yet
                </button>
              </div>
            </>
          )}

          {stage === 'celebrate' && (
            <>
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold text-text-primary mb-1">
                {game.name}: Cleared!
              </h2>
              <p className="text-base text-text-muted mb-1">
                You cleared <span className="text-green-400 font-semibold">{game.name}</span> from your backlog.
              </p>
              <p className="text-sm text-text-dim italic mb-5">
                {(() => {
                  const msgs = [
                    'One more slot opened up. Space cleared. Great work.',
                    'That\'s one less game looking at you from the pile.',
                    'You committed, you followed through. That\'s the whole game.',
                    'Another one done. The pile is officially lighter.',
                    'Credits rolled. You earned this moment.',
                    'Feels good, right? That\'s what finishing things feels like.',
                    'The backlog just got a little less intimidating.',
                  ];
                  return msgs[Math.floor(Math.random() * msgs.length)];
                })()}
              </p>

              {/* Stats impact */}
              <div
                className="rounded-xl p-4 mb-5 text-left space-y-2.5"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div className="flex items-center justify-between text-sm font-[family-name:var(--font-mono)]">
                  <span className="text-text-muted">Games cleared</span>
                  <span>
                    <span className="text-text-dim">{gamesCleared}</span>
                    <span className="text-text-dim mx-1.5">→</span>
                    <span className="text-green-400 font-bold text-base">{gamesCleared + 1}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-[family-name:var(--font-mono)]">
                  <span className="text-text-muted">Backlog remaining</span>
                  <span>
                    <span className="text-text-dim">{backlogSize}</span>
                    <span className="text-text-dim mx-1.5">→</span>
                    <span className="text-amber-400 font-bold text-base">{Math.max(0, backlogSize - 1)}</span>
                  </span>
                </div>
                {hoursOnGame > 0 && (
                  <div className="flex items-center justify-between text-sm font-[family-name:var(--font-mono)]">
                    <span className="text-text-muted">Time invested</span>
                    <span className="text-blue-400 font-bold">{hoursOnGame}h</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="mb-5">
                <p className="text-sm text-text-muted font-[family-name:var(--font-mono)] mb-2">
                  Rate it. You earned an opinion
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Rate ${star} out of 5 stars`}
                      className="text-3xl transition-transform hover:scale-125 active:scale-90"
                      style={{
                        filter: star <= (hoverRating || rating) ? 'none' : 'grayscale(1) opacity(0.3)',
                      }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-text-muted font-[family-name:var(--font-mono)] mt-1.5">
                    {rating === 5 ? 'Masterpiece.' : rating === 4 ? 'Great game.' : rating === 3 ? 'Worth playing.' : rating === 2 ? 'Meh.' : 'Pain.'}
                  </p>
                )}
              </div>

              {/* Share this clear */}
              <GameClearShare
                game={game}
                rating={rating}
                gamesCleared={gamesCleared}
                backlogSize={backlogSize}
                hoursOnGame={hoursOnGame}
                showToast={showToast}
              />

              {/* CTAs */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleShowCleared}
                  className="w-full px-6 py-3 text-base font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97] shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                    color: '#0a0a0f',
                    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.25)',
                  }}
                >
                  🏆 Show Me My Cleared List
                </button>
                <button
                  onClick={handleClose}
                  className="w-full px-6 py-3 text-base font-semibold rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.97] hover:bg-white/5"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  Onward. Back to the pile
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
