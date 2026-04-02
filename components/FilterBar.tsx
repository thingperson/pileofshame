'use client';

import { useStore } from '@/lib/store';
import { TIME_TIER_CONFIG } from '@/lib/constants';
import { TimeTier, MoodTag } from '@/lib/types';
import { MOOD_TAG_CONFIG } from '@/lib/enrichment';

const MOOD_OPTIONS: MoodTag[] = ['chill', 'intense', 'story-rich', 'brainless', 'atmospheric', 'competitive', 'spooky', 'creative', 'strategic', 'emotional'];

export default function FilterBar() {
  const filters = useStore((s) => s.filters);
  const categories = useStore((s) => s.categories);
  const setFilter = useStore((s) => s.setFilter);

  return (
    <div>
      {/* Filter Row — stacks on mobile, wraps on desktop */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        {/* Shelf/Category */}
        <select
          value={filters.category}
          onChange={(e) => setFilter('category', e.target.value)}
          aria-label="Filter by shelf"
          className="text-sm bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-text-secondary focus:border-accent-purple"
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
          className="text-sm bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-text-secondary focus:border-accent-purple"
        >
          <option value="">I&apos;m in the mood for...</option>
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
          className="text-sm bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-text-secondary focus:border-accent-purple"
        >
          <option value="">I have time for...</option>
          <option value="quick-hit">⚡ Quick Hit: under an hour</option>
          <option value="wind-down">🌙 A couple hours</option>
          <option value="deep-cut">🔥 Clear the schedule, 2-3 hrs</option>
          <option value="marathon">🏔️ Marathon: 4+ hours</option>
        </select>

        {/* Status toggles */}
        <button
          onClick={() => setFilter('showPlayed', !filters.showPlayed)}
          aria-pressed={filters.showPlayed}
          className={`text-sm px-3 py-2 rounded-lg border font-[family-name:var(--font-mono)] transition-opacity ${
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
          className={`text-sm px-3 py-2 rounded-lg border font-[family-name:var(--font-mono)] transition-opacity ${
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
  );
}
