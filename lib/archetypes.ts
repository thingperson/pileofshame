import { Game } from './types';

export interface PlayerArchetype {
  title: string;
  icon: string;
  description: string;
  tone: 'roast' | 'respect' | 'neutral';
}

// --- Theme usage tracking ---

const THEME_USAGE_KEY = 'pos-theme-sessions';

export type ThemeUsage = Record<string, number>;

export function getThemeUsage(): ThemeUsage {
  try {
    const raw = localStorage.getItem(THEME_USAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function trackThemeSession(theme: string) {
  const usage = getThemeUsage();
  usage[theme] = (usage[theme] || 0) + 1;
  try {
    localStorage.setItem(THEME_USAGE_KEY, JSON.stringify(usage));
  } catch { /* quota */ }
}

function getDominantTheme(usage: ThemeUsage): { theme: string; count: number; total: number } | null {
  const entries = Object.entries(usage);
  if (entries.length === 0) return null;
  const total = entries.reduce((sum, [, c]) => sum + c, 0);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return { theme: sorted[0][0], count: sorted[0][1], total };
}

interface PlayerStats {
  totalGames: number;
  completedCount: number;
  bailedCount: number;
  backlogCount: number;
  nowPlayingCount: number;
  completionRate: number; // 0-1
  bailRate: number; // 0-1
  avgHoursPerGame: number;
  oldestBacklogDays: number;
  totalHoursPlayed: number;
  windDownCount: number;
  deepCutCount: number;
  avgRating: number;
  ratedCount: number;
  // Platform stats
  platforms: Set<string>;
  platformCounts: Record<string, number>;
  // Genre stats
  topGenre: string;
  topGenreCount: number;
  uniqueGenres: number;
  // Misc behavioral
  installedCount: number;
  wishlistedCount: number;
  nonFinishableCount: number;
  quickHitCount: number;
  marathonCount: number;
  comfortGameCount: number; // games with 50h+ playtime
}

function computeStats(games: Game[]): PlayerStats {
  const completed = games.filter((g) => g.status === 'played');
  const bailed = games.filter((g) => g.status === 'bailed');
  const backlog = games.filter((g) => g.status === 'buried' || g.status === 'on-deck');
  const nowPlaying = games.filter((g) => g.status === 'playing');
  const totalHours = games.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0);
  const gamesWithHours = games.filter((g) => g.hoursPlayed > 0);

  // Oldest backlog game
  let oldestDays = 0;
  for (const g of backlog) {
    const days = Math.floor((Date.now() - new Date(g.addedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days > oldestDays) oldestDays = days;
  }

  const rated = completed.filter((g) => g.rating && g.rating > 0);
  const avgRating = rated.length > 0
    ? rated.reduce((sum, g) => sum + (g.rating || 0), 0) / rated.length
    : 0;

  // Platform stats
  const platforms = new Set<string>();
  const platformCounts: Record<string, number> = {};
  for (const g of games) {
    platforms.add(g.source);
    platformCounts[g.source] = (platformCounts[g.source] || 0) + 1;
  }

  // Genre stats
  const genreCounts: Record<string, number> = {};
  for (const g of games) {
    for (const genre of (g.genres || [])) {
      const key = genre.toLowerCase();
      genreCounts[key] = (genreCounts[key] || 0) + 1;
    }
  }
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  const topGenre = sortedGenres[0]?.[0] || '';
  const topGenreCount = sortedGenres[0]?.[1] || 0;

  return {
    totalGames: games.length,
    completedCount: completed.length,
    bailedCount: bailed.length,
    backlogCount: backlog.length,
    nowPlayingCount: nowPlaying.length,
    completionRate: games.length > 0 ? completed.length / games.length : 0,
    bailRate: games.length > 0 ? bailed.length / games.length : 0,
    avgHoursPerGame: gamesWithHours.length > 0 ? totalHours / gamesWithHours.length : 0,
    oldestBacklogDays: oldestDays,
    totalHoursPlayed: totalHours,
    windDownCount: games.filter((g) => g.timeTier === 'wind-down').length,
    deepCutCount: games.filter((g) => g.timeTier === 'deep-cut').length,
    avgRating,
    ratedCount: rated.length,
    platforms,
    platformCounts,
    topGenre,
    topGenreCount,
    uniqueGenres: sortedGenres.length,
    installedCount: games.filter((g) => g.installed).length,
    wishlistedCount: games.filter((g) => g.isWishlisted).length,
    nonFinishableCount: games.filter((g) => g.isNonFinishable).length,
    quickHitCount: games.filter((g) => g.timeTier === 'quick-hit').length,
    marathonCount: games.filter((g) => g.timeTier === 'marathon').length,
    comfortGameCount: games.filter((g) => g.hoursPlayed >= 50).length,
  };
}

const ARCHETYPES: ((s: PlayerStats) => PlayerArchetype | null)[] = [
  // === ROASTS ===

  // The Collector — massive library, barely plays
  (s) => {
    if (s.totalGames > 200 && s.completionRate < 0.05) return {
      title: 'Pure Collector',
      icon: '🏛️',
      description: `You've assembled ${s.totalGames} games. You don't have a backlog. You have an empire. The collection is immaculate. Now pick one and give it the attention it deserves.`,
      tone: 'roast',
    };
    return null;
  },

  // The Hoarder — big library, low completion
  (s) => {
    if (s.totalGames > 100 && s.completionRate < 0.1) return {
      title: 'The Hoarder',
      icon: '📦',
      description: `${s.totalGames} games, ${s.completedCount} finished. Your backlog has a backlog. Every Steam sale adds to the pile, but at least you have incredible taste. Let's put a dent in it.`,
      tone: 'roast',
    };
    return null;
  },

  // The Dabbler — lots of low-hour games
  (s) => {
    if (s.totalGames > 30 && s.avgHoursPerGame < 3 && s.completionRate < 0.15) return {
      title: 'The Dabbler',
      icon: '🦋',
      description: `You sample everything and commit to nothing. Yet. Call it exploration. One of those quick dips is going to hook you. When it does, you'll know.`,
      tone: 'roast',
    };
    return null;
  },

  // The Quitter — high bail rate
  (s) => {
    if (s.bailedCount > 5 && s.bailRate > 0.2) return {
      title: 'The Quitter',
      icon: '🚪',
      description: `You've bailed on ${s.bailedCount} games. Aggressive curation, honestly. You know what you don't like, and brother, it's a lot.`,
      tone: 'roast',
    };
    return null;
  },

  // The Juggler — too many games at once
  (s) => {
    if (s.nowPlayingCount >= 4) return {
      title: 'The Juggler',
      icon: '🤹',
      description: `${s.nowPlayingCount} games in flight at once. Call it range. But one of them needs to land on "cleared" soon. Pick your favorite and commit.`,
      tone: 'roast',
    };
    return null;
  },

  // The Archaeologist — ancient backlog
  (s) => {
    if (s.oldestBacklogDays > 365 && s.backlogCount > 20) return {
      title: 'The Archaeologist',
      icon: '🏺',
      description: `Games from ${Math.round(s.oldestBacklogDays / 365) === 1 ? '1 year' : Math.round(s.oldestBacklogDays / 365) + ' years'} ago are still waiting for you. Not dead. Patient. Some of them are genuinely great. Maybe it's time for a resurrection run.`,
      tone: 'roast',
    };
    return null;
  },

  // The Window Shopper — mostly wishlisted
  (s) => {
    if (s.totalGames > 50 && s.totalHoursPlayed < 20) return {
      title: 'The Window Shopper',
      icon: '🪟',
      description: `${s.totalGames} games collected, ${s.totalHoursPlayed} hours played. You've built an incredible library. Now it's time to actually live in it. Pick something short and sweet to get the momentum going.`,
      tone: 'roast',
    };
    return null;
  },

  // === RESPECT ===

  // Backlog Zero — actually cleared everything
  (s) => {
    if (s.backlogCount === 0 && s.completedCount > 5) return {
      title: 'Backlog Zero',
      icon: '👑',
      description: `You actually did it. Zero games in the backlog. ${s.completedCount} cleared. You are a myth. A legend. The other archetypes whisper your name in fear.`,
      tone: 'respect',
    };
    return null;
  },

  // The Completionist — high completion rate
  (s) => {
    if (s.completionRate > 0.5 && s.completedCount > 10) return {
      title: 'The Completionist',
      icon: '🏆',
      description: `${Math.round(s.completionRate * 100)}% completion rate. Every game you buy knows its days are numbered. When you commit, you finish.`,
      tone: 'respect',
    };
    return null;
  },

  // The Sniper — small library, high completion
  (s) => {
    if (s.totalGames < 30 && s.completionRate > 0.4) return {
      title: 'The Sniper',
      icon: '🎯',
      description: `Small library, high kill count. Every purchase is deliberate, every game gets finished. Disciplined. Focused. Honestly kind of intimidating.`,
      tone: 'respect',
    };
    return null;
  },

  // The Redeemer — completing games after long backlog
  (s) => {
    if (s.backlogCount > 50 && s.completedCount > 10 && s.completionRate > 0.08) return {
      title: 'The Redeemer',
      icon: '⚡',
      description: `Big pile, but you're actually chipping away at it. ${s.completedCount} cleared and counting. The backlog fears you now. Keep going.`,
      tone: 'respect',
    };
    return null;
  },

  // The Critic — rates everything, has opinions
  (s) => {
    if (s.ratedCount >= 5 && s.avgRating > 0 && s.avgRating < 3.5) return {
      title: 'The Critic',
      icon: '🧐',
      description: `Average rating: ${s.avgRating.toFixed(1)}/5. You have standards, and most games don't meet them. Your reviews could end careers. Ruthless.`,
      tone: 'neutral',
    };
    return null;
  },

  // The Enthusiast — rates everything highly
  (s) => {
    if (s.ratedCount >= 5 && s.avgRating >= 4.0) return {
      title: 'The Enthusiast',
      icon: '🌟',
      description: `Average rating: ${s.avgRating.toFixed(1)}/5. You love games and games love you back. Either you have great taste or zero standards. We'll never know.`,
      tone: 'neutral',
    };
    return null;
  },

  // === NEUTRAL / CATCH-ALL ===

  // The Deep Diver — high hours per game
  (s) => {
    if (s.avgHoursPerGame > 50) return {
      title: 'The Deep Diver',
      icon: '🫧',
      description: `${Math.round(s.avgHoursPerGame)} hours average per game. When you commit, you COMMIT. You practically move into these games. Rent-free.`,
      tone: 'neutral',
    };
    return null;
  },

  // The Casual — moderate everything
  (s) => {
    if (s.totalGames > 10 && s.totalGames < 50 && s.completionRate > 0.15 && s.completionRate < 0.5) return {
      title: 'The Balanced Gamer',
      icon: '⚖️',
      description: `A healthy mix of playing, clearing, and collecting. You buy smart, play often, and finish what you start. The rest of us could learn something here.`,
      tone: 'neutral',
    };
    return null;
  },

  // === PLATFORM & BEHAVIORAL ===

  // The Omni-Gamer — imported from 3+ platforms
  (s) => {
    const importPlatforms = [...s.platforms].filter(p => p !== 'other');
    if (importPlatforms.length >= 3) return {
      title: 'The Omni-Gamer',
      icon: '🌐',
      description: `Games on ${importPlatforms.length} different platforms. Each one has its own pile and none of them talk to each other. You're running a multi-platform shame empire.`,
      tone: 'roast',
    };
    return null;
  },

  // Steam Loyalist — 90%+ games are Steam
  (s) => {
    const steamPct = (s.platformCounts['steam'] || 0) / s.totalGames;
    if (s.totalGames > 30 && steamPct > 0.9) return {
      title: 'Steam Loyalist',
      icon: '🚂',
      description: `${Math.round(steamPct * 100)}% of your library is Steam. Gabe Newell sends you a Christmas card. Your wallet flinches every June and December.`,
      tone: 'neutral',
    };
    return null;
  },

  // PlayStation Purist
  (s) => {
    const psnPct = (s.platformCounts['playstation'] || 0) / s.totalGames;
    if (s.totalGames > 20 && psnPct > 0.7) return {
      title: 'PlayStation Purist',
      icon: '🎮',
      description: `${Math.round(psnPct * 100)}% PlayStation. You bleed blue. Your backlog is a trophy case of games you'll "definitely get the platinum for someday."`,
      tone: 'neutral',
    };
    return null;
  },

  // The Genre Fiend — one genre dominates heavily
  (s) => {
    if (s.totalGames > 20 && s.topGenreCount > s.totalGames * 0.4 && s.topGenre) {
      const genre = s.topGenre.charAt(0).toUpperCase() + s.topGenre.slice(1);
      return {
        title: `${genre} Addict`,
        icon: '🧬',
        description: `${s.topGenreCount} of your ${s.totalGames} games are ${genre}. At this point it's less a preference and more a condition. There are other genres. Allegedly.`,
        tone: 'roast',
      };
    }
    return null;
  },

  // The Quick Draw — library dominated by quick-hit games
  (s) => {
    if (s.totalGames > 15 && s.quickHitCount > s.totalGames * 0.4) return {
      title: 'The Quick Draw',
      icon: '⚡',
      description: `${s.quickHitCount} quick-hit games. You like your sessions short, your commits fast, and your attention span... wait, what were we saying?`,
      tone: 'neutral',
    };
    return null;
  },

  // The Endurance Runner — lots of marathon games
  (s) => {
    if (s.marathonCount >= 5 && s.marathonCount > s.totalGames * 0.15) return {
      title: 'The Endurance Runner',
      icon: '🏔️',
      description: `${s.marathonCount} marathon-length games in the pile. Each one is a 60+ hour commitment. At this rate you're planning a sabbatical, not a gaming session.`,
      tone: 'roast',
    };
    return null;
  },

  // The Installer — tons of games installed, not playing them
  (s) => {
    if (s.installedCount > 15 && s.nowPlayingCount <= 1) return {
      title: 'The Optimizer',
      icon: '💾',
      description: `${s.installedCount} games installed and ready to launch. The hard part is done. They're right there. Close this tab and pick one. We'll be here when you get back.`,
      tone: 'roast',
    };
    return null;
  },

  // The Wishful Thinker — lots of wishlisted games
  (s) => {
    if (s.wishlistedCount >= 10 && s.backlogCount > 50) return {
      title: 'The Wishful Thinker',
      icon: '🌠',
      description: `${s.wishlistedCount} games on the wishlist while ${s.backlogCount} sit unplayed. You're shopping for more problems before solving the ones you have. We admire the audacity.`,
      tone: 'roast',
    };
    return null;
  },

  // The Eclectic — plays a ton of different genres
  (s) => {
    if (s.uniqueGenres >= 10 && s.totalGames > 30) return {
      title: 'The Eclectic',
      icon: '🎨',
      description: `${s.uniqueGenres} different genres across your library. RPGs, puzzles, shooters, simulators. No type, just range. A backlog sommelier.`,
      tone: 'neutral',
    };
    return null;
  },

  // The Cozy Craver — has comfort games with high playtime
  (s) => {
    if (s.comfortGameCount >= 2) return {
      title: 'Cozy Craver',
      icon: '🏕️',
      description: `${s.comfortGameCount} games with 50+ hours each. You have your comfort picks and you know which ones they are. When indecision strikes, these are where you land. Comfort is valid, and you're getting the hang of exploring the rest too.`,
      tone: 'neutral',
    };
    return null;
  },

  // The Infinite Player — lots of non-finishable games
  (s) => {
    if (s.nonFinishableCount >= 5 && s.nonFinishableCount > s.totalGames * 0.15) return {
      title: 'The Infinite Player',
      icon: '♾️',
      description: `${s.nonFinishableCount} games in your library that can't technically be "finished." MMOs, sandboxes, endless modes. Nothing wrong with that. Some games are meant to be ongoing. Just don't let them crowd out the ones with endings.`,
      tone: 'neutral',
    };
    return null;
  },

  // The Momentum Builder — recently clearing games at a good clip
  (s) => {
    if (s.completedCount >= 3 && s.completedCount > s.bailedCount * 2 && s.nowPlayingCount >= 1) return {
      title: 'The Momentum Builder',
      icon: '🚀',
      description: `${s.completedCount} cleared, ${s.nowPlayingCount} in progress, and you're actually finishing more than you're bailing on. This is what progress looks like. Keep the streak alive.`,
      tone: 'respect',
    };
    return null;
  },

  // The Bargain Hunter — lots of games, low hours = sale buyer
  (s) => {
    if (s.totalGames > 80 && s.avgHoursPerGame < 5 && s.completionRate < 0.1) return {
      title: 'The Bargain Hunter',
      icon: '🏷️',
      description: `You can't resist a deal. ${s.totalGames} games, most of them under 5 hours played. Every sale is an event, every bundle a treasure chest. The library is stacked. Time to actually unwrap some of those gifts you bought yourself.`,
      tone: 'roast',
    };
    return null;
  },

  // The Night Owl — has lots of long-session games
  (s) => {
    if (s.deepCutCount >= 8 && s.marathonCount >= 3) return {
      title: 'The Night Owl',
      icon: '🦉',
      description: `Your library is stacked with games that demand long sessions. Deep cuts, marathons, sprawling RPGs. You block out entire evenings for this. Respect the commitment.`,
      tone: 'neutral',
    };
    return null;
  },
];

// --- Theme archetypes (based on usage frequency) ---

interface ThemeArchetypeDef {
  theme: string;
  minSessions: number;
  minPct: number; // % of total sessions on this theme
  archetype: PlayerArchetype;
}

const THEME_ARCHETYPES: ThemeArchetypeDef[] = [
  {
    theme: 'dino',
    minSessions: 8,
    minPct: 0.4,
    archetype: {
      title: 'Dino Devotee',
      icon: '🦖',
      description: `You spend so much time in dino mode that you've been voted most likely to open an actual clone-based theme park. Careful though. They're clever girls.`,
      tone: 'neutral',
    },
  },
  {
    theme: '90s',
    minSessions: 8,
    minPct: 0.4,
    archetype: {
      title: 'Webmaster Supreme',
      icon: '🚧',
      description: `You live in the 90s theme. Your backlog is under construction. Your soul is a geocities page. You probably still have an AOL email.`,
      tone: 'neutral',
    },
  },
  {
    theme: '80s',
    minSessions: 8,
    minPct: 0.4,
    archetype: {
      title: 'Synthwave Surfer',
      icon: '🌆',
      description: `The neon glow calls to you. You've used the 80s theme so much that your retinas are permanently tinted pink and purple. Outrun your backlog.`,
      tone: 'neutral',
    },
  },
  {
    theme: 'ultra',
    minSessions: 8,
    minPct: 0.4,
    archetype: {
      title: 'ULTRA Devotee',
      icon: '⚡',
      description: `Chartreuse everything. Sharp edges. Zero border radius. ULTRA mode has consumed you. Your backlog glows in the dark.`,
      tone: 'neutral',
    },
  },
  {
    theme: 'future',
    minSessions: 8,
    minPct: 0.4,
    archetype: {
      title: 'Holographic Entity',
      icon: '🔮',
      description: `You browse your backlog through a holographic lens. The future theme has claimed you. In the year 3000, your pile will still be there.`,
      tone: 'neutral',
    },
  },
  {
    theme: 'weird',
    minSessions: 8,
    minPct: 0.4,
    archetype: {
      title: 'The Unsettling One',
      icon: '👁️',
      description: `You chose weird mode. And you stayed. Most people flip back after 30 seconds. You leaned in. We're not sure what that says about you but we respect it.`,
      tone: 'neutral',
    },
  },
  {
    theme: 'light',
    minSessions: 15,
    minPct: 0.6,
    archetype: {
      title: 'The Lighthouse',
      icon: '☀️',
      description: `Light mode. Voluntarily. Your monitor is a flashbang and your pile is fully illuminated. There is nowhere to hide from your unplayed games.`,
      tone: 'roast',
    },
  },
  {
    theme: 'void',
    minSessions: 8,
    minPct: 0.4,
    archetype: {
      title: 'The Minimalist',
      icon: '🫥',
      description: `You use Void mode. No library. No stats. No distractions. Just "pick for me" and go. You understood the assignment better than anyone.`,
      tone: 'respect',
    },
  },
];

// Ultimate fallback
const FALLBACK: PlayerArchetype = {
  title: 'The Gamer',
  icon: '🎮',
  description: `You've got a pile. It's growing. Every gamer's does. The good news? You're here, which means you're ready to actually play some of them. Let's get started.`,
  tone: 'neutral',
};

export interface ArchetypeOptions {
  // When false (default), roast-tone archetypes are filtered out. Respects the
  // product rule that shame/critique framing must be opt-in.
  includeRoasts?: boolean;
}

export function getAllMatchingArchetypes(
  games: Game[],
  themeUsage?: ThemeUsage,
  opts?: ArchetypeOptions,
): PlayerArchetype[] {
  const includeRoasts = opts?.includeRoasts ?? false;
  if (games.length < 3) return [FALLBACK];

  const stats = computeStats(games);
  const matches: PlayerArchetype[] = [];

  for (const check of ARCHETYPES) {
    const result = check(stats);
    if (result) matches.push(result);
  }

  // Theme-based archetypes
  if (themeUsage) {
    const dominant = getDominantTheme(themeUsage);
    if (dominant) {
      for (const ta of THEME_ARCHETYPES) {
        if (
          ta.theme === dominant.theme &&
          dominant.count >= ta.minSessions &&
          dominant.total > 0 &&
          dominant.count / dominant.total >= ta.minPct
        ) {
          matches.push(ta.archetype);
        }
      }
    }
  }

  const filtered = includeRoasts
    ? matches
    : matches.filter((m) => m.tone !== 'roast');

  return filtered.length > 0 ? filtered : [FALLBACK];
}

export function getPlayerArchetype(games: Game[], opts?: ArchetypeOptions): PlayerArchetype {
  return getAllMatchingArchetypes(games, undefined, opts)[0];
}

/**
 * Maps archetype titles → pixel sprite keys. See lib/pixel/data/personas.json.
 * Full coverage as of 2026-04-25 — every archetype has a sprite. Dynamic
 * "<Genre> Addict" archetypes use the generic genreAddict sprite (handled
 * in getArchetypeSpriteKey).
 */
export const SPRITE_KEY_BY_TITLE: Record<string, string> = {
  'Pure Collector': 'pureCollector',
  'The Hoarder': 'hoarder',
  'The Dabbler': 'dabbler',
  'The Quitter': 'quitter',
  'The Juggler': 'juggler',
  'The Archaeologist': 'archaeologist',
  'The Window Shopper': 'windowShopper',
  'Backlog Zero': 'backlogZero',
  'The Completionist': 'completionist',
  'The Sniper': 'sniper',
  'The Redeemer': 'redeemer',
  'The Critic': 'critic',
  'The Enthusiast': 'enthusiast',
  'The Deep Diver': 'deepdiver',
  'The Balanced Gamer': 'balanced',
  'The Omni-Gamer': 'omniGamer',
  'Steam Loyalist': 'steamLoyalist',
  'PlayStation Purist': 'psPurist',
  'The Quick Draw': 'quickDraw',
  'The Endurance Runner': 'enduranceRunner',
  'The Optimizer': 'optimizer',
  'The Wishful Thinker': 'wishfulThinker',
  'The Eclectic': 'eclectic',
  'Cozy Craver': 'cozy',
  'The Infinite Player': 'infinite',
  'The Momentum Builder': 'momentumBuilder',
  'The Bargain Hunter': 'bargainHunter',
  'The Night Owl': 'nightOwl',
  'Dino Devotee': 'dino',
  'Webmaster Supreme': 'webmaster',
  'Synthwave Surfer': 'synthwave',
  'ULTRA Devotee': 'ultraDevotee',
  'Holographic Entity': 'hologram',
  'The Unsettling One': 'unsettling',
  'The Lighthouse': 'lighthouse',
  'The Minimalist': 'minimalist',
  'The Gamer': 'gamer',
};

export function getArchetypeSpriteKey(archetype: PlayerArchetype): string | undefined {
  // Dynamic "<Genre> Addict" archetype uses the generic genreAddict sprite.
  if (archetype.title.endsWith(' Addict')) return 'genreAddict';
  return SPRITE_KEY_BY_TITLE[archetype.title];
}
