'use client';

import { useStore } from '@/lib/store';
import { DEFAULT_VIBES, TIME_TIER_CONFIG } from '@/lib/constants';
import { TimeTier } from '@/lib/types';

export default function FilterBar() {
  const filters = useStore((s) => s.filters);
  const categories = useStore((s) => s.categories);
  const setFilter = useStore((s) => s.setFilter);

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="Search games..."
          className="w-full text-sm bg-bg-card border border-border-subtle rounded-xl pl-9 pr-3 py-2 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent-purple"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-2">
        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => setFilter('category', e.target.value)}
          className="text-xs bg-bg-card border border-border-subtle rounded-lg px-2 py-1.5 text-text-secondary focus:outline-none focus:border-accent-purple"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Vibe */}
        <select
          value={filters.vibe}
          onChange={(e) => setFilter('vibe', e.target.value)}
          className="text-xs bg-bg-card border border-border-subtle rounded-lg px-2 py-1.5 text-text-secondary focus:outline-none focus:border-accent-purple"
        >
          <option value="">All Vibes</option>
          {DEFAULT_VIBES.map((vibe) => (
            <option key={vibe} value={vibe}>{vibe}</option>
          ))}
        </select>

        {/* Time Tier */}
        <select
          value={filters.timeTier}
          onChange={(e) => setFilter('timeTier', e.target.value as '' | TimeTier)}
          className="text-xs bg-bg-card border border-border-subtle rounded-lg px-2 py-1.5 text-text-secondary focus:outline-none focus:border-accent-purple"
        >
          <option value="">All Tiers</option>
          {(Object.entries(TIME_TIER_CONFIG) as [TimeTier, typeof TIME_TIER_CONFIG[TimeTier]][]).map(
            ([tier, config]) => (
              <option key={tier} value={tier}>{config.icon} {config.label}</option>
            )
          )}
        </select>

        {/* Status toggles */}
        <button
          onClick={() => setFilter('showPlayed', !filters.showPlayed)}
          className={`text-xs px-2 py-1.5 rounded-lg border font-[family-name:var(--font-mono)] transition-opacity ${
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
          className={`text-xs px-2 py-1.5 rounded-lg border font-[family-name:var(--font-mono)] transition-opacity ${
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
