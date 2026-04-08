/**
 * Verified Re-entry Packs
 *
 * Milestone-aware tips for popular titles. Instead of flat "here are 3 tips,"
 * these packs serve different advice based on estimated progression (hours played
 * vs HLTB data). Each milestone has controls reminders, contextual tips, and
 * a "where you probably are" orientation line.
 *
 * Tips are written in our voice: warm, specific, not a wiki. The goal is a
 * 30-second re-orientation, not a walkthrough.
 */

export interface ReentryMilestone {
  /** Max hours for this milestone (exclusive). Use Infinity for the final tier. */
  upToHours: number;
  /** One-line orientation: "You're probably in [area] doing [thing]" */
  whereYouAre: string;
  /** 2-4 tips relevant to this stage of the game */
  tips: string[];
  /** Controls or mechanics to remember at this stage */
  controls: string[];
}

export interface ReentryPack {
  /** Lowercase name fragments to match against (same as GAME_SPECIFIC_TIPS keys) */
  nameMatches: string[];
  /** Full game name for display */
  displayName: string;
  /** Milestones ordered by hours. Player gets the first milestone where hours < upToHours */
  milestones: ReentryMilestone[];
  /** Universal tips shown regardless of milestone */
  alwaysTips: string[];
}

// ── Clair Obscur: Expedition 33 ─────────────────────────────────
const CLAIR_OBSCUR: ReentryPack = {
  nameMatches: ['clair obscur', 'expedition 33'],
  displayName: 'Clair Obscur: Expedition 33',
  milestones: [
    {
      upToHours: 10,
      whereYouAre: 'Act 1 with Gustave. Probably somewhere between Spring Meadows and Gestral Village.',
      tips: [
        '🗡️ Gustave leaves the party after Act 1. Don\'t burn rare upgrade materials on him.',
        '🗺️ Lumiere (the opening city) is gone for good. If you missed anything there, it\'s gone.',
        '📋 You\'re building your party right now. Lune and Maelle join during this act.',
        '🎨 Check Pictos on each character. Equip one for 4 fights to permanently learn its Lumina.',
      ],
      controls: [
        '🛡️ Parry: R1/RB slightly BEFORE the hit lands. Rewards +1 AP.',
        '💨 Dodge: Circle/B. More forgiving but no AP gain.',
        '⬆️ Jump: X/A when the gold flare appears. Free counter-attack.',
        '⚔️ First Strike: R1/RB on enemies in the overworld for an extra opening turn.',
      ],
    },
    {
      upToHours: 20,
      whereYouAre: 'Act 2 with Verso as lead. Gustave\'s gone. You\'ve got Gradient Attacks now.',
      tips: [
        '🔥 Verso\'s damage scales UP as you chain attacks without getting hit. Parry everything.',
        '🦎 Monoco learns from enemies, not skill points. Fight varied enemies to unlock his forms.',
        '⚡ Gradient Attacks unlocked at Monoco\'s Station. They cost a full charge (built by spending AP). After using one, you get another turn.',
        '🐕 Esqui (your companion) can clear obstacles, swim, and fly. Toggle with L3 in the field.',
      ],
      controls: [
        '🛡️ Parry: R1/RB slightly BEFORE impact. Still the most important mechanic.',
        '🌑 Gradient Counter: HOLD R2/RT when screen goes greyscale. Don\'t tap, hold.',
        '👥 Expedition Counter: entire party parries at once. ALL members press R1/RB together.',
        '🏕️ Camp: D-pad Down. Manage party and rest anytime.',
      ],
    },
    {
      upToHours: 35,
      whereYouAre: 'Late Act 2 or The Monolith. If you just beat The Paintress, you\'re roughly halfway through the game.',
      tips: [
        '⚠️ Beating The Paintress is NOT the end. Budget another 20-30 hours for Act 3.',
        '📈 Damage cap is removed after The Paintress fight. Numbers are about to get big.',
        '🧱 Difficulty spikes hard after Act 2. If you\'re rusty, drop difficulty in settings. No penalty.',
        '💎 Save rare upgrade materials. You can\'t max gear to level 33 until New Game+.',
      ],
      controls: [
        '🛡️ Parry timing hasn\'t changed. Slightly before impact.',
        '🌑 Gradient Counter: HOLD R2/RT during greyscale moments.',
        '🗺️ D-pad Up for the map. No mini-map in dungeons, so orient yourself.',
      ],
    },
    {
      upToHours: Infinity,
      whereYouAre: 'Act 3 with Maelle. The world\'s open. All 6 characters available.',
      tips: [
        '🌍 Act 3 is open-world. Areas scale in difficulty. Pick fights you can handle.',
        '🎭 You have all 6 characters now. Experiment with team comps for different bosses.',
        '📋 Check the map for unexplored areas. Side content is where the hardest fights live.',
        '🚫 Don\'t attack friendly Nevron NPCs. Killing them locks you out of the Fountain questline.',
      ],
      controls: [
        '🛡️ Parry: R1/RB before impact. By now this should be muscle memory.',
        '🌑 Gradient Counter: HOLD R2/RT. Watch enemy animation, not the greyscale effect.',
        '⏭️ Skip Turn: R3. Flee: L3. Both useful when outmatched.',
      ],
    },
  ],
  alwaysTips: [
    '🎯 Offensive QTEs: hit the yellow zone on the clockwise cursor for bonus damage.',
    '💥 Break Meter: big single hits fill it faster than many small ones. Shattering guard = free burst window.',
  ],
};

// ── Registry ────────────────────────────────────────────────────

const ALL_PACKS: ReentryPack[] = [
  CLAIR_OBSCUR,
  // Add more packs here as we build them
];

/**
 * Find a re-entry pack for a game by name.
 * Returns null if no verified pack exists.
 */
export function findReentryPack(gameName: string): ReentryPack | null {
  const lower = gameName.toLowerCase();
  return ALL_PACKS.find(pack =>
    pack.nameMatches.some(match => lower.includes(match))
  ) || null;
}

/**
 * Get milestone-appropriate tips for a game.
 * Returns null if no pack exists for this game.
 */
export function getReentryTips(
  gameName: string,
  hoursPlayed: number
): { whereYouAre: string; tips: string[]; controls: string[]; alwaysTips: string[] } | null {
  const pack = findReentryPack(gameName);
  if (!pack) return null;

  // Find the right milestone based on hours played
  const milestone = pack.milestones.find(m => hoursPlayed < m.upToHours)
    || pack.milestones[pack.milestones.length - 1];

  return {
    whereYouAre: milestone.whereYouAre,
    tips: milestone.tips,
    controls: milestone.controls,
    alwaysTips: pack.alwaysTips,
  };
}
