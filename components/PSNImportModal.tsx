'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';
import { trackImport } from '@/lib/analytics';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { getDupeNudge } from '@/lib/descriptors';

interface PSNGameData {
  name: string;
  platform: string;
  imageUrl: string;
  lastPlayed: string;
  progress: number;
  trophiesEarned: number;
  trophiesTotal: number;
  hasPlatinum: boolean;
  earnedPlatinum: boolean;
  source: 'purchased' | 'trophy' | 'both';
}

interface PSNImportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PSNImportModal({ open, onClose }: PSNImportModalProps) {
  const [npsso, setNpsso] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState<PSNGameData[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'instructions' | 'paste' | 'select'>('instructions');

  const addGame = useStore((s) => s.addGame);
  const existingGames = useStore((s) => s.games);
  const { showToast } = useToast();

  const fetchGames = useCallback(async () => {
    if (!npsso.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/psn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npsso: npsso.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch PlayStation games');
        setLoading(false);
        return;
      }

      // Filter out games already in library (fuzzy match by name)
      const existingNames = new Set(
        existingGames.map((g) => g.name.toLowerCase().trim())
      );
      const newGames = data.games.filter(
        (g: PSNGameData) => !existingNames.has(g.name.toLowerCase().trim())
      );

      setGames(newGames);
      setSelected(new Set(newGames.map((g: PSNGameData) => g.name)));
      setStep('select');
    } catch {
      setError('Network error. Try again.');
    }
    setLoading(false);
  }, [npsso, existingGames]);

  const toggleGame = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === games.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(games.map((g) => g.name)));
    }
  };

  const handleImport = () => {
    const toImport = games.filter((g) => selected.has(g.name));
    let count = 0;

    toImport.forEach((game) => {
      addGame({
        name: game.name,
        source: 'playstation',
        coverUrl: game.imageUrl || undefined,
        category: DEFAULT_CATEGORIES[0],
        vibes: [],
        timeTier: game.progress > 50 ? 'deep-cut' : 'wind-down',
        notes: game.platform,
        status: game.progress === 100 ? 'played' : 'buried',
        achievements: game.trophiesTotal > 0 ? {
          earned: game.trophiesEarned,
          total: game.trophiesTotal,
          hasPlatinum: game.hasPlatinum,
          earnedPlatinum: game.earnedPlatinum,
        } : undefined,
      });
      count++;
    });

    trackImport('playstation', count);

    // Check for cross-platform dupes
    const allGames = useStore.getState().games;
    for (const game of toImport) {
      const nudge = getDupeNudge(game.name, allGames);
      if (nudge) {
        showToast(`${game.name}: ${nudge}`);
        break;
      }
    }

    showToast(`Imported ${count} PlayStation games. Sony would be proud.`);
    handleClose();
  };

  const handleClose = () => {
    setNpsso('');
    setGames([]);
    setSelected(new Set());
    setError('');
    setStep('instructions');
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
        aria-label="Import from PlayStation"
        className="relative w-full max-w-lg max-h-[85vh] rounded-2xl border overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
          animation: 'scaleIn 300ms ease-out',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-text-primary">🔵 Import from PlayStation</h2>
          <p className="text-xs text-text-dim mt-1">
            {step === 'instructions' && 'Quick setup. Takes about 30 seconds'}
            {step === 'paste' && 'Paste your NPSSO token below'}
            {step === 'select' && `${games.length} games found (full catalog) · ${selected.size} selected`}
          </p>
        </div>

        {/* Step 1: Instructions */}
        {step === 'instructions' && (
          <div className="px-5 pb-5 space-y-4">
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <p className="text-sm font-medium text-text-secondary">
                Sony doesn&apos;t have a public API, but we can use your login session to pull your library. Here&apos;s how:
              </p>
              <ol className="text-xs text-text-muted space-y-3 list-decimal list-inside">
                <li>
                  <a
                    href="https://store.playstation.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-purple hover:underline font-medium"
                  >
                    Log into the PlayStation Store
                  </a>
                  {' '}in your browser (if you aren&apos;t already)
                </li>
                <li>
                  Once logged in, open this URL in the <strong className="text-text-secondary">same browser</strong>:
                  <div className="mt-1.5 flex items-center gap-2">
                    <code
                      className="flex-1 text-accent-purple text-[11px] font-[family-name:var(--font-mono)] bg-bg-primary rounded px-2 py-1.5 select-all cursor-text break-all"
                    >
                      https://ca.account.sony.com/api/v1/ssocookie
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://ca.account.sony.com/api/v1/ssocookie');
                        showToast('URL copied!');
                      }}
                      className="px-2 py-1.5 text-[10px] text-text-dim hover:text-accent-purple rounded border border-border-subtle transition-colors shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                </li>
                <li>
                  You&apos;ll see a page with something like:
                  <code className="block mt-1 text-[11px] font-[family-name:var(--font-mono)] text-text-dim bg-bg-primary rounded px-2 py-1">
                    {`{"npsso":"abc123def456..."}`}
                  </code>
                </li>
                <li>
                  Copy that long string (just the value, not the whole JSON) and paste it on the next screen
                </li>
              </ol>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 px-3 py-2.5 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('paste')}
                className="flex-1 px-3 py-2.5 text-sm font-bold rounded-xl transition-all"
                style={{
                  backgroundColor: 'var(--color-accent-purple)',
                  color: '#0a0a0f',
                }}
              >
                I&apos;ve got the token →
              </button>
            </div>

            <p className="text-[10px] text-text-faint text-center">
              🔒 Your token is only used once to fetch your game list. We don&apos;t store it.
            </p>
          </div>
        )}

        {/* Step 2: Paste NPSSO token */}
        {step === 'paste' && (
          <div className="px-5 pb-5 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={npsso}
                onChange={(e) => setNpsso(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchGames()}
                placeholder="Paste your NPSSO token here"
                aria-label="PSN NPSSO token"
                autoFocus
                className="flex-1 text-sm bg-bg-primary border border-border-subtle rounded-lg px-3 py-2.5 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent-purple font-[family-name:var(--font-mono)]"
              />
              <button
                onClick={fetchGames}
                disabled={loading || !npsso.trim()}
                className="px-4 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30"
                style={{
                  backgroundColor: 'var(--color-accent-purple)',
                  color: '#0a0a0f',
                }}
              >
                {loading ? '...' : 'Fetch'}
              </button>
            </div>

            {loading && (
              <div className="text-center py-4 space-y-2">
                <div className="w-6 h-6 border-2 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-text-dim">Pulling your PlayStation library...</p>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={() => setStep('instructions')}
              className="w-full px-3 py-2 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
            >
              ← Back to instructions
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
                  key={game.name}
                  onClick={() => toggleGame(game.name)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all text-left ${
                    selected.has(game.name)
                      ? 'border-accent-purple bg-accent-purple/5'
                      : 'border-border-subtle hover:border-border-active'
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selected.has(game.name)
                        ? 'border-accent-purple bg-accent-purple'
                        : 'border-text-dim'
                    }`}
                  >
                    {selected.has(game.name) && (
                      <svg className="w-3 h-3 text-bg-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Game icon */}
                  {game.imageUrl && (
                    <img
                      src={game.imageUrl}
                      alt=""
                      className="w-8 h-8 rounded object-cover shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}

                  {/* Game info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{game.name}</p>
                    <p className="text-[11px] text-text-dim font-[family-name:var(--font-mono)]">
                      {game.platform}
                      {game.trophiesEarned > 0 && ` · ${game.trophiesEarned}/${game.trophiesTotal} trophies`}
                      {game.earnedPlatinum && ' 🏆'}
                      {game.source === 'purchased' && ' · Owned, never launched'}
                    </p>
                  </div>

                  {/* Progress */}
                  {game.progress > 0 && (
                    <span
                      className="text-[10px] font-bold font-[family-name:var(--font-mono)] shrink-0 px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: game.progress === 100 ? 'rgba(34,197,94,0.15)' : 'rgba(167,139,250,0.15)',
                        color: game.progress === 100 ? '#22c55e' : '#a78bfa',
                      }}
                    >
                      {game.progress}%
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Import button */}
            <div className="px-5 py-3 border-t flex gap-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button
                onClick={() => { setStep('paste'); setGames([]); }}
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
