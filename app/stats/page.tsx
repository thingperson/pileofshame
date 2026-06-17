'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { ToastProvider } from '@/components/Toast';
import StatsPanel from '@/components/StatsPanel';
import { DISCORD_INVITE_URL } from '@/lib/social';
import { getAllMatchingArchetypes, getThemeUsage } from '@/lib/archetypes';
import { findArchetypeByTitle } from '@/lib/archetypeRegistry';

function StatsContent() {
  const games = useStore((s) => s.games);
  const includeRoasts = useStore((s) => s.settings.showRoasts ?? false);

  const clearedCount = useMemo(
    () => games.filter((g) => g.status === 'played').length,
    [games],
  );
  const valueReclaimed = clearedCount * 15;

  // Archetype share URL for hero CTA
  const shareUrl = useMemo(() => {
    if (games.length < 3) return null;
    const themeUsage = getThemeUsage();
    const archetypes = getAllMatchingArchetypes(games, themeUsage, { includeRoasts });
    if (!archetypes.length) return null;
    const entry = findArchetypeByTitle(archetypes[0].title);
    if (!entry) return null;
    return typeof window !== 'undefined'
      ? `${window.location.origin}/archetype/${entry.slug}`
      : `/archetype/${entry.slug}`;
  }, [games, includeRoasts]);

  const handleShareType = async () => {
    if (!shareUrl) return;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try { await navigator.share({ url: shareUrl }); return; } catch {}
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
    } else {
      window.prompt('Copy your archetype link:', shareUrl);
    }
  };

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="text-text-dim hover:text-accent-purple transition-colors"
            aria-label="Back to home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">My Stats</h1>
        </div>

        {/* Hero */}
        {clearedCount > 0 && (
          <section className="mb-6 rounded-xl border p-6 text-center" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-subtle)' }}>
            <p className="text-6xl font-black tabular-nums" style={{ color: 'var(--stat-green, #22c55e)' }}>
              {clearedCount}
            </p>
            <p className="text-sm font-semibold text-text-dim mt-1">
              {clearedCount === 1 ? 'game' : 'games'} cleared
            </p>
            {valueReclaimed > 0 && (
              <p className="text-lg font-bold text-text-muted mt-3 font-[family-name:var(--font-mono)]">
                ≈${valueReclaimed.toLocaleString()} reclaimed from your pile
              </p>
            )}
            {shareUrl && (
              <button
                onClick={handleShareType}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-accent-purple)', color: '#0a0a0f' }}
              >
                ↗ Share your type
              </button>
            )}
          </section>
        )}

        {/* Stats */}
        <StatsPanel games={games} />
      </div>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-12">
        <div className="max-w-[960px] mx-auto px-4 py-6 flex gap-4 text-sm text-text-dim">
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-accent-purple transition-colors">
            Discord
          </a>
          <Link href="/privacy" className="hover:text-accent-purple transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-accent-purple transition-colors">
            Terms
          </Link>
        </div>
      </footer>
    </main>
  );
}

export default function StatsPage() {
  return (
    <ToastProvider>
      <StatsContent />
    </ToastProvider>
  );
}
