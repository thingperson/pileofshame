'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useStore } from '@/lib/store';
import { saveToCloud, loadFromCloud } from '@/lib/cloudSync';
import { useToast } from './Toast';
import { DEFAULT_CATEGORIES } from '@/lib/constants';

// Debounced auto-sync component — sits invisibly in the app
export default function CloudSync() {
  const { user, isSignedIn } = useAuth();
  const games = useStore((s) => s.games);
  const categories = useStore((s) => s.categories);
  const customVibes = useStore((s) => s.customVibes);
  const settings = useStore((s) => s.settings);
  const lastSaved = useStore((s) => s.lastSaved);
  const importState = useStore((s) => s.importState);
  const { showToast } = useToast();
  const [hasLoaded, setHasLoaded] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedRef = useRef<string>('');

  // Load from cloud on first sign-in — handle user switching
  useEffect(() => {
    if (!isSignedIn || !user || hasLoaded) return;

    const loadCloud = async () => {
      // Check if localStorage belongs to a different user
      const lastUserId = localStorage.getItem('getplaying-last-user-id');
      const isDifferentUser = lastUserId && lastUserId !== user.id;
      const isFirstTimeUser = !lastUserId;

      // If a different user signed in, clear local data first
      if (isDifferentUser) {
        localStorage.removeItem('getplaying-library');
        // Reset store to empty
        importState(JSON.stringify({
          games: [],
          categories: [...DEFAULT_CATEGORIES],
          customVibes: [],
          settings: { showPlayed: false, showBailed: false, viewMode: 'list', theme: 'dark', platformPreference: 'any' },
          lastSaved: new Date().toISOString(),
        }));
      }

      // Save current user ID
      localStorage.setItem('getplaying-last-user-id', user.id);

      const cloudData = await loadFromCloud(user.id);
      if (cloudData && cloudData.games && Array.isArray(cloudData.games)) {
        const localGames = useStore.getState().games;

        if (localGames.length === 0 || isDifferentUser) {
          // Empty local or switched users — use cloud data
          importState(JSON.stringify(cloudData));
          if (cloudData.games.length > 0) {
            showToast('Library loaded from cloud.');
          }
        } else if (cloudData.lastSaved > useStore.getState().lastSaved) {
          // Cloud is newer — cloud wins
          importState(JSON.stringify(cloudData));
          showToast('Synced with cloud (newer data found).');
        }
      } else if (isDifferentUser) {
        // Different user, no cloud data — they start fresh
        showToast('Welcome! Start by importing your games.');
      } else if (isFirstTimeUser) {
        // First sign-in ever on this device — keep local data, it's theirs
        // (they may have been using the app before auth existed)
      }

      setHasLoaded(true);
      lastSyncedRef.current = useStore.getState().lastSaved;
    };

    loadCloud();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user, hasLoaded, importState, showToast]);

  // Clear local user tracking on sign-out
  useEffect(() => {
    if (!isSignedIn && hasLoaded) {
      // User signed out — don't clear library yet (they might sign back in)
      // But reset hasLoaded so next sign-in triggers a fresh cloud load
      setHasLoaded(false);
    }
  }, [isSignedIn, hasLoaded]);

  // Auto-save to cloud on changes (debounced)
  const saveDebounced = useCallback(() => {
    if (!isSignedIn || !user) return;
    if (lastSaved === lastSyncedRef.current) return; // no changes

    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      const state = useStore.getState();
      const success = await saveToCloud(user.id, {
        games: state.games,
        categories: state.categories,
        customVibes: state.customVibes,
        settings: state.settings,
        lastSaved: state.lastSaved,
      });

      if (success) {
        lastSyncedRef.current = state.lastSaved;
      }
    }, 3000); // 3 second debounce
  }, [isSignedIn, user, lastSaved]);

  useEffect(() => {
    saveDebounced();
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [saveDebounced, games, categories, customVibes, settings, lastSaved]);

  // Render nothing — this is a logic-only component
  return null;
}
