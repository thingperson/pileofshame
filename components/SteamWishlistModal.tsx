'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';
import { trackImport } from '@/lib/analytics';
import { DEFAULT_CATEGORIES } from '@/lib/constants';

interface WishlistGame {
  appid: number;
  name: string;
  headerUrl: string;
  reviewScore: number;
  releaseDate: string;
  tags: string[];
  isFree: boolean;
}

interface SteamProfile {
  steamId: string;
  personaName: string;
  avatarUrl: string;
  profileUrl: string;
}

interface SteamWishlistModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SteamWishlistModal({ open, onClose }: SteamWishlistModalProps) {
  const [steamId, setSteamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [games, setGames] = useState<WishlistGame[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [step, setStep] = useState<'input' | 'confirm' | 'select'>('input');

  const addGame = useStore((s) => s.addGame);
  const existingGames = useStore((s) => s.games);
  const { showToast } = useToast();

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

  const fetchWishlist = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/steam?steamId=${encodeURIComponent(profile.steamId)}&action=wishlist`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch wishlist');
        setLoading(false);
        return;
      }

      // Filter out games already in library
      const existingSteamIds = new Set(existingGames.filter(g => g.steamAppId).map(g => g.steamAppId));
      const existingNames = new Set(existingGames.map(g => g.name.toLowerCase()));
      const newGames = data.games.filter(
        (g: WishlistGame) => !existingSteamIds.has(g.appid) && !existingNames.has(g.name.toLowerCase())
      );

      setGames(newGames);
      setSelected(new Set(newGames.map((g: WishlistGame) => g.appid)));
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

    toImport.forEach((game) => {
      addGame({
        name: game.name,
        source: 'steam',
        steamAppId: game.appid,
        coverUrl: game.headerUrl,
        category: DEFAULT_CATEGORIES[0],
        vibes: [],
        timeTier: 'deep-cut', // assume wishlist games are deep cuts until we know better
        notes: game.tags.length > 0 ? game.tags.join(', ') : '',
        status: 'buried',
        isWishlisted: true,
      });
      count++;
    });

    trackImport('steam-wishlist', count);
    showToast(`Added ${count} wishlist games. Deals will surface when prices drop.`);
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
        aria-label="Import Steam Wishlist"
        className="relative w-full max-w-lg max-h-[85vh] rounded-2xl border overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
          animation: 'scaleIn 300ms ease-out',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-text-primary">⭐ Import Steam Wishlist</h2>
          <p className="text-xs text-text-dim mt-1">
            {step === 'input' && 'Import your wishlist to track deals and price drops'}
            {step === 'confirm' && 'Is this your account?'}
            {step === 'select' && `${games.length} wishlist games found · ${selected.size} selected`}
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

            <div
              className="rounded-lg p-3 text-[11px] text-text-dim space-y-1"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <p className="text-text-muted font-medium">Why import your wishlist?</p>
              <p>We&apos;ll flag when games on your list go on sale, so you can grab them at the right price and add them to your pile.</p>
              <p className="pt-1">
                <a
                  href="https://store.steampowered.com/wishlist/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-purple hover:underline"
                >
                  Open your Steam wishlist →
                </a>
                {' '}to find your profile URL.
              </p>
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
                onClick={() => { setStep('input'); setProfile(null); setError(''); }}
                className="flex-1 px-3 py-2.5 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
              >
                Not me
              </button>
              <button
                onClick={fetchWishlist}
                disabled={loading}
                className="flex-1 px-3 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30"
                style={{
                  backgroundColor: 'var(--color-accent-purple)',
                  color: '#0a0a0f',
                }}
              >
                {loading ? 'Loading...' : "That's me, fetch wishlist"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Games */}
        {step === 'select' && (
          <>
            <div className="px-5 pb-2 flex items-center gap-2">
              <button
                onClick={toggleAll}
                className="text-xs text-accent-purple hover:underline"
              >
                {selected.size === games.length ? 'Deselect all' : 'Select all'}
              </button>
              {games.length === 0 && (
                <span className="text-xs text-text-dim">
                  All your wishlist games are already in your library!
                </span>
              )}
            </div>

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

                  <img
                    src={game.headerUrl}
                    alt=""
                    className="w-16 h-8 rounded object-cover shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{game.name}</p>
                    <div className="flex gap-2 text-[10px] text-text-faint font-[family-name:var(--font-mono)]">
                      {game.releaseDate && <span>{game.releaseDate}</span>}
                      {game.tags.length > 0 && <span>{game.tags.join(', ')}</span>}
                      {game.isFree && <span className="text-green-400">Free</span>}
                    </div>
                  </div>

                  <span className="text-sm shrink-0">⭐</span>
                </button>
              ))}
            </div>

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
