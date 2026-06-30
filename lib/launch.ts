import type { Game } from './types';
import { SOURCE_LABELS } from './constants';

export type DeviceType = 'desktop' | 'ios' | 'android';

export interface LaunchTarget {
  url: string;
  label: string;
  /** Same as label but for games already started (e.g. "Resume on Steam") */
  resumeLabel: string;
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
 * Supports: Steam (protocol URI), Xbox (protocol URI on desktop, store
 * fallback on mobile), PlayStation (store URL — no native protocol).
 */
export function getLaunchTarget(game: Game, device?: DeviceType): LaunchTarget | null {
  const d = device ?? detectDeviceType();

  // Steam: protocol URI. Works on desktop + Android (Steam Link).
  if (game.steamAppId) {
    const label = SOURCE_LABELS[game.source] ?? 'Steam';
    return {
      url: `steam://rungameid/${game.steamAppId}`,
      label: `Launch in ${label}`,
      resumeLabel: `Resume on ${label}`,
      title: `Opens in ${label} (or Steam Link on mobile)`,
    };
  }

  // Xbox: protocol URI on desktop/Android, store URL on iOS (no Xbox app deeplink).
  if (game.xboxTitleId) {
    if (d === 'ios') {
      return {
        url: `https://www.xbox.com/games/store/a/${game.xboxTitleId}`,
        label: 'Open in Xbox Store',
        resumeLabel: 'Open in Xbox Store',
        title: 'Opens the Xbox Store page',
      };
    }
    return {
      url: `xbox://launch/${game.xboxTitleId}`,
      label: 'Launch in Xbox',
      resumeLabel: 'Resume in Xbox',
      title: 'Opens in Xbox app (or Game Pass)',
    };
  }

  // PlayStation: no native protocol URI. Link to PS Store.
  if (game.psnProductId) {
    return {
      url: `https://store.playstation.com/concept/${game.psnProductId}`,
      label: 'Open in PS Store',
      resumeLabel: 'Open in PS Store',
      title: 'Opens the PlayStation Store page',
    };
  }

  return null;
}
