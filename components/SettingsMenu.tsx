'use client';

import { useState, useRef, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { LibrarySettings } from '@/lib/types';
import { downloadBackup, readBackupFile } from '@/lib/backup';
import { enrichBatch } from '@/lib/enrichGame';
import { trackThemeSession } from '@/lib/archetypes';
import { useToast } from './Toast';

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichingAll, setEnrichingAll] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState('');
  const [refreshingSteam, setRefreshingSteam] = useState(false);
  const [steamIdPrompt, setSteamIdPrompt] = useState(false);
  const [steamIdInput, setSteamIdInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportState = useStore((s) => s.exportState);
  const importState = useStore((s) => s.importState);
  const games = useStore((s) => s.games);
  const updateGame = useStore((s) => s.updateGame);
  const settings = useStore((s) => s.settings);
  const linkedSteamId = useStore((s) => s.linkedSteamId);
  const { showToast } = useToast();

  const gamesWithoutArt = useMemo(() => games.filter((g) => !g.coverUrl), [games]);
  const steamGames = useMemo(() => games.filter((g) => g.steamAppId), [games]);
  const psnGames = useMemo(() => games.filter((g) => g.source === 'playstation'), [games]);
  const gamesNeedingEnrichment = useMemo(() => games.filter((g) => !g.enrichedAt || !g.description || !g.moodTags || g.moodTags.length === 0), [games]);

  const handleEnrichAll = async () => {
    setEnrichingAll(true);
    setEnrichProgress('Starting...');
    try {
      const count = await enrichBatch(
        games,
        updateGame,
        (done, total) => {
          setEnrichProgress(`${done}/${total} games`);
        },
        5,
      );
      if (count > 0) {
        showToast(`Enriched ${count} games with descriptions, moods & time estimates.`);
      } else {
        showToast('All games already enriched.');
      }
    } catch {
      showToast('Enrichment hit an error. Try again for remaining games.');
    }
    setEnrichingAll(false);
    setEnrichProgress('');
  };

  const handleRefreshSteamHours = async (overrideSteamId?: string) => {
    const steamId = overrideSteamId || linkedSteamId;
    if (!steamId) {
      setSteamIdPrompt(true);
      return;
    }
    setRefreshingSteam(true);
    try {
      // Resolve vanity URL / profile URL first, then fetch playtime
      const resolveRes = await fetch(`/api/steam?steamId=${encodeURIComponent(steamId)}&action=resolve`);
      const resolveData = await resolveRes.json();
      if (!resolveRes.ok) {
        showToast(resolveData.error || 'Could not find that Steam account.');
        setRefreshingSteam(false);
        return;
      }
      const resolvedId = resolveData.profile.steamId;
      // Save for future use
      useStore.setState({ linkedSteamId: resolvedId });

      const res = await fetch(`/api/steam?steamId=${encodeURIComponent(resolvedId)}&action=playtime`);
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Could not fetch Steam playtime.');
        setRefreshingSteam(false);
        return;
      }
      const playtimeMap: Record<number, number> = data.playtime;
      let updated = 0;
      for (const game of steamGames) {
        if (game.steamAppId && playtimeMap[game.steamAppId] !== undefined) {
          const newHours = playtimeMap[game.steamAppId];
          if (newHours !== game.hoursPlayed) {
            updateGame(game.id, { hoursPlayed: newHours });
            updated++;
          }
        }
      }
      if (updated > 0) {
        showToast(`Updated playtime for ${updated} game${updated !== 1 ? 's' : ''}. Keep grinding.`);
      } else {
        showToast('All playtime already up to date.');
      }
    } catch {
      showToast('Network error refreshing Steam hours.');
    }
    setRefreshingSteam(false);
  };

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
    showToast(`Added cover art to ${enriched} games.${remaining > 0 ? ` ${remaining} remaining. Run again.` : ''}`);
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
            {steamIdPrompt ? (
              <div className="p-2 space-y-2">
                <p className="text-xs text-text-muted">
                  Enter your Steam username or profile URL to sync playtime:
                </p>
                <input
                  type="text"
                  value={steamIdInput}
                  onChange={(e) => setSteamIdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && steamIdInput.trim()) {
                      setSteamIdPrompt(false);
                      handleRefreshSteamHours(steamIdInput.trim());
                      setSteamIdInput('');
                    }
                  }}
                  placeholder="Username, URL, or Steam ID"
                  aria-label="Steam ID or profile URL"
                  autoFocus
                  className="w-full text-xs bg-bg-primary border border-border-subtle rounded-lg px-2.5 py-2 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent-purple"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSteamIdPrompt(false); setSteamIdInput(''); }}
                    className="flex-1 px-2 py-1.5 text-xs text-text-dim rounded-lg border border-border-subtle"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (steamIdInput.trim()) {
                        setSteamIdPrompt(false);
                        handleRefreshSteamHours(steamIdInput.trim());
                        setSteamIdInput('');
                      }
                    }}
                    disabled={!steamIdInput.trim()}
                    className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg disabled:opacity-30"
                    style={{ backgroundColor: 'var(--color-accent-purple)', color: '#0a0a0f' }}
                  >
                    Sync
                  </button>
                </div>
              </div>
            ) : !confirmImport ? (
              <>
                {/* Theme Toggle */}
                <div className="px-3 py-2 space-y-1.5">
                  <p className="text-[11px] text-text-faint font-[family-name:var(--font-mono)]">Theme</p>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { value: 'dark', label: '🌙 Dark' },
                      { value: 'light', label: '☀️ Light' },
                      { value: '80s', label: '🌆 80s' },
                      { value: '90s', label: '🚧 90s' },
                      { value: 'future', label: '🔮 Future' },
                      { value: 'dino', label: '🦕 Dino' },
                      { value: 'weird', label: '👁️ Weird' },
                      { value: 'ultra', label: '⚡ ULTRA' },
                      { value: 'void', label: '🫥 Void' },
                      { value: 'cozy', label: '☕ Cozy' },
                      { value: 'minimal', label: '- Minimal' },
                      { value: 'tropical', label: '🌴 Tropical' },
                      { value: 'campfire', label: '🔥 Campfire' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          useStore.setState((s) => ({
                            settings: { ...s.settings, theme: opt.value as LibrarySettings['theme'] },
                          }));
                          trackThemeSession(opt.value);
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

                {/* Connected Platforms */}
                {(linkedSteamId || psnGames.length > 0) && (
                  <div className="px-3 py-2 space-y-1.5">
                    <p className="text-[11px] text-text-faint font-[family-name:var(--font-mono)]">Connected Platforms</p>
                    <div className="space-y-1">
                      {linkedSteamId && (
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <span className="text-sm">🟢</span>
                          <span className="flex-1">Steam</span>
                          <span className="text-[10px] text-text-dim font-[family-name:var(--font-mono)]">
                            {steamGames.length} games
                          </span>
                        </div>
                      )}
                      {psnGames.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <span className="text-sm">🔵</span>
                          <span className="flex-1">PlayStation</span>
                          <span className="text-[10px] text-text-dim font-[family-name:var(--font-mono)]">
                            {psnGames.length} games
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="h-px mx-3" style={{ backgroundColor: 'var(--color-border-subtle)' }} />

                <button
                  onClick={handleExport}
                  className="w-full text-left px-3 py-2 text-sm text-text-secondary rounded-lg hover:bg-bg-card transition-colors"
                >
                  📦 Export Backup
                </button>
                <button
                  onClick={handleImportClick}
                  className="w-full text-left px-3 py-2 text-sm text-text-secondary rounded-lg hover:bg-bg-card transition-colors"
                >
                  📥 Restore Backup
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
                {steamGames.length > 0 && (
                  <button
                    onClick={() => handleRefreshSteamHours()}
                    disabled={refreshingSteam}
                    className="w-full text-left px-3 py-2 text-sm text-text-secondary rounded-lg hover:bg-bg-card transition-colors disabled:opacity-50"
                  >
                    {refreshingSteam ? '⏳ Syncing...' : `🔄 Refresh Steam Hours (${steamGames.length})`}
                  </button>
                )}
                {gamesNeedingEnrichment.length > 0 && (
                  <button
                    onClick={handleEnrichAll}
                    disabled={enrichingAll}
                    className="w-full text-left px-3 py-2 text-sm text-text-secondary rounded-lg hover:bg-bg-card transition-colors disabled:opacity-50"
                  >
                    {enrichingAll
                      ? `⏳ Enriching ${enrichProgress}`
                      : `🧠 Smart Enrich (${gamesNeedingEnrichment.length} games)`}
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
