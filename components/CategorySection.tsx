'use client';

import { useState } from 'react';
import { Game } from '@/lib/types';
import GameCard from './GameCard';

interface CategorySectionProps {
  name: string;
  games: Game[];
}

export default function CategorySection({ name, games }: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (games.length === 0) return null;

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
        <h2 className="text-sm font-semibold text-text-secondary tracking-wide">
          {name}
        </h2>
        <span className="text-xs text-text-dim font-[family-name:var(--font-mono)]">
          {games.length}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-1.5 pl-0.5">
          {games
            .sort((a, b) => a.priority - b.priority)
            .map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
        </div>
      )}
    </div>
  );
}
