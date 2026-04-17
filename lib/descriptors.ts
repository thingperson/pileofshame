/**
 * Game Descriptors — opinionated one-liner recommendations
 *
 * Priority:
 * 1. Curated descriptor (hand-written for well-known games)
 * 2. Metacritic-based personality descriptor
 * 3. Genre-aware fallback
 */

export interface GameDescriptor {
  line: string;
  confidence: 'curated' | 'scored' | 'generic';
}

// --- Curated descriptors for well-known games ---
// Key = lowercase game name (trimmed)

const CURATED: Record<string, string> = {
  // S-tier — universally adored
  'the witcher 3: wild hunt': 'Masterpiece. 200 hours of content and every single one earns its keep.',
  'the witcher 3': 'Masterpiece. 200 hours of content and every single one earns its keep.',
  'red dead redemption 2': 'A slow burn that becomes the best story games have ever told. Give it time.',
  'elden ring': 'The mountaintop of open-world design. Will break you. You\'ll thank it.',
  'baldur\'s gate 3': 'The new gold standard for RPGs. Every choice matters. Every playthrough is different.',
  'the legend of zelda: breath of the wild': 'Changed what open worlds could be. Still unmatched in sense of discovery.',
  'breath of the wild': 'Changed what open worlds could be. Still unmatched in sense of discovery.',
  'the legend of zelda: tears of the kingdom': 'Breath of the Wild but they somehow made discovery feel new again.',
  'tears of the kingdom': 'Breath of the Wild but they somehow made discovery feel new again.',
  'god of war': 'A dad game disguised as a combat game. Or maybe the other way around. Either way, essential.',
  'god of war ragnarok': 'Bigger, bolder sequel. The emotional payoff is worth every hour.',
  'the last of us': 'Will ruin you emotionally. In the best way. A story that stays with you.',
  'the last of us part i': 'Will ruin you emotionally. In the best way. A story that stays with you.',
  'the last of us part ii': 'Controversial for a reason. It makes you uncomfortable. That\'s the point.',
  'hades': 'The roguelike that made people who hate roguelikes love roguelikes.',
  'celeste': 'A perfect platformer about depression. Sounds weird. Works perfectly.',
  'hollow knight': 'The best $15 you\'ll ever spend on a game. Massive. Beautiful. Brutal.',
  'disco elysium': 'A game about talking. Just talking. And it\'s one of the best games ever made.',
  'disco elysium - the final cut': 'A game about talking. Just talking. And it\'s one of the best games ever made.',
  'portal 2': 'The funniest game ever made. Also has puzzles. Also has the best co-op ever.',
  'portal': 'An hour of perfection. If you haven\'t played this, stop reading and go.',
  'undertale': 'Looks like nothing. Hits like a truck. Don\'t spoil it for yourself.',
  'outer wilds': 'The less you know, the better. A genuine once-in-a-lifetime experience.',
  'return of the obra dinn': 'A detective game where you\'re actually detecting. Genius. Play blind.',
  'stardew valley': 'Digital comfort food. Will eat your weekends. You won\'t mind.',

  // Modern classics
  'horizon zero dawn': 'Robot dinosaurs in post-apocalypse. Sounds dumb, plays incredible. Slow start, but push through.',
  'horizon forbidden west': 'More of everything that worked. The world-building is chef\'s kiss.',
  'ghost of tsushima': 'The samurai game you always wanted. Gorgeous. Respectful. Surprisingly deep combat.',
  'sekiro: shadows die twice': 'The hardest FromSoft game. Also the most rewarding once it clicks.',
  'dark souls': 'The one that started it all. Deliberately obtuse. Deliberately brilliant.',
  'dark souls iii': 'The most accessible Souls game. Still not accessible. Still essential.',
  'dark souls remastered': 'The one that started it all. Deliberately obtuse. Deliberately brilliant.',
  'bloodborne': 'The best exclusive ever made. Aggressive, gothic, and completely unhinged. A masterpiece.',
  'persona 5': 'Style over everything and it works. 100+ hours but never drags.',
  'persona 5 royal': 'The definitive version. Style over everything and it works. 100+ hours but never drags.',
  'final fantasy vii remake': 'Reimagines a classic without disrespecting it. The combat system is phenomenal.',
  'final fantasy vii rebirth': 'The sequel delivers. Open world done right for a JRPG.',
  'mass effect legendary edition': 'Three games. One galaxy. The choices compound beautifully across the trilogy.',
  'mass effect': 'Janky but foundational. The universe-building is unmatched.',
  'mass effect 2': 'The peak. Perfect squad, perfect missions, perfect stakes.',
  'mass effect 3': 'The ending discourse overshadowed a genuinely great game. The ride matters more than the destination.',

  // Nintendo
  'super mario odyssey': 'Pure joy in game form. Every moon is a little surprise party.',
  'animal crossing: new horizons': 'A life sim that becomes your life. Budget 300 hours.',
  'metroid dread': 'Samus is back and she\'s terrifying. Tight, tense, perfect pacing.',
  'fire emblem: three houses': 'A tactical RPG wrapped in a high school sim. Somehow both halves are great.',
  'splatoon 3': 'Nintendo\'s shooter. Weird. Colorful. Genuinely competitive.',
  'super smash bros. ultimate': 'Everyone is here. Everyone. It\'s overwhelming in the best way.',
  'pokemon legends: arceus': 'The Pokemon game fans always wanted. Finally.',

  // Indies & cult classics
  'dead cells': 'Roguelike combat perfection. Every run teaches you something.',
  'slay the spire': 'The deckbuilder. Will ruin your productivity for months.',
  'inscryption': 'Don\'t read anything about it. Just play it. Trust.',
  'tunic': 'A Zelda-like that respects your intelligence. The manual mechanic is genius.',
  'it takes two': 'The best co-op game ever made. Play it with someone you like.',
  'a short hike': 'A 2-hour game that\'ll make you feel more peaceful than a week of vacation.',
  'what remains of edith finch': 'A walking sim that justifies the entire genre. 2 hours. Unforgettable.',
  'subnautica': 'Survival horror but the horror is the ocean. Genuinely terrifying. Genuinely beautiful.',
  'factorio': 'Warning: this game will rewire your brain. You will dream in conveyor belts.',
  'rimworld': 'A war crime simulator disguised as a colony builder. Endlessly replayable.',
  'terraria': 'Minecraft\'s weird cousin who turned out way more interesting.',
  'valheim': 'Viking survival that respects your time. Best with friends, great alone.',
  'satisfactory': 'Factorio in 3D. Warning: will consume your entire personality.',
  'deep rock galactic': 'Rock and Stone! Co-op mining FPS with the best community in gaming.',
  'vampire survivors': 'A $3 game that\'ll eat 50 hours. You won\'t understand why. Nobody does.',

  // Big-budget AAA
  'cyberpunk 2077': 'Rocky launch, incredible game post-patches. Night City is unmatched. Give it the chance it now deserves.',
  'starfield': 'Bethesda\'s most divisive game. Will hit if you love exploration. Misses if you want density.',
  'spider-man': 'The best Spider-Man anything since Spider-Man 2. Swinging never gets old.',
  'marvel\'s spider-man': 'The best Spider-Man anything since Spider-Man 2. Swinging never gets old.',
  'marvel\'s spider-man: miles morales': 'Shorter, tighter, and Miles is a better protagonist. Fight me.',
  'alan wake 2': 'A survival horror musical detective mystery. As weird as it sounds. Brilliant.',
  'resident evil 4': 'The remake that showed how remakes should be done. Perfect pacing.',
  'resident evil village': 'The tall vampire lady game. Also a genuinely solid horror romp.',
  'deathloop': 'Groundhog Day meets Hitman. Stylish. Smart. Better on second playthrough.',
  'death stranding': 'A walking simulator about Amazon delivery in the apocalypse. Either your thing or absolutely not.',
  'control': 'The building is the star. Brutalist architecture meets telekinesis. Underrated gem.',
  'psychonauts 2': 'A platformer about mental health that\'s also laugh-out-loud funny. Rare combo.',
  'doom eternal': 'The purest shooter ever made. It demands everything and rewards it tenfold.',
  'doom (2016)': 'Rip and tear. The game that brought shooters back from cover-shooter purgatory.',
  'half-life: alyx': 'VR\'s killer app. If you have VR, this is mandatory.',
  'titanfall 2': 'The best FPS campaign nobody played. 6 hours of pure adrenaline.',
  'bioshock': 'Would you kindly play this. Atmospheric, smart, and the twist still holds up.',
  'bioshock infinite': 'The city in the sky is worth the visit. Combat\'s fine. Story carries it.',

  // Strategy & simulation
  'civilization vi': 'One more turn. You\'ll say this at 3 AM on a work night. Every time.',
  'cities: skylines': 'SimCity done right. Your city will have traffic problems. Accept it.',
  'total war: warhammer iii': 'The ultimate fantasy strategy sandbox. Overwhelming in the best way.',
  'xcom 2': 'Tactical perfection. You will name soldiers after friends. Friends will die.',

  // Multiplayer / live service
  'destiny 2': 'The shooting is butter. The economy is confusing. You\'ll play 500 hours anyway.',
  'monster hunter: world': 'Intimidating at first. Give it 10 hours. Then you\'ll understand the addiction.',
  'monster hunter rise': 'The most accessible Monster Hunter. Wirebug combat is addictive.',
  'sea of thieves': 'A pirate sandbox that\'s mediocre solo, magical with friends.',
  'no man\'s sky': 'The greatest comeback in gaming history. A completely different game now. Worth revisiting.',
  'apex legends': 'The best movement shooter. Free. Will make you feel old if you\'re over 25.',
  'overwatch 2': 'Still Overwatch. That\'s either great or terrible depending on when you left.',

  // Cozy / chill
  'unpacking': 'You unpack boxes. That\'s it. It\'s somehow deeply moving.',
  'powerwash simulator': 'ASMR: The Game. Unexpectedly therapeutic.',
  'spiritfarer': 'A game about death that\'s warm and gentle. Will make you cry.',
  'coffee talk': 'A visual novel about making coffee for fantasy creatures. Exactly as cozy as it sounds.',
  'dorfromantik': 'Tile-placing zen. Perfect podcast game.',

  // Roguelikes / roguelites
  'the binding of isaac: rebirth': 'Grotesque, addictive, endlessly deep. 1000+ hours of content. Not kidding.',
  'risk of rain 2': 'Power fantasy roguelike. You start weak, end as a god. Every run.',
  'into the breach': 'Chess meets mechs meets perfect design. Every move matters.',
  'spelunky 2': 'The roguelike that hates you. You\'ll hate it back. Then play 200 more hours.',
  'returnal': 'Roguelike meets AAA. Housemarque\'s magnum opus. Punishing but fair.',
  'balatro': 'Poker roguelike. Sounds niche. Will consume your soul.',

  // Narrative
  'firewatch': 'A summer in a watchtower. Beautiful, melancholy, over in 4 hours. Perfect length.',
  'life is strange': 'Teen drama with time travel. Either you connect deeply or you bounce hard. You\'ll know in 15 mins.',
  'night in the woods': 'A game about being 20 and lost. If that resonates, this will hurt (good).',
  'kentucky route zero': 'Magical realism as a game. Slow. Strange. Completely unique.',

  // Platformers
  'ori and the blind forest': 'A platformer that\'ll make you cry in the first 10 minutes.',
  'ori and the will of the wisps': 'Everything the first game was, but more. The combat upgrade is massive.',
  'cuphead': 'Cartoon difficulty. Your hands will hurt. Your eyes will thank you.',
  'shovel knight': 'Retro platforming perfected. More content than games 5x its price.',

  // More common Steam/PS/Xbox library titles (non-duplicates)
  'devil may cry 5': 'Peak action combat. Three characters, three playstyles, all excellent.',
  'metal gear solid v: the phantom pain': 'Unfinished story, perfect stealth sandbox. The gameplay is the real narrative.',
  'dragon age: inquisition': 'BioWare\'s last great RPG. Companions that feel like friends.',
  'divinity: original sin 2': 'The other CRPG masterpiece. Unmatched freedom in how you solve problems.',
  'civilization v': 'Some argue this is still the best Civ. Those people have a point.',
  'resident evil 2': 'Survival horror perfected for modern hardware. Mr. X will haunt your dreams.',
  'rocket league': 'Car soccer. Infinite skill ceiling. You\'ll be terrible for 100 hours. Then just bad.',
  'fall guys': 'Silly, chaotic fun. Perfect for 20 minutes. Or 3 hours. Hard to predict.',
  'overcooked! 2': 'Will test your relationships. In the best way. Pure cooperative chaos.',
  'overcooked! all you can eat': 'All the relationship-testing chaos in one package.',
  'tony hawk\'s pro skater 1 + 2': 'Nostalgia done right. The remaster these games deserved.',
  'uncharted 4: a thief\'s end': 'Nathan Drake\'s farewell tour. Gorgeous, emotional, and the best set pieces in gaming.',
  'spider-man remastered': 'The best Spider-Man game ever made. Swinging never gets old.',
  'marvel\'s spider-man remastered': 'The best Spider-Man game ever made. Swinging never gets old.',
  'gran turismo 7': 'The driving simulator for people who care about cars. Beautiful and obsessively detailed.',
  'alan wake': 'Stephen King meets video games. Atmospheric and genuinely creepy.',
  'prey': 'An immersive sim hiding in plain sight. Criminally underplayed.',
  'dishonored': 'Play it stealthy. Play it loud. Play it twice. Every approach works.',
  'dishonored 2': 'More powers, more options, two characters. The immersive sim at its finest.',
  'hitman 3': 'Murder puzzles in beautiful locations. The trilogy is a masterclass in level design.',
  'the outer worlds': 'Fallout in space, lighter and funnier. A solid RPG comfort food.',
  'sonic mania': 'The Sonic game fans made. Better than anything Sega managed in 20 years.',
  'untitled goose game': 'Be a goose. Ruin people\'s days. Somehow one of the funniest games ever.',
  'wipeout omega collection': 'Anti-gravity racing perfection. The soundtrack alone justifies the purchase.',
  'dirt rally 2.0': 'The most authentic rally experience in gaming. Your co-driver will become your best friend.',
  'nhl 20': 'Hockey. On a screen. You know if this is your thing.',
  'ea sports ufc 4': 'MMA fighting. Button-masher on the surface, surprisingly deep underneath.',
  'starbound': 'Terraria in space. Explore planets, build bases, lose weeks.',
  'the last guardian': 'A boy and his giant bird-dog. Frustrating controls, but the emotional payoff is real.',
  'ace combat 7: skies unknown': 'Arcade flight combat with anime drama. Sounds absurd, plays fantastic.',
  'tetris effect: connected': 'Tetris, but transcendent. The synesthesia experience gaming needed.',
  'fall guys: ultimate knockout': 'Silly, chaotic fun. Perfect for 20 minutes. Or 3 hours. Hard to predict.',
  'sonic mania plus': 'The definitive version of the definitive Sonic game.',
  'the gardens between': 'A short puzzle game about friendship and memory. Beautiful and bittersweet.',
};

// --- Metacritic-based descriptors ---

interface ScoreDescriptor {
  range: [number, number];
  descriptors: string[];
}

const SCORE_DESCRIPTORS: ScoreDescriptor[] = [
  {
    range: [95, 100],
    descriptors: [
      'Universally adored. This is a capital-E Event game.',
      'One of the highest-rated games ever made. The hype is real.',
      'Generational talent. This one defines eras.',
      'A game people still talk about years later. The reputation\'s earned.',
      'The kind of game your future self will thank you for playing.',
      'If you only play ten more games in your life, this is one.',
      'Critics and players agree. That almost never happens.',
    ],
  },
  {
    range: [90, 94],
    descriptors: [
      'Near-universal acclaim. Damn near everyone who played this loved it.',
      'Elite tier. The kind of game people build their backlog around.',
      'A top-shelf title. If this is in your pile, move it up.',
      'Reviewers ran out of ways to say \'great.\' You\'re about to see why.',
      'The kind of game that shows up on year-end lists. All of them.',
      'This one doesn\'t need you to meet it halfway. It comes to you.',
      'Reliably great. Unanimously so.',
    ],
  },
  {
    range: [85, 89],
    descriptors: [
      'Excellent by any measure. Most players walk away impressed.',
      'Highly rated across the board. A safe bet for a great time.',
      'Strong reviews, strong word of mouth. This one earned its reputation.',
      'Sharp execution. Not revolutionary, but very good at what it does.',
      'You won\'t regret picking this one. Most people don\'t.',
      'Did most things right. A few things brilliantly. Worth the time.',
      'High marks across the board. No red flags.',
    ],
  },
  {
    range: [80, 84],
    descriptors: [
      'Solid and well-received. Not flawless, but the good outweighs the rough.',
      'A good game that does what it sets out to do. Worth your time.',
      'Well-reviewed, well-liked. The kind of game you\'re glad you played.',
      'A B+ game that occasionally hits an A. Happens more than you\'d think.',
      'Does the basics well. A few moments punch above.',
      'Reviewers liked it. Players liked it. You\'ll probably like it too.',
      'Well-made. Won\'t blow your mind but won\'t waste your time.',
    ],
  },
  {
    range: [75, 79],
    descriptors: [
      'Good, not great. Will hit if it\'s your genre. Skip if not.',
      'Positive reviews with some caveats. Know what you\'re getting into.',
      'A solid pick if the genre appeals to you. Doesn\'t transcend it.',
      'Fine. Not a word we love, but accurate here. If you\'re in the mood, go.',
      'Works well for what it is. Doesn\'t try to be more.',
      'The kind of game you play and forget in two weeks. Not a bad thing.',
      'Genre fans will be satisfied. Others might bounce.',
    ],
  },
  {
    range: [70, 74],
    descriptors: [
      'Mixed-to-positive. Has its fans, has its critics. You\'ll know which you are fast.',
      'Divisive. Some people love this, others bounce hard. You\'ll know in 15 mins.',
      'Not for everyone, but the people it clicks with really click with it.',
      'Reviewers disagreed. So did players. Form your own opinion.',
      'Some of it lands. Some of it doesn\'t. You\'ll know which is which.',
      'Imperfect, but memorable to the people who stuck with it.',
      'A game with flaws and fans. Give it an hour.',
    ],
  },
  {
    range: [60, 69],
    descriptors: [
      'Polarizing. There\'s something here, but it\'s buried under rough edges.',
      'Has ambition. Doesn\'t always land. Worth a look if the concept grabs you.',
      'The reviews are mixed, but reviews don\'t know your taste. Give it a shot.',
      'Uneven. Parts are great, parts aren\'t. You\'ll play it to find out which.',
      'A game trying to do too much. Sometimes that\'s exactly what you want.',
      'Rough around the edges, but some edges have soul.',
      'Not for everyone. If you\'re curious, that\'s a signal.',
    ],
  },
  {
    range: [50, 59],
    descriptors: [
      'Rough around the edges. Play this if you\'re a fan of the genre, skip otherwise.',
      'Mid. But sometimes mid is exactly what you need midweek.',
      'This one needs you to meet it halfway. It won\'t do the work for you.',
      'Not the best reviewed. Still earned its spot in your pile for a reason.',
      'Patchy. Has its moments. Measure your expectations.',
      'You paid for this. Might as well see what it\'s about.',
      'Reviewers weren\'t kind. You don\'t have to be them.',
    ],
  },
  {
    range: [0, 49],
    descriptors: [
      'Brave choice having this in the pile. Respect the commitment.',
      'The reviews were brutal. Maybe they\'re wrong. Maybe.',
      'A guilty pleasure waiting to happen. Or just guilt. Either way.',
      'Universally panned. Play it ironically. Or sincerely. No judgment.',
      'The kind of game you play on a dare. Live a little.',
      'Bad review scores. Strong personality. Your call.',
      'A bold pick. Nobody ever tells stories about safe games.',
    ],
  },
];

// --- Genre-aware fallbacks (when no metacritic) ---

// Genre fallback pool — 4 lines per genre, picked deterministically from a hash
// of the game name so the same game shows the same line on reroll but different
// games in the same genre don't all read identically.
const GENRE_FALLBACKS: Record<string, string[]> = {
  rpg: [
    'An RPG in the pile. Block out some serious hours for this one.',
    'RPG means reading. RPG means commitment. Still in?',
    'The kind of game where \'just one more quest\' becomes midnight.',
    'Level up. Story up. Time up. Classic RPG tax.',
  ],
  roguelike: [
    'A roguelike. Every failed run is technically progress.',
    'A roguelike. You will die. The game wants you to. You\'ll come back.',
    'One more run energy. Set a timer or lose the evening.',
    'Built to be replayed. Built to be brutal. Weirdly relaxing.',
  ],
  puzzle: [
    'A puzzle game. Your brain will thank you. Your backlog won\'t.',
    'A puzzle game. Bring coffee and patience.',
    'Expect \'aha\' moments. Expect some stuck moments. Both are the point.',
    'Perfect when thinking is what you actually want to do.',
  ],
  platformer: [
    'A platformer. Jump, die, learn, repeat. The classics never change.',
    'A platformer. Muscle memory, rhythm, and rage. All three.',
    'Short levels, long memories. Platformers age well.',
    'Tight controls and trial-and-error. The genre at its best.',
  ],
  horror: [
    'Play this one at night with headphones. Trust the process.',
    'Horror. Bright lights off. Headphones on. Commit.',
    'A survival horror. Bring your nerves. Leave your composure.',
    'Scary on purpose. Worth it if you\'re in the mood.',
  ],
  strategy: [
    'A strategy game. Budget more time than you think you need.',
    'Strategy games eat hours. Plan accordingly.',
    'Chess with extra steps. You\'ll love the extra steps.',
    'Thinking the game. That\'s the game.',
  ],
  sim: [
    'A sim game. You\'ll either play 5 minutes or 500 hours. No in-between.',
    'A sim. These games don\'t end. That\'s the appeal.',
    'Menus within menus. Addictive menus.',
    'Quiet systems doing quiet things. You\'ll lose an afternoon.',
  ],
  shooter: [
    'Bullets first, questions later. Pure adrenaline.',
    'A shooter. Aim. Shoot. Move. Repeat. There\'s joy in the rhythm.',
    'Fast-twitch fun. Your reflexes will thank you.',
    'If you want adrenaline, load it up.',
  ],
  action: [
    'Fast combat, sharp reflexes. This one earns its spot in the pile.',
    'Action means timing. Action means commitment to combos. Fun.',
    'Gets the blood moving. Also gets the thumbs sore.',
    'Reactive, rhythmic, rewarding when it clicks.',
  ],
  adventure: [
    'An adventure awaits. The pile can wait. This one\'s calling.',
    'Adventure games reward curiosity. Bring some.',
    'Exploration means wandering means noticing. Slow it down.',
    'Get lost in a place on purpose. That\'s the genre.',
  ],
  indie: [
    'An indie pick. Often where the real magic happens.',
    'Indie games swing for the fences. This one probably connects.',
    'Small team, big ideas. Usually worth your time.',
    'Indie = personality. Load it up.',
  ],
  racing: [
    'A racing game. Perfect for when you want zero narrative commitment.',
    'Racing. Pure reflex. Pure fun. And no one gets sad in a racing game.',
    'Go fast. Turn left. Occasionally right. That\'s the deal.',
    'A perfect 30-minute game.',
  ],
  fighting: [
    'A fighting game. You\'ll spend more time in training mode than you expect.',
    'Fighting games are rhythm games with fists. Learn the beat.',
    'Losing is the tutorial. Winning is the reward.',
    'Bring friends. Or bring the practice dummy.',
  ],
  sports: [
    'A sports game. Great for when the real season isn\'t on.',
    'A sports game. Ritualistic. Satisfying. Oddly meditative.',
    'Arcade sports or sim? Either way, pick up and play.',
    'The pickup-and-play format perfected.',
  ],
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickFromPool(pool: string[], seed: string): string {
  return pool[hashString(seed) % pool.length];
}

function getGenreFallback(genres: string[], gameName: string = ''): string {
  const g = genres.map((s) => s.toLowerCase());
  const seed = gameName.toLowerCase();

  if (g.some((s) => s.includes('rpg') || s.includes('role-playing'))) return pickFromPool(GENRE_FALLBACKS.rpg, seed);
  if (g.some((s) => s.includes('roguelike') || s.includes('roguelite'))) return pickFromPool(GENRE_FALLBACKS.roguelike, seed);
  if (g.some((s) => s.includes('puzzle'))) return pickFromPool(GENRE_FALLBACKS.puzzle, seed);
  if (g.some((s) => s.includes('platformer'))) return pickFromPool(GENRE_FALLBACKS.platformer, seed);
  if (g.some((s) => s.includes('horror') || s.includes('survival'))) return pickFromPool(GENRE_FALLBACKS.horror, seed);
  if (g.some((s) => s.includes('strategy') || s.includes('tactical'))) return pickFromPool(GENRE_FALLBACKS.strategy, seed);
  if (g.some((s) => s.includes('simulation') || s.includes('sim'))) return pickFromPool(GENRE_FALLBACKS.sim, seed);
  if (g.some((s) => s.includes('shooter') || s.includes('fps'))) return pickFromPool(GENRE_FALLBACKS.shooter, seed);
  if (g.some((s) => s.includes('action'))) return pickFromPool(GENRE_FALLBACKS.action, seed);
  if (g.some((s) => s.includes('adventure') || s.includes('exploration'))) return pickFromPool(GENRE_FALLBACKS.adventure, seed);
  if (g.some((s) => s.includes('indie'))) return pickFromPool(GENRE_FALLBACKS.indie, seed);
  if (g.some((s) => s.includes('racing') || s.includes('driving'))) return pickFromPool(GENRE_FALLBACKS.racing, seed);
  if (g.some((s) => s.includes('fighting'))) return pickFromPool(GENRE_FALLBACKS.fighting, seed);
  if (g.some((s) => s.includes('sports'))) return pickFromPool(GENRE_FALLBACKS.sports, seed);

  return '';
}

// --- Edition detection nudges ---

interface EditionMatch {
  pattern: RegExp;
  nudges: string[];
}

const EDITION_NUDGES: EditionMatch[] = [
  {
    pattern: /\b(digital\s+)?deluxe\b/i,
    nudges: [
      'You paid for the Deluxe Edition. Those bonus cosmetics aren\'t going to admire themselves.',
      'Deluxe Edition sitting in the pile. The extra content you paid for is getting dusty.',
      'You went Deluxe on this one. That\'s a financial commitment to vibes you haven\'t experienced yet.',
    ],
  },
  {
    pattern: /\b(ultimate)\b/i,
    nudges: [
      'The Ultimate Edition, no less. You bought everything. Played nothing. Iconic.',
      'The Ultimate Edition. You own every DLC, every expansion, every excuse not to play it.',
      'You got the Ultimate. All the content is there. All of it. Waiting.',
    ],
  },
  {
    pattern: /\b(collector'?s)\b/i,
    nudges: [
      'Collector\'s Edition. At this point the game is literally collecting dust. On brand.',
      'You bought the Collector\'s Edition. The irony writes itself.',
    ],
  },
  {
    pattern: /\b(goty|game of the year)\b/i,
    nudges: [
      'Game of the Year Edition. Someone\'s game of the year. Not yours yet, apparently.',
      'GOTY Edition with all the DLC. A complete package, completely unplayed.',
      'They called it Game of the Year. You called it Game of Next Year. And the year after that.',
    ],
  },
  {
    pattern: /\b(gold)\b/i,
    nudges: [
      'Gold Edition. All the extras, all the DLC, all the good intentions.',
      'You went Gold. That\'s the "I\'ll definitely play this" tier of optimism.',
    ],
  },
  {
    pattern: /\b(premium|platinum)\b/i,
    nudges: [
      'Premium Edition. You paid premium prices for a premium spot in your backlog.',
      'The Premium tier. Because regular shame wasn\'t enough.',
    ],
  },
  {
    pattern: /\b(complete|definitive)\b/i,
    nudges: [
      'The complete package. Now complete your end of the bargain and play it.',
      'Definitive Edition. The definitive version of a game you\'ve definitely not played.',
    ],
  },
  {
    pattern: /\b(legendary)\b/i,
    nudges: [
      'Legendary Edition. The legend is how long it\'s been in your backlog.',
    ],
  },
  {
    pattern: /\b(remaster(ed)?|remake)\b/i,
    nudges: [
      'A remaster. You might\'ve already owned the original. Now you own the guilt twice.',
      'They remastered it. You re-bought it. Circle of life.',
      'The devs put in the work to update this. Meet them halfway.',
    ],
  },
  {
    pattern: /\b(season\s*pass|expansion\s*pass)\b/i,
    nudges: [
      'You bought the Season Pass. Every season that passes without playing is on you.',
    ],
  },
];

function getEditionNudge(name: string): string | null {
  const lower = name.toLowerCase();
  for (const { pattern, nudges } of EDITION_NUDGES) {
    if (pattern.test(lower)) {
      // Deterministic pick based on name
      const hash = lower.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return nudges[hash % nudges.length];
    }
  }
  return null;
}

// --- Main export ---

// --- Duplicate game detection nudges ---

const DUPE_NUDGES = [
  'You own this on multiple platforms. That\'s not dedication, that\'s a cry for help.',
  'Bought it twice. Played it zero times. Math checks out.',
  'One copy wasn\'t enough shame, so you doubled down.',
  'Multi-platform owner. Still haven\'t played it on any of them.',
  'You own this more than once. Each copy judges you independently.',
  'Two copies, zero hours. Efficiency.',
];

export function getDupeNudge(name: string, allGames: { name: string; source: string }[]): string | null {
  const normalized = name.trim().toLowerCase()
    .replace(/\s*[:\-–]\s*(definitive|complete|goty|game of the year|remastered|deluxe|ultimate|enhanced|special)\s*(edition|version)?$/i, '')
    .replace(/\s*\(.*?\)\s*$/, '')
    .trim();

  const matches = allGames.filter((g) => {
    const gNorm = g.name.trim().toLowerCase()
      .replace(/\s*[:\-–]\s*(definitive|complete|goty|game of the year|remastered|deluxe|ultimate|enhanced|special)\s*(edition|version)?$/i, '')
      .replace(/\s*\(.*?\)\s*$/, '')
      .trim();
    return gNorm === normalized;
  });

  if (matches.length <= 1) return null;

  // Check if they're on different platforms
  const sources = new Set(matches.map((m) => m.source));
  if (sources.size <= 1) return null;

  const hash = normalized.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return DUPE_NUDGES[hash % DUPE_NUDGES.length];
}

export function getGameDescriptor(
  name: string,
  metacritic?: number | null,
  genres?: string[],
): GameDescriptor | null {
  // 1. Check curated list
  const key = name.trim().toLowerCase();
  const curated = CURATED[key];
  if (curated) {
    return { line: curated, confidence: 'curated' };
  }

  // Also check without common suffixes/prefixes
  const simplified = key
    .replace(/\s*[:\-–]\s*(definitive|complete|goty|game of the year|remastered|deluxe|ultimate|enhanced|special)\s*(edition|version)?$/i, '')
    .replace(/\s*\(.*?\)\s*$/, '')
    .trim();

  if (simplified !== key) {
    const curatedSimple = CURATED[simplified];
    if (curatedSimple) {
      // Append edition nudge to curated description
      const nudge = getEditionNudge(name);
      const line = nudge ? `${curatedSimple} ${nudge}` : curatedSimple;
      return { line, confidence: 'curated' };
    }
  }

  // 2. Check for edition nudge as primary descriptor
  const editionNudge = getEditionNudge(name);

  // 3. Use metacritic score
  if (metacritic && metacritic > 0) {
    for (const tier of SCORE_DESCRIPTORS) {
      if (metacritic >= tier.range[0] && metacritic <= tier.range[1]) {
        const hash = key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const scoreLine = tier.descriptors[hash % tier.descriptors.length];
        // Combine score descriptor with edition nudge
        const line = editionNudge ? `${scoreLine} ${editionNudge}` : scoreLine;
        return { line, confidence: 'scored' };
      }
    }
  }

  // 4. Edition nudge on its own
  if (editionNudge) {
    return { line: editionNudge, confidence: 'scored' };
  }

  // 5. Genre fallback
  if (genres && genres.length > 0) {
    const fallback = getGenreFallback(genres, name);
    if (fallback) {
      return { line: fallback, confidence: 'generic' };
    }
  }

  return null;
}
