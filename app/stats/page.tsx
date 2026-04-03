'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { ToastProvider } from '@/components/Toast';
import StatsPanel from '@/components/StatsPanel';

function StatsContent() {
  const games = useStore((s) => s.games);

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

        {/* Stats */}
        <StatsPanel games={games} />
      </div>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-12">
        <div className="max-w-[960px] mx-auto px-4 py-6 flex gap-4 text-sm text-text-dim">
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
