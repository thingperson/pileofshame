import { MoodTag, TimeTier } from './types';

/**
 * Auto-enrichment engine.
 * Maps RAWG genres/tags → mood tags, HLTB hours → session tiers.
 * No user input required — the app does the categorization work.
 */

// Genre → Mood mapping. A genre can map to multiple moods.
const GENRE_MOOD_MAP: Record<string, MoodTag[]> = {
  // RAWG genres
  'Action': ['intense'],
  'Adventure': ['story-rich', 'atmospheric'],
  'RPG': ['story-rich', 'strategic'],
  'Strategy': ['strategic'],
  'Puzzle': ['brainless', 'chill'],
  'Platformer': ['chill'],
  'Shooter': ['intense', 'competitive'],
  'Fighting': ['intense', 'competitive'],
  'Racing': ['competitive', 'brainless'],
  'Sports': ['competitive', 'brainless'],
  'Simulation': ['chill', 'creative'],
  'Casual': ['brainless', 'chill'],
  'Indie': ['atmospheric'],
  'Family': ['chill', 'brainless'],
  'Board Games': ['strategic', 'chill'],
  'Card': ['strategic', 'chill'],
  'Massively Multiplayer': ['competitive'],
  'Educational': ['brainless'],
  'Arcade': ['brainless', 'intense'],

  // Common RAWG tags (these show up in genre lists sometimes)
  'Horror': ['spooky', 'atmospheric'],
  'Survival': ['intense', 'atmospheric'],
  'Sandbox': ['creative', 'chill'],
  'Open World': ['atmospheric'],
  'Stealth': ['strategic', 'atmospheric'],
  'Music': ['chill', 'brainless'],
  'Visual Novel': ['story-rich', 'emotional'],
  'Point-and-click': ['story-rich', 'chill'],
  'Metroidvania': ['atmospheric', 'intense'],
  'Roguelike': ['intense', 'strategic'],
  'Roguelite': ['intense'],
  'Souls-like': ['intense'],
  'Walking Simulator': ['atmospheric', 'emotional', 'chill'],
  'City Builder': ['creative', 'strategic'],
  'Tower Defense': ['strategic'],
  'Hack and Slash': ['intense', 'brainless'],
  'Beat \'em up': ['intense', 'brainless'],
  'Narrative': ['story-rich', 'emotional'],
  'Exploration': ['atmospheric', 'chill'],
  'Relaxing': ['chill', 'brainless'],
  'Cozy': ['chill'],
  'Emotional': ['emotional', 'story-rich'],
  'Atmospheric': ['atmospheric'],
  'Competitive': ['competitive', 'intense'],
  'Co-op': ['chill'],
  'Multiplayer': ['competitive'],
};

// Well-known games that need specific mood overrides
// (because genre alone doesn't capture what the game FEELS like)
const GAME_MOOD_OVERRIDES: Record<string, MoodTag[]> = {
  'Stardew Valley': ['chill', 'creative'],
  'PowerWash Simulator': ['brainless', 'chill'],
  'Animal Crossing': ['chill', 'creative'],
  'Celeste': ['intense', 'emotional'],
  'Hollow Knight': ['atmospheric', 'intense'],
  'Hades': ['intense'],
  'Hades II': ['intense'],
  'Disco Elysium': ['story-rich', 'emotional'],
  'The Witcher 3': ['story-rich', 'atmospheric'],
  'Elden Ring': ['intense', 'atmospheric'],
  'Dark Souls': ['intense', 'atmospheric'],
  'Bloodborne': ['intense', 'spooky', 'atmospheric'],
  'Sekiro': ['intense'],
  'Minecraft': ['creative', 'chill'],
  'Terraria': ['creative', 'chill'],
  'Portal': ['brainless', 'story-rich'],
  'Portal 2': ['story-rich'],
  'Undertale': ['emotional', 'story-rich'],
  'Outer Wilds': ['atmospheric', 'story-rich'],
  'Return of the Obra Dinn': ['strategic', 'atmospheric'],
  'What Remains of Edith Finch': ['emotional', 'story-rich'],
  'Firewatch': ['atmospheric', 'emotional'],
  'Journey': ['atmospheric', 'emotional', 'chill'],
  'Rocket League': ['competitive', 'brainless'],
  'Counter-Strike': ['competitive', 'intense'],
  'Dota 2': ['competitive', 'strategic'],
  'League of Legends': ['competitive', 'strategic'],
  'Valorant': ['competitive', 'intense'],
  'Civilization': ['strategic'],
  'XCOM': ['strategic', 'intense'],
  'Factorio': ['strategic', 'creative'],
  'Satisfactory': ['creative', 'chill'],
  'Subnautica': ['atmospheric', 'spooky'],
  'Amnesia': ['spooky'],
  'Resident Evil': ['spooky', 'intense'],
  'Silent Hill': ['spooky', 'atmospheric'],
  'Phasmophobia': ['spooky', 'competitive'],
  'The Sims': ['creative', 'chill', 'brainless'],
  'Cities: Skylines': ['creative', 'chill'],
  'Tetris': ['brainless', 'chill'],
  'Vampire Survivors': ['brainless', 'intense'],
  'Balatro': ['strategic', 'brainless'],
  'Slay the Spire': ['strategic'],
  'Mass Effect': ['story-rich', 'emotional'],
  'Baldur\'s Gate 3': ['story-rich', 'strategic'],
  'God of War': ['intense', 'story-rich'],
  'The Last of Us': ['story-rich', 'emotional', 'intense'],
  'Red Dead Redemption': ['story-rich', 'atmospheric'],
  'Breath of the Wild': ['atmospheric', 'creative'],
  'Tears of the Kingdom': ['atmospheric', 'creative'],
};

/**
 * Infer mood tags from genres.
 * Checks overrides first (fuzzy match on game name), then maps genres.
 */
export function inferMoodTags(gameName: string, genres?: string[]): MoodTag[] {
  // Check overrides first (fuzzy: game name starts with or contains the key)
  const nameLower = gameName.toLowerCase();
  for (const [key, moods] of Object.entries(GAME_MOOD_OVERRIDES)) {
    if (nameLower.includes(key.toLowerCase())) {
      return moods;
    }
  }

  if (!genres || genres.length === 0) return [];

  // Collect all mood tags from genre mapping
  const moodSet = new Set<MoodTag>();
  for (const genre of genres) {
    const moods = GENRE_MOOD_MAP[genre];
    if (moods) {
      moods.forEach((m) => moodSet.add(m));
    }
  }

  // Deduplicate and limit to top 3 most relevant
  const result = Array.from(moodSet);
  return result.slice(0, 3);
}

/**
 * Infer session tier from HLTB main story hours.
 */
export function inferTimeTier(hltbMainHours: number): TimeTier {
  if (hltbMainHours <= 3) return 'quick-hit';
  if (hltbMainHours <= 12) return 'wind-down';
  if (hltbMainHours <= 35) return 'deep-cut';
  return 'marathon';
}

/**
 * MOOD_TAG_CONFIG: Display labels, colors, and descriptions for mood tags.
 */
export const MOOD_TAG_CONFIG: Record<MoodTag, { label: string; icon: string; color: string }> = {
  'chill': { label: 'Chill', icon: '😌', color: '#34d399' },
  'intense': { label: 'Intense', icon: '⚡', color: '#f87171' },
  'story-rich': { label: 'Story Rich', icon: '📖', color: '#93c5fd' },
  'brainless': { label: 'Brain Off', icon: '🧹', color: '#fbbf24' },
  'atmospheric': { label: 'Atmospheric', icon: '🌌', color: '#a78bfa' },
  'competitive': { label: 'Competitive', icon: '🏆', color: '#fb923c' },
  'spooky': { label: 'Spooky', icon: '👻', color: '#6ee7b7' },
  'creative': { label: 'Creative', icon: '🎨', color: '#f9a8d4' },
  'strategic': { label: 'Strategic', icon: '♟️', color: '#38bdf8' },
  'emotional': { label: 'Emotional', icon: '💔', color: '#e879f9' },
};

/**
 * Generate a playtime roast for games with excessive hours.
 */
export function getPlaytimeRoast(gameName: string, hours: number): string | null {
  if (hours < 50) return null;

  // Game-specific roasts
  const nameLower = gameName.toLowerCase();
  if (nameLower.includes('rocket league') && hours > 500) {
    return `${hours.toLocaleString()}h of car soccer. Your pile isn't clearing itself while you're doing aerials.`;
  }
  if (nameLower.includes('stardew') && hours > 100) {
    return `${hours.toLocaleString()}h. The farm isn't going to water itself, but your backlog isn't either.`;
  }
  if ((nameLower.includes('dota') || nameLower.includes('league of legends')) && hours > 500) {
    return `${hours.toLocaleString()}h. You could've beaten your entire backlog in this time. Twice.`;
  }
  if (nameLower.includes('civilization') && hours > 200) {
    return `${hours.toLocaleString()}h. "Just one more turn" is why you have a pile.`;
  }
  if (nameLower.includes('factorio') && hours > 200) {
    return `${hours.toLocaleString()}h. The factory must grow. Your pile must not.`;
  }
  if (nameLower.includes('skyrim') && hours > 200) {
    return `${hours.toLocaleString()}h and you probably still haven't finished the main quest.`;
  }
  if (nameLower.includes('counter-strike') && hours > 500) {
    return `${hours.toLocaleString()}h. Your rank went up. Your pile didn't go down.`;
  }

  // Generic roasts by hour threshold
  if (hours >= 1000) {
    return `${hours.toLocaleString()}h in this one game. That's literally weeks of your life. No wonder your pile isn't shrinking.`;
  }
  if (hours >= 500) {
    return `${hours.toLocaleString()}h. This game alone could've cleared half your backlog.`;
  }
  if (hours >= 200) {
    return `${hours.toLocaleString()}h. Is this a game or a second job?`;
  }
  if (hours >= 100) {
    return `${hours.toLocaleString()}h. You clearly like this one, but your other games are getting jealous.`;
  }
  if (hours >= 50) {
    return `${hours.toLocaleString()}h. That's a solid investment. Time to move on?`;
  }

  return null;
}
