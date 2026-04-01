'use client';

import { useStore } from '@/lib/store';
import { ViewMode } from '@/lib/types';

export default function ViewToggle() {
  const viewMode = useStore((s) => s.settings.viewMode);
  const updateSettings = useStore((s) => s.updateGame); // we'll use a dedicated action

  const setViewMode = (mode: ViewMode) => {
    useStore.setState((state) => ({
      settings: { ...state.settings, viewMode: mode },
    }));
  };

  return (
    <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border-subtle)' }}>
      <button
        onClick={() => setViewMode('list')}
        className={`px-2.5 py-1.5 text-xs transition-colors ${
          viewMode === 'list' ? 'text-text-primary bg-white/5' : 'text-text-dim hover:text-text-muted'
        }`}
        title="List view"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button
        onClick={() => setViewMode('grid')}
        className={`px-2.5 py-1.5 text-xs transition-colors ${
          viewMode === 'grid' ? 'text-text-primary bg-white/5' : 'text-text-dim hover:text-text-muted'
        }`}
        title="Grid view"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      </button>
    </div>
  );
}
