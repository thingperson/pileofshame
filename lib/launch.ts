import type { Game } from './types';
import { SOURCE_LABELS } from './constants';

export type DeviceType = 'desktop' | 'ios' | 'android';

export interface LaunchTarget {
  url: string;
  label: string;
  /** Tooltip explaining behavior (e.g. "Opens in Steam (or Steam Link on mobile)") */
  title: string;
}

/**
 * Detect device type from user agent. Returns 'desktop' as default.
 * Call client-side only (needs navigator).
 */
export function detectDeviceType(): DeviceType {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

/**
 * Given a game, returns the launch target (URL + label) or null if no
 * launch action is available.
 *
 * Phase 1: Steam only. Future phases add PSN, Xbox, Epic, GOG, Switch.
 */
export function getLaunchTarget(game: Game, _device?: DeviceType): LaunchTarget | null {
  // Steam: use the protocol URI. Works on desktop + Android (Steam Link).
  // iOS Safari often blocks custom protocol URIs, but Steam Link handles it.
  if (game.steamAppId) {
    const label = SOURCE_LABELS[game.source] ?? 'Steam';
    return {
      url: `steam://rungameid/${game.steamAppId}`,
      label: `Launch in ${label}`,
      title: `Opens in ${label} (or Steam Link on mobile)`,
    };
  }

  // Future: other platforms will slot in here.
  return null;
}
