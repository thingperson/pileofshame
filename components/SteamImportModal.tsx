'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';
import { trackImport } from '@/lib/analytics';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { getDupeNudge } from '@/lib/descriptors';

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

// Deep link to the Steam privacy page where "Game details" lives. Owned-games
// fetches require that field set to Public — OpenID identifies the user but
// doesn't grant access to a private library.
const STEAM_PRIVACY_URL = 'https://steamcommunity.com/my/edit/settings';

interface SteamImportModalProps {
  open: boolean;
  onClose: () => void;
  // When set (full-page redirect fallback return), skip straight to importing
  // this already-verified SteamID64.
  initialSteamId?: string;
}

export default function SteamImportModal({ open, onClose, initialSteamId }: SteamImportModalProps) {
  const [steamId, setSteamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [games, setGames] = useState<SteamGameData[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [step, setStep] = useState<'input' | 'confirm' | 'notme' | 'select' | 'loading' | 'private'>('input');

  const addGame = useStore((s) => s.addGame);
  const existingGames = useStore((s) => s.games);
  const { showToast } = useToast();

  // OpenID popup bookkeeping: did a verified message arrive, and when did we
  // open the popup (to tell a blocker-killed window from a real user cancel).
  const gotMessageRef = useRef(false);
  const popupOpenedAtRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const consumedInitialRef = useRef(false);

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
      setError('Steam ghosted us. Try again in a sec?');
    }
    setLoading(false);
  }, [steamId]);

  const fetchGames = useCallback(async (targetId?: string) => {
    const id = targetId ?? profile?.steamId;
    if (!id) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/steam?steamId=${encodeURIComponent(id)}`);
      const data = await res.json();

      if (!res.ok) {
        // Private game-details is the common failure here — route the user to
        // the fix rather than a dead-end error.
        setError(data.error || 'Steam ghosted us. Try again in a sec?');
        setStep('private');
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
      setError('Steam ghosted us. Try again in a sec?');
    }
    setLoading(false);
  }, [profile, existingGames]);

  // OpenID gave us a cryptographically verified SteamID — no "is this you?"
  // step needed. Grab the profile for display (best-effort), then pull games.
  const importViaVerifiedId = useCallback(async (verifiedId: string) => {
    setSigningIn(false);
    setError('');
    setStep('loading');
    try {
      const res = await fetch(`/api/steam?steamId=${encodeURIComponent(verifiedId)}&action=resolve`);
      const data = await res.json();
      // resolve can fail on a fully-private profile; keep going with the
      // verified id and a placeholder so the library fetch still gets its shot.
      setProfile(
        res.ok && data.profile
          ? data.profile
          : { steamId: verifiedId, personaName: 'your Steam account', avatarUrl: '', profileUrl: '' }
      );
    } catch {
      setProfile({ steamId: verifiedId, personaName: 'your Steam account', avatarUrl: '', profileUrl: '' });
    }
    await fetchGames(verifiedId);
  }, [fetchGames]);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  // Primary flow: open Steam's sign-in in a popup. If the browser blocks it,
  // fall back to a full-page redirect (top-level navigation is never blocked).
  const signInWithSteam = useCallback(() => {
    setError('');
    gotMessageRef.current = false;
    setSigningIn(true);

    const w = 520, h = 660;
    const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
    let popup: Window | null = null;
    try {
      popup = window.open(
        '/api/steam/openid',
        'steam_openid',
        `popup,width=${w},height=${h},left=${left},top=${top}`,
      );
    } catch {
      popup = null;
    }

    // Hard block: window.open returned nothing → redirect in place.
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.location.href = '/api/steam/openid';
      return;
    }

    // Soft block: some blockers open then instantly kill the window. Poll for
    // closure — if it dies before we hear back AND almost immediately, treat it
    // as blocked and redirect; a later close with no message is a user cancel.
    popupOpenedAtRef.current = Date.now();
    stopPolling();
    pollRef.current = setInterval(() => {
      if (!popup || !popup.closed) return;
      stopPolling();
      if (gotMessageRef.current) return; // success handler already took over
      const elapsed = Date.now() - popupOpenedAtRef.current;
      if (elapsed < 1500) {
        window.location.href = '/api/steam/openid';
      } else {
        setSigningIn(false); // user closed it themselves
      }
    }, 400);
  }, []);

  // Receive the verified SteamID back from the popup callback page.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { type?: string; steamId?: string | null; error?: string | null };
      if (!d || d.type !== 'steam-openid') return;
      gotMessageRef.current = true;
      stopPolling();
      if (d.error || !d.steamId) {
        setSigningIn(false);
        if (d.error === 'cancelled') return; // user backed out — no scolding
        setError("Steam sign-in didn't go through. Try again, or enter your ID manually below.");
        setManualOpen(true);
        return;
      }
      importViaVerifiedId(d.steamId);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [open, importViaVerifiedId]);

  // Full-page redirect fallback return: /?steam_openid=<id> handed down as prop.
  useEffect(() => {
    if (open && initialSteamId && !consumedInitialRef.current) {
      consumedInitialRef.current = true;
      importViaVerifiedId(initialSteamId);
    }
  }, [open, initialSteamId, importViaVerifiedId]);

  useEffect(() => () => stopPolling(), []);

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

  // Default-import only games the user hasn't started — fast path for
  // big libraries where scrolling 500 games to deselect played ones is
  // the actual bottleneck.
  const selectOnlyUnplayed = () => {
    setSelected(new Set(games.filter((g) => g.playtimeHours === 0).map((g) => g.appid)));
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
        timeTier: game.playtimeHours > 50 ? 'marathon' : game.playtimeHours > 20 ? 'deep-cut' : game.playtimeHours > 5 ? 'wind-down' : 'quick-hit',
        notes: game.playtimeHours > 0 ? `${game.playtimeHours}h on Steam` : '',
        status: 'buried',
        hoursPlayed: game.playtimeHours,
      });

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

    showToast(`Imported ${count} games from Steam.`);
    handleClose();
  };

  const handleClose = () => {
    stopPolling();
    gotMessageRef.current = false;
    setSteamId('');
    setGames([]);
    setSelected(new Set());
    setProfile(null);
    setError('');
    setSigningIn(false);
    setManualOpen(false);
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
            {step === 'input' && 'One tap. Sign in through Steam and we’ll pull your library.'}
            {step === 'confirm' && 'Is this your account?'}
            {step === 'loading' && 'Pulling your library…'}
            {step === 'private' && 'Almost there.'}
            {step === 'select' && `${games.length} games found · ${selected.size} selected`}
          </p>
        </div>

        {/* Step 1: Sign in through Steam (primary) + manual fallback */}
        {step === 'input' && (
          <div className="px-5 pb-5 space-y-3">
            <button
              onClick={signInWithSteam}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-accent-purple)', color: '#0a0a0f' }}
            >
              {signingIn ? 'Waiting for Steam…' : 'Sign in through Steam'}
            </button>

            <p className="text-xs text-text-dim text-center">
              Opens Steam&apos;s own sign-in. We never see your password.
            </p>

            <div className="text-xs text-text-faint flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span>
                Heads up: your Steam <strong className="text-text-dim">game details</strong> need to be set to Public.
              </span>
              <a
                href={STEAM_PRIVACY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-purple hover:underline"
              >
                Check your setting →
              </a>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Fallback: manual ID entry, collapsed by default */}
            <div className="pt-1">
              <button
                onClick={() => setManualOpen((v) => !v)}
                className="text-xs text-text-dim hover:text-text-muted transition-colors"
              >
                {manualOpen ? 'Hide manual entry' : 'Trouble signing in? Enter your ID manually'}
              </button>

              {manualOpen && (
                <div className="mt-3 space-y-2">
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
                      style={{ backgroundColor: 'var(--color-accent-purple)', color: '#0a0a0f' }}
                    >
                      {loading ? '...' : 'Find'}
                    </button>
                  </div>
                  <p className="text-xs text-text-faint">
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
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-full px-3 py-2 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Loading: verified via OpenID, pulling the library */}
        {step === 'loading' && (
          <div className="px-5 pb-10 pt-4 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
            <p className="text-sm text-text-muted">Pulling your library from Steam…</p>
          </div>
        )}

        {/* Private profile: signed in, but game details aren't public */}
        {step === 'private' && (
          <div className="px-5 pb-5 space-y-4">
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-subtle)' }}
            >
              <p className="text-sm text-text-secondary">
                You&apos;re signed in. Steam&apos;s just keeping your games to itself. Flip{' '}
                <strong className="text-text-primary">Game details</strong> to{' '}
                <strong className="text-text-primary">Public</strong>{' '}and we&apos;ll grab them.
              </p>
              <a
                href={STEAM_PRIVACY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent-purple hover:underline"
              >
                Open Steam privacy settings →
              </a>
              <p className="text-xs text-text-dim">
                Set <strong className="text-text-secondary">Game details</strong> to Public, save, then retry.
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setStep('input'); setError(''); }}
                className="flex-1 px-3 py-2.5 text-sm text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => fetchGames(profile?.steamId)}
                disabled={loading || !profile}
                className="flex-1 px-3 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-30"
                style={{ backgroundColor: 'var(--color-accent-purple)', color: '#0a0a0f' }}
              >
                {loading ? 'Checking…' : 'Try again'}
              </button>
            </div>
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
                onClick={() => fetchGames()}
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
                  <code className="text-accent-purple text-xs font-[family-name:var(--font-mono)]">
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
            <div className="px-5 pb-2 flex items-center gap-3 flex-wrap">
              <button
                onClick={toggleAll}
                className="text-xs text-accent-purple hover:underline"
              >
                {selected.size === games.length ? 'Deselect all' : 'Select all'}
              </button>
              {games.some((g) => g.playtimeHours > 0) && (
                <button
                  onClick={selectOnlyUnplayed}
                  className="text-xs text-accent-purple hover:underline"
                  title="Only select games you haven't started yet"
                >
                  Hide what I&apos;ve played
                </button>
              )}
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
                      <p className="text-xs text-text-dim font-[family-name:var(--font-mono)]">
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
