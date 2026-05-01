/**
 * Google Analytics event tracking.
 * Wraps gtag() so the rest of the app doesn't need to worry about
 * whether GA is loaded or what the function signature looks like.
 *
 * All events land in GA4 under Engagement > Events.
 */

type GTagFn = (...args: unknown[]) => void;
type ParamValue = string | number | boolean | undefined | null;

function gtag(eventName: string, params?: Record<string, ParamValue>) {
  if (typeof window === 'undefined') return;

  const w = window as unknown as { gtag?: GTagFn; dataLayer?: unknown[] };

  // Lazy-init gtag stub. Without this, any tracker called before
  // gtag.js finishes loading silently no-ops (e.g. trackLandingView
  // in a useEffect that runs during hydration, before the consent-
  // gated afterInteractive script). The stub queues calls into
  // window.dataLayer; when gtag.js eventually loads (post-consent),
  // it drains that queue. Privacy-safe — dataLayer is an in-memory
  // array. If user declines consent, gtag.js never loads and the
  // queue is GC'd on unload. No data leaves the browser pre-consent.
  if (typeof w.gtag !== 'function') {
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    };
  }

  // Strip undefined/null so GA4 doesn't store empty values that bloat reports.
  const clean = params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null))
    : undefined;
  w.gtag('event', eventName, clean);
}

// Auth
export const trackSignUp = (method: string) => gtag('sign_up', { method });
export const trackLogin = (method: string) => gtag('login', { method });
export const trackLogout = () => gtag('logout');

// Core actions
export const trackImport = (source: string, count: number) => gtag('import_library', { source, game_count: count });
export const trackGameAdded = (source: string) => gtag('game_added', { source });
export const trackStatusChange = (from: string, to: string) => gtag('status_change', { from_status: from, to_status: to });
export const trackGameCleared = (params?: {
  game_name?: string;
  hours_played?: number;
  hltb_main?: number;
  time_tier?: string;
  rating?: number;
}) => gtag('game_cleared', params);
export const trackGameBailed = () => gtag('game_bailed');

// Engagement
export const trackReroll = (
  mode: string,
  params?: { mood?: string; session_length?: string; roll_index?: number },
) => gtag('reroll', { mode, ...params });

export const trackRerollCommit = (params?: {
  mode?: string;
  mood?: string;
  session_length?: string;
  game_name?: string;
  time_tier?: string;
  smart_pick_type?: string;
  hltb_main?: number;
  rolls_until_commit?: number;
}) => gtag('reroll_commit', params);

export const trackJust5Min = (params?: { game_name?: string; time_tier?: string }) =>
  gtag('just_5_min', params);
export const trackDealCheck = (game: string) => gtag('deal_check', { game_name: game });
export const trackShareStats = (platform: string) => gtag('share_stats', { platform });
export const trackShareStatsCard = (action: string) => gtag('share_stats_card', { action });
export const trackShareClear = (platform: string, game: string) => gtag('share_clear', { platform, game_name: game });

// Discovery
export const trackStatsExpand = () => gtag('stats_expand');
export const trackHelpOpen = () => gtag('help_open');

// ── Funnel / Key Event milestones ──────────────────────────────────────
// These are the events to mark as "Key Events" in GA4 Admin → Events.
// They fire in addition to (not instead of) the granular events above, so
// existing detail reporting is preserved.
//
// "first_*" events use a localStorage guard so each browser fires them at
// most once. That makes them clean conversion signals.

function fireOnce(flagKey: string, fn: () => void): void {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(flagKey) === '1') return;
    localStorage.setItem(flagKey, '1');
  } catch {
    // If storage is unavailable, fall through — fire anyway.
  }
  fn();
}

// Onboarding funnel
export const trackSampleStarted = () => gtag('sample_started');
export const trackSampleCompleted = () => fireOnce('if-ga-sample-completed', () => gtag('sample_completed'));
export const trackImportCompleted = (source: string, count: number) =>
  gtag('import_completed', { source, game_count: count });

// First-action milestones (once per browser)
export const trackFirstRoll = () => fireOnce('if-ga-first-roll', () => gtag('first_roll'));
export const trackFirstCommit = () => fireOnce('if-ga-first-commit', () => gtag('first_commit'));
export const trackFirstCompletion = () => fireOnce('if-ga-first-completion', () => gtag('first_completion'));

// Share + auth conversion
export const trackShareCardCreated = (game: string) => gtag('share_card_created', { game_name: game });
export const trackSignupCompleted = () => gtag('signup_completed');

// ── Round-1 redteam diagnostic events (2026-04-27) ─────────────────────
// Answer: do returning users actually use the picker, or default to
// browsing tabs? Without these we cannot adjudicate any other audit
// finding from data. Anonymous, no game/user IDs, GA4-clean.
export const trackPickerOpened = (entry: string) => gtag('picker_opened', { entry });
export const trackTabClicked = (tab: string) => gtag('tab_clicked', { tab });
export const trackGameLaunchedExternally = (platform: string) =>
  gtag('game_launched_externally', { platform });

// Archetype reroll — distinguishes character-novelty (1–3/session) from
// sticky engagement (10+). If reroll volume reads sticky we have an
// engagement loop competing with "go play" on a stats page.
export const trackArchetypeRerolled = (params?: {
  from_archetype?: string;
  to_archetype?: string;
}) => gtag('archetype_rerolled', params);

// Top-of-funnel — fires once per browser tab session when LandingPage
// mounts. has_library distinguishes returning users from cold visitors,
// which is the funnel signal we actually care about. Without this event,
// landing → sample-load and landing → import-start are unmeasurable.
export const trackLandingView = (params?: { has_library?: boolean }) => {
  if (typeof window === 'undefined') return;
  try {
    if (sessionStorage.getItem('if-ga-landing-view') === '1') return;
    sessionStorage.setItem('if-ga-landing-view', '1');
  } catch {
    // sessionStorage unavailable — fire anyway, GA4 will dedupe by session
  }
  gtag('landing_view', {
    has_library: params?.has_library ? 1 : 0,
  });
};
