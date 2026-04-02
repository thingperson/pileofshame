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
      className="flex items-center gap-3 px-4 py-3 rounded-xl border mb-4 animate-[fadeIn_300ms_ease-out]"
      style={{
        backgroundColor: 'rgba(124, 58, 237, 0.06)',
        borderColor: 'rgba(124, 58, 237, 0.2)',
      }}
    >
      <span className="text-lg shrink-0">☁️</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary font-medium">
          Your library lives in this browser right now.
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          Sign in to sync across devices and keep it safe.
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="text-xs text-text-faint hover:text-text-muted transition-colors shrink-0"
        aria-label="Dismiss sync reminder"
      >
        ✕
      </button>
    </div>
  );
}
