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

const PAGE_SIZES = [20, 50, 100, Infinity] as const;
const PAGE_LABELS: Record<number, string> = { 20: '20', 50: '50', 100: '100', [Infinity]: 'All' };

export default function CategorySection({ name, games }: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState(0);
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
  const totalPages = pageSize === Infinity ? 1 : Math.ceil(sorted.length / pageSize);
  const paginatedGames = pageSize === Infinity
    ? sorted
    : sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const showPagination = sorted.length > 20;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full group"
      >
        <svg
          aria-hidden="true"
          className={`w-3.5 h-3.5 text-text-dim transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {icon && <span className="text-xl">{icon}</span>}
        <h2 className="text-lg font-bold text-text-primary tracking-tight">
          {name}
        </h2>
        <span className="text-sm text-text-muted font-[family-name:var(--font-mono)]">
          {games.length}
        </span>
      </button>

      {!collapsed && viewMode === 'list' && (
        <div className="space-y-1.5 pl-0.5">
          {paginatedGames.map((game, i) => {
            // Track Up Next numbering — count all on-deck games in sorted order
            let upNextIndex: number | undefined;
            if (game.status === 'on-deck') {
              const allOnDeck = sorted.filter((g) => g.status === 'on-deck');
              upNextIndex = allOnDeck.indexOf(game) + 1;
            }
            return (
              <GameCard key={game.id} game={game} upNextIndex={upNextIndex} />
            );
          })}
        </div>
      )}

      {!collapsed && viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pl-0.5">
          {paginatedGames.map((game) => (
            <GridCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!collapsed && showPagination && (
        <div className="flex items-center justify-between pt-2 px-1">
          <div className="flex items-center gap-1">
            {totalPages > 1 && (
              <>
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-2 py-1 text-[11px] text-text-dim hover:text-text-muted disabled:opacity-30 font-[family-name:var(--font-mono)]"
                >
                  ← Prev
                </button>
                <span className="text-[11px] text-text-faint font-[family-name:var(--font-mono)]">
                  {currentPage + 1}/{totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-2 py-1 text-[11px] text-text-dim hover:text-text-muted disabled:opacity-30 font-[family-name:var(--font-mono)]"
                >
                  Next →
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-faint">Show:</span>
            {PAGE_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => { setPageSize(size); setCurrentPage(0); }}
                className={`px-1.5 py-0.5 text-[10px] rounded font-[family-name:var(--font-mono)] transition-colors ${
                  pageSize === size
                    ? 'text-accent-purple bg-accent-purple/10'
                    : 'text-text-faint hover:text-text-dim'
                }`}
              >
                {PAGE_LABELS[size]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
