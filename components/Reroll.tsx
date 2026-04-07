'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Game, MoodTag } from '@/lib/types';
import { useStore } from '@/lib/store';
import { STATUS_CONFIG, REROLL_MESSAGES, TIME_TIER_CONFIG } from '@/lib/constants';
import { MOOD_TAG_CONFIG } from '@/lib/enrichment';
import { getGameDescriptor } from '@/lib/descriptors';
import { REROLL_MODES, RerollMode, EnergyLevel, getDefaultEnergy, getEligibleGames, pickWeighted, getPickReasons } from '@/lib/reroll';
import { useToast } from './Toast';
import { trackReroll, trackRerollCommit } from '@/lib/analytics';
import { recordSkip } from '@/lib/skipTracking';
import { recordSkipReason, SkipReasonKey } from '@/lib/skipReasons';
import { recordDecision } from '@/lib/decisionHistory';

const ALL_MOODS: MoodTag[] = ['chill', 'intense', 'story-rich', 'brainless', 'atmospheric', 'competitive', 'spooky', 'creative', 'strategic', 'emotional'];

const POST_ACCEPT_LINES = [
  "Go. We'll be here when you get back.",
  "{game} isn't going to play itself. Close the app.",
  "You made a decision. That's the hard part. Now play.",
  "The pile just got smaller. Go.",
  "You picked it. Trust your gut.",
  "One less game to wonder about. Go find out.",
];

function getPostAcceptLine(gameName: string): string {
  const line = POST_ACCEPT_LINES[Math.floor(Math.random() * POST_ACCEPT_LINES.length)];
  return line.replace('{game}', gameName);
}

function getSessionEstimate(game: Game): string | null {
  if (game.hltbMain && game.hltbMain > 0) {
    if (game.hoursPlayed > 0) {
      const remaining = Math.max(Math.ceil(game.hltbMain - game.hoursPlayed), 1);
      return `~${remaining}h left`;
    }
    return `~${game.hltbMain}h to beat`;
  }
  return null;
}

interface RerollProps {
  open: boolean;
  onClose: () => void;
  initialMode?: RerollMode;
}

export default function Reroll({ open, onClose, initialMode }: RerollProps) {
  const [mode, setMode] = useState<RerollMode>('anything');
  const [moodFilters, setMoodFilters] = useState<MoodTag[]>([]);
  const [currentPick, setCurrentPick] = useState<Game | null>(null);
  const [rolling, setRolling] = useState(false);
  const [showForced, setShowForced] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [skipModePicker, setSkipModePicker] = useState(false);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());
  const [postAccept, setPostAccept] = useState<Game | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel>(getDefaultEnergy());
  const [skipFeedbackGame, setSkipFeedbackGame] = useState<Game | null>(null);
  const [skipFeedbackVisible, setSkipFeedbackVisible] = useState(false);
  const [skipFeedbackRecorded, setSkipFeedbackRecorded] = useState(false);
  const skipFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const games = useStore((s) => s.games);
  const platformPreference = useStore((s) => s.settings.platformPreference) || 'any';
  const reroll = useStore((s) => s.reroll);
  const incrementReroll = useStore((s) => s.incrementReroll);
  const pushLastPick = useStore((s) => s.pushLastPick);
  const resetReroll = useStore((s) => s.resetReroll);
  const updateGame = useStore((s) => s.updateGame);
  const { showToast } = useToast();

  const toggleMood = useCallback((mood: MoodTag) => {
    setMoodFilters((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  }, []);

  const doRoll = useCallback((overrideMode?: RerollMode) => {
    const rollMode = overrideMode || mode;
    const eligible = getEligibleGames(games, rollMode, platformPreference, moodFilters);

    // Filter out games already shown this session to prevent repetition
    const unseenEligible = eligible.filter((g) => !shownIds.has(g.id));

    // If all eligible games have been shown, tell the user
    if (unseenEligible.length === 0 && eligible.length > 0) {
      showToast(eligible.length === 1
        ? 'Only one game matches this mode. Try a different mode or adjust your filters.'
        : `You've seen all ${eligible.length} games in this category. Try a different mode or adjust your filters.`);
      return;
    }

    const pick = pickWeighted(unseenEligible.length > 0 ? unseenEligible : eligible, skippedIds, reroll.lastThreePicks, energy);
    if (!pick) {
      showToast(moodFilters.length > 0
        ? 'No games match that mood. Try removing a filter.'
        : 'No games match this mode. Add some games first.');
      return;
    }

    // Track skipped game (session + persistent)
    if (currentPick) {
      pushLastPick(currentPick);
      setSkippedIds((prev) => new Set(prev).add(currentPick.id));
      recordSkip(currentPick.id);
      recordDecision({
        gameId: currentPick.id,
        gameName: currentPick.name,
        mode: rollMode,
        action: 'skip',
        moodFilters,
        energy,
        genres: (currentPick.genres || []).map(g => g.toLowerCase()),
        timeTier: currentPick.timeTier,
        timestamp: new Date().toISOString(),
      });

      // Show "Why'd you skip?" feedback for the skipped game
      if (skipFeedbackTimer.current) clearTimeout(skipFeedbackTimer.current);
      setSkipFeedbackGame(currentPick);
      setSkipFeedbackVisible(true);
      setSkipFeedbackRecorded(false);
      skipFeedbackTimer.current = setTimeout(() => {
        setSkipFeedbackVisible(false);
        setTimeout(() => setSkipFeedbackGame(null), 300);
      }, 4000);
    }

    // Track shown game to prevent repetition
    setShownIds((prev) => new Set(prev).add(pick.id));

    incrementReroll();
    trackReroll(rollMode);
    const newCount = reroll.sessionCount + 1;

    // Check for reroll messages
    if (REROLL_MESSAGES[newCount]) {
      showToast(REROLL_MESSAGES[newCount]);
    }

    // Animate
    setRolling(true);
    setRevealed(false);

    setTimeout(() => {
      setCurrentPick(pick);
      setRolling(false);
      setRevealed(true);

      // Check if forced choice at roll 10
      if (newCount >= 10) {
        setTimeout(() => setShowForced(true), 600);
      }
    }, 500);
  }, [games, mode, moodFilters, currentPick, reroll.sessionCount, incrementReroll, pushLastPick, showToast, skippedIds, shownIds, platformPreference, energy]);

  const handleLetsGo = useCallback((game: Game) => {
    // Now Playing cap check
    const nowPlayingCount = games.filter((g) => g.status === 'playing').length;
    if (nowPlayingCount >= 3) {
      showToast('Now Playing is capped at 3. Finish or shelve something first.');
      return;
    }
    updateGame(game.id, { status: 'playing' });
    trackRerollCommit();
    recordDecision({
      gameId: game.id,
      gameName: game.name,
      mode,
      action: 'accept',
      moodFilters,
      energy,
      genres: (game.genres || []).map(g => g.toLowerCase()),
      timeTier: game.timeTier,
      timestamp: new Date().toISOString(),
    });

    // Show post-accept nudge instead of immediately closing
    setPostAccept(game);
    setCurrentPick(null);
    setShowForced(false);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setPostAccept(null);
      resetReroll();
      onClose();
    }, 3000);
  }, [games, updateGame, resetReroll, onClose, mode, moodFilters, energy]);

  const handleNotNow = useCallback(() => {
    resetReroll();
    setCurrentPick(null);
    setPostAccept(null);
    setShowForced(false);
    setRevealed(false);
    onClose();
  }, [resetReroll, onClose]);

  const handleFirstRoll = useCallback(() => {
    const eligible = getEligibleGames(games, mode, platformPreference, moodFilters);
    if (eligible.length === 0) {
      showToast(moodFilters.length > 0
        ? 'No games match that mood. Try removing a filter.'
        : 'No games match this mode.');
      return;
    }
    doRoll();
  }, [games, mode, moodFilters, doRoll, showToast, platformPreference]);

  const SKIP_REASON_OPTIONS: { key: SkipReasonKey; label: string; icon: string }[] = [
    { key: 'not-in-mood', label: 'Not in the mood', icon: '😴' },
    { key: 'too-long', label: 'Too long', icon: '⏰' },
    { key: 'played-recently', label: 'Played recently', icon: '🔁' },
    { key: 'hit-a-wall', label: 'Hit a wall', icon: '🧱' },
    { key: 'not-interested', label: 'Not interested', icon: '👎' },
  ];

  const handleSkipFeedback = useCallback((reason: SkipReasonKey) => {
    if (!skipFeedbackGame) return;
    recordSkipReason(skipFeedbackGame.id, reason);
    setSkipFeedbackRecorded(true);
    if (skipFeedbackTimer.current) clearTimeout(skipFeedbackTimer.current);
    setTimeout(() => {
      setSkipFeedbackVisible(false);
      setTimeout(() => {
        setSkipFeedbackGame(null);
        setSkipFeedbackRecorded(false);
      }, 300);
    }, 300);
  }, [skipFeedbackGame]);

  // Reset state when modal opens — if initialMode provided, auto-roll
  useEffect(() => {
    if (open) {
      setCurrentPick(null);
      setPostAccept(null);
      setShowForced(false);
      setRevealed(false);
      setSkippedIds(new Set());
      setShownIds(new Set());
      setMoodFilters([]);
      setEnergy(getDefaultEnergy());
      setSkipFeedbackGame(null);
      setSkipFeedbackVisible(false);
      setSkipFeedbackRecorded(false);
      if (skipFeedbackTimer.current) clearTimeout(skipFeedbackTimer.current);
      if (initialMode) {
        setMode(initialMode);
        setSkipModePicker(true);
      } else {
        setMode('anything');
        setSkipModePicker(false);
      }
    }
  }, [open, initialMode]);

  // Auto-roll on open when mode is pre-selected
  useEffect(() => {
    if (open && skipModePicker && !currentPick && !rolling) {
      const eligible = getEligibleGames(games, mode, platformPreference, moodFilters);
      if (eligible.length > 0) {
        doRoll();
      } else {
        showToast('No games match this mode.');
        onClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, skipModePicker]);

  const modalRef = useRef<HTMLDivElement>(null);

  // Escape to close + focus trapping
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleNotNow();
        return;
      }

      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const modal = modalRef.current;
    if (modal) {
      const first = modal.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  const forcedPicks = reroll.lastThreePicks;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleNotNow}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="What Should I Play"
        className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-[85vh]"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-active)',
          animation: 'scaleIn 400ms ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleNotNow}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-text-dim hover:text-text-primary hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 text-center">
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
            🎲 {currentPick ? 'Roll Again' : 'What Should I Play?'}
          </h2>
          {currentPick ? (
            <p className="text-sm text-text-dim mt-1 font-[family-name:var(--font-mono)]">
              Roll {reroll.sessionCount}
            </p>
          ) : (
            <p className="text-sm text-text-dim mt-1 font-[family-name:var(--font-mono)]">
              Tell us your session, pick a vibe, roll
            </p>
          )}
        </div>

        {/* Mode Selector (only before first roll, skip if mode pre-selected) */}
        {!currentPick && !showForced && !skipModePicker && (
          <div className="px-5 pb-4">
            {/* Energy selector */}
            <p className="text-xs text-text-dim font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2">How&apos;s your energy?</p>
            <div className="flex gap-2 mb-4">
              {([
                { level: 'low' as EnergyLevel, label: 'Low', icon: '🔋' },
                { level: 'medium' as EnergyLevel, label: 'Medium', icon: '⚡' },
                { level: 'high' as EnergyLevel, label: 'High', icon: '🔥' },
              ]).map(({ level, label, icon }) => (
                <button
                  key={level}
                  onClick={() => setEnergy(level)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    energy === level
                      ? 'border-accent-purple'
                      : 'border-border-subtle hover:border-border-active'
                  }`}
                  style={{ backgroundColor: energy === level ? 'rgba(124, 58, 237, 0.12)' : 'var(--color-bg-card)' }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Session type */}
            <p className="text-xs text-text-dim font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2">How much time do you have?</p>
            <div className="grid grid-cols-2 gap-2">
              {REROLL_MODES.map(({ mode: m, label, icon, description }) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-3 sm:py-2.5 rounded-xl text-left border transition-all ${
                    mode === m
                      ? 'border-accent-purple'
                      : 'border-border-subtle hover:border-border-active'
                  }`}
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <div className="text-base font-medium text-text-primary">
                    {icon} {label}
                  </div>
                  <div className="text-xs text-text-dim mt-0.5">{description}</div>
                </button>
              ))}
            </div>
            {/* Mood filter pills */}
            <div className="mt-4">
              <p className="text-xs text-text-dim font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2">I want something that feels...</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_MOODS.map((mood) => {
                  const config = MOOD_TAG_CONFIG[mood];
                  const active = moodFilters.includes(mood);
                  return (
                    <button
                      key={mood}
                      onClick={() => toggleMood(mood)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
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
              onClick={handleFirstRoll}
              className="w-full mt-3 px-4 py-4 sm:py-3 text-lg sm:text-base font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--color-accent-purple)',
                color: '#0a0a0f',
              }}
            >
              🎲 Roll
            </button>
          </div>
        )}

        {/* Current Pick */}
        {currentPick && !showForced && (
          <div className={`flex flex-col min-h-0 flex-1 transition-all duration-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
          <div className="px-5 overflow-y-auto min-h-0 flex-1">
            {/* Mode switcher pills */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-2">
              {REROLL_MODES.map(({ mode: m, icon, label }) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setShownIds(new Set()); doRoll(m); }}
                  className={`px-3 py-2 rounded-full text-sm font-medium font-[family-name:var(--font-mono)] transition-all ${
                    mode === m
                      ? 'bg-white/10 text-text-primary'
                      : 'text-text-dim hover:text-text-muted hover:bg-white/5'
                  }`}
                  title={label}
                >
                  {icon} {label}
                </button>
              ))}
              <span className="px-2 py-1 rounded-full text-xs font-medium font-[family-name:var(--font-mono)] bg-white/5 text-text-dim">
                {energy === 'low' ? '🔋' : energy === 'high' ? '🔥' : '⚡'} {energy}
              </span>
            </div>

            {/* Mood filter pills (compact, inline) */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {ALL_MOODS.map((mood) => {
                const config = MOOD_TAG_CONFIG[mood];
                const active = moodFilters.includes(mood);
                return (
                  <button
                    key={mood}
                    onClick={() => { toggleMood(mood); }}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
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
                <div className="relative w-full h-48 sm:h-48 overflow-hidden">
                  <img
                    src={currentPick.coverUrl}
                    alt={currentPick.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-card)] via-transparent to-transparent" />
                </div>
              ) : (
                <div className="w-full h-24 flex items-center justify-center text-4xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  🎮
                </div>
              )}
              <div className="px-5 pb-5 pt-3">
              <h3 className="text-2xl sm:text-xl font-bold text-text-primary mb-2">
                {currentPick.name}
              </h3>
              <div className="flex flex-wrap justify-center gap-3 text-xs text-text-dim font-[family-name:var(--font-mono)]">
                {currentPick.metacritic && (
                  <span
                    className="px-1.5 py-0.5 rounded font-bold"
                    style={{
                      backgroundColor: currentPick.metacritic >= 75 ? 'rgba(34,197,94,0.15)' : currentPick.metacritic >= 50 ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                      color: currentPick.metacritic >= 75 ? '#22c55e' : currentPick.metacritic >= 50 ? '#eab308' : '#ef4444',
                    }}
                  >
                    {currentPick.metacritic}
                  </span>
                )}
                {currentPick.hltbMain && (
                  <span>🕐 ~{currentPick.hltbMain}h to beat</span>
                )}
                <span>{TIME_TIER_CONFIG[currentPick.timeTier].icon} {TIME_TIER_CONFIG[currentPick.timeTier].label}</span>
                {currentPick.hoursPlayed > 0 && <span>{currentPick.hoursPlayed}h logged</span>}
              </div>
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
              {/* Why this game? */}
              {(() => {
                const reasons = getPickReasons(currentPick);
                return reasons.length > 0 ? (
                  <div className="mt-3 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-xs text-text-faint font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1.5">Why this one?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {reasons.map((r, i) => (
                        <span
                          key={i}
                          className="text-xs text-text-muted font-[family-name:var(--font-mono)] px-2 py-1 rounded-md"
                          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                        >
                          {r.icon} {r.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
              </div>
            </div>

            {/* Skip feedback pills */}
            {skipFeedbackGame && (
              <div
                className="px-5 pb-3 overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: skipFeedbackVisible ? '120px' : '0',
                  opacity: skipFeedbackVisible ? 1 : 0,
                }}
              >
                {skipFeedbackRecorded ? (
                  <p className="text-center text-sm text-text-muted font-[family-name:var(--font-mono)]">
                    &#10003;
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-text-faint font-[family-name:var(--font-mono)] text-center mb-2">
                      Why&apos;d you skip {skipFeedbackGame.name}?
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {SKIP_REASON_OPTIONS.map(({ key, label, icon }) => (
                        <button
                          key={key}
                          onClick={() => handleSkipFeedback(key)}
                          className="px-2.5 py-1.5 rounded-full text-xs font-medium font-[family-name:var(--font-mono)] text-text-dim transition-all hover:text-text-muted hover:bg-white/10"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            </div>
            {/* Action buttons — pinned to bottom */}
            <div className="flex gap-2 px-5 py-4 shrink-0 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'var(--color-bg-elevated)' }}>
              <button
                onClick={handleNotNow}
                className="flex-1 px-3 py-3.5 sm:py-2.5 text-sm font-medium text-text-dim rounded-xl border border-border-subtle hover:text-text-muted transition-colors"
              >
                Not now
              </button>
              <button
                onClick={() => doRoll()}
                disabled={reroll.sessionCount >= 10}
                className="flex-1 px-3 py-3.5 sm:py-2.5 text-sm font-medium rounded-xl border border-border-subtle text-text-secondary hover:border-accent-purple transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                🎲 Roll Again
              </button>
              <button
                onClick={() => handleLetsGo(currentPick)}
                className="flex-1 px-3 py-3.5 sm:py-2.5 text-base sm:text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--color-accent-purple)',
                  color: '#0a0a0f',
                }}
              >
                Let&apos;s go
              </button>
            </div>
          </div>
        )}

        {/* Forced Choice (Roll 10) */}
        {showForced && (
          <div className="px-5 pb-5">
            <p className="text-center text-sm font-medium text-text-secondary mb-1">
              Pick one. No more rolls.
            </p>
            <p className="text-center text-xs text-text-faint font-[family-name:var(--font-mono)] mb-4">
              These came up during your session. One of them is calling your name.
            </p>
            <div className="space-y-2">
              {forcedPicks.map((game) => {
                const desc = getGameDescriptor(game.name, game.metacritic, game.genres);
                return (
                  <button
                    key={game.id}
                    onClick={() => handleLetsGo(game)}
                    className="w-full flex items-center gap-3 p-4 sm:p-3 rounded-xl border transition-all hover:border-accent-purple hover:scale-[1.01]"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border-subtle)',
                    }}
                  >
                    {game.coverUrl && (
                      <img src={game.coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <span className="text-sm font-medium text-text-primary truncate block">
                        {game.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {game.metacritic && (
                          <span
                            className="text-xs font-bold px-1 rounded"
                            style={{
                              backgroundColor: game.metacritic >= 75 ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                              color: game.metacritic >= 75 ? '#22c55e' : '#eab308',
                            }}
                          >
                            {game.metacritic}
                          </span>
                        )}
                        {game.hltbMain && (
                          <span className="text-xs text-text-dim font-[family-name:var(--font-mono)]">~{game.hltbMain}h</span>
                        )}
                        <span className="text-xs text-text-dim">{TIME_TIER_CONFIG[game.timeTier].icon}</span>
                      </div>
                      {desc && (
                        <p className="text-xs text-text-faint mt-0.5 truncate italic">{desc.line}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleNotNow}
              className="w-full mt-3 px-3 py-2 text-xs text-text-dim hover:text-text-muted transition-colors"
            >
              Fine, I&apos;ll pick later
            </button>
          </div>
        )}

        {/* Post-accept nudge overlay */}
        {postAccept && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={() => {
              setPostAccept(null);
              resetReroll();
              onClose();
            }}
          >
            <div
              className="text-center px-8 py-6 max-w-sm"
              style={{ animation: 'scaleIn 300ms ease-out' }}
            >
              <p className="text-2xl font-extrabold text-text-primary mb-2">
                {postAccept.name}
              </p>
              {(() => {
                const est = getSessionEstimate(postAccept);
                return est ? (
                  <p className="text-xs text-text-dim font-[family-name:var(--font-mono)] mb-4">
                    {est}
                  </p>
                ) : null;
              })()}
              <p className="text-sm text-text-muted mb-4">
                {getPostAcceptLine(postAccept.name)}
              </p>
              {postAccept.steamAppId && (
                <a
                  href={`steam://run/${postAccept.steamAppId}`}
                  className="inline-block px-5 py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] mb-2"
                  style={{ backgroundColor: 'var(--color-accent-purple)', color: '#0a0a0f' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Launch on Steam
                </a>
              )}
              <p className="text-[10px] text-text-faint font-[family-name:var(--font-mono)] mt-3">
                tap anywhere to close
              </p>
            </div>
          </div>
        )}

        {/* Rolling animation overlay */}
        {rolling && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-5xl animate-bounce">🎲</div>
          </div>
        )}
      </div>
    </div>
  );
}
