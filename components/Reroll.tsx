'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Game, MoodTag } from '@/lib/types';
import { useStore } from '@/lib/store';
import { useScrollLock } from '@/lib/useScrollLock';
import { STATUS_CONFIG, REROLL_MESSAGES, TIME_TIER_CONFIG, MAX_PLAYING_NOW } from '@/lib/constants';
import { MOOD_TAG_CONFIG } from '@/lib/enrichment';
import { hasSprite } from '@/lib/pixel/sprites';
import PixelSprite from './PixelSprite';
import { getGameDescriptor } from '@/lib/descriptors';
import { REROLL_MODES, RerollMode, SessionLength, getDefaultSessionLength, getEligibleGames, pickWeighted, pickSmartResume, getPickReasons } from '@/lib/reroll';
import { SMART_PICK_LABELS, renderSmartPickHeadline, SmartPickType } from '@/lib/smartPickCopy';
import { useToast } from './Toast';
import { trackReroll, trackRerollCommit, trackFirstRoll, trackFirstCommit, trackSampleCompleted, trackPickerOpened, trackGameLaunchedExternally } from '@/lib/analytics';
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
    return game.isNonFinishable ? `~${game.hltbMain}h per session` : `~${game.hltbMain}h to beat`;
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
  /** Fires when the user commits a pick ("Let's go"). Parent navigates the
   *  user to the Playing Now tab so the picked game is where they expect. */
  onCommit?: () => void;
}

export default function Reroll({ open, onClose, initialMode, onJustFiveMinutes, onSubShuffle, onCommit }: RerollProps) {
  useScrollLock(open);
  const [mode, setMode] = useState<RerollMode>('anything');
  const [moodFilters, setMoodFilters] = useState<MoodTag[]>([]);
  const [currentPick, setCurrentPick] = useState<Game | null>(null);
  const [smartPickType, setSmartPickType] = useState<SmartPickType | null>(null);
  const [rollCount, setRollCount] = useState(0);
  // Collapsible sections in the pre-roll picker. Both default closed so the
  // modal opens at 2 CTAs + energy pills; secondary choices are one tap away.
  const [showMoreWays, setShowMoreWays] = useState(false);
  const [showVibes, setShowVibes] = useState(false);
  // Pre-roll session-length drawer — collapsed by default per the locked
  // 2-input rule. Opens on tap; commits to the chosen length until reset.
  const [showSessionLengthDrawer, setShowSessionLengthDrawer] = useState(false);
  // Post-pick "change roll settings" drawer — hides mode/mood/session-length
  // pill rows by default so the user reads the pick, not the picker. Opens
  // on tap when they want to alter the roll parameters without resetting.
  const [showRollSettings, setShowRollSettings] = useState(false);
  // Post-pick "Why this one?" drawer — collapsed by default. The pick should
  // explain itself; we only justify on demand.
  const [showWhyThisOne, setShowWhyThisOne] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [commitNudgeShown, setCommitNudgeShown] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [skipModePicker, setSkipModePicker] = useState(false);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());
  const [postAccept, setPostAccept] = useState<Game | null>(null);
  const [sessionLength, setSessionLength] = useState<SessionLength>(getDefaultSessionLength());
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
      const result = pickSmartResume(pickPool, skippedIds, reroll.lastThreePicks, sessionLength);
      pick = result?.game ?? null;
      pickedType = result?.smartPickType ?? null;
    } else {
      pick = pickWeighted(pickPool, skippedIds, reroll.lastThreePicks, sessionLength);
    }
    if (!pick) {
      const moodMsg = moodFilters.length > 1
        ? 'No games match those moods. Clear them and roll again.'
        : 'No games match that mood. Clear it and roll again.';
      showToast(moodFilters.length > 0
        ? moodMsg
        : 'No games match this mode. Try a different one.');
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
        sessionLength,
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
    // Mode / session-length / mood-pill switches pass countAsRoll=false so
    // browsing doesn't burn the 10-roll cap — only explicit Roll / Roll Again counts.
    trackReroll(rollMode, {
      mood: moodFilters[0],
      session_length: sessionLength,
      roll_index: countAsRoll ? rollCount + 1 : rollCount,
    });
    const newCount = countAsRoll ? rollCount + 1 : rollCount;
    if (countAsRoll) setRollCount(newCount);

    // Check for reroll messages
    if (REROLL_MESSAGES[newCount]) {
      showToast(REROLL_MESSAGES[newCount]);
    }

    // Soft commitment nudge once per session, around roll 8. No trap —
    // the user can keep rolling. Replaces the old hard 10-roll forced-
    // choice modal which violated "less time in app = success."
    if (countAsRoll && newCount === 8 && !commitNudgeShown) {
      showToast("You're deciding and that's everything.");
      setCommitNudgeShown(true);
    }

    // Animate
    setRolling(true);
    setRevealed(false);

    setTimeout(() => {
      setCurrentPick(pick);
      setSmartPickType(pickedType);
      setRolling(false);
      setRevealed(true);
      // Each new pick collapses Why This One — we want the next reveal to
      // explain itself before the user reaches for justification.
      setShowWhyThisOne(false);
      // First roll: expand filter summary so the user sees what shaped it.
      // Subsequent rolls: collapse to the one-line summary.
      setShowRollSettings(newCount <= 1);
      // Funnel: first-ever roll reveal (once per browser)
      trackFirstRoll();
    }, 500);
  }, [games, mode, moodFilters, currentPick, rollCount, pushLastPick, showToast, skippedIds, shownIds, platformPreference, sessionLength, commitNudgeShown]);

  const handleLetsGo = useCallback((game: Game) => {
    // Playing Now cap check
    const nowPlayingCount = games.filter((g) => g.status === 'playing').length;
    if (nowPlayingCount >= MAX_PLAYING_NOW) {
      showToast(`Playing Now is capped at ${MAX_PLAYING_NOW}. Finish or shelve something first.`);
      return;
    }
    updateGame(game.id, { status: 'playing' });
    incrementReroll();
    trackRerollCommit({
      mode,
      mood: moodFilters[0],
      session_length: sessionLength,
      game_name: game.name,
      time_tier: game.timeTier,
      smart_pick_type: smartPickType ?? undefined,
      hltb_main: game.hltbMain,
      rolls_until_commit: rollCount,
    });
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
      sessionLength,
      genres: (game.genres || []).map(g => g.toLowerCase()),
      timeTier: game.timeTier,
      timestamp: new Date().toISOString(),
    });

    // Show post-accept celebration. No auto-dismiss — the user reads it,
    // taps "Going to play", and we navigate them to Playing Now where the
    // game now lives. The 3-second auto-close was punitive: it stripped
    // the celebratory beat and pushed the user out before they'd absorbed
    // the decision.
    setPostAccept(game);
    setCurrentPick(null);
  }, [games, updateGame, mode, moodFilters, sessionLength, showToast]);

  // Dismiss handler for the post-accept celebration. Closes the modal,
  // resets reroll state, and tells the parent to navigate to Playing Now.
  const handlePostAcceptDismiss = useCallback(() => {
    // For non-Steam platforms there's no real launch URL to click — the
    // dismiss button is the user declaring intent to play. Treat it as the
    // launch signal for those sources. Steam fires its own event from the
    // launch link itself, so don't double-count.
    if (postAccept && postAccept.source !== 'steam') {
      trackGameLaunchedExternally(postAccept.source);
    }
    setPostAccept(null);
    resetReroll();
    onCommit?.();
    onClose();
  }, [resetReroll, onCommit, onClose, postAccept]);

  const handleNotNow = useCallback(() => {
    // If the user is dismissing while the post-accept celebration is showing,
    // they already committed — fire onCommit so they land on Playing Now.
    // Without this, hitting × or Escape after a commit drops them back on
    // Backlog tab where the game just left, which breaks the loop promise.
    const wasPostAccept = !!postAccept;
    resetReroll();
    setCurrentPick(null);
    setPostAccept(null);
    setRevealed(false);
    if (wasPostAccept) onCommit?.();
    onClose();
  }, [resetReroll, onClose, onCommit, postAccept]);

  const handleFirstRoll = useCallback((overrideMode?: RerollMode) => {
    const rollMode = overrideMode || mode;
    const eligible = getEligibleGames(games, rollMode, platformPreference, moodFilters);
    if (eligible.length === 0) {
      const moodMsg = moodFilters.length > 1
        ? 'No games match those moods. Clear them and roll again.'
        : 'No games match that mood. Clear it and roll again.';
      showToast(moodFilters.length > 0
        ? moodMsg
        : 'No games match this mode.');
      return;
    }
    doRoll(rollMode);
  }, [games, mode, moodFilters, doRoll, showToast, platformPreference]);

  const SKIP_REASON_OPTIONS: { key: SkipReasonKey; label: string; icon: string; spriteKey: string }[] = [
    { key: 'not-in-mood', label: 'Not in the mood', icon: '😴', spriteKey: 'skipNotInMood' },
    { key: 'too-long', label: 'Too long', icon: '⏰', spriteKey: 'skipTooLong' },
    { key: 'played-recently', label: 'Played recently', icon: '🔁', spriteKey: 'skipPlayedRecently' },
    { key: 'hit-a-wall', label: 'Hit a wall', icon: '🧱', spriteKey: 'skipHitWall' },
    { key: 'not-interested', label: 'Not interested', icon: '👎', spriteKey: 'skipNotInterested' },
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
      setCommitNudgeShown(false);
      setRevealed(false);
      setSkippedIds(new Set());
      setShownIds(new Set());
      setMoodFilters([]);
      setSessionLength(getDefaultSessionLength());
      setSkipFeedbackGame(null);
      setSkipFeedbackVisible(false);
      setSkipFeedbackRecorded(false);
      skipFeedbackShownCount.current = 0;
      setShowSessionLengthDrawer(false);
      setShowRollSettings(false);
      setShowWhyThisOne(false);
      if (skipFeedbackTimer.current) clearTimeout(skipFeedbackTimer.current);
      if (initialMode) {
        setMode(initialMode);
        setSkipModePicker(true);
      } else {
        setMode('anything');
        setSkipModePicker(false);
      }
      trackPickerOpened(initialMode || 'anything');
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
        aria-label="Pick My Game"
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
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-text-dim hover:text-text-primary hover:bg-glass-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 text-center">
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
            🎲 {currentPick ? 'Roll Again' : 'Pick My Game'}
          </h2>
          {currentPick && (
            <p className="text-sm text-text-dim mt-1 font-[family-name:var(--font-mono)]">
              Roll {rollCount}
            </p>
          )}
        </div>

        {/* Mode Selector (only before first roll, skip if mode pre-selected) */}
        {!currentPick && !skipModePicker && (
          <div className="px-5 pb-4">
            {/* Primary CTAs — clicking rolls immediately in that mode (no
                separate Roll button). "5-min tryout" closes the modal and
                hands off to the JustFiveMinutes flow via the parent ref.
                The picker should explain itself: 2 buttons, 1 decision. */}
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
                title="Five minutes is enough to feel a game. Not enough to second-guess yourself."
              >
                ⏱️ 5-min tryout
              </button>
            </div>

            {/* Session length drawer — collapsed by default. Shows current
                selection in the header so the user can see at a glance what's
                set. Tier copy is locked (see .claude/rules/user-psychology.md
                §3): Small ~20 min / Medium ~1–2 hrs / Large 2+ hrs · I'm in. */}
            <div className="mt-3 rounded-xl border" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button
                type="button"
                onClick={() => setShowSessionLengthDrawer((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                aria-expanded={showSessionLengthDrawer}
              >
                <span>
                  Session length
                  <span className="ml-2 text-xs text-accent-purple font-[family-name:var(--font-mono)]">
                    · {sessionLength === 'small' ? '🚣 Small' : sessionLength === 'large' ? '🚢 Large' : '⛵ Medium'}
                  </span>
                </span>
                <span className="text-text-dim text-xs">{showSessionLengthDrawer ? '▴' : '▾'}</span>
              </button>
              {showSessionLengthDrawer && (
                <div className="px-3 pb-3 flex gap-2">
                  {([
                    { level: 'small' as SessionLength, label: 'Small', sub: '~20 min', icon: '🚣' },
                    { level: 'medium' as SessionLength, label: 'Medium', sub: '~1–2 hrs', icon: '⛵' },
                    { level: 'large' as SessionLength, label: 'Large', sub: <>2+ hrs · <em>I&apos;m in</em></>, icon: '🚢' },
                  ]).map(({ level, label, sub, icon }) => (
                    <button
                      key={level}
                      onClick={() => setSessionLength(level)}
                      aria-label={`Session length: ${label}`}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        sessionLength === level
                          ? 'border-accent-purple'
                          : 'border-border-subtle hover:border-border-active'
                      }`}
                      style={{ backgroundColor: sessionLength === level ? 'rgba(124, 58, 237, 0.12)' : 'var(--color-bg-card)' }}
                    >
                      <div>{icon} {label}</div>
                      <div className="text-[10px] text-text-dim font-[family-name:var(--font-mono)] mt-0.5">{sub}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vibes — mood chips. Collapsed by default. Single-select to avoid
                zero-result rolls (see toggleMood comment). Selecting a vibe
                filters the next roll; selection persists until cleared. */}
            <div className="mt-3 rounded-xl border" style={{ borderColor: 'var(--color-border-subtle)' }}>
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
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${active ? 'scale-[1.02]' : 'hover:bg-glass-medium'}`}
                        style={{
                          backgroundColor: active ? `${config.color}25` : 'var(--color-glass-subtle)',
                          color: active ? config.color : 'var(--color-text-muted)',
                          border: active ? `1px solid ${config.color}50` : '1px solid var(--color-glass-border)',
                        }}
                      >
                        {hasSprite(config.spriteKey) ? (
                          <PixelSprite name={config.spriteKey} size={20} ariaLabel={config.label} />
                        ) : (
                          <span aria-hidden="true">{config.icon}</span>
                        )}
                        <span>{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* More ways to play — alternative roll modes. Visually separated
                from the filters above: these choose a different pick strategy
                entirely, not a refinement of the current one. */}
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <button
                type="button"
                onClick={() => setShowMoreWays((v) => !v)}
                className="w-full flex items-center justify-between px-1 py-1 text-xs font-medium text-text-dim hover:text-text-muted transition-colors"
                aria-expanded={showMoreWays}
              >
                <span>Or pick a different way...</span>
                <span className="text-text-dim text-xs">{showMoreWays ? '▴' : '▾'}</span>
              </button>
              {showMoreWays && (
                <div className="mt-2 grid grid-cols-2 gap-2">
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
          </div>
        )}

        {/* Current Pick */}
        {currentPick && (
          <div className={`flex flex-col min-h-0 flex-1 transition-all duration-500 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
          <div className="px-5 overflow-y-auto min-h-0 flex-1">
            {/* Roll settings — collapsed to a one-line summary after the first
                roll. On the very first roll of a session the filters stay
                expanded so the user sees what shaped the pick. Subsequent
                rolls collapse to mood · session length · ↻ change. */}
            <div className="mb-3 text-center">
              {rollCount <= 1 ? (
                <button
                  type="button"
                  onClick={() => setShowRollSettings((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-[family-name:var(--font-mono)] text-text-faint hover:text-text-muted transition-colors"
                  aria-expanded={showRollSettings}
                >
                  <span>⚙ {showRollSettings ? 'Hide' : 'Change'} roll settings</span>
                  <span className="text-text-dim">{showRollSettings ? '▴' : '▾'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowRollSettings((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs font-[family-name:var(--font-mono)] text-text-dim hover:text-text-muted transition-colors"
                  aria-expanded={showRollSettings}
                >
                  <span>{moodFilters.length > 0 ? MOOD_TAG_CONFIG[moodFilters[0]].label : 'Any vibe'}</span>
                  <span className="text-text-faint">·</span>
                  <span>{sessionLength === 'small' ? 'Small' : sessionLength === 'large' ? 'Large' : 'Medium'}</span>
                  <span className="text-text-faint">·</span>
                  <span className="text-accent-purple">↻ change</span>
                </button>
              )}
            </div>
            {showRollSettings && (
              <div className="mb-4 pb-3 border-b" style={{ borderColor: 'var(--color-glass-border)' }}>
                {/* Mode switcher pills */}
                <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                  {REROLL_MODES.map(({ mode: m, icon, label }) => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); }}
                      className={`px-3 py-2 rounded-full text-sm font-medium font-[family-name:var(--font-mono)] transition-all ${
                        mode === m
                          ? 'bg-glass-medium text-text-primary'
                          : 'text-text-dim hover:text-text-muted hover:bg-glass-subtle'
                      }`}
                      title={label}
                    >
                      {icon} {label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const levels: SessionLength[] = ['small', 'medium', 'large'];
                      const next = levels[(levels.indexOf(sessionLength) + 1) % levels.length];
                      setSessionLength(next);
                    }}
                    className="px-3 py-2 rounded-full text-sm font-medium font-[family-name:var(--font-mono)] text-text-dim hover:text-text-muted hover:bg-glass-subtle transition-all"
                    title={`Session length: ${sessionLength}. Tap to change.`}
                  >
                    {sessionLength === 'small' ? '🚣 Small' : sessionLength === 'large' ? '🚢 Large' : '⛵ Medium'}
                  </button>
                </div>

                {/* Mood filter pills (compact, inline) */}
                <div className="flex flex-wrap justify-center gap-1.5">
                  {ALL_MOODS.map((mood) => {
                    const config = MOOD_TAG_CONFIG[mood];
                    const active = moodFilters.includes(mood);
                    return (
                      <button
                        key={mood}
                        onClick={() => { toggleMood(mood); }}
                        className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          active ? 'scale-[1.02]' : 'hover:bg-glass-medium'
                        }`}
                        style={{
                          backgroundColor: active ? `${config.color}25` : 'var(--color-glass-subtle)',
                          color: active ? config.color : 'var(--color-text-muted)',
                        }}
                      >
                        {config.icon} {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                {/* Metacritic deliberately omitted: a number nudges users toward
                    other people's opinions of the game instead of their own. We
                    say "try this — we have reason to believe you'll like it,"
                    not "here's how it scored." */}
                {currentPick.hltbMain && (
                  <span>🕐 ~{currentPick.hltbMain}h {currentPick.isNonFinishable ? 'per session' : 'to beat'}</span>
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
              {/* Descriptor — curated prose for known games, mood-based fallback
                  for the rest, with genre + score behind that. Mood-based lines
                  describe the *experience* (what this feels like to play) rather
                  than reception (how critics scored it), which is the move
                  closer to the user's actual question: "is this for me right
                  now?" Curated lines stay accent-purple to signal hand-written;
                  the mood/genre/score tiers share the muted color. */}
              {(() => {
                const desc = getGameDescriptor(
                  currentPick.name,
                  currentPick.metacritic,
                  currentPick.genres,
                  currentPick.moodTags,
                );
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
              {/* Why this game? Collapsed by default — the pick should explain
                  itself. We only justify on demand. The "Beatable in ~Xh" pill
                  generated by getPickReasons is filtered out when hltbMain is
                  already shown in the stat row above (no duplicates). */}
              {(() => {
                // Suppress the time-to-beat reason when the same number is
                // already in the stat row above. Avoids the user reading
                // "~3.1h to beat" twice on the same screen.
                const allReasons = getPickReasons(currentPick);
                const reasons = currentPick.hltbMain
                  ? allReasons.filter((r) => !r.label.startsWith('Beatable in'))
                  : allReasons;
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
                  <div className="mt-3 pt-2 border-t" style={{ borderColor: 'var(--color-glass-border)' }}>
                    <button
                      type="button"
                      onClick={() => setShowWhyThisOne((v) => !v)}
                      className="w-full flex items-center justify-center gap-1.5 text-xs text-text-faint font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1.5 hover:text-text-muted transition-colors"
                      aria-expanded={showWhyThisOne}
                    >
                      <span>Why this one?</span>
                      <span className="text-text-dim normal-case">{showWhyThisOne ? '▴' : '▾'}</span>
                    </button>
                    {showWhyThisOne && (
                      <div className="flex flex-wrap gap-1.5 justify-center">
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
                            style={{ backgroundColor: 'var(--color-glass-subtle)' }}
                          >
                            {r.icon} {r.label}
                          </span>
                        ))}
                      </div>
                    )}
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
                      {SKIP_REASON_OPTIONS.map(({ key, label, icon, spriteKey }) => (
                        <button
                          key={key}
                          onClick={() => handleSkipFeedback(key)}
                          className="px-2.5 py-1.5 rounded-full text-xs font-medium font-[family-name:var(--font-mono)] text-text-dim transition-all hover:text-text-muted hover:bg-glass-medium inline-flex items-center gap-1.5"
                          style={{
                            backgroundColor: 'var(--color-glass-subtle)',
                            border: '1px solid var(--color-glass-border)',
                          }}
                        >
                          {hasSprite(spriteKey) ? (
                            <PixelSprite name={spriteKey} size={14} ariaLabel={label} />
                          ) : (
                            <span aria-hidden="true">{icon}</span>
                          )}
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            </div>
            {/* Action buttons — pinned to bottom. "Not now" was retired
                2026-04-27: the close (×) in the modal header already serves
                that exit. The picker only needs two answers from the user
                here: "this one" or "show me another." */}
            <div className="flex flex-col items-center px-5 py-4 shrink-0 border-t" style={{ borderColor: 'var(--color-glass-border)', backgroundColor: 'var(--color-bg-elevated)' }}>
              <button
                onClick={() => handleLetsGo(currentPick)}
                className="w-full px-3 py-3.5 sm:py-2.5 text-base sm:text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--color-accent-purple)',
                  color: '#0a0a0f',
                }}
              >
                Let&apos;s go
              </button>
              <button
                onClick={() => doRoll()}
                className="mt-2 text-sm font-medium text-text-dim hover:text-text-secondary transition-colors"
              >
                🎲 Roll again
              </button>
            </div>
          </div>
        )}

        {/* The 10-roll forced-choice modal was removed 2026-04-25 — it
            trapped users and read as punitive ("Pick one. No more rolls.").
            Replaced with a one-time soft toast at roll 8 in doRoll above. */}

        {/* Post-accept celebration overlay — fires on commit ("Let's go").
            No auto-dismiss: the user reads it, taps the dismiss CTA, and the
            parent navigates them to Playing Now. The job here is to release
            the user from the app — we made the decision easy, the rest is
            theirs. Steam button uses `steam://rungameid/` (canonical: handles
            install-if-needed, supports non-Steam shortcuts). */}
        {postAccept && (() => {
          // Platform-specific encouragement when we can't deep-launch the game
          // (everything except Steam, for now). Reads off `source` from import.
          const platformLine: Record<string, string> = {
            playstation: 'Fire up the PlayStation.',
            xbox: 'Fire up the Xbox.',
            switch: 'Wake up the Switch.',
            epic: 'Open the Epic launcher.',
            gog: 'Open GOG Galaxy.',
            other: 'Open your launcher.',
          };
          const encourage = postAccept.source === 'steam'
            ? null
            : (platformLine[postAccept.source] || 'Time to play.');
          return (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div
                className="text-center px-8 py-6 max-w-sm"
                style={{ animation: 'scaleIn 300ms ease-out' }}
              >
                <p className="text-xs text-text-faint font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2">
                  Decision made.
                </p>
                <h3 className="text-2xl font-extrabold text-text-primary mb-1">
                  {postAccept.name}
                </h3>
                {(() => {
                  const est = getSessionEstimate(postAccept);
                  return est ? (
                    <p className="text-xs text-text-dim font-[family-name:var(--font-mono)] mb-4">
                      {est}
                    </p>
                  ) : <div className="mb-4" />;
                })()}
                <p className="text-sm text-text-secondary mb-5 leading-relaxed">
                  The hard part&apos;s behind you. Get the controller in your hands. Just go enjoy.
                </p>
                {postAccept.steamAppId && (
                  <a
                    href={`steam://rungameid/${postAccept.steamAppId}`}
                    onClick={() => trackGameLaunchedExternally('steam')}
                    className="inline-block w-full px-5 py-3 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] mb-3"
                    style={{ backgroundColor: 'var(--color-accent-purple)', color: '#0a0a0f' }}
                  >
                    🎮 Open in Steam
                  </a>
                )}
                {encourage && (
                  <p className="text-sm font-medium text-text-primary mb-3">
                    {encourage}
                  </p>
                )}
                <button
                  onClick={handlePostAcceptDismiss}
                  className="w-full px-5 py-2.5 text-sm font-medium rounded-xl border transition-colors"
                  style={{
                    borderColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Going to play
                </button>
              </div>
            </div>
          );
        })()}

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
