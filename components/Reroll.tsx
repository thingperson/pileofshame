'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Game, MoodTag } from '@/lib/types';
import { useStore } from '@/lib/store';
import { STATUS_CONFIG, REROLL_MESSAGES, TIME_TIER_CONFIG, MAX_PLAYING_NOW } from '@/lib/constants';
import { MOOD_TAG_CONFIG } from '@/lib/enrichment';
import { getGameDescriptor } from '@/lib/descriptors';
import { REROLL_MODES, RerollMode, EnergyLevel, getDefaultEnergy, getEligibleGames, pickWeighted, pickSmartResume, getPickReasons } from '@/lib/reroll';
import { SMART_PICK_LABELS, renderSmartPickHeadline, SmartPickType } from '@/lib/smartPickCopy';
import { useToast } from './Toast';
import { trackReroll, trackRerollCommit, trackFirstRoll, trackFirstCommit, trackSampleCompleted } from '@/lib/analytics';
import { recordSkip } from '@/lib/skipTracking';
import { recordSkipReason, SkipReasonKey } from '@/lib/skipReasons';
import { recordDecision } from '@/lib/decisionHistory';
import { emitSampleCompleted } from './SampleImportNudge';

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
  /** Parent wires to a JustFiveMinutes ref (see app/page.tsx). The Reroll
   *  modal's "⚡ Just 5 mins" CTA calls this and closes — the Just 5 mins
   *  flow has its own modal + timer. */
  onJustFiveMinutes?: () => void;
  /** Opens the GamePassBrowse (Sub Shuffle) modal. Closes Reroll first. */
  onSubShuffle?: () => void;
}

export default function Reroll({ open, onClose, initialMode, onJustFiveMinutes, onSubShuffle }: RerollProps) {
  const [mode, setMode] = useState<RerollMode>('anything');
  const [moodFilters, setMoodFilters] = useState<MoodTag[]>([]);
  const [currentPick, setCurrentPick] = useState<Game | null>(null);
  const [smartPickType, setSmartPickType] = useState<SmartPickType | null>(null);
  const [rollCount, setRollCount] = useState(0);
  // Collapsible sections in the pre-roll picker. Both default closed so the
  // modal opens at 2 CTAs + energy pills; secondary choices are one tap away.
  const [showMoreWays, setShowMoreWays] = useState(false);
  const [showVibes, setShowVibes] = useState(false);
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
  // Show "why'd you skip?" at most twice per modal open — captures the
  // primary skip reason without nagging rerolls 3+.
  const skipFeedbackShownCount = useRef(0);
  const SKIP_FEEDBACK_SESSION_MAX = 2;

  const games = useStore((s) => s.games);
  const platformPreference = useStore((s) => s.settings.platformPreference) || 'any';
  const reroll = useStore((s) => s.reroll);
  const incrementReroll = useStore((s) => s.incrementReroll);
  const pushLastPick = useStore((s) => s.pushLastPick);
  const resetReroll = useStore((s) => s.resetReroll);
  const updateGame = useStore((s) => s.updateGame);
  const { showToast } = useToast();

  // SHELVED Apr 14 2026: multi-select mood filtering caused too many zero-result rolls
  // (e.g. "cozy" + "no-brainer" returned nothing for medium libraries → users bounce).
  // Single-select keeps the feature visible with the friction removed. Re-enable
  // multi-select once we ship a closest-match fallback. See ROADMAP.md.
  const toggleMood = useCallback((mood: MoodTag) => {
    setMoodFilters((prev) => (prev.includes(mood) ? [] : [mood]));
  }, []);

  const doRoll = useCallback((overrideMode?: RerollMode, countAsRoll: boolean = true) => {
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

    const pickPool = unseenEligible.length > 0 ? unseenEligible : eligible;
    let pick: Game | null;
    let pickedType: SmartPickType | null = null;
    if (rollMode === 'continue') {
      const result = pickSmartResume(pickPool, skippedIds, reroll.lastThreePicks, energy);
      pick = result?.game ?? null;
      pickedType = result?.smartPickType ?? null;
    } else {
      pick = pickWeighted(pickPool, skippedIds, reroll.lastThreePicks, energy);
    }
    if (!pick) {
      showToast(moodFilters.length > 0
        ? 'No games match that mood. Try a different one.'
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

      // Show "Why'd you skip?" feedback for the skipped game — capped at
      // SKIP_FEEDBACK_SESSION_MAX shows per modal open. No auto-dismiss;
      // user taps a reason or the × to close. Brady's feedback: the old
      // 8s timeout was too fast to read, and showing every skip nagged.
      if (skipFeedbackShownCount.current < SKIP_FEEDBACK_SESSION_MAX) {
        if (skipFeedbackTimer.current) clearTimeout(skipFeedbackTimer.current);
        setSkipFeedbackGame(currentPick);
        setSkipFeedbackVisible(true);
        setSkipFeedbackRecorded(false);
        skipFeedbackShownCount.current += 1;
      }
    }

    // Track shown game to prevent repetition
    setShownIds((prev) => new Set(prev).add(pick.id));

    // NOTE: incrementReroll (store) runs only on commit ("Let's go"), not on
    // rolls. Local rollCount drives the forced-choice gate and "Roll N" label.
    // Mode / energy / mood-pill switches pass countAsRoll=false so browsing
    // doesn't burn the 10-roll cap — only explicit Roll / Roll Again counts.
    trackReroll(rollMode);
    const newCount = countAsRoll ? rollCount + 1 : rollCount;
    if (countAsRoll) setRollCount(newCount);

    // Check for reroll messages
    if (REROLL_MESSAGES[newCount]) {
      showToast(REROLL_MESSAGES[newCount]);
    }

    // Animate
    setRolling(true);
    setRevealed(false);

    setTimeout(() => {
      setCurrentPick(pick);
      setSmartPickType(pickedType);
      setRolling(false);
      setRevealed(true);
      // Funnel: first-ever roll reveal (once per browser)
      trackFirstRoll();

      // Check if forced choice at roll 10
      if (newCount >= 10) {
        setTimeout(() => setShowForced(true), 600);
      }
    }, 500);
  }, [games, mode, moodFilters, currentPick, rollCount, pushLastPick, showToast, skippedIds, shownIds, platformPreference, energy]);

  const handleLetsGo = useCallback((game: Game) => {
    // Playing Now cap check
    const nowPlayingCount = games.filter((g) => g.status === 'playing').length;
    if (nowPlayingCount >= MAX_PLAYING_NOW) {
      showToast(`Playing Now is capped at ${MAX_PLAYING_NOW}. Finish or shelve something first.`);
      return;
    }
    updateGame(game.id, { status: 'playing' });
    incrementReroll();
    trackRerollCommit();
    // Funnel: first-ever commit (once per browser)
    trackFirstCommit();
    // Funnel: if this commit came out of the sample onboarding flow, count
    // the sample as completed. Flag is set on sample load and cleared once
    // here so later commits don't re-fire.
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('if-sample-pending') === '1') {
        trackSampleCompleted();
        localStorage.removeItem('if-sample-pending');
        // Signal the SampleImportNudge to appear (post-value-proof prompt)
        emitSampleCompleted();
      }
    } catch {
      // ignore storage errors
    }
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

  const handleFirstRoll = useCallback((overrideMode?: RerollMode) => {
    const rollMode = overrideMode || mode;
    const eligible = getEligibleGames(games, rollMode, platformPreference, moodFilters);
    if (eligible.length === 0) {
      showToast(moodFilters.length > 0
        ? 'No games match that mood. Try a different one.'
        : 'No games match this mode.');
      return;
    }
    doRoll(rollMode);
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
      setSmartPickType(null);
      setRollCount(0);
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
      skipFeedbackShownCount.current = 0;
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
              Roll {rollCount}
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

            {/* Primary CTAs — clicking rolls immediately in that mode (no
                separate Roll button). "Just 5 mins" closes the modal and
                hands off to the JustFiveMinutes flow via the parent ref. */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMode('anything'); setTimeout(() => handleFirstRoll('anything'), 0); }}
                className="px-4 py-5 rounded-xl text-lg font-bold text-white transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
              >
                🎲 Anything
              </button>
              <button
                onClick={() => onJustFiveMinutes?.()}
                className="px-4 py-5 rounded-xl text-lg font-bold text-white transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}
                disabled={!onJustFiveMinutes}
                title="Try a game for 5 minutes. Then decide where it goes."
              >
                ⚡ Just 5 mins
              </button>
            </div>

            {/* More ways to play — Quick Session + Resume. Collapsed by default. */}
            <div className="mt-3 rounded-xl border" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button
                type="button"
                onClick={() => setShowMoreWays((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                aria-expanded={showMoreWays}
              >
                <span>More ways to play</span>
                <span className="text-text-dim text-xs">{showMoreWays ? '▴' : '▾'}</span>
              </button>
              {showMoreWays && (
                <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                  {REROLL_MODES.filter((m) => m.mode !== 'anything').map(({ mode: m, label, icon, description }) => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); setTimeout(() => handleFirstRoll(m), 0); }}
                      className="px-3 py-3 rounded-xl text-left border border-border-subtle hover:border-accent-purple transition-all"
                      style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                      <div className="text-base font-medium text-text-primary">
                        {icon} {label}
                      </div>
                      <div className="text-xs text-text-dim mt-0.5">{description}</div>
                    </button>
                  ))}
                  {onSubShuffle && (
                    <button
                      onClick={() => onSubShuffle()}
                      className="col-span-2 px-3 py-3 rounded-xl text-left border border-border-subtle hover:border-accent-purple transition-all"
                      style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                      <div className="text-base font-medium text-text-primary">
                        <span className="font-black tracking-tight" style={{ color: '#7ec850' }}>GP</span>
                        <span className="opacity-50"> / </span>
                        <span className="font-black tracking-tight" style={{ color: '#ffd800' }}>PS+</span>
                        <span> Sub Shuffle</span>
                      </div>
                      <div className="text-xs text-text-dim mt-0.5">Pick from the Game Pass or PS+ catalog.</div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Vibes — mood chips. Collapsed by default. Single-select to avoid
                zero-result rolls (see toggleMood comment). Selecting a vibe
                filters the next roll; selection persists until cleared. */}
            <div className="mt-2 rounded-xl border" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button
                type="button"
                onClick={() => setShowVibes((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                aria-expanded={showVibes}
              >
                <span>
                  Vibes
                  {moodFilters.length > 0 && (
                    <span className="ml-2 text-xs text-accent-purple font-[family-name:var(--font-mono)]">
                      · {moodFilters.map((m) => MOOD_TAG_CONFIG[m].label).join(', ')}
                    </span>
                  )}
                </span>
                <span className="text-text-dim text-xs">{showVibes ? '▴' : '▾'}</span>
              </button>
              {showVibes && (
                <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                  {ALL_MOODS.map((mood) => {
                    const config = MOOD_TAG_CONFIG[mood];
                    const active = moodFilters.includes(mood);
                    return (
                      <button
                        key={mood}
                        onClick={() => toggleMood(mood)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${active ? 'scale-[1.02]' : 'hover:bg-white/10'}`}
                        style={{
                          backgroundColor: active ? `${config.color}25` : 'rgba(255,255,255,0.05)',
                          color: active ? config.color : 'var(--color-text-muted)',
                          border: active ? `1px solid ${config.color}50` : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {config.icon} {config.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
                  onClick={() => { setMode(m); setShownIds(new Set()); doRoll(m, false); }}
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
              <button
                onClick={() => {
                  const levels: EnergyLevel[] = ['low', 'medium', 'high'];
                  const next = levels[(levels.indexOf(energy) + 1) % levels.length];
                  setEnergy(next);
                  setShownIds(new Set());
                  doRoll(mode, false);
                }}
                className="px-3 py-2 rounded-full text-sm font-medium font-[family-name:var(--font-mono)] text-text-dim hover:text-text-muted hover:bg-white/5 transition-all"
                title={`Energy: ${energy}. Tap to change.`}
              >
                {energy === 'low' ? '🔋 Low' : energy === 'high' ? '🔥 High' : '⚡ Medium'}
              </button>
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
                      active ? 'scale-[1.02]' : 'hover:bg-white/10'
                    }`}
                    style={{
                      backgroundColor: active ? `${config.color}25` : 'rgba(255,255,255,0.03)',
                      color: active ? config.color : 'var(--color-text-muted)',
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
              {/* Smart Pick pill + headline */}
              {smartPickType && (() => {
                const { label, icon } = SMART_PICK_LABELS[smartPickType];
                const headline = renderSmartPickHeadline(smartPickType, currentPick.name, {
                  hoursPlayed: currentPick.hoursPlayed,
                  hltbMain: currentPick.hltbMain,
                  ratingPct: currentPick.metacritic ?? undefined,
                });
                return (
                  <div className="mt-3">
                    <span
                      className="inline-block text-xs font-[family-name:var(--font-mono)] font-medium px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: 'rgba(167, 139, 250, 0.15)',
                        color: '#a78bfa',
                        border: '1px solid rgba(167, 139, 250, 0.35)',
                      }}
                    >
                      🧠 Smart Pick · {icon ? `${icon} ` : ''}{label}
                    </span>
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                      {headline}
                    </p>
                  </div>
                );
              })()}
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
              {/* Why this game? Smart Pick trigger leads (accent-purple left border),
                  remaining signals follow unstyled. */}
              {(() => {
                const reasons = getPickReasons(currentPick);
                // Build a Smart-Pick trigger reason — the thing that actually caused
                // this game to surface. Sits as pill #1, visually distinguished so
                // the user reads "because I'm 85% through" before the secondary
                // signals (Metacritic, mood, backlog age).
                let trigger: { icon: string; label: string } | null = null;
                if (smartPickType) {
                  const h = Math.round(currentPick.hoursPlayed);
                  if (smartPickType === 'almost-there' && currentPick.hltbMain) {
                    const pct = Math.min(99, Math.round((currentPick.hoursPlayed / currentPick.hltbMain) * 100));
                    trigger = { icon: '🏁', label: `${pct}% to credits` };
                  } else if (smartPickType === 'keep-flowing') {
                    trigger = { icon: '🌊', label: `Still warm, ${h}h in` };
                  } else if (smartPickType === 'forgotten-gem') {
                    trigger = { icon: '💎', label: `${h}h in, top-rated` };
                  } else if (smartPickType === 'unfinished-business') {
                    trigger = { icon: '📜', label: `${h}h in, then silence` };
                  }
                }
                if (!trigger && reasons.length === 0) return null;
                return (
                  <div className="mt-3 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-xs text-text-faint font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1.5">Why this one?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {trigger && (
                        <span
                          className="text-xs font-[family-name:var(--font-mono)] px-2 py-1 rounded-md"
                          style={{
                            backgroundColor: 'rgba(167, 139, 250, 0.12)',
                            color: '#c4b5fd',
                            borderLeft: '2px solid #a78bfa',
                          }}
                        >
                          {trigger.icon} {trigger.label}
                        </span>
                      )}
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
                );
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
                    <div className="relative mb-2">
                      <p className="text-xs text-text-faint font-[family-name:var(--font-mono)] text-center">
                        Why&apos;d you skip {skipFeedbackGame.name}?
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSkipFeedbackVisible(false);
                          setTimeout(() => setSkipFeedbackGame(null), 300);
                        }}
                        aria-label="Dismiss skip feedback"
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted text-sm leading-none px-1"
                      >
                        ×
                      </button>
                    </div>
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
                disabled={rollCount >= 10}
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
