/**
 * Analytics event tracking.
 *
 * Backed by Vercel Web Analytics — cookieless, first-party, no consent banner.
 * GA4 + gtag were removed 2026-07-15: adblockers and consent-declines made GA
 * data unreliable (real users didn't show up; only our own un-blocked test
 * sessions did). Vercel's <Analytics/> (mounted in app/layout.tsx) already
 * records page views + unique visitors automatically. This file adds only a
 * small allowlist of custom funnel events on top of that.
 *
 * Every track* function below is preserved so existing call sites across the
 * app keep compiling unchanged — but most are intentional no-ops. Only the
 * activation → play funnel is wired to Vercel right now:
 *
 *     import_completed → pick_committed → game_launched
 *
 * To start recording another event, forward it to track() the same way the
 * three wired ones do. Custom events count toward the Vercel plan's monthly
 * event cap, so keep the wired set small on purpose.
 */
import { track } from '@vercel/analytics';

// ── Wired funnel events ──────────────────────────────────────────────────
// The three signals we most want to see right now: did they activate (import),
// did they reach a decision (commit a pick), did they go play (launch).

export const trackImportCompleted = (source: string, count: number) =>
  track('import_completed', { source, count });

export const trackRerollCommit = (params?: {
  mode?: string;
  mood?: string;
  session_length?: string;
  game_name?: string;
  time_tier?: string;
  smart_pick_type?: string;
  hltb_main?: number;
  rolls_until_commit?: number;
}) =>
  track('pick_committed', {
    mode: params?.mode ?? 'unknown',
    session_length: params?.session_length ?? 'unknown',
  });

export const trackGameLaunchedExternally = (platform: string) =>
  track('game_launched', { platform });

// ── Intentional no-ops ───────────────────────────────────────────────────
// Kept so the ~15 call sites across components/ and lib/ compile untouched.
// Flip any of these on by forwarding to track() like the three above.

const noop = (..._args: unknown[]): void => {};

// Auth
export const trackSignUp = noop;
export const trackLogin = noop;
export const trackLogout = noop;

// Core actions
export const trackImport = noop;
export const trackGameAdded = noop;
export const trackStatusChange = noop;
export const trackGameCleared = noop;
export const trackGameBailed = noop;

// Engagement
export const trackReroll = noop;
export const trackJust5Min = noop;
export const trackDealCheck = noop;
export const trackShareStats = noop;
export const trackShareStatsCard = noop;
export const trackShareClear = noop;

// Discovery
export const trackStatsExpand = noop;
export const trackHelpOpen = noop;

// Onboarding funnel
export const trackSampleStarted = noop;
export const trackSampleCompleted = noop;

// First-action milestones
export const trackFirstRoll = noop;
export const trackFirstCommit = noop;
export const trackFirstCompletion = noop;

// Share + auth conversion
export const trackShareCardCreated = noop;
export const trackSignupCompleted = noop;

// Redteam diagnostics
export const trackPickerOpened = noop;
export const trackTabClicked = noop;
export const trackArchetypeRerolled = noop;

// Top-of-funnel
export const trackLandingView = noop;
