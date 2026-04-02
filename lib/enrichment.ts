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
/**
 * Game-specific roast config: [name match, hour threshold, roast template].
 * Templates use {h} for formatted hours. Keep it warm, never mean.
 */
const GAME_ROASTS: [string[], number, string[]][] = [
  // Competitive comfort games
  [['rocket league'], 200, [
    '{h}h of car soccer. Your pile called. You didn\'t answer.',
    '{h}h. Still chasing that ceiling shot. Still ignoring the pile.',
    '{h}h in Rocket League. Your backlog filed a missing persons report.',
  ]],
  [['counter-strike', 'cs:go', 'cs2'], 200, [
    '{h}h. Rush B, never rush your backlog.',
    '{h}h of CS. Your rank went up. Your pile didn\'t go down.',
    '{h}h. You\'ve defused a lot of bombs but your backlog is still ticking.',
  ]],
  [['valorant'], 200, [
    '{h}h. Your agent pool is deep. Your completed games pool is not.',
    '{h}h of Valorant. Your pile is in the other tab, waiting.',
  ]],
  [['apex legends'], 200, [
    '{h}h. You\'re the champion of not clearing your backlog.',
    '{h}h dropping hot. Never dropping into your pile though.',
  ]],
  [['fortnite'], 200, [
    '{h}h building walls. Your backlog is building resentment.',
    '{h}h. Victory royale count: impressive. Games finished: let\'s not talk about it.',
  ]],
  [['overwatch'], 200, [
    '{h}h. The payload has moved more than your backlog progress.',
    '{h}h of Overwatch. Your pile needs healing.',
  ]],
  [['dota', 'league of legends'], 300, [
    '{h}h. This isn\'t a game, it\'s a citizenship. Your pile can wait. (It\'s been waiting.)',
    '{h}h. At this point you don\'t play this game. You live in it.',
  ]],
  [['dead by daylight'], 200, [
    '{h}h. The real horror is your backlog.',
    '{h}h of DbD. Your pile has been on the hook for a while now.',
  ]],

  // Comfort / sandbox games
  [['stardew'], 80, [
    '{h}h. The farm isn\'t going to water itself. Neither is your backlog.',
    '{h}h of virtual farming. Your real crop is unplayed games.',
    '{h}h in Stardew. Grandpa would be proud. Your backlog would not.',
  ]],
  [['minecraft'], 200, [
    '{h}h of placing blocks. Your pile is stacking up too.',
    '{h}h. You\'ve built entire worlds. Your backlog remains unexplored.',
  ]],
  [['terraria'], 200, [
    '{h}h digging holes. Your backlog is one.',
    '{h}h of Terraria. You\'ve explored every biome except your own library.',
  ]],
  [['animal crossing'], 100, [
    '{h}h. Tom Nook is proud. Your backlog is confused.',
    '{h}h of island life. Your other games are on a different island. A forgotten one.',
  ]],
  [['no man\'s sky'], 150, [
    '{h}h exploring the universe. Your game library is its own undiscovered galaxy.',
  ]],
  [['valheim'], 150, [
    '{h}h in the tenth world. Your backlog is the eleventh.',
  ]],

  // Strategy / "one more turn" games
  [['civilization', 'civ vi', 'civ v', 'civ 6', 'civ 5'], 100, [
    '{h}h. "Just one more turn" is why you have a pile. But also why you\'re happy.',
    '{h}h. You\'ve conquered entire civilizations but can\'t conquer your backlog.',
  ]],
  [['factorio'], 100, [
    '{h}h. The factory must grow. Your pile must not. ...The factory wins.',
    '{h}h. The real throughput problem is your backlog.',
  ]],
  [['satisfactory'], 100, [
    '{h}h. Your factory is satisfactory. Your backlog progress is not.',
  ]],
  [['stellaris'], 150, [
    '{h}h managing a galactic empire. Can\'t manage a game library though.',
  ]],
  [['rimworld'], 150, [
    '{h}h. Your colonists have it harder than your backlog, but not by much.',
    '{h}h of war crimes and organ harvesting. Your backlog feels neglected by comparison.',
  ]],
  [['total war'], 150, [
    '{h}h of Total War. Total backlog awareness: zero.',
  ]],
  [['crusader kings'], 150, [
    '{h}h scheming for thrones. Your backlog is plotting revenge.',
  ]],
  [['europa universalis', 'eu4'], 200, [
    '{h}h. You colonized the entire map but haven\'t explored your own library.',
  ]],
  [['cities: skylines', 'cities skylines'], 150, [
    '{h}h of urban planning. Your backlog has worse infrastructure.',
  ]],

  // RPGs
  [['skyrim'], 150, [
    '{h}h and you probably still haven\'t finished the main quest.',
    '{h}h. You took an arrow to the knee and never got up. Your pile noticed.',
  ]],
  [['elden ring'], 100, [
    '{h}h. You are maidenless and backlogless. Wait, no. Just maidenless.',
    '{h}h. The Lands Between are conquered. The Lands of Your Library are not.',
  ]],
  [['baldur\'s gate 3', 'baldur\'s gate III'], 100, [
    '{h}h. You\'ve rolled more dice than cleared games at this point.',
    '{h}h and probably three separate playthroughs. Your pile is on playthrough zero.',
  ]],
  [['the witcher', 'witcher 3'], 100, [
    '{h}h. Geralt would have cleared this backlog by now. Geralt is efficient.',
  ]],
  [['fallout'], 100, [
    '{h}h in the wasteland. Your backlog is its own post-apocalyptic landscape.',
  ]],
  [['destiny'], 200, [
    '{h}h. Your light level is high. Your backlog completion rate is not.',
    '{h}h chasing god rolls. The real god roll is clearing a game.',
  ]],
  [['monster hunter'], 150, [
    '{h}h hunting monsters. The real monster is the size of your pile.',
  ]],
  [['path of exile'], 200, [
    '{h}h. Your passive tree is bigger than your completed games list.',
  ]],
  [['warframe'], 200, [
    '{h}h. Ninjas play free. Ninjas also apparently never clear their backlog.',
  ]],
  [['final fantasy xiv', 'ffxiv', 'ff14'], 200, [
    '{h}h. The critically acclaimed MMORPG with a free trial. And your critically ignored backlog.',
  ]],
  [['world of warcraft', 'wow'], 300, [
    '{h}h. You\'ve been playing since vanilla. Your backlog has been waiting since vanilla.',
  ]],
  [['diablo'], 100, [
    '{h}h grinding for loot. The real treasure was the games you never played along the way.',
  ]],

  // Survival / crafting
  [['rust'], 200, [
    '{h}h. You keep getting raided and you keep coming back. Your pile relates.',
  ]],
  [['ark'], 200, [
    '{h}h taming dinosaurs. Your backlog is untamed.',
  ]],
  [['the forest', 'sons of the forest'], 100, [
    '{h}h lost in the woods. Your backlog is also lost.',
  ]],

  // Sports / racing
  [['fifa', 'ea fc', 'eafc'], 200, [
    '{h}h. Your FUT team is stacked. Your completed games? Less so.',
  ]],
  [['nba 2k'], 200, [
    '{h}h on the court. Your backlog is benched permanently.',
  ]],
  [['gran turismo', 'forza'], 150, [
    '{h}h of laps. Your backlog is still on lap zero.',
  ]],

  // Other specific games
  [['gta', 'grand theft auto'], 100, [
    '{h}h. You\'ve committed every crime except clearing your pile.',
  ]],
  [['hades'], 60, [
    '{h}h. Even Sisyphus thinks you should try something new.',
    '{h}h of escape attempts. Your backlog is the real underworld.',
  ]],
  [['binding of isaac'], 100, [
    '{h}h. You\'ve unlocked everything. Your pile remains locked.',
  ]],
  [['slay the spire'], 80, [
    '{h}h. Ascension 20 on all characters, zero ascension on your backlog.',
  ]],
  [['deep rock galactic'], 100, [
    '{h}h. Rock and stone. Your pile of games? Rock and moan.',
  ]],
  [['among us'], 50, [
    '{h}h. Your backlog progress is looking pretty sus.',
  ]],
  [['celeste'], 40, [
    '{h}h. You can climb a mountain but you can\'t climb out of your backlog.',
  ]],
  [['hollow knight'], 60, [
    '{h}h in Hallownest. Your backlog is its own forgotten kingdom.',
  ]],
];

export function getPlaytimeRoast(gameName: string, hours: number): string | null {
  if (hours < 40) return null;

  const nameLower = gameName.toLowerCase();

  // Check game-specific roasts first
  for (const [names, threshold, roasts] of GAME_ROASTS) {
    if (hours >= threshold && names.some(n => nameLower.includes(n))) {
      const roast = roasts[Math.floor(Math.random() * roasts.length)];
      return roast.replace('{h}', hours.toLocaleString());
    }
  }

  // Genre-aware generic roasts would go here if we had genre context
  // For now, tier-based generic roasts

  if (hours >= 2000) {
    const roasts = [
      `${hours.toLocaleString()}h. This isn't a game. This is where you live now.`,
      `${hours.toLocaleString()}h. At this point the game should be paying you rent.`,
      `${hours.toLocaleString()}h. Your other games have accepted their fate.`,
    ];
    return roasts[Math.floor(Math.random() * roasts.length)];
  }
  if (hours >= 1000) {
    const roasts = [
      `${hours.toLocaleString()}h in this one game. Everything else is a side quest at this point.`,
      `${hours.toLocaleString()}h. You could have cleared your entire backlog. Twice. But here we are.`,
      `${hours.toLocaleString()}h. This is a relationship, not a game.`,
    ];
    return roasts[Math.floor(Math.random() * roasts.length)];
  }
  if (hours >= 500) {
    const roasts = [
      `${hours.toLocaleString()}h. This is clearly your comfort game. Your pile understands. Mostly.`,
      `${hours.toLocaleString()}h. That's a part-time job's worth of hours. In one game.`,
      `${hours.toLocaleString()}h. Your pile is jealous, but honestly? Respect.`,
    ];
    return roasts[Math.floor(Math.random() * roasts.length)];
  }
  if (hours >= 200) {
    const roasts = [
      `${hours.toLocaleString()}h. You clearly love this one. Your other games are side-eyeing you.`,
      `${hours.toLocaleString()}h. That's commitment. Your backlog wishes you were this committed to it.`,
    ];
    return roasts[Math.floor(Math.random() * roasts.length)];
  }
  if (hours >= 100) {
    const roasts = [
      `${hours.toLocaleString()}h. Solid investment. Your pile would like a word though.`,
      `${hours.toLocaleString()}h. Triple digits. This one earned its spot.`,
    ];
    return roasts[Math.floor(Math.random() * roasts.length)];
  }
  if (hours >= 40) {
    return `${hours.toLocaleString()}h. A real commitment. Most of your pile wishes it got this much attention.`;
  }

  return null;
}
