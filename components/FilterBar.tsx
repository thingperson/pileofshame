'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { TIME_TIER_CONFIG } from '@/lib/constants';
import { TimeTier, MoodTag } from '@/lib/types';
import { MOOD_TAG_CONFIG } from '@/lib/enrichment';

const MOOD_OPTIONS: MoodTag[] = ['chill', 'intense', 'story-rich', 'brainless', 'atmospheric', 'competitive', 'spooky', 'creative', 'strategic', 'emotional'];

export default function FilterBar() {
  const [expanded, setExpanded] = useState(false);
  const filters = useStore((s) => s.filters);
  const categories = useStore((s) => s.categories);
  const setFilter = useStore((s) => s.setFilter);

  const hasActiveFilters = !!(filters.category || filters.mood || filters.timeTier || filters.showPlayed || filters.showBailed);

  return (
    <div className="mb-4">
      {/* Toggle row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-[family-name:var(--font-mono)] text-text-dim hover:text-text-muted transition-colors py-1"
      >
        <svg
          aria-hidden="true"
          className={`w-3 h-3 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        Filter{hasActiveFilters ? 's' : ''}
        {hasActiveFilters && (
          <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
        )}
      </button>

      {/* Filter Row — collapsible */}
      {expanded && (
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 mt-2 animate-[fadeIn_150ms_ease-out]">
          {/* Shelf/Category */}
          <select
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
            aria-label="Filter by shelf"
            className="text-xs sm:text-sm bg-bg-card border border-border-subtle rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-text-secondary focus:border-accent-purple min-w-0"
          >
            <option value="">All Shelves</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Mood — auto-inferred from genres */}
          <select
            value={filters.mood}
            onChange={(e) => setFilter('mood', e.target.value as '' | MoodTag)}
            aria-label="Filter by mood"
            className="text-xs sm:text-sm bg-bg-card border border-border-subtle rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-text-secondary focus:border-accent-purple min-w-0"
          >
            <option value="">Mood...</option>
            {MOOD_OPTIONS.map((mood) => {
              const config = MOOD_TAG_CONFIG[mood];
              return (
                <option key={mood} value={mood}>{config.icon} {config.label}</option>
              );
            })}
          </select>

          {/* Session Length */}
          <select
            value={filters.timeTier}
            onChange={(e) => setFilter('timeTier', e.target.value as '' | TimeTier)}
            aria-label="Filter by session length"
            className="text-xs sm:text-sm bg-bg-card border border-border-subtle rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-text-secondary focus:border-accent-purple min-w-0"
          >
            <option value="">Session...</option>
            <option value="quick-hit">⚡ Quick Hit</option>
            <option value="wind-down">🌙 A couple hours</option>
            <option value="deep-cut">🔥 Deep Cut (2-3 hrs)</option>
            <option value="marathon">🏔️ Marathon (4+ hrs)</option>
          </select>

          {/* Status toggles — side by side on mobile */}
          <div className="flex gap-1.5 sm:contents">
            <button
              onClick={() => setFilter('showPlayed', !filters.showPlayed)}
              aria-pressed={filters.showPlayed}
              className={`flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border font-[family-name:var(--font-mono)] transition-opacity ${
                filters.showPlayed ? 'opacity-100' : 'opacity-50'
              }`}
              style={{
                borderColor: filters.showPlayed ? 'var(--color-status-played)' : 'var(--color-border-subtle)',
                color: filters.showPlayed ? 'var(--color-status-played)' : 'var(--color-text-dim)',
              }}
            >
              ✅ Played
            </button>
            <button
              onClick={() => setFilter('showBailed', !filters.showBailed)}
              aria-pressed={filters.showBailed}
              className={`flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border font-[family-name:var(--font-mono)] transition-opacity ${
                filters.showBailed ? 'opacity-100' : 'opacity-50'
              }`}
              style={{
                borderColor: filters.showBailed ? 'var(--color-status-bailed)' : 'var(--color-border-subtle)',
                color: filters.showBailed ? 'var(--color-status-bailed)' : 'var(--color-text-dim)',
              }}
            >
              🚪 Bailed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
