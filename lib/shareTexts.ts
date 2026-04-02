/**
 * Dynamic share text generator.
 *
 * ~30 template variations so posts don't look copy-pasted when multiple
 * people share. Each template gets populated with the user's real stats,
 * making every share feel personal and specific.
 */

interface ShareStats {
  backlog: number;
  cleared: number;
  bailed: number;
  hours: number;
  unplayedValue: number;
  playedValue: number;
  backlogHours: number;
  streak: number;
  oldest: string;
  pct: number; // exploration progress %
}

// --- VALUE-LED templates ($ amount upfront) ---
const VALUE_TEMPLATES = [
  (s: ShareStats) =>
    `I recovered $${s.playedValue.toLocaleString()} worth of value from my old unplayed game library. Decision paralysis had me stuck for years. ${s.cleared} games cleared and counting.`,

  (s: ShareStats) =>
    `$${s.unplayedValue.toLocaleString()} in games I own but haven't played. I finally started tackling the pile. ${s.cleared} down so far, $${s.playedValue.toLocaleString()} in value recovered.`,

  (s: ShareStats) =>
    `Turns out I was sitting on $${(s.unplayedValue + s.playedValue).toLocaleString()} in games. I've unlocked $${s.playedValue.toLocaleString()} of that by actually playing them. The other $${s.unplayedValue.toLocaleString()} is next.`,

  (s: ShareStats) =>
    `I've spent $${(s.unplayedValue + s.playedValue).toLocaleString()} on games. Played $${s.playedValue.toLocaleString()} worth. That means $${s.unplayedValue.toLocaleString()} is just... sitting there. Working on it.`,

  (s: ShareStats) =>
    `$${s.playedValue.toLocaleString()} recovered from my gaming backlog. ${s.cleared} titles finished that I genuinely would have missed not playing. The backlog effect is real.`,
];

// --- PROGRESS-LED templates (cleared count, momentum) ---
const PROGRESS_TEMPLATES = [
  (s: ShareStats) =>
    `${s.cleared} games cleared from the pile. ${s.pct}% explored. I didn't think I'd actually start finishing these, but here we are.`,

  (s: ShareStats) =>
    `I've tackled ${s.cleared} titles and made ${s.pct}% progress on games I would really have missed not playing. Changed how I game. Plain and simple.`,

  (s: ShareStats) =>
    `${s.backlog} games in my backlog. ${s.cleared} cleared. ${s.pct}% progress. Sounds small but that's ${s.cleared} games I actually finished instead of just staring at my library.`,

  (s: ShareStats) =>
    `Remember when picking a game felt harder than playing one? ${s.cleared} games cleared now. ${s.backlog} to go. Progress is progress.`,

  (s: ShareStats) =>
    `My pile had ${s.backlog + s.cleared + s.bailed} games gathering dust. I've cleared ${s.cleared} of them. That's ${s.pct}% and climbing.`,
];

// --- SHAME-LED templates (relatable, self-aware) ---
const SHAME_TEMPLATES = [
  (s: ShareStats) =>
    `${s.backlog} unplayed games. $${s.unplayedValue.toLocaleString()} worth. ${s.backlogHours > 0 ? `~${s.backlogHours.toLocaleString()} hours to play them all. ` : ''}At least I'm aware of the problem now.`,

  (s: ShareStats) =>
    `I own ${s.backlog + s.cleared} games. I've finished ${s.cleared}. That math is not great. But at least I'm doing something about it.`,

  (s: ShareStats) =>
    `My gaming backlog is worth more than my car. $${s.unplayedValue.toLocaleString()} in games I bought with good intentions and zero follow-through. Fixing that now.`,

  (s: ShareStats) =>
    `I have ${s.backlog} games I've never finished and ${s.cleared} that I have. Progress report: ${s.pct}%. The pile is real.`,

  (s: ShareStats) =>
    `If I played 2 hours a day, clearing my backlog would take ${s.backlogHours > 0 ? Math.round(s.backlogHours / (2 * 7)).toLocaleString() + ' weeks' : 'a while'}. Good thing I started.`,
];

// --- STREAK-LED templates (momentum, celebration) ---
const STREAK_TEMPLATES = [
  (s: ShareStats) =>
    `${s.streak} games cleared in a row without bailing. I'm on a roll. ${s.backlog} more to go but the momentum is real.`,

  (s: ShareStats) =>
    `${s.streak}-game clear streak. ${s.cleared} total. Something clicked and I'm actually finishing games now instead of buying more.`,

  (s: ShareStats) =>
    `Hit a ${s.streak}-game streak. Haven't bailed on one in a while. Turns out the trick is picking the right game at the right time.`,
];

// --- OLDEST GAME templates ---
const OLDEST_TEMPLATES = [
  (s: ShareStats) =>
    `My oldest unplayed game is ${s.oldest}. It's been in the pile for longer than some of my friendships. But I've cleared ${s.cleared} others so far.`,

  (s: ShareStats) =>
    `${s.oldest} has been sitting in my library judging me. ${s.cleared} other games cleared though. It's next. Probably. Maybe.`,
];

// --- RECOMMENDATION templates (CTA-heavy) ---
const CTA_TEMPLATES = [
  (s: ShareStats) =>
    `${s.cleared} games cleared, $${s.playedValue.toLocaleString()} in value recovered. If decision paralysis has your gaming library collecting dust, this actually helps.`,

  (s: ShareStats) =>
    `I recovered $${s.playedValue.toLocaleString()} from games I already owned. No new purchases, just finally playing what I had. If that sounds familiar, you should try this.`,

  (s: ShareStats) =>
    `Went from ${s.backlog + s.cleared} unplayed games to ${s.backlog}. ${s.cleared} finished. The backlog effect is real and this actually snapped me out of it.`,

  (s: ShareStats) =>
    `${s.pct}% through my pile. ${s.cleared} games I genuinely enjoyed instead of just owning. The trick? Having something pick for you when you can't decide.`,

  (s: ShareStats) =>
    `My pile was ${s.backlog + s.cleared + s.bailed} games deep. I couldn't even pick one. Now I've cleared ${s.cleared}. Mood-based matching is weirdly effective.`,
];

/**
 * Generate a share text with platform-specific CTA.
 * Picks a template based on the user's strongest stat,
 * then rotates within that category so it doesn't repeat.
 */
export function generateDynamicShareText(
  stats: ShareStats,
  platform: 'twitter' | 'reddit' | 'discord',
): string {
  // Pick the best template pool based on what stats are most impressive
  let pool: ((s: ShareStats) => string)[];

  if (stats.streak >= 5 && STREAK_TEMPLATES.length > 0) {
    pool = STREAK_TEMPLATES;
  } else if (stats.playedValue >= 100 && VALUE_TEMPLATES.length > 0) {
    pool = VALUE_TEMPLATES;
  } else if (stats.cleared >= 3 && PROGRESS_TEMPLATES.length > 0) {
    pool = PROGRESS_TEMPLATES;
  } else if (stats.unplayedValue >= 200 && SHAME_TEMPLATES.length > 0) {
    pool = SHAME_TEMPLATES;
  } else if (stats.oldest && OLDEST_TEMPLATES.length > 0) {
    pool = OLDEST_TEMPLATES;
  } else {
    pool = CTA_TEMPLATES;
  }

  // Semi-random selection (changes daily so re-shares aren't identical)
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const template = pool[dayIndex % pool.length];

  const body = template(stats);
  const cta = getShareCTA(platform);

  return `${body}\n${cta}`;
}

function getShareCTA(platform: 'twitter' | 'reddit' | 'discord'): string {
  switch (platform) {
    case 'twitter':
      return '\npileofsha.me';
    case 'reddit':
      return '\n\n[pileofsha.me](https://pileofsha.me)';
    case 'discord':
      return '\n\n<https://pileofsha.me>';
  }
}

/**
 * Get a share-card caption (shorter, for image posts).
 * Used when sharing the PNG card — the image carries the stats,
 * so the text just needs personality and the URL.
 */
export function generateCardCaption(
  stats: ShareStats,
  platform: 'twitter' | 'reddit' | 'discord',
): string {
  const captions = [
    `$${stats.playedValue.toLocaleString()} recovered. ${stats.cleared} games cleared. The pile is shrinking.`,
    `${stats.pct}% through my gaming backlog. Progress is progress.`,
    `${stats.cleared} games I actually finished instead of just owning.`,
    `The backlog effect is real. ${stats.cleared} down, ${stats.backlog} to go.`,
    `Turns out the hard part was deciding. Once you pick, you play.`,
    `My pile of shame, quantified. Working on it.`,
    `${stats.backlog} games, $${stats.unplayedValue.toLocaleString()} in value, and I'm ${stats.pct}% through.`,
  ];

  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const caption = captions[dayIndex % captions.length];
  const cta = getShareCTA(platform);

  return `${caption}\n${cta}`;
}
