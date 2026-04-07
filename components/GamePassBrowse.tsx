'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Game, MoodTag } from '@/lib/types';
import { useStore } from '@/lib/store';
import { inferMoodTags } from '@/lib/enrichment';
import { MOOD_TAG_CONFIG } from '@/lib/enrichment';
import { pickWeighted, getEligibleGames, REROLL_MODES, RerollMode } from '@/lib/reroll';
import { getGameDescriptor } from '@/lib/descriptors';
import { TIME_TIER_CONFIG } from '@/lib/constants';
import { useToast } from './Toast';

type SubService = 'gamepass' | 'psplus';

interface GamePassGame {
  productId: string;
  name: string;
  imageUrl: string;
  description: string;
  genres: string[];
  platforms: ('PC' | 'Console')[] | string[];
  tier?: string;
}

const ALL_MOODS: MoodTag[] = ['chill', 'intense', 'story-rich', 'brainless', 'atmospheric', 'competitive', 'spooky', 'creative', 'strategic', 'emotional'];

const SERVICE_CONFIG: Record<SubService, {
  label: string;
  icon: string;
  color: string;
  badgeColor: string;
  badgeText: string;
  gradient: string;
  source: Game['source'];
  apiEndpoint: string;
  quips: string[];
}> = {
  gamepass: {
    label: 'Game Pass',
    icon: '🟩',
    color: '#2ecc40',
    badgeColor: 'rgba(16, 124, 16, 0.15)',
    badgeText: 'On Game Pass',
    gradient: 'linear-gradient(135deg, #107c10, #2ecc40)',
    source: 'xbox',
    apiEndpoint: '/api/gamepass',
    quips: [
      "400 games and you're scrolling the store. Classic.",
      "Your subscription is judging you.",
      "Microsoft gave you the buffet. Let us fill your plate.",
      "You're paying for these whether you play them or not.",
      "The catalog rotates. Your indecision doesn't.",
    ],
  },
  psplus: {
    label: 'PS+',
    icon: '🔵',
    color: '#003791',
    badgeColor: 'rgba(0, 55, 145, 0.15)',
    badgeText: 'On PS+',
    gradient: 'linear-gradient(135deg, #003791, #0070d1)',
    source: 'playstation',
    apiEndpoint: '/api/psplus',
    quips: [
      "Sony gave you the catalog. You gave them your wallet.",
      "Hundreds of games. You played Astro Bot twice.",
      "Your PS+ is renewing next month. Make it worth it.",
      "The catalog rotates. Your pile doesn't.",
      "Extra tier, extra guilt.",
    ],
  },
};

const GAMEPASS_QUIPS = SERVICE_CONFIG.gamepass.quips;

function getRandomQuip(): string {
  return GAMEPASS_QUIPS[Math.floor(Math.random() * GAMEPASS_QUIPS.length)];
}

/** Guess a time tier from genres (no HLTB data for Game Pass catalog) */
function guessTimeTier(genres: string[]): Game['timeTier'] {
  const g = genres.map((s) => s.toLowerCase());
  if (g.some((s) => s.includes('puzzle') || s.includes('arcade') || s.includes('card') || s.includes('casual'))) return 'quick-hit';
  if (g.some((s) => s.includes('platformer') || s.includes('racing') || s.includes('sports') || s.includes('fighting'))) return 'wind-down';
  if (g.some((s) => s.includes('rpg') || s.includes('strategy') || s.includes('simulation'))) return 'marathon';
  return 'deep-cut';
}

/** Convert a Game Pass catalog entry into a Game object for the reroll engine */
function gamePassToGame(gp: GamePassGame): Game {
  const moods = inferMoodTags(gp.name, gp.genres);
  const timeTier = guessTimeTier(gp.genres);

  return {
    id: `gamepass-${gp.productId}`,
    name: gp.name,
    source: 'xbox',
    coverUrl: gp.imageUrl,
    description: gp.description,
    genres: gp.genres,
    moodTags: moods.length > 0 ? moods : undefined,
    timeTier: timeTier || 'deep-cut',
    category: 'The Pile',
    vibes: [],
    priority: 0,
    notes: '',
    status: 'buried',
    hoursPlayed: 0,
    installed: false,
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enrichedAt: new Date().toISOString(),
  };
}

interface GamePassBrowseProps {
  open: boolean;
  onClose: () => void;
}

export default function GamePassBrowse({ open, onClose }: GamePassBrowseProps) {
  const [service, setService] = useState<SubService>('gamepass');
  const [catalogs, setCatalogs] = useState<Record<SubService, GamePassGame[]>>({ gamepass: [], psplus: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<RerollMode>('anything');
  const [moodFilters, setMoodFilters] = useState<MoodTag[]>([]);
  const [currentPick, setCurrentPick] = useState<Game | null>(null);
  const [rolling, setRolling] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [recentPicks, setRecentPicks] = useState<Game[]>([]);
  const [rollCount, setRollCount] = useState(0);
  const [quip, setQuip] = useState(getRandomQuip);
  const [platformFilter, setPlatformFilter] = useState<'all' | 'PC' | 'Console'>('all');

  const svc = SERVICE_CONFIG[service];
  const catalog = catalogs[service];

  const addGame = useStore((s) => s.addGame);
  const existingGames = useStore((s) => s.games);
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  // Convert full catalog to Game objects for the reroll engine
  const catalogAsGames = useMemo(() => {
    return catalog
      .filter((gp) => platformFilter === 'all' || gp.platforms.includes(platformFilter))
      .map((gp) => {
        const game = gamePassToGame(gp);
        game.source = svc.source;
        game.id = `${service}-${gp.productId}`;
        return game;
      });
  }, [catalog, platformFilter, service, svc.source]);

  // Check if a game is already in user's library
  const isInLibrary = useCallback((name: string) => {
    const lower = name.toLowerCase();
    return existingGames.some((g) => g.name.toLowerCase() === lower);
  }, [existingGames]);

  // Fetch catalog on open or service switch
  useEffect(() => {
    if (!open) return;
    if (catalogs[service].length > 0) return; // Already loaded for this service

    setLoading(true);
    setError('');

    fetch(svc.apiEndpoint)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load catalog');
        return res.json();
      })
      .then((data) => {
        setCatalogs((prev) => ({ ...prev, [service]: data.games || [] }));
      })
      .catch(() => {
        setError(`Couldn't load the ${svc.label} catalog. Try again in a sec.`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, service, catalogs, svc.apiEndpoint, svc.label]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setCurrentPick(null);
      setRolling(false);
      setRevealed(false);
      setSkippedIds(new Set());
      setRecentPicks([]);
      setRollCount(0);
      setMoodFilters([]);
      setMode('anything');
      setQuip(getRandomQuip());
    }
  }, [open]);

  const toggleMood = useCallback((mood: MoodTag) => {
    setMoodFilters((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  }, []);

  const doRoll = useCallback((overrideMode?: RerollMode) => {
    const rollMode = overrideMode || mode;
    const eligible = getEligibleGames(catalogAsGames, rollMode, 'any', moodFilters);

    // Filter out games already in library
    const fresh = eligible.filter((g) => !isInLibrary(g.name));

    const pick = pickWeighted(fresh, skippedIds, recentPicks);
    if (!pick) {
      showToast(moodFilters.length > 0
        ? `No ${svc.label} games match that mood. Try removing a filter.`
        : 'No games match this mode. The catalog might still be loading.');
      return;
    }

    // Track skipped
    if (currentPick) {
      setRecentPicks((prev) => [...prev, currentPick].slice(-3));
      setSkippedIds((prev) => new Set(prev).add(currentPick.id));
    }

    setRollCount((c) => c + 1);
    setRolling(true);
    setRevealed(false);

    setTimeout(() => {
      setCurrentPick(pick);
      setRolling(false);
      setRevealed(true);
    }, 500);
  }, [catalogAsGames, mode, moodFilters, currentPick, skippedIds, recentPicks, showToast, isInLibrary]);

  const handleAddToLibrary = useCallback((game: Game) => {
    if (isInLibrary(game.name)) {
      showToast(`${game.name} is already in your library.`);
      return;
    }

    addGame({
      name: game.name,
      source: svc.source,
      coverUrl: game.coverUrl,
      description: game.description,
      genres: game.genres,
      moodTags: game.moodTags,
      timeTier: game.timeTier,
      category: 'The Pile',
      vibes: [],
      notes: `Added from ${svc.label}`,
      status: 'buried',
      enrichedAt: game.enrichedAt,
    });

    showToast(`${game.name} added to your pile. Now go play it.`);
  }, [addGame, showToast, isInLibrary, svc]);

  const handleAddAndPlay = useCallback((game: Game) => {
    if (isInLibrary(game.name)) {
      showToast(`${game.name} is already in your library.`);
      return;
    }

    addGame({
      name: game.name,
      source: svc.source,
      coverUrl: game.coverUrl,
      description: game.description,
      genres: game.genres,
      moodTags: game.moodTags,
      timeTier: game.timeTier,
      category: 'The Pile',
      vibes: [],
      notes: `Added from ${svc.label}`,
      status: 'playing',
      enrichedAt: game.enrichedAt,
    });

    showToast(`${game.name} added and set to Playing. Go.`);
    onClose();
  }, [addGame, showToast, isInLibrary, onClose]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Game Pass Pick"
        className="relative w-full max-w-lg max-h-[90vh] rounded-2xl border overflow-hidden overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
          animation: 'scaleIn 400ms ease-out',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 text-center">
          {/* Service tabs */}
          <div className="flex justify-center gap-1 mb-3">
            {(Object.keys(SERVICE_CONFIG) as SubService[]).map((s) => {
              const cfg = SERVICE_CONFIG[s];
              const active = service === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    if (s !== service) {
                      setService(s);
                      setCurrentPick(null);
                      setRolling(false);
                      setRevealed(false);
                      setSkippedIds(new Set());
                      setRecentPicks([]);
                      setRollCount(0);
                      setQuip(cfg.quips[Math.floor(Math.random() * cfg.quips.length)]);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    active ? 'text-white scale-[1.02]' : 'text-text-dim hover:text-text-muted opacity-60'
                  }`}
                  style={active ? { background: cfg.gradient } : { backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
            {svc.icon} {svc.label} Pick
          </h2>
          <p className="text-xs text-text-dim mt-1 font-[family-name:var(--font-mono)]">
            {loading ? 'Loading the catalog...' : currentPick ? `Roll ${rollCount}` : quip}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="px-5 pb-5 text-center">
            <div className="text-4xl mb-3 animate-bounce">{svc.icon}</div>
            <p className="text-sm text-text-muted">Grabbing the {svc.label} catalog...</p>
            <p className="text-xs text-text-faint mt-1 font-[family-name:var(--font-mono)]">This takes a few seconds the first time. We cache it after.</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-5 pb-5 text-center">
            <p className="text-sm text-text-muted mb-3">{error}</p>
            <button
              onClick={() => { setCatalogs((prev) => ({ ...prev, [service]: [] })); setError(''); }}
              className="px-4 py-2 text-sm text-text-secondary rounded-xl border border-border-subtle hover:border-accent-purple transition-all"
            >
              Try again
            </button>
          </div>
        )}

        {/* Mode Selector (before first roll, catalog loaded) */}
        {!loading && !error && catalog.length > 0 && !currentPick && (
          <div className="px-5 pb-4">
            {/* Catalog stats */}
            <p className="text-xs text-text-faint font-[family-name:var(--font-mono)] text-center mb-3">
              {catalog.length} games in the catalog right now
            </p>

            {/* Platform filter (Game Pass only — PS+ uses PS4/PS5 which aren't filterable the same way) */}
            {service === 'gamepass' && (
              <div className="flex justify-center gap-1.5 mb-3">
                {(['all', 'PC', 'Console'] as const).map((pf) => (
                  <button
                    key={pf}
                    onClick={() => setPlatformFilter(pf)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium font-[family-name:var(--font-mono)] transition-all ${
                      platformFilter === pf
                        ? 'bg-white/10 text-text-primary'
                        : 'text-text-dim hover:text-text-muted hover:bg-white/5'
                    }`}
                  >
                    {pf === 'all' ? 'All' : pf}
                  </button>
                ))}
              </div>
            )}

            {/* Mode buttons */}
            <div className="grid grid-cols-2 gap-2">
              {REROLL_MODES.filter((m) => m.mode !== 'continue').map(({ mode: m, label, icon, description }) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-2.5 rounded-xl text-left border transition-all ${
                    mode === m
                      ? 'border-accent-purple'
                      : 'border-border-subtle hover:border-border-active'
                  }`}
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <div className="text-sm font-medium text-text-primary">
                    {icon} {label}
                  </div>
                  <div className="text-xs text-text-dim mt-0.5">{description}</div>
                </button>
              ))}
            </div>

            {/* Mood filter pills */}
            <div className="mt-3">
              <p className="text-xs text-text-dim font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1.5">Mood</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_MOODS.map((mood) => {
                  const config = MOOD_TAG_CONFIG[mood];
                  const active = moodFilters.includes(mood);
                  return (
                    <button
                      key={mood}
                      onClick={() => toggleMood(mood)}
                      className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        active
                          ? 'scale-[1.02]'
                          : 'opacity-60 hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: active ? `${config.color}25` : 'rgba(255,255,255,0.05)',
                        color: active ? config.color : 'var(--color-text-dim)',
                        border: active ? `1px solid ${config.color}50` : '1px solid transparent',
                      }}
                    >
                      {config.icon} {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => doRoll()}
              className="w-full mt-3 px-4 py-3 text-base font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: svc.gradient,
                color: '#fff',
              }}
            >
              🎲 Pick from {svc.label}
            </button>
          </div>
        )}

        {/* Current Pick */}
        {currentPick && (
          <div className={`px-5 pb-5 transition-all duration-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
            {/* Mode switcher pills */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-2">
              {REROLL_MODES.filter((m) => m.mode !== 'continue').map(({ mode: m, icon, label }) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); doRoll(m); }}
                  className={`px-3 py-2 rounded-full text-xs font-medium font-[family-name:var(--font-mono)] transition-all ${
                    mode === m
                      ? 'bg-white/10 text-text-primary'
                      : 'text-text-dim hover:text-text-muted hover:bg-white/5'
                  }`}
                  title={label}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Mood filter pills (compact) */}
            <div className="flex flex-wrap justify-center gap-1 mb-4">
              {ALL_MOODS.map((mood) => {
                const config = MOOD_TAG_CONFIG[mood];
                const active = moodFilters.includes(mood);
                return (
                  <button
                    key={mood}
                    onClick={() => toggleMood(mood)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                      active ? 'scale-[1.02]' : 'opacity-50 hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: active ? `${config.color}25` : 'transparent',
                      color: active ? config.color : 'var(--color-text-dim)',
                    }}
                  >
                    {config.icon} {config.label}
                  </button>
                );
              })}
            </div>

            {/* Game reveal */}
            <div
              className="rounded-xl border overflow-hidden mb-4 text-center"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-active)',
              }}
            >
              {/* Cover art hero */}
              {currentPick.coverUrl ? (
                <div className="relative w-full h-40 sm:h-48 overflow-hidden">
                  <img
                    src={currentPick.coverUrl}
                    alt={currentPick.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] via-transparent to-transparent" />
                </div>
              ) : (
                <div className="w-full h-24 flex items-center justify-center text-4xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  {svc.icon}
                </div>
              )}
              <div className="px-5 pb-5 pt-3">
                <h3 className="text-xl font-bold text-text-primary mb-1">
                  {currentPick.name}
                </h3>

                {/* Game Pass badge + already in library badge */}
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider"
                    style={{ backgroundColor: svc.badgeColor, color: svc.color }}
                  >
                    {svc.badgeText}
                  </span>
                  {isInLibrary(currentPick.name) && (
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider"
                      style={{ backgroundColor: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa' }}
                    >
                      Already in your pile
                    </span>
                  )}
                </div>

                {/* Metadata row */}
                <div className="flex flex-wrap justify-center gap-3 text-xs text-text-dim font-[family-name:var(--font-mono)]">
                  {currentPick.timeTier && (
                    <span>{TIME_TIER_CONFIG[currentPick.timeTier].icon} {TIME_TIER_CONFIG[currentPick.timeTier].label}</span>
                  )}
                  {currentPick.genres && currentPick.genres.length > 0 && (
                    <span>{currentPick.genres.slice(0, 2).join(', ')}</span>
                  )}
                </div>

                {/* Description */}
                {currentPick.description && (
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    {currentPick.description}
                  </p>
                )}

                {/* Descriptor */}
                {(() => {
                  const desc = getGameDescriptor(currentPick.name, currentPick.metacritic, currentPick.genres);
                  return desc ? (
                    <p
                      className="text-sm mt-3 leading-relaxed italic"
                      style={{
                        color: desc.confidence === 'curated' ? '#a78bfa' : 'var(--color-text-muted)',
                      }}
                    >
                      &ldquo;{desc.line}&rdquo;
                    </p>
                  ) : null;
                })()}

                {/* Mood tags */}
                {currentPick.moodTags && currentPick.moodTags.length > 0 && (
                  <div className="mt-3 pt-2 border-t flex flex-wrap justify-center gap-1.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {currentPick.moodTags.map((mood) => {
                      const config = MOOD_TAG_CONFIG[mood];
                      return (
                        <span
                          key={mood}
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${config.color}15`, color: config.color }}
                        >
                          {config.icon} {config.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-3 py-2.5 text-sm font-medium text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
              >
                Not now
              </button>
              <button
                onClick={() => doRoll()}
                className="flex-1 px-3 py-2.5 text-sm font-medium rounded-xl border border-border-subtle text-text-secondary hover:border-accent-purple transition-all"
              >
                🎲 Roll Again
              </button>
              {isInLibrary(currentPick.name) ? (
                <button
                  disabled
                  className="flex-1 px-3 py-2.5 text-sm font-medium rounded-xl opacity-40 cursor-not-allowed"
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-dim)' }}
                >
                  Already added
                </button>
              ) : (
                <button
                  onClick={() => handleAddAndPlay(currentPick)}
                  className="flex-1 px-3 py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: svc.gradient,
                    color: '#fff',
                  }}
                >
                  Let&apos;s go
                </button>
              )}
            </div>

            {/* Secondary: just add to pile */}
            {!isInLibrary(currentPick.name) && (
              <button
                onClick={() => handleAddToLibrary(currentPick)}
                className="w-full mt-2 px-3 py-2 text-xs text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors font-[family-name:var(--font-mono)]"
              >
                Add to pile (play later)
              </button>
            )}
          </div>
        )}

        {/* Rolling animation overlay */}
        {rolling && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-5xl animate-bounce">{svc.icon}</div>
          </div>
        )}

        {/* Close button (when no pick shown) */}
        {!loading && !currentPick && !error && catalog.length > 0 && (
          <div className="px-5 pb-4">
            <button
              onClick={onClose}
              className="w-full px-3 py-2 text-xs text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
            >
              Never mind
            </button>
          </div>
        )}

        {/* Close button for error/loading */}
        {(error || loading) && (
          <div className="px-5 pb-4">
            <button
              onClick={onClose}
              className="w-full px-3 py-2 text-xs text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
