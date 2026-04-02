'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Game } from '@/lib/types';
import { useStore } from '@/lib/store';
import { getCompletionRecommendations, getWishlistRecommendations } from '@/lib/recommendations';
import DealBadge from './DealBadge';
import { trackGameCleared } from '@/lib/analytics';

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

export default function CompletionCelebration({ game, onClose, onConfirm }: CompletionCelebrationProps) {
  const [stage, setStage] = useState<'confirm' | 'celebrate'>('confirm');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const games = useStore((s) => s.games);
  const updateGame = useStore((s) => s.updateGame);

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
        className="relative w-full max-w-md rounded-2xl border overflow-hidden"
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
                One more slot opened up. Space cleared. Great work.
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

              {/* What's Next — recommendations from their own library + wishlist */}
              {(() => {
                const backlogRecs = getCompletionRecommendations(game, games, 3);
                const wishlistRecs = getWishlistRecommendations(game, games, 2);
                const hasRecs = backlogRecs.length > 0 || wishlistRecs.length > 0;

                return hasRecs ? (
                  <div
                    className="rounded-xl p-4 mb-5 text-left"
                    style={{
                      backgroundColor: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <p className="text-xs text-text-faint font-[family-name:var(--font-mono)] mb-2.5">
                      You cleared a slot. What goes in it?
                    </p>

                    {/* Backlog recommendations */}
                    {backlogRecs.length > 0 && (
                      <div className="space-y-1.5 mb-2">
                        {backlogRecs.map((rec) => (
                          <div
                            key={rec.game.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="text-text-primary font-medium truncate flex-1">
                              {rec.game.name}
                            </span>
                            <span className="text-[10px] text-text-faint font-[family-name:var(--font-mono)] shrink-0">
                              {rec.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Wishlist recommendations with deal check */}
                    {wishlistRecs.length > 0 && (
                      <div className="pt-2 mt-2 space-y-1.5" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                        <p className="text-[10px] text-text-faint font-[family-name:var(--font-mono)]">
                          On your wishlist:
                        </p>
                        {wishlistRecs.map((rec) => (
                          <div key={rec.game.id} className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-yellow-400">⭐</span>
                              <span className="text-text-primary font-medium truncate flex-1">
                                {rec.game.name}
                              </span>
                            </div>
                            <DealBadge gameName={rec.game.name} compact />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-text-dim font-[family-name:var(--font-mono)] mb-5">
                    Got DLC or want to New Game+? Queue it up from your Cleared list anytime.
                  </p>
                );
              })()}

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
