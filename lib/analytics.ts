/**
 * Google Analytics event tracking.
 * Wraps gtag() so the rest of the app doesn't need to worry about
 * whether GA is loaded or what the function signature looks like.
 *
 * All events land in GA4 under Engagement > Events.
 */

type GTagFn = (...args: unknown[]) => void;

function gtag(eventName: string, params?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && typeof (window as unknown as { gtag?: GTagFn }).gtag === 'function') {
    (window as unknown as { gtag: GTagFn }).gtag('event', eventName, params);
  }
}

// Auth
export const trackSignUp = (method: string) => gtag('sign_up', { method });
export const trackLogin = (method: string) => gtag('login', { method });
export const trackLogout = () => gtag('logout');

// Core actions
export const trackImport = (source: string, count: number) => gtag('import_library', { source, game_count: count });
export const trackGameAdded = (source: string) => gtag('game_added', { source });
export const trackStatusChange = (from: string, to: string) => gtag('status_change', { from_status: from, to_status: to });
export const trackGameCleared = () => gtag('game_cleared');
export const trackGameBailed = () => gtag('game_bailed');

// Engagement
export const trackReroll = (mode: string) => gtag('reroll', { mode });
export const trackRerollCommit = () => gtag('reroll_commit');
export const trackJust5Min = () => gtag('just_5_min');
export const trackDealCheck = (game: string) => gtag('deal_check', { game_name: game });
export const trackShareStats = (platform: string) => gtag('share_stats', { platform });
export const trackShareClear = (platform: string, game: string) => gtag('share_clear', { platform, game_name: game });

// Discovery
export const trackStatsExpand = () => gtag('stats_expand');
export const trackHelpOpen = () => gtag('help_open');
