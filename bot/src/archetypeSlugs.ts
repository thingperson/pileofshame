/**
 * Mirror of slugs from lib/archetypeRegistry.ts in the main repo. 40 entries
 * as of 2026-05-13.
 *
 * We don't import from the main repo — keeping the bot's dep graph clean of
 * Next.js / React types. If you add an archetype upstream, update this list.
 *
 * The bot doesn't need title/flavor text — it just needs to validate the
 * slug exists, then build the URL `${INVENTORY_FULL_URL}/archetype/${slug}`
 * which serves the canonical OG image.
 *
 * To regenerate from upstream:
 *   grep -oE "slug: '[^']+'" ../lib/archetypeRegistry.ts | sed -E "s/slug: '([^']+)'/\\1/"
 */

export const ARCHETYPE_SLUGS = [
  'pure-collector',
  'hoarder',
  'dabbler',
  'quitter',
  'juggler',
  'archaeologist',
  'window-shopper',
  'backlog-zero',
  'completionist',
  'sniper',
  'redeemer',
  'critic',
  'enthusiast',
  'deep-diver',
  'balanced-gamer',
  'omni-gamer',
  'steam-loyalist',
  'playstation-purist',
  'genre-addict',
  'quick-draw',
  'endurance-runner',
  'optimizer',
  'wishful-thinker',
  'eclectic',
  'cozy-craver',
  'infinite-player',
  'momentum-builder',
  'bargain-hunter',
  'night-owl',
  'dino-devotee',
  'webmaster-supreme',
  'synthwave-surfer',
  'ultra-devotee',
  'holographic-entity',
  'unsettling-one',
  'lighthouse',
  'minimalist',
  'gamer',
  'grind-ghost',
  'late-bloomer',
] as const;

export type ArchetypeSlug = (typeof ARCHETYPE_SLUGS)[number];

export function isValidSlug(s: string): s is ArchetypeSlug {
  return (ARCHETYPE_SLUGS as readonly string[]).includes(s);
}

/**
 * Convert a slug to a human-readable title for embeds.
 * `pure-collector` → `Pure Collector`.
 */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
