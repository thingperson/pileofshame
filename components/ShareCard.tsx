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
  /** When provided, only stats matching these ShareComposer line IDs appear on the card */
  selectedStats?: Set<string>;
}

const CARD_THEMES = [
  { value: 'dark', label: 'Default', icon: '🌑' },
  { value: '80s', label: '80s Neon', icon: '📼' },
  { value: '90s', label: '90s Web', icon: '📸' },
  { value: 'dino', label: 'Pixel', icon: '🦕' },
  { value: 'ultra', label: 'Ultra', icon: '⚡' },
] as const;

type CardTheme = typeof CARD_THEMES[number]['value'];

/**
 * Generates a shareable stats card image and offers download/share options.
 * Uses the /api/share-card endpoint which renders themed PNG images via next/og.
 */
export default function ShareCard({ stats, rank, selectedStats }: ShareCardProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const pageTheme = useStore((s) => s.settings.theme);
  const [cardTheme, setCardTheme] = useState<CardTheme | null>(null);
  const { showToast } = useToast();

  // Use selected card theme, or map page theme to closest card theme
  const activeCardTheme: CardTheme = cardTheme ?? (() => {
    if (pageTheme === '80s') return '80s';
    if (pageTheme === '90s') return '90s';
    if (pageTheme === 'dino') return 'dino';
    if (pageTheme === 'ultra' || pageTheme === 'weird') return 'ultra';
    return 'dark';
  })();

  // Map ShareComposer stat line IDs to card params
  const shouldInclude = useCallback((statId: string) => {
    if (!selectedStats) return true; // no filter = include all
    return selectedStats.has(statId);
  }, [selectedStats]);

  const buildCardUrl = useCallback((overrideTheme?: CardTheme) => {
    const params = new URLSearchParams();
    // Backlog and cleared are always included (core identity of the card)
    params.set('backlog', stats.backlogSize.toString());
    params.set('cleared', stats.gamesCleared.toString());
    if (shouldInclude('bailed') && stats.bailedCount) params.set('bailed', stats.bailedCount.toString());
    if (shouldInclude('hours-logged') && stats.totalHours) params.set('hours', stats.totalHours.toString());
    if (shouldInclude('untapped-value') && stats.unplayedValue) params.set('value', stats.unplayedValue.toString());
    if (shouldInclude('value-reclaimed') && stats.playedValue) params.set('playedValue', stats.playedValue.toString());
    if (shouldInclude('backlog-hours') && stats.backlogHours) params.set('backlogHours', stats.backlogHours.toString());
    if (shouldInclude('oldest') && stats.oldest) params.set('oldest', stats.oldest.name);
    if (shouldInclude('streak') && stats.streak) params.set('streak', stats.streak.toString());
    if (rank) params.set('rank', rank);
    params.set('theme', overrideTheme ?? activeCardTheme);
    return `/api/share-card?${params.toString()}`;
  }, [stats, rank, activeCardTheme, shouldInclude]);

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
      a.download = `inventory-full-stats.png`;
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

  const selectCardTheme = (t: CardTheme) => {
    setCardTheme(t);
    // Auto-refresh preview if one is already showing
    if (previewUrl) {
      const url = buildCardUrl(t);
      setPreviewUrl(url);
    }
  };

  return (
    <div className="space-y-3">
      {/* Card theme selector */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-text-dim font-[family-name:var(--font-mono)] mr-1">Card style:</span>
        {CARD_THEMES.map((t) => (
          <button
            key={t.value}
            onClick={() => selectCardTheme(t.value)}
            className="px-2 py-1 text-[11px] rounded-md transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{
              backgroundColor: activeCardTheme === t.value ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
              color: activeCardTheme === t.value ? '#a78bfa' : 'var(--color-text-dim)',
              border: activeCardTheme === t.value
                ? '1px solid rgba(167, 139, 250, 0.3)'
                : '1px solid var(--color-border-subtle)',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

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
              {cardTheme ? `${CARD_THEMES.find(t => t.value === cardTheme)?.label} style` : `Matched to your theme (${pageTheme})`}
              {' · '}Try the other styles above
            </span>
            <button
              onClick={() => setPreviewUrl(null)}
              className="text-[11px] text-text-faint hover:text-text-muted transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
