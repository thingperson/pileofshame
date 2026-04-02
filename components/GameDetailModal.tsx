'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Game } from '@/lib/types';
import GameCard from './GameCard';

interface GameDetailModalProps {
  game: Game | null;
  onClose: () => void;
}

/**
 * Slide-up detail modal for grid view. Wraps GameCard in expanded mode
 * so grid users get the full detail experience (descriptions, mood tags,
 * deals, editing, celebration flow).
 */
export default function GameDetailModal({ game, onClose }: GameDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Escape to close + focus trapping
  useEffect(() => {
    if (!game) return;

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
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';

    // Focus first interactive element
    requestAnimationFrame(() => {
      const first = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea'
      );
      first?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [game, handleClose]);

  if (!game) return null;

  const modal = (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ zIndex: 45 }}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal content — slide up on mobile, centered on desktop */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${game.name} details`}
        className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          animation: 'slideUp 250ms ease-out',
          zIndex: 46,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close handle — mobile drag indicator */}
        <div className="sticky top-0 z-10 flex justify-center pt-2 pb-1 sm:hidden" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
          <div className="w-10 h-1 rounded-full bg-text-faint/30" />
        </div>

        {/* Close button — desktop */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-white/5 transition-colors hidden sm:flex"
          aria-label="Close"
        >
          ✕
        </button>

        {/* GameCard in forced-expanded mode */}
        <div className="px-1 pb-2">
          <GameCard game={game} forceExpanded />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
