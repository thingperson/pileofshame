'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';
import { trackImport } from '@/lib/analytics';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { getDupeNudge } from '@/lib/descriptors';

interface XboxGameData {
  titleId: string;
  name: string;
  imageUrl: string | null;
  achievements: {
    earned: number;
    total: number;
    gamerscore: number;
    totalGamerscore: number;
  } | null;
  lastPlayed: string | null;
  devices: string[];
}

interface XboxProfile {
  xuid: string;
  gamertag: string;
  avatarUrl: string | null;
  gamerscore: string;
}

interface XboxImportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function XboxImportModal({ open, onClose }: XboxImportModalProps) {
  const [gamertag, setGamertag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<XboxProfile | null>(null);
  const [games, setGames] = useState<XboxGameData[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'input' | 'confirm' | 'select'>('input');

  const addGame = useStore((s) => s.addGame);
  const existingGames = useStore((s) => s.games);
  const { showToast } = useToast();

  const resolveProfile = useCallback(async () => {
    if (!gamertag.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/xbox?gamertag=${encodeURIComponent(gamertag.trim())}&action=resolve`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not find that gamertag.');
        setLoading(false);
        return;
      }

      setProfile(data.profile);
      setStep('confirm');
    } catch {
      setError('Failed to connect. Try again.');
    }
    setLoading(false);
  }, [gamertag]);

  const fetchGames = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/xbox?xuid=${profile.xuid}&action=games`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not load games.');
        setLoading(false);
        return;
      }

      setGames(data.games);
      // Pre-select games not already imported
      const existingNames = new Set(existingGames.map((g) => g.name.toLowerCase()));
      const newSelected = new Set<string>();
      data.games.forEach((g: XboxGameData) => {
        if (!existingNames.has(g.name.toLowerCase())) {
          newSelected.add(g.titleId);
        }
      });
      setSelected(newSelected);
      setStep('select');
    } catch {
      setError('Failed to fetch games.');
    }
    setLoading(false);
  }, [profile, existingGames]);

  const toggleGame = (titleId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(titleId)) next.delete(titleId);
      else next.add(titleId);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(games.map((g) => g.titleId)));
  const deselectAll = () => setSelected(new Set());

  const handleImport = () => {
    const toImport = games.filter((g) => selected.has(g.titleId));
    for (const game of toImport) {
      addGame({
        name: game.name,
        source: 'xbox',
        status: 'buried',
        category: DEFAULT_CATEGORIES[0],
        vibes: [],
        timeTier: 'wind-down',
        notes: '',
        coverUrl: game.imageUrl || undefined,
        achievements: game.achievements ? {
          earned: game.achievements.earned,
          total: game.achievements.total,
          gamerscore: game.achievements.gamerscore,
          totalGamerscore: game.achievements.totalGamerscore,
        } : undefined,
      });
    }
    trackImport('xbox', toImport.length);

    // Check for cross-platform dupes
    const allGames = useStore.getState().games;
    for (const game of toImport) {
      const nudge = getDupeNudge(game.name, allGames);
      if (nudge) {
        showToast(`${game.name}: ${nudge}`);
        break;
      }
    }

    showToast(`Imported ${toImport.length} Xbox games.`);
    handleClose();
  };

  const handleClose = () => {
    setStep('input');
    setGamertag('');
    setProfile(null);
    setGames([]);
    setSelected(new Set());
    setError('');
    onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  if (!open) return null;

  const existingNames = new Set(existingGames.map((g) => g.name.toLowerCase()));

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Import from Xbox"
        className="relative w-full max-w-lg max-h-[85vh] rounded-2xl border p-5 space-y-4 animate-[scaleIn_300ms_ease-out] flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
        }}
      >
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          Import from Xbox
        </h2>

        {step === 'input' && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Enter your Xbox Gamertag to import your game history.
            </p>
            <input
              type="text"
              value={gamertag}
              onChange={(e) => setGamertag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && resolveProfile()}
              placeholder="Gamertag"
              aria-label="Xbox Gamertag"
              autoFocus
              className="w-full text-sm bg-bg-primary border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent-purple"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resolveProfile}
                disabled={!gamertag.trim() || loading}
                className="flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30"
                style={{ backgroundColor: '#107c10', color: 'white' }}
              >
                {loading ? 'Searching...' : 'Find Profile'}
              </button>
            </div>
            <p className="text-xs text-text-faint">
              Your Xbox profile and game history must be set to public.
            </p>
          </div>
        )}

        {step === 'confirm' && profile && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              {profile.avatarUrl && (
                <img src={profile.avatarUrl} alt="" className="w-12 h-12 rounded-full bg-bg-primary" />
              )}
              <div>
                <p className="text-sm font-medium text-text-primary">{profile.gamertag}</p>
                <p className="text-xs text-text-dim font-[family-name:var(--font-mono)]">
                  Gamerscore: {profile.gamerscore}
                </p>
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setStep('input'); setProfile(null); }}
                className="flex-1 px-4 py-2.5 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
              >
                Not me
              </button>
              <button
                onClick={fetchGames}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30"
                style={{ backgroundColor: '#107c10', color: 'white' }}
              >
                {loading ? 'Loading games...' : "That's me"}
              </button>
            </div>
          </div>
        )}

        {step === 'select' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-dim font-[family-name:var(--font-mono)]">
                {selected.size} selected · {games.length} games
              </span>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-accent-purple hover:underline">All</button>
                <button onClick={deselectAll} className="text-xs text-text-dim hover:text-text-muted">None</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 min-h-0 max-h-[50vh]">
              {games.map((game) => {
                const isExisting = existingNames.has(game.name.toLowerCase());
                return (
                  <label
                    key={game.titleId}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      selected.has(game.titleId) ? 'bg-white/5' : ''
                    } ${isExisting ? 'opacity-40' : 'hover:bg-white/5'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(game.titleId)}
                      onChange={() => toggleGame(game.titleId)}
                      className="rounded accent-green-600"
                    />
                    {game.imageUrl ? (
                      <img src={game.imageUrl} alt="" className="w-10 h-10 rounded object-cover bg-bg-primary shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-bg-primary shrink-0 flex items-center justify-center text-text-faint text-xs">🎮</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{game.name}</p>
                      <p className="text-xs text-text-dim font-[family-name:var(--font-mono)]">
                        {game.achievements && `${game.achievements.earned}/${game.achievements.total} achievements`}
                        {game.lastPlayed && ` · Last: ${new Date(game.lastPlayed).toLocaleDateString()}`}
                        {isExisting && ' · already imported'}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={selected.size === 0}
                className="flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30"
                style={{ backgroundColor: '#107c10', color: 'white' }}
              >
                Import {selected.size} Games
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
