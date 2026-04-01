'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { downloadBackup, readBackupFile } from '@/lib/backup';
import { useToast } from './Toast';

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [enriching, setEnriching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportState = useStore((s) => s.exportState);
  const importState = useStore((s) => s.importState);
  const games = useStore((s) => s.games);
  const updateGame = useStore((s) => s.updateGame);
  const settings = useStore((s) => s.settings);
  const { showToast } = useToast();

  const gamesWithoutArt = games.filter((g) => !g.coverUrl);

  const handleEnrichArt = async () => {
    setEnriching(true);
    let enriched = 0;
    const batch = gamesWithoutArt.slice(0, 20); // 20 at a time to avoid rate limits
    for (const game of batch) {
      try {
        const res = await fetch(`/api/rawg?search=${encodeURIComponent(game.name)}`);
        if (!res.ok) continue;
        const data = await res.json();
        const match = data.results?.[0];
        if (match && match.coverUrl) {
          updateGame(game.id, {
            coverUrl: match.coverUrl,
            rawgSlug: match.slug,
            metacritic: match.metacritic || undefined,
            genres: match.genres?.length > 0 ? match.genres : undefined,
          });
          enriched++;
        }
      } catch {
        // skip failures
      }
      // Small delay to avoid hammering the API
      await new Promise((r) => setTimeout(r, 200));
    }
    const remaining = gamesWithoutArt.length - enriched;
    showToast(`Added cover art to ${enriched} games.${remaining > 0 ? ` ${remaining} remaining — run again.` : ''}`);
    setEnriching(false);
  };

  const handleExport = () => {
    const data = exportState();
    downloadBackup(data);
    showToast('Library exported.');
    setOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const json = await readBackupFile(file);
      setPendingImport(json);
      setConfirmImport(true);
    } catch {
      showToast('Failed to read file.');
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (pendingImport) {
      const success = importState(pendingImport);
      if (success) {
        showToast('Library restored.');
      } else {
        showToast('Invalid backup file.');
      }
    }
    setConfirmImport(false);
    setPendingImport(null);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-text-dim hover:text-text-muted transition-colors"
        title="Settings"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => { setOpen(false); setConfirmImport(false); }} />
          <div
            className="absolute right-0 top-full mt-2 w-64 rounded-xl border p-2 space-y-1 z-40"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              borderColor: 'var(--color-border-active)',
            }}
          >
            {!confirmImport ? (
              <>
                {/* Theme Toggle */}
                <div className="px-3 py-2 space-y-1.5">
                  <p className="text-[11px] text-text-faint font-[family-name:var(--font-mono)]">Theme</p>
                  <div className="flex gap-1">
                    {[
                      { value: 'dark', label: '🌙 Dark' },
                      { value: '90s', label: '🚧 90s' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          useStore.setState((s) => ({
                            settings: { ...s.settings, theme: opt.value as 'dark' | '90s' },
                          }));
                        }}
                        className={`px-2 py-1 text-[11px] rounded-md font-medium transition-all ${
                          settings.theme === opt.value
                            ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                            : 'text-text-dim hover:text-text-muted border border-transparent'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform Preference */}
                <div className="px-3 py-2 space-y-1.5">
                  <p className="text-[11px] text-text-faint font-[family-name:var(--font-mono)]">I play on</p>
                  <div className="flex gap-1">
                    {[
                      { value: 'any', label: 'Any' },
                      { value: 'pc', label: '🖥️ PC' },
                      { value: 'mac', label: '🍎 Mac' },
                      { value: 'console', label: '🎮 Console' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          useStore.setState((s) => ({
                            settings: { ...s.settings, platformPreference: opt.value as 'any' | 'pc' | 'mac' | 'console' },
                          }));
                        }}
                        className={`px-2 py-1 text-[11px] rounded-md font-medium transition-all ${
                          settings.platformPreference === opt.value
                            ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                            : 'text-text-dim hover:text-text-muted border border-transparent'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px mx-3" style={{ backgroundColor: 'var(--color-border-subtle)' }} />

                <button
                  onClick={handleExport}
                  className="w-full text-left px-3 py-2 text-sm text-text-secondary rounded-lg hover:bg-bg-card transition-colors"
                >
                  📦 Export Library
                </button>
                <button
                  onClick={handleImportClick}
                  className="w-full text-left px-3 py-2 text-sm text-text-secondary rounded-lg hover:bg-bg-card transition-colors"
                >
                  📥 Import Library
                </button>
                {gamesWithoutArt.length > 0 && (
                  <button
                    onClick={handleEnrichArt}
                    disabled={enriching}
                    className="w-full text-left px-3 py-2 text-sm text-text-secondary rounded-lg hover:bg-bg-card transition-colors disabled:opacity-50"
                  >
                    {enriching ? '⏳ Fetching...' : `🖼️ Fetch Cover Art (${gamesWithoutArt.length})`}
                  </button>
                )}
              </>
            ) : (
              <div className="p-2 space-y-2">
                <p className="text-xs text-text-muted">
                  This will replace your current library. Continue?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setConfirmImport(false); setPendingImport(null); }}
                    className="flex-1 px-2 py-1.5 text-xs text-text-dim rounded-lg border border-border-subtle"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg"
                    style={{ backgroundColor: 'var(--color-accent-purple)', color: '#0a0a0f' }}
                  >
                    Replace
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
