'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useStore } from '@/lib/store';
import { saveToCloud, loadFromCloud } from '@/lib/cloudSync';
import { useToast } from './Toast';

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

  // Load from cloud on first sign-in
  useEffect(() => {
    if (!isSignedIn || !user || hasLoaded) return;

    const loadCloud = async () => {
      const cloudData = await loadFromCloud(user.id);
      if (cloudData) {
        const localGames = useStore.getState().games;

        // If cloud has data and local is empty (or cloud is newer), use cloud
        if (cloudData.games && Array.isArray(cloudData.games)) {
          if (localGames.length === 0) {
            // Empty local — use cloud data
            importState(JSON.stringify(cloudData));
            showToast('Library loaded from cloud.');
          } else if (cloudData.lastSaved > lastSaved) {
            // Cloud is newer — ask user? For now, cloud wins if local hasn't changed
            // In future: show merge dialog
            importState(JSON.stringify(cloudData));
            showToast('Synced with cloud (newer data found).');
          }
        }
      }
      setHasLoaded(true);
      lastSyncedRef.current = lastSaved;
    };

    loadCloud();
  }, [isSignedIn, user, hasLoaded, lastSaved, importState, showToast]);

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
