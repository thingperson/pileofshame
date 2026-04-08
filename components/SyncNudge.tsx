'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useStore } from '@/lib/store';

const NUDGE_KEY = 'inventoryfull-sync-nudge-dismissed';

/**
 * Post-import nudge: reminds users to sign in for cloud sync.
 * Shows once after first import, dismissible, never shows if signed in.
 */
export default function SyncNudge() {
  const { isSignedIn } = useAuth();
  const games = useStore((s) => s.games);
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const wasDismissed = localStorage.getItem(NUDGE_KEY);
    setDismissed(!!wasDismissed);
  }, []);

  // Don't show if: not mounted, signed in, no games, or already dismissed
  if (!mounted || isSignedIn || games.length === 0 || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(NUDGE_KEY, '1');
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 animate-[fadeIn_300ms_ease-out]"
      style={{
        backgroundColor: 'rgba(124, 58, 237, 0.04)',
        borderColor: 'rgba(124, 58, 237, 0.15)',
      }}
    >
      <span className="text-xs shrink-0">☁️</span>
      <p className="flex-1 text-xs text-text-muted font-[family-name:var(--font-mono)]">
        Local only. <span className="text-text-dim">Sign in to sync across devices.</span>
      </p>
      <button
        onClick={handleDismiss}
        className="text-xs text-text-faint hover:text-text-muted transition-colors shrink-0 px-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Dismiss sync reminder"
      >
        ✕
      </button>
    </div>
  );
}
