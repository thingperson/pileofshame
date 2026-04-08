'use client';

import { useStore } from '@/lib/store';

/**
 * Subtle, non-blocking indicator shown while games are being auto-enriched
 * in the background. Sits below the header area.
 */
export default function EnrichmentIndicator() {
  const progress = useStore((s) => s.enrichmentProgress);

  if (!progress) return null;

  const pct = progress.total > 0
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-[family-name:var(--font-mono)] mb-3"
      style={{
        backgroundColor: 'rgba(167, 139, 250, 0.08)',
        border: '1px solid rgba(167, 139, 250, 0.15)',
      }}
      role="status"
      aria-live="polite"
    >
      <div className="w-3.5 h-3.5 border-2 border-accent-purple border-t-transparent rounded-full animate-spin shrink-0" />
      <span className="text-text-muted">
        Fetching art, descriptions & play times... {progress.done}/{progress.total} games
      </span>
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(167, 139, 250, 0.15)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: 'var(--color-accent-purple)',
          }}
        />
      </div>
    </div>
  );
}
