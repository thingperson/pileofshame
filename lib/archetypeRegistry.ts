/**
 * Static, evergreen archetype data for shareable archetype landing pages and
 * OG cards. The in-app archetype descriptions in lib/archetypes.ts are
 * personalized (interpolate the user's stats); these are the de-personalized
 * versions used on /archetype/[slug] pages that anyone can land on.
 *
 * Each entry mirrors a title from SPRITE_KEY_BY_TITLE in lib/archetypes.ts.
 * Voice was lifted from the in-app description with stat interpolations stripped.
 */

export interface ArchetypeRegistryEntry {
  slug: string;
  title: string;
  spriteKey: string;
  tone: 'roast' | 'respect' | 'neutral';
  flavor: string;
}

// Slug helper — kebab-case the title, strip "the ".
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const ARCHETYPE_REGISTRY: ArchetypeRegistryEntry[] = [
  { slug: 'pure-collector', title: 'Pure Collector', spriteKey: 'pureCollector', tone: 'roast',
    flavor: "You haven't built a backlog. You've built an empire. The collection is immaculate. Now pick one and give it the attention it deserves." },
  { slug: 'hoarder', title: 'The Hoarder', spriteKey: 'hoarder', tone: 'roast',
    flavor: "Your backlog has a backlog. Every Steam sale adds to the pile. At least you have incredible taste." },
  { slug: 'dabbler', title: 'The Dabbler', spriteKey: 'dabbler', tone: 'roast',
    flavor: "You sample everything and commit to nothing. Yet. Call it exploration. One of those quick dips is going to hook you." },
  { slug: 'quitter', title: 'The Quitter', spriteKey: 'quitter', tone: 'roast',
    flavor: "Aggressive curation. You know what you don't like, and brother, it's a lot." },
  { slug: 'juggler', title: 'The Juggler', spriteKey: 'juggler', tone: 'roast',
    flavor: "Several games in flight at once. Call it range. One of them needs to land on cleared soon." },
  { slug: 'archaeologist', title: 'The Archaeologist', spriteKey: 'archaeologist', tone: 'roast',
    flavor: "Games from years ago are still waiting for you. Not dead. Patient. Some of them are genuinely great." },
  { slug: 'window-shopper', title: 'The Window Shopper', spriteKey: 'windowShopper', tone: 'roast',
    flavor: "You've built an incredible library. Now it's time to actually live in it." },

  { slug: 'backlog-zero', title: 'Backlog Zero', spriteKey: 'backlogZero', tone: 'respect',
    flavor: "You actually did it. Zero games in the backlog. You are a myth. The other archetypes whisper your name in fear." },
  { slug: 'completionist', title: 'The Completionist', spriteKey: 'completionist', tone: 'respect',
    flavor: "Every game you buy knows its days are numbered. When you commit, you finish." },
  { slug: 'sniper', title: 'The Sniper', spriteKey: 'sniper', tone: 'respect',
    flavor: "Small library, high kill count. Every purchase deliberate, every game finished. Honestly kind of intimidating." },
  { slug: 'redeemer', title: 'The Redeemer', spriteKey: 'redeemer', tone: 'respect',
    flavor: "Big pile, but you're chipping away at it. The backlog fears you now." },

  { slug: 'critic', title: 'The Critic', spriteKey: 'critic', tone: 'neutral',
    flavor: "You have standards, and most games don't meet them. Your reviews could end careers." },
  { slug: 'enthusiast', title: 'The Enthusiast', spriteKey: 'enthusiast', tone: 'neutral',
    flavor: "You love games and games love you back. Either great taste or zero standards. We'll never know." },
  { slug: 'deep-diver', title: 'The Deep Diver', spriteKey: 'deepdiver', tone: 'neutral',
    flavor: "When you commit, you COMMIT. You practically move into these games. Rent-free." },
  { slug: 'balanced-gamer', title: 'The Balanced Gamer', spriteKey: 'balanced', tone: 'neutral',
    flavor: "A healthy mix of playing, clearing, and collecting. You buy smart, play often, and finish what you start." },

  { slug: 'omni-gamer', title: 'The Omni-Gamer', spriteKey: 'omniGamer', tone: 'roast',
    flavor: "Games on every platform. Each one has its own pile and none of them talk to each other." },
  { slug: 'steam-loyalist', title: 'Steam Loyalist', spriteKey: 'steamLoyalist', tone: 'neutral',
    flavor: "Gabe Newell sends you a Christmas card. Your wallet flinches every June and December." },
  { slug: 'playstation-purist', title: 'PlayStation Purist', spriteKey: 'psPurist', tone: 'neutral',
    flavor: "You bleed blue. Your backlog is a trophy case of games you'll definitely platinum someday." },

  { slug: 'genre-addict', title: 'Genre Addict', spriteKey: 'genreAddict', tone: 'roast',
    flavor: "Your library has a type. At this point it's less a preference and more a condition. There are other genres. Allegedly." },
  { slug: 'quick-draw', title: 'The Quick Draw', spriteKey: 'quickDraw', tone: 'neutral',
    flavor: "Short sessions, fast commits, attention span... wait, what were we saying?" },
  { slug: 'endurance-runner', title: 'The Endurance Runner', spriteKey: 'enduranceRunner', tone: 'roast',
    flavor: "Your pile is full of 60-hour commitments. You're planning a sabbatical, not a session." },
  { slug: 'optimizer', title: 'The Optimizer', spriteKey: 'optimizer', tone: 'roast',
    flavor: "Games installed and ready to launch. The hard part is done. They're right there. Pick one." },
  { slug: 'wishful-thinker', title: 'The Wishful Thinker', spriteKey: 'wishfulThinker', tone: 'roast',
    flavor: "Wishlist full. Backlog fuller. You're shopping for problems before solving the ones you have." },
  { slug: 'eclectic', title: 'The Eclectic', spriteKey: 'eclectic', tone: 'neutral',
    flavor: "RPGs, puzzles, shooters, simulators. No type, just range. A backlog sommelier." },
  { slug: 'cozy-craver', title: 'Cozy Craver', spriteKey: 'cozy', tone: 'neutral',
    flavor: "You have your comfort picks and you know exactly which ones they are. Comfort is valid." },
  { slug: 'infinite-player', title: 'The Infinite Player', spriteKey: 'infinite', tone: 'neutral',
    flavor: "MMOs, sandboxes, endless modes. Some games are meant to be ongoing. Just don't let them crowd out the ones with endings." },
  { slug: 'momentum-builder', title: 'The Momentum Builder', spriteKey: 'momentumBuilder', tone: 'respect',
    flavor: "More cleared than bailed. This is what progress looks like. Keep the streak alive." },
  { slug: 'bargain-hunter', title: 'The Bargain Hunter', spriteKey: 'bargainHunter', tone: 'roast',
    flavor: "Every sale is an event, every bundle a treasure chest. Time to actually unwrap some of those gifts you bought yourself." },
  { slug: 'night-owl', title: 'The Night Owl', spriteKey: 'nightOwl', tone: 'neutral',
    flavor: "Your library is stacked with games that demand long sessions. Respect the commitment." },

  { slug: 'dino-devotee', title: 'Dino Devotee', spriteKey: 'dino', tone: 'neutral',
    flavor: "You spend so much time in dino mode you've been voted most likely to open an actual clone-based theme park. Careful, they're clever girls." },
  { slug: 'webmaster-supreme', title: 'Webmaster Supreme', spriteKey: 'webmaster', tone: 'neutral',
    flavor: "Your backlog is under construction. Your soul is a geocities page. You probably still have an AOL email." },
  { slug: 'synthwave-surfer', title: 'Synthwave Surfer', spriteKey: 'synthwave', tone: 'neutral',
    flavor: "The neon glow calls to you. Your retinas are permanently tinted pink and purple. Outrun your backlog." },
  { slug: 'ultra-devotee', title: 'ULTRA Devotee', spriteKey: 'ultraDevotee', tone: 'neutral',
    flavor: "Chartreuse everything. Sharp edges. Zero border radius. Your backlog glows in the dark." },
  { slug: 'holographic-entity', title: 'Holographic Entity', spriteKey: 'hologram', tone: 'neutral',
    flavor: "You browse your backlog through a holographic lens. In the year 3000, your pile will still be there." },
  { slug: 'unsettling-one', title: 'The Unsettling One', spriteKey: 'unsettling', tone: 'neutral',
    flavor: "You chose weird mode. And you stayed. We're not sure what that says about you but we respect it." },
  { slug: 'lighthouse', title: 'The Lighthouse', spriteKey: 'lighthouse', tone: 'roast',
    flavor: "Light mode. Voluntarily. Your monitor is a flashbang and your pile is fully illuminated. There is nowhere to hide." },
  { slug: 'minimalist', title: 'The Minimalist', spriteKey: 'minimalist', tone: 'respect',
    flavor: "No library. No stats. No distractions. Just pick for me and go. You understood the assignment." },

  { slug: 'gamer', title: 'The Gamer', spriteKey: 'gamer', tone: 'neutral',
    flavor: "You've got a pile. It's growing. Every gamer's does. You're here, which means you're ready to play some of them." },
];

export function findArchetypeBySlug(slug: string): ArchetypeRegistryEntry | undefined {
  return ARCHETYPE_REGISTRY.find((a) => a.slug === slug);
}

// Lookup by title (used by in-app share button to compute the share URL).
export function findArchetypeByTitle(title: string): ArchetypeRegistryEntry | undefined {
  // Dynamic "<Genre> Addict" archetypes share the generic genre-addict page.
  if (title.endsWith(' Addict')) return findArchetypeBySlug('genre-addict');
  return ARCHETYPE_REGISTRY.find((a) => a.title === title);
}
