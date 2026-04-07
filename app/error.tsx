'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md space-y-4">
        <div className="text-4xl">💥</div>
        <h2 className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
          Something broke.
        </h2>
        <p className="text-white/50 text-sm">
          We&apos;ve been notified. Your pile is safe.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
