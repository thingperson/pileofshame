import { Game } from './types';

export interface PlayerArchetype {
  title: string;
  icon: string;
  description: string;
  tone: 'roast' | 'respect' | 'neutral';
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
  };
}

const ARCHETYPES: ((s: PlayerStats) => PlayerArchetype | null)[] = [
  // === ROASTS ===

  // The Collector — massive library, barely plays
  (s) => {
    if (s.totalGames > 200 && s.completionRate < 0.05) return {
      title: 'Pure Collector',
      icon: '🏛️',
      description: `A non-gamer with true gamer taste. You own ${s.totalGames} games just so you can say you own them. The only question is... why?`,
      tone: 'roast',
    };
    return null;
  },

  // The Hoarder — big library, low completion
  (s) => {
    if (s.totalGames > 100 && s.completionRate < 0.1) return {
      title: 'The Hoarder',
      icon: '📦',
      description: `${s.totalGames} games and you've finished ${s.completedCount}. Your backlog has a backlog. Every Steam sale is a crime scene and you're the perpetrator.`,
      tone: 'roast',
    };
    return null;
  },

  // The Dabbler — lots of low-hour games
  (s) => {
    if (s.totalGames > 30 && s.avgHoursPerGame < 3 && s.completionRate < 0.15) return {
      title: 'The Dabbler',
      icon: '🦋',
      description: `You dip in. You dip out. You try a few new titles. Now you forgot the story and controls. Dabbling ain't easy. You make it an artform.`,
      tone: 'roast',
    };
    return null;
  },

  // The Quitter — high bail rate
  (s) => {
    if (s.bailedCount > 5 && s.bailRate > 0.2) return {
      title: 'The Quitter',
      icon: '🚪',
      description: `You've bailed on ${s.bailedCount} games. That's not giving up, that's aggressive curation. You know what you don't like, and brother, it's a lot.`,
      tone: 'roast',
    };
    return null;
  },

  // The Juggler — too many games at once
  (s) => {
    if (s.nowPlayingCount >= 4) return {
      title: 'The Juggler',
      icon: '🤹',
      description: `${s.nowPlayingCount} games "in progress" simultaneously. You're not playing games, you're managing a portfolio. None of them will be finished.`,
      tone: 'roast',
    };
    return null;
  },

  // The Archaeologist — ancient backlog
  (s) => {
    if (s.oldestBacklogDays > 365 && s.backlogCount > 20) return {
      title: 'The Archaeologist',
      icon: '🏺',
      description: `You have games from ${Math.round(s.oldestBacklogDays / 365) === 1 ? '1 year' : Math.round(s.oldestBacklogDays / 365) + ' years'} ago collecting dust. At this point they're not a backlog, they're artifacts. Future civilizations will study your Steam library.`,
      tone: 'roast',
    };
    return null;
  },

  // The Window Shopper — mostly wishlisted
  (s) => {
    if (s.totalGames > 50 && s.totalHoursPlayed < 20) return {
      title: 'The Window Shopper',
      icon: '🪟',
      description: `${s.totalGames} games in the library, ${s.totalHoursPlayed} hours actually played. You don't play games, you curate a museum. Admission is free but nobody visits.`,
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
      description: `${Math.round(s.completionRate * 100)}% completion rate. You don't just play games. You defeat them. When you buy a game, it knows its days are numbered.`,
      tone: 'respect',
    };
    return null;
  },

  // The Sniper — small library, high completion
  (s) => {
    if (s.totalGames < 30 && s.completionRate > 0.4) return {
      title: 'The Sniper',
      icon: '🎯',
      description: `Small library, high kill count. You don't waste time on games you won't finish. Disciplined. Focused. Honestly kind of intimidating.`,
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
      description: `${Math.round(s.avgHoursPerGame)} hours average per game. When you commit, you COMMIT. You don't play games. You move into them. Rent-free.`,
      tone: 'neutral',
    };
    return null;
  },

  // The Casual — moderate everything
  (s) => {
    if (s.totalGames > 10 && s.totalGames < 50 && s.completionRate > 0.15 && s.completionRate < 0.5) return {
      title: 'The Balanced Gamer',
      icon: '⚖️',
      description: `A healthy mix of playing, clearing, and accumulating. You're disgustingly well-adjusted. Where's the shame in that? Boring, but admirable.`,
      tone: 'neutral',
    };
    return null;
  },
];

// Ultimate fallback
const FALLBACK: PlayerArchetype = {
  title: 'The Gamer',
  icon: '🎮',
  description: `You've got a pile. It's not massive. Yet. But we both know how this ends. Every gamer starts somewhere, and this is your somewhere. Welcome to the intervention.`,
  tone: 'neutral',
};

export function getAllMatchingArchetypes(games: Game[]): PlayerArchetype[] {
  if (games.length < 3) return [FALLBACK];

  const stats = computeStats(games);
  const matches: PlayerArchetype[] = [];

  for (const check of ARCHETYPES) {
    const result = check(stats);
    if (result) matches.push(result);
  }

  return matches.length > 0 ? matches : [FALLBACK];
}

export function getPlayerArchetype(games: Game[]): PlayerArchetype {
  return getAllMatchingArchetypes(games)[0];
}
