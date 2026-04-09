'use client';

import { useCallback, useRef } from 'react';
import { GameStatus } from '@/lib/types';

export type TabId = 'backlog' | 'up-next' | 'now-playing' | 'completed';

export interface TabDef {
  id: TabId;
  label: string;
  shortLabel: string;
  statuses: GameStatus[];
  icon: string;
  color: string;
}

export const TABS: TabDef[] = [
  { id: 'backlog', label: 'Backlog', shortLabel: 'Backlog', statuses: ['buried'], icon: '📚', color: '#64748b' },
  { id: 'up-next', label: 'Up Next', shortLabel: 'Next', statuses: ['on-deck'], icon: '🎯', color: '#38bdf8' },
  { id: 'now-playing', label: 'Playing Now', shortLabel: 'Now', statuses: ['playing'], icon: '▶️', color: '#f59e0b' },
  { id: 'completed', label: 'Completed', shortLabel: 'Done', statuses: ['played', 'bailed'], icon: '✅', color: '#22c55e' },
];

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  counts: Record<TabId, number>;
}

export default function TabNav({ activeTab, onTabChange, counts }: TabNavProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      newIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      newIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = TABS.length - 1;
    } else {
      return;
    }

    onTabChange(TABS[newIndex].id);
    tabRefs.current[newIndex]?.focus();
  }, [onTabChange]);

  return (
    <div
      role="tablist"
      aria-label="Game pipeline"
      className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1"
    >
      {TABS.map((tab, index) => {
        const active = activeTab === tab.id;
        const count = counts[tab.id];
        return (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple ${
              active
                ? 'text-text-primary'
                : 'text-text-dim hover:text-text-muted hover:bg-white/5'
            }`}
            style={active ? {
              backgroundColor: `${tab.color}15`,
              boxShadow: `inset 0 -2px 0 ${tab.color}`,
            } : undefined}
          >
            <span className="text-xs" aria-hidden="true">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
            {count > 0 && (
              <span
                className="text-xs font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: active ? `${tab.color}20` : 'rgba(255,255,255,0.06)',
                  color: active ? tab.color : 'var(--color-text-faint)',
                }}
                aria-label={`${count} game${count !== 1 ? 's' : ''}`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
