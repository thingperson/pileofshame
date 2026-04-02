'use client';

import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';

interface ShareCardProps {
  stats: {
    backlogSize: number;
    gamesCleared: number;
    bailedCount: number;
    totalHours: number;
    unplayedValue?: number;
    playedValue?: number;
    backlogHours?: number | null;
    oldest?: { name: string; days: number } | null;
    streak: number;
  };
  rank?: string;
}

/**
 * Generates a shareable stats card image and offers download/share options.
 * Uses the /api/share-card endpoint which renders themed PNG images via next/og.
 */
export default function ShareCard({ stats, rank }: ShareCardProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const theme = useStore((s) => s.settings.theme);
  const { showToast } = useToast();

  const buildCardUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('backlog', stats.backlogSize.toString());
    params.set('cleared', stats.gamesCleared.toString());
    params.set('bailed', stats.bailedCount.toString());
    params.set('hours', stats.totalHours.toString());
    if (stats.unplayedValue) params.set('value', stats.unplayedValue.toString());
    if (stats.playedValue) params.set('playedValue', stats.playedValue.toString());
    if (stats.backlogHours) params.set('backlogHours', stats.backlogHours.toString());
    if (stats.oldest) params.set('oldest', stats.oldest.name);
    params.set('streak', stats.streak.toString());
    if (rank) params.set('rank', rank);
    params.set('theme', theme);
    return `/api/share-card?${params.toString()}`;
  }, [stats, rank, theme]);

  const handlePreview = useCallback(async () => {
    setLoading(true);
    const url = buildCardUrl();
    setPreviewUrl(url);
    setLoading(false);
  }, [buildCardUrl]);

  const handleDownload = useCallback(async () => {
    setLoading(true);
    try {
      const url = buildCardUrl();
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `pile-of-shame-stats.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showToast('Card downloaded. Go share it.');
    } catch {
      showToast('Failed to generate card. Try again.');
    }
    setLoading(false);
  }, [buildCardUrl, showToast]);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}${buildCardUrl()}`;
    navigator.clipboard.writeText(url);
    showToast('Card link copied to clipboard.');
  }, [buildCardUrl, showToast]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handlePreview}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold font-[family-name:var(--font-mono)] rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{
            backgroundColor: 'rgba(167, 139, 250, 0.1)',
            color: '#a78bfa',
            border: '1px solid rgba(167, 139, 250, 0.25)',
          }}
        >
          🖼️ Preview card
        </button>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold font-[family-name:var(--font-mono)] rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: '#22c55e',
            border: '1px solid rgba(34, 197, 94, 0.25)',
          }}
        >
          {loading ? '...' : '📥 Download PNG'}
        </button>
        <button
          onClick={handleCopyLink}
          className="px-3 py-1.5 text-xs font-semibold font-[family-name:var(--font-mono)] rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          🔗 Copy image link
        </button>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="card-enter rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <img
            src={previewUrl}
            alt="Your shareable stats card"
            className="w-full"
            style={{ aspectRatio: '1200/630' }}
          />
          <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
            <span className="text-[11px] text-text-dim font-[family-name:var(--font-mono)]">
              Themed to your current theme ({theme})
            </span>
            <button
              onClick={() => setPreviewUrl(null)}
              className="text-[11px] text-text-faint hover:text-text-muted transition-colors"
            >
              Close preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
