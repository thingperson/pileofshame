'use client';

import { GameStatus } from '@/lib/types';

export type TabId = 'backlog' | 'up-next' | 'now-playing' | 'completed';

export interface TabDef {
  id: TabId;
  label: string;
  statuses: GameStatus[];
  icon: string;
  color: string;
}

export const TABS: TabDef[] = [
  { id: 'backlog', label: 'Backlog', statuses: ['buried'], icon: '📚', color: '#64748b' },
  { id: 'up-next', label: 'Up Next', statuses: ['on-deck'], icon: '🎯', color: '#38bdf8' },
  { id: 'now-playing', label: 'Now Playing', statuses: ['playing'], icon: '🔥', color: '#f59e0b' },
  { id: 'completed', label: 'Completed', statuses: ['played', 'bailed'], icon: '✅', color: '#22c55e' },
];

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  counts: Record<TabId, number>;
}

export default function TabNav({ activeTab, onTabChange, counts }: TabNavProps) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        const count = counts[tab.id];
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              active
                ? 'text-text-primary'
                : 'text-text-dim hover:text-text-muted hover:bg-white/5'
            }`}
            style={active ? {
              backgroundColor: `${tab.color}15`,
              boxShadow: `inset 0 -2px 0 ${tab.color}`,
            } : undefined}
          >
            <span className="text-xs">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            {count > 0 && (
              <span
                className="text-[10px] font-[family-name:var(--font-mono)] px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: active ? `${tab.color}20` : 'rgba(255,255,255,0.06)',
                  color: active ? tab.color : 'var(--color-text-faint)',
                }}
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
