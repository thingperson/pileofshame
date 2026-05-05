'use client';

import { useEffect } from 'react';
import type { TabId } from '@/components/TabNav';

interface Options {
  onRoll: () => void;
  onTab: (tab: TabId) => void;
}

const TAB_BY_DIGIT: Record<string, TabId> = {
  '1': 'backlog',
  '2': 'up-next',
  '3': 'now-playing',
  '4': 'completed',
};

export function useKeyboardShortcuts({ onRoll, onTab }: Options) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const editing =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable === true;

      // '/' jumps to search even from non-editing contexts; modal-open still blocks it.
      const modalOpen =
        document.querySelectorAll('[role="dialog"][aria-modal="true"]').length > 0;
      if (modalOpen) return;

      if (e.key === '/' && !editing) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('inventory-full:focus-search'));
        return;
      }

      if (editing) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onRoll();
        return;
      }

      const tab = TAB_BY_DIGIT[e.key];
      if (tab) {
        e.preventDefault();
        onTab(tab);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onRoll, onTab]);
}
