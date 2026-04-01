'use client';

import { useState } from 'react';
import { Game } from '@/lib/types';
import { useStore } from '@/lib/store';
import { CATEGORY_ICONS } from '@/lib/constants';
import GameCard from './GameCard';
import GridCard from './GridCard';

interface CategorySectionProps {
  name: string;
  games: Game[];
}

export default function CategorySection({ name, games }: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const viewMode = useStore((s) => s.settings.viewMode);

  if (games.length === 0) return null;

  // Sort: playing first, then on-deck, then buried, then by priority
  const statusOrder: Record<string, number> = {
    'playing': 0,
    'on-deck': 1,
    'buried': 2,
    'played': 3,
    'bailed': 4,
  };
  const sorted = [...games].sort((a, b) => {
    const sa = statusOrder[a.status] ?? 2;
    const sb = statusOrder[b.status] ?? 2;
    if (sa !== sb) return sa - sb;
    return a.priority - b.priority;
  });

  const icon = CATEGORY_ICONS[name] || '';

  return (
    <div className="space-y-2">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full group"
      >
        <svg
          className={`w-3.5 h-3.5 text-text-dim transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {icon && <span className="text-lg">{icon}</span>}
        <h2 className="text-sm font-semibold text-text-secondary tracking-wide">
          {name}
        </h2>
        <span className="text-xs text-text-dim font-[family-name:var(--font-mono)]">
          {games.length}
        </span>
      </button>

      {!collapsed && viewMode === 'list' && (
        <div className="space-y-1.5 pl-0.5">
          {sorted.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {!collapsed && viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pl-0.5">
          {sorted.map((game) => (
            <GridCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
