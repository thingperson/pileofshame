'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';
import { trackImport } from '@/lib/analytics';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { getDupeNudge } from '@/lib/descriptors';
import { getSmartImportStatus } from '@/lib/smartSort';

interface SteamGameData {
  appid: number;
  name: string;
  playtimeHours: number;
  iconUrl: string | null;
  headerUrl: string;
}

interface SteamProfile {
  steamId: string;
  personaName: string;
  avatarUrl: string;
  profileUrl: string;
}

interface SteamImportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SteamImportModal({ open, onClose }: SteamImportModalProps) {
  const [steamId, setSteamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [games, setGames] = useState<SteamGameData[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [step, setStep] = useState<'input' | 'confirm' | 'notme' | 'select'>('input');

  const addGame = useStore((s) => s.addGame);
  const existingGames = useStore((s) => s.games);
  const { showToast } = useToast();

  // Save the linked Steam ID when importing
  const saveSteamId = (id: string) => {
    useStore.setState({ linkedSteamId: id });
  };

  const resolveProfile = useCallback(async () => {
    if (!steamId.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/steam?steamId=${encodeURIComponent(steamId.trim())}&action=resolve`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not find that Steam account');
        setLoading(false);
        return;
      }

      setProfile(data.profile);
      setStep('confirm');
    } catch {
      setError('Network error. Try again.');
    }
    setLoading(false);
  }, [steamId]);

  const fetchGames = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/steam?steamId=${encodeURIComponent(profile.steamId)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch games');
        setLoading(false);
        return;
      }

      // Filter out games already in library
      const existingSteamIds = new Set(existingGames.filter(g => g.steamAppId).map(g => g.steamAppId));
      const newGames = data.games.filter((g: SteamGameData) => !existingSteamIds.has(g.appid));

      setGames(newGames);
      setSelected(new Set(newGames.map((g: SteamGameData) => g.appid)));
      setStep('select');
    } catch {
      setError('Network error. Try again.');
    }
    setLoading(false);
  }, [profile, existingGames]);

  const toggleGame = (appid: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(appid)) next.delete(appid);
      else next.add(appid);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === games.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(games.map((g) => g.appid)));
    }
  };

  const handleImport = () => {
    const toImport = games.filter((g) => selected.has(g.appid));
    let count = 0;

    // Track import breakdown for post-import summary
    const breakdown = { total: 0, backlog: 0, started: 0, upNext: 0, completed: 0 };

    toImport.forEach((game) => {
      const smartStatus = getSmartImportStatus(game.playtimeHours, undefined, undefined);
      // Cap Up Next at 5 — overflow goes to backlog with started flag
      const status = smartStatus === 'on-deck' && breakdown.upNext >= 5 ? 'buried' : smartStatus;

      addGame({
        name: game.name,
        source: 'steam',
        steamAppId: game.appid,
        coverUrl: game.headerUrl,
        category: DEFAULT_CATEGORIES[0],
        vibes: [],
        timeTier: game.playtimeHours > 50 ? 'marathon' : game.playtimeHours > 20 ? 'deep-cut' : game.playtimeHours > 5 ? 'wind-down' : 'quick-hit',
        notes: game.playtimeHours > 0 ? `${game.playtimeHours}h on Steam` : '',
        status,
        hoursPlayed: game.playtimeHours,
      });

      // Track breakdown
      breakdown.total++;
      if (status === 'played') breakdown.completed++;
      else if (status === 'on-deck') breakdown.upNext++;
      else if (game.playtimeHours > 0) breakdown.started++;
      else breakdown.backlog++;

      count++;
    });

    // Save the Steam ID for future playtime refresh
    if (profile) {
      saveSteamId(profile.steamId);
    }

    trackImport('steam', count);

    // Check for cross-platform dupes
    const allGames = useStore.getState().games;
    for (const game of toImport) {
      const nudge = getDupeNudge(game.name, allGames);
      if (nudge) {
        showToast(`${game.name}: ${nudge}`);
        break;
      }
    }

    const smartParts = [];
    if (breakdown.completed > 0) smartParts.push(`${breakdown.completed} already beaten`);
    if (breakdown.upNext > 0) smartParts.push(`${breakdown.upNext} ready to jump back into`);
    const smartMsg = smartParts.length > 0 ? ` ${smartParts.join(', ')}.` : '';
    showToast(`Imported ${count} games from Steam.${smartMsg}`);
    handleClose();
  };

  const handleClose = () => {
    setSteamId('');
    setGames([]);
    setSelected(new Set());
    setProfile(null);
    setError('');
    setStep('input');
    onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Import from Steam"
        className="relative w-full max-w-lg max-h-[85vh] rounded-2xl border overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
          animation: 'scaleIn 300ms ease-out',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-text-primary">🎮 Import from Steam</h2>
          <p className="text-xs text-text-dim mt-1">
            {step === 'input' && 'Enter your Steam username, profile URL, or ID'}
            {step === 'confirm' && 'Is this your account?'}
            {step === 'select' && `${games.length} games found · ${selected.size} selected`}
          </p>
        </div>

        {/* Step 1: Enter Steam ID */}
        {step === 'input' && (
          <div className="px-5 pb-5 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && resolveProfile()}
                placeholder="Username, profile URL, or Steam ID"
                aria-label="Steam ID or profile URL"
                autoFocus
                className="flex-1 text-sm bg-bg-primary border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent-purple"
              />
              <button
                onClick={resolveProfile}
                disabled={loading || !steamId.trim()}
                className="px-4 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30"
                style={{
                  backgroundColor: 'var(--color-accent-purple)',
                  color: '#0a0a0f',
                }}
              >
                {loading ? '...' : 'Find'}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="text-[11px] text-text-faint space-y-1">
              <p>
                <a
                  href="https://steamcommunity.com/my/profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-purple hover:underline"
                >
                  Open your Steam profile →
                </a>
                {' '}and copy the URL from your browser.
              </p>
              <p>Your profile and game details must be set to public.</p>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-3 py-2 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Step 2: Confirm Profile */}
        {step === 'confirm' && profile && (
          <div className="px-5 pb-5 space-y-4">
            <div
              className="flex items-center gap-4 p-4 rounded-xl border"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-active)',
              }}
            >
              <img
                src={profile.avatarUrl}
                alt={profile.personaName}
                className="w-16 h-16 rounded-xl"
              />
              <div>
                <p className="text-base font-bold text-text-primary">{profile.personaName}</p>
                <p className="text-xs text-text-dim font-[family-name:var(--font-mono)] mt-0.5">
                  {profile.steamId}
                </p>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setStep('notme'); setProfile(null); setError(''); }}
                className="flex-1 px-3 py-2.5 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
              >
                Not me
              </button>
              <button
                onClick={fetchGames}
                disabled={loading}
                className="flex-1 px-3 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30"
                style={{
                  backgroundColor: 'var(--color-accent-purple)',
                  color: '#0a0a0f',
                }}
              >
                {loading ? 'Loading...' : "That's me, fetch games"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2b: Not Me — Help find the right account */}
        {step === 'notme' && (
          <div className="px-5 pb-5 space-y-4">
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <p className="text-sm text-text-secondary">
                Steam usernames aren&apos;t unique, so someone else may have that custom URL. Here&apos;s how to find yours:
              </p>
              <ol className="text-xs text-text-muted space-y-2 list-decimal list-inside">
                <li>
                  <a
                    href="https://steamcommunity.com/my"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-purple hover:underline font-medium"
                  >
                    Click here to open your Steam profile
                  </a>
                  {' '}(opens in new tab, you must be logged in)
                </li>
                <li>Copy the <strong className="text-text-secondary">URL from your browser bar</strong>. It&apos;ll look like:
                  <br />
                  <code className="text-accent-purple text-[11px] font-[family-name:var(--font-mono)]">
                    steamcommunity.com/profiles/76561198...
                  </code>
                </li>
                <li>Paste it below</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && resolveProfile()}
                placeholder="Paste your Steam profile URL"
                aria-label="Steam ID or profile URL"
                autoFocus
                className="flex-1 text-sm bg-bg-primary border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent-purple"
              />
              <button
                onClick={resolveProfile}
                disabled={loading || !steamId.trim()}
                className="px-4 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30"
                style={{
                  backgroundColor: 'var(--color-accent-purple)',
                  color: '#0a0a0f',
                }}
              >
                {loading ? '...' : 'Find'}
              </button>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-3 py-2 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Step 3: Select Games */}
        {step === 'select' && (
          <>
            {/* Select controls */}
            <div className="px-5 pb-2 flex items-center gap-2">
              <button
                onClick={toggleAll}
                className="text-xs text-accent-purple hover:underline"
              >
                {selected.size === games.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            {/* Game list */}
            <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-1">
              {games.map((game) => (
                <button
                  key={game.appid}
                  onClick={() => toggleGame(game.appid)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all text-left ${
                    selected.has(game.appid)
                      ? 'border-accent-purple bg-accent-purple/5'
                      : 'border-border-subtle hover:border-border-active'
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selected.has(game.appid)
                        ? 'border-accent-purple bg-accent-purple'
                        : 'border-text-dim'
                    }`}
                  >
                    {selected.has(game.appid) && (
                      <svg className="w-3 h-3 text-bg-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Game icon */}
                  {game.iconUrl && (
                    <img
                      src={game.iconUrl}
                      alt=""
                      className="w-8 h-8 rounded object-cover shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}

                  {/* Game info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{game.name}</p>
                    {game.playtimeHours > 0 && (
                      <p className="text-[11px] text-text-dim font-[family-name:var(--font-mono)]">
                        {game.playtimeHours}h played
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Import button */}
            <div className="px-5 py-3 border-t flex gap-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button
                onClick={() => { setStep('input'); setGames([]); setProfile(null); }}
                className="flex-1 px-3 py-2.5 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={selected.size === 0}
                className="flex-1 px-3 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30"
                style={{
                  backgroundColor: 'var(--color-accent-purple)',
                  color: '#0a0a0f',
                }}
              >
                Import {selected.size} game{selected.size !== 1 ? 's' : ''}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
