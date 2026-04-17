/**
 * Smart Pick headline copy — one rotating "why this one" headline per pick type.
 *
 * A Smart Pick fires when the reroll engine chose a game deliberately (not
 * random from the Anything pool) based on recency, progress, or rating +
 * invested hours. The headline appears on the pick result card above
 * secondary "why" reasons like Metacritic score and mood match.
 *
 * Selection is hash-based on the game name so the same game shows the same
 * headline on repeated rerolls; different games rotate through the pool.
 *
 * Template tokens (filled by `renderSmartPickHeadline`):
 *   {h}         → user hours played, e.g. "12"
 *   {remaining} → hltbMain - hoursPlayed, e.g. "2"
 *   {pct}       → rating percent — Steam positive % or progress %, e.g. "94"
 *
 * Copy approved by Brady 2026-04-17. Voice-filtered against
 * .claude/rules/voice-and-tone.md. See
 * docs/DECISIONS.md 2026-04-17 for rationale.
 */

export type SmartPickType = 'keep-flowing' | 'unfinished-business' | 'forgotten-gem' | 'almost-there';

export const SMART_PICK_LABELS: Record<SmartPickType, { label: string; icon: string }> = {
  'keep-flowing': { label: 'Keep Flowing', icon: '🌊' },
  'unfinished-business': { label: 'Unfinished Business', icon: '' },
  'forgotten-gem': { label: 'Forgotten Gem', icon: '💎' },
  'almost-there': { label: 'Almost There', icon: '🏁' },
};

const HEADLINES: Record<SmartPickType, string[]> = {
  'keep-flowing': [
    'Still warm. {h} hours in recently. Pick up where you left off.',
    'You were in the middle of something good. Keep going.',
    'The muscle memory hasn\'t worn off. Open the save.',
    'You just played this. Slide back in.',
    '{h} hours this month. Don\'t let it cool off.',
    'Recent save, real hours. Your momentum\'s right there.',
  ],
  'unfinished-business': [
    '{h} hours logged. Then silence. Let\'s break it.',
    'Your save\'s been sitting for a while. Time to decide: finish or fold.',
    'You put real time into this. The ending\'s still waiting.',
    'Unfinished for now. Maybe that changes today.',
    '{h} hours in. You were onto something. What happened?',
    'Walked away mid-playthrough. Nothing says you can\'t walk back.',
  ],
  'forgotten-gem': [
    '{pct}% positive on Steam. Your {h}-hour save is still there.',
    'Acclaimed game. Partial playthrough. Easy math.',
    'You already liked this. The people who finished it? Loved it.',
    'High scores, {h} hours in, and you haven\'t finished it. Time to jump back in.',
    'Most people who finish this are glad. You already started.',
    'The reviews agree: it\'s good. Your save agrees: you thought so too.',
  ],
  'almost-there': [
    'About {remaining} hours from the credits. Close it out.',
    'You\'re past the point of no return. Might as well see the ending.',
    'The end is within reach. Maybe one sitting.',
    '{pct}% of the way through. One more push.',
    'You\'ve done the hard part. The last part\'s just playing.',
    'Final stretch. Don\'t leave a game this close on the pile.',
  ],
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

interface HeadlineTokens {
  hoursPlayed?: number;
  hltbMain?: number;
  ratingPct?: number;
}

/**
 * Render a Smart Pick headline for a given pick type + game, filling in
 * templated values like {h} and {remaining}. Same (type, gameName) pair
 * always returns the same headline — the rotation is deterministic, so
 * a rerolled game doesn't feel random across sessions.
 *
 * If a template token has no corresponding value (e.g. hltbMain missing
 * for {remaining}), the line containing it is filtered out of the pool
 * before selection so we don't render "About hours from the credits."
 */
export function renderSmartPickHeadline(
  type: SmartPickType,
  gameName: string,
  tokens: HeadlineTokens,
): string {
  const pool = HEADLINES[type].filter((line) => {
    if (line.includes('{h}') && tokens.hoursPlayed == null) return false;
    if (line.includes('{remaining}') && (tokens.hltbMain == null || tokens.hoursPlayed == null)) return false;
    if (line.includes('{pct}') && tokens.ratingPct == null) return false;
    return true;
  });

  // Guarantee at least one non-templated fallback per type so an empty
  // pool never renders. These are the lines with zero tokens.
  const safePool = pool.length > 0 ? pool : HEADLINES[type].filter((line) => !/\{[a-z]+\}/.test(line));

  const chosen = safePool[hashString(gameName.toLowerCase()) % safePool.length];

  const h = tokens.hoursPlayed != null ? Math.round(tokens.hoursPlayed).toString() : '';
  const remaining = tokens.hoursPlayed != null && tokens.hltbMain != null
    ? Math.max(0, Math.round(tokens.hltbMain - tokens.hoursPlayed)).toString()
    : '';
  const pct = tokens.ratingPct != null ? Math.round(tokens.ratingPct).toString() : '';

  return chosen
    .replace(/\{h\}/g, h)
    .replace(/\{remaining\}/g, remaining)
    .replace(/\{pct\}/g, pct);
}
