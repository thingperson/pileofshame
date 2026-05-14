#!/usr/bin/env tsx
/**
 * assemble-pool.ts — Merge subagent blurbs + supplemental games into final pool.
 * Run after build-pool.ts generates the draft.
 *
 * Usage: npx tsx bot/scripts/assemble-pool.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRAFT_PATH = join(__dirname, '..', 'data', 'pick-pool-draft.json');
const OUTPUT_PATH = join(__dirname, '..', 'data', 'pick-pool.json');

interface PoolEntry {
  title: string;
  lengthHours: number;
  moods: string[];
  blurb: string;
}

// ── Blurbs from subagent drafts (KEEP entries only) ──

const BLURBS: Record<string, string> = {
  // Batch 1
  "The Legend of Zelda: Ocarina of Time": "The one that taught a generation what adventure feels like. Still holds up.",
  "Soulcalibur": "The fighting game that made Dreamcast owners insufferable. Deservedly.",
  "Super Mario Galaxy": "Nintendo threw Mario into space and somehow made gravity fun. Pure joy.",
  "Metroid Prime": "Lonely, atmospheric, brilliant. Scanning everything isn't a chore here.",
  "Super Mario Galaxy 2": "More Galaxy. That's the highest compliment.",
  "Perfect Dark": "GoldenEye's cooler older sister. Laptop guns that become turrets.",
  "Super Mario Odyssey": "Possessing a T-Rex with a hat is peak game design. No notes.",
  "The Legend of Zelda: Breath of the Wild": "They broke the Zelda formula and rebuilt it better. Go anywhere.",
  "Baldur's Gate III": "200 hours of 'one more conversation.' Your save file has consequences.",
  "The Legend of Zelda: Tears of the Kingdom": "Breath of the Wild but now you can glue rockets to a raft.",
  "Half-Life": "Started the 'shooters can have stories' argument. Won it immediately.",
  "Uncharted 2: Among Thieves": "The train level. You know the one. Blockbuster gaming at its peak.",
  "Red Dead Redemption 2": "Slow, deliberate, devastating. Arthur Morgan deserves your time.",
  "BioShock": "Would you kindly clear your evening? Rapture doesn't let go.",
  "Half-Life 2": "The gravity gun changed everything. Still the benchmark for physics gameplay.",
  "Tekken 3": "The fighting game your cousin was suspiciously good at. Still tight.",
  "Metal Gear Solid 2: Sons of Liberty": "Kojima predicted the internet and nobody believed him. They do now.",
  "The Legend of Zelda: Majora's Mask": "Three days to save the world. Dark, urgent, unforgettable.",
  "Baldur's Gate II: Shadows of Amn": "The CRPG everything else is measured against. Minsc and Boo demand it.",
  "Portal 2": "Co-op ruins friendships. Solo ruins your sense of what puzzles can be. Perfect.",
  "LittleBigPlanet": "Sackboy is pure vibes. Play the levels, skip the creator unless you want to lose a weekend.",
  "The Legend of Zelda: A Link to the Past": "Top-down Zelda perfected. Every dungeon earns its place.",
  "Grand Theft Auto IV": "Bowling with your cousin. Also: the best story Rockstar ever told.",
  "The Last Of Us": "You'll feel things you didn't sign up for. Trust the pacing.",
  "Red Dead Redemption": "The sunset ride home. If you know, you know. If you don't, go find out.",
  "XCOM 2: War of the Chosen": "Your soldiers will die and you'll name the next squad after them.",
  "Elden Ring": "Beautiful, brutal, enormous. The pile fears this one.",
  "The Orange Box": "Three legendary games for the price of one. Valve never did this again.",
  "Burnout 3: Takedown": "Pure destruction at 200mph. No simulation, no pretense. Just carnage.",
  "Chrono Cross": "Gorgeous, strange, polarizing. The soundtrack alone justifies the hours.",
  "Resident Evil Code: Veronica": "Classic RE at its most unhinged. Claire deserves this spotlight.",
  "The Elder Scrolls IV: Oblivion": "The NPCs have unhinged conversations at 3am. You'll love every second.",
  "Grand Theft Auto: Vice City": "Neon, synths, Hawaiian shirts. The vibes are immaculate.",
  "God of War I": "Angry dad before the reboot made him a sad dad. Pure spectacle.",
  "Diablo": "Click demons until they drop loot. Repeat forever. The original loop.",
  "The Elder Scrolls V: Skyrim": "You've bought it four times. Might as well finally finish it.",
  "Batman: Arkham City": "Be Batman in an open-world prison. The combat still feels incredible.",
  "BioShock Infinite": "Columbia is gorgeous. The ending will start arguments. Both are the point.",
  "Divinity: Original Sin 2 - Definitive Edition": "Everything is a weapon. Oil plus fire equals tactics. Best co-op RPG ever made.",
  "Metal Gear Solid 3: Subsistence": "Snake eats frogs in a jungle. Also: the best story in the series.",
  "Divinity: Original Sin - Enhanced Edition": "Larian's first crack at the formula. Rough edges, genuine magic underneath.",
  "Metal Gear Solid": "Cardboard box stealth. Fourth-wall demolition. Gaming's first auteur moment.",
  "Grim Fandango": "Film noir with skeletons. The writing hasn't aged a day.",
  "Command & Conquer": "Tiberium harvesting and FMV cutscenes. RTS before RTS got complicated.",
  "Super Mario 64": "Invented 3D platforming and mostly got it right on the first try.",
  "Metal Gear Solid 4: Guns of the Patriots": "More movie than game. That's either the pitch or the warning.",
  "Mass Effect 2": "Assemble the squad. Do their loyalty missions. Get attached. Survive the finale.",
  "Persona 5 Royal": "100+ hours of style, heart, and time management. The calendar is the real boss.",
  "Sid Meier's Civilization IV": "'One more turn' at 2am. You've been warned.",
  "Jet Set Radio": "Cel-shaded rollerblading with a soundtrack that never left your head.",
  "God of War (2018)": "One continuous camera shot. Father-son roadtrip through Norse mythology. Heavy.",
  "StarCraft II: Wings of Liberty": "The campaign is secretly great. Raynor's story carries it.",
  "Company of Heroes": "WW2 RTS where cover and positioning matter more than build order spam.",
  "Gears of War 2": "Chainsaw guns and genuine emotional beats. The Horde mode alone is worth it.",
  "Dwarf Fortress": "ASCII art hides the deepest simulation ever made. Losing is fun. Literally.",

  // Batch 2
  "Okami": "Zelda by way of Japanese watercolor. Paintbrush combat that never stops being satisfying.",
  "Grand Theft Auto III": "The one that started it. Rough now, but the freedom was real.",
  "The Last of Us Part II": "Relentless. Will make you feel things you didn't sign up for.",
  "Maniac Mansion: Day of the Tentacle": "Point-and-click perfection. Time travel puzzles that actually make sense. Mostly.",
  "Castlevania: Symphony of the Night": "The map keeps going. Invented a genre and still plays better than most of its children.",
  "Uncharted 4: A Thief's End": "The best action movie you'll ever play. Knows exactly when to quit.",
  "SSX 3": "One enormous mountain, top to bottom. Arcade snowboarding that hasn't been topped.",
  "Paper Mario (2000)": "RPG with construction-paper charm. Funny, simple, genuinely clever.",
  "Skies of Arcadia": "Sky pirates, airship battles, a world that wants to be explored. JRPG comfort food.",
  "Grand Theft Auto: San Andreas": "Three cities, a BMX, and zero chill. The one everyone remembers.",
  "Super Mario 3D World": "Pure platforming joy. Every level a new idea, no filler.",
  "The Legend of Zelda: Skyward Sword": "Divisive for a reason. Motion controls aside, the dungeons are some of Zelda's best.",
  "Homeworld": "Space RTS in full 3D. Still gorgeous. Still heartbreaking.",
  "Super Smash Bros. Ultimate": "Everyone is here. Literally everyone. Single-player is meatier than you'd expect.",
  "God of War II": "Bigger, angrier sequel. The scale goes absurd and earns it.",
  "Demon's Souls (2020)": "The remake that justified the PS5. Gorgeous misery from minute one.",
  "Sid Meier's Alpha Centauri": "Civilization on an alien planet with better writing than most RPGs.",
  "Soul Calibur II": "Weapon-based fighting that still feels incredible. Pick a guest character and go.",
  "FINAL FANTASY VI": "The opera scene. Kefka. The World of Ruin. The JRPG all others are measured against.",
  "The Walking Dead: Season 1": "Telltale's best. You'll make terrible choices and feel every one.",
  "God of War III": "Opens with the most ridiculous set piece in gaming history. Doesn't slow down.",
  "Uncharted 3: Drake's Deception": "Big set pieces, great banter. The plane sequence alone.",
  "Eternal Darkness: Sanity's Requiem": "Horror that messes with YOU, not just the character. The sanity effects are legendary.",
  "Vagrant Story (2000)": "Dark, dense, and criminally underplayed. The weapon crafting will consume you.",
  "Mario Kart 8 Deluxe": "The definitive kart racer. 96 tracks. Every single one bangs.",
  "Call of Duty 4: Modern Warfare": "The campaign that rewrote shooters. Short, brutal, unforgettable.",
  "Super Mario World": "Perfect 2D platforming. Cape Feather is the best power-up ever made.",
  "Metroid Fusion": "Tight, tense, linear Metroid. The SA-X is stalking you. You are not ready.",
  "Fire Emblem Awakening": "The one that saved the franchise. Permadeath makes every move matter.",
  "Super Mario Sunshine": "Weird Mario. FLUDD is polarizing, but the platforming underneath is pure.",
  "Bloodborne": "Victorian nightmare at 30fps and you won't care. The best combat From ever made.",
  "Undertale": "Looks like nothing. Plays like nothing else. Spare everyone or don't. It notices.",
  "Final Fantasy X": "Linear and proud of it. The story hits harder than the sphere grid.",
  "Tom Clancy's Splinter Cell Chaos Theory": "Peak stealth. Every mission a puzzle box. The bank level is a masterpiece.",
  "Final Fantasy XII": "MMO combat in a single-player shell. The Gambit system is programming-lite and brilliant.",
  "A Monster's Expedition": "Push trees. Make bridges. The whole island opens up. Quietly perfect.",
  "Thief: The Dark Project": "First-person stealth before anyone else figured it out. Sound design carries the game.",
  "Warcraft 3: Reign of Chaos": "RTS with hero units and a campaign that set up an entire MMO.",
  "Braid": "Time-bending platformer. The last world recontextualizes everything. Short and permanent.",

  // Batch 3
  "Bayonetta 2": "Over-the-top action that never stops escalating. Pure spectacle, zero filler.",
  "Metroid Prime 2: Echoes": "Darker, harder Metroid Prime. The light/dark world mechanic earns every headache.",
  "Age of Empires II: Age of Kings": "The RTS that ruined a generation's bedtime. Still holds up.",
  "Grand Theft Auto V": "Massive, dumb, brilliant. Three playable idiots and a world that rewards curiosity.",
  "Conker's Bad Fur Day": "Foul-mouthed platformer from Rare's unhinged era. Absolutely for you.",
  "Banjo-Kazooie": "Collect-a-thon perfected. Charming, funny, and tighter than you remember.",
  "Journey": "Two hours, no words, genuinely moving. Play it in one sitting.",
  "System Shock 2": "The immersive sim that taught BioShock everything. Creaky but still terrifying.",
  "The Witcher 3: Wild Hunt": "200 hours of world-class RPG. Side quests here outwrite most games' main stories.",
  "Crash Bandicoot 3: Warped": "Peak Crash. Tight levels, wild variety, beatable in a weekend.",
  "Gears of War 3": "Best campaign in the series. A real ending and Horde mode worth it alone.",
  "Tom Clancy's Splinter Cell": "Slow, tense stealth that rewards patience. Sam Fisher's best outing aged well.",
  "Crysis": "Still gorgeous. The nanosuit sandbox is more fun than the memes suggest.",
  "The Legend of Zelda: A Link Between Worlds": "Top-down Zelda that trusts you from the start. Open structure, tight dungeons.",
  "Klonoa 2: Lunatea's Veil": "Gorgeous 2.5D platformer that nobody played. Short, sweet, surprisingly emotional.",
  "Ninja Gaiden (2004)": "Brutal, precise combat that punishes button-mashing. You will die. You will improve.",
  "Super Mario World 2: Yoshi's Island": "Hand-drawn platforming at its best. Baby Mario's crying is the final boss.",
  "Mark of the Ninja": "Stealth done right in 2D. Every kill feels earned. Tight and replayable.",
  "NieR:Automata": "Three playthroughs. Each one recontextualizes the last. Don't stop at the first ending.",
  "Death Road to Canada": "Roguelike road trip through zombie Canada. Silly, chaotic, great with friends.",
  "FEZ": "Rotate the world. 2D becomes 3D becomes puzzle. Quiet, brilliant, unforgettable.",
  "Spyro: Year of the Dragon": "Peak PS1 collectathon. More variety than the first two, same charm.",
  "Call of Duty": "The original. No killstreaks, no prestige. Just a solid WWII campaign.",
  "Resident Evil 2": "Survival horror landmark. Two characters, genuine tension, inventory as gameplay.",
  "God of War: Chains of Olympus": "PSP-sized God of War that punches way above its weight.",
  "Ratchet & Clank: Up Your Arsenal": "Best PS2 Ratchet. Weapons are creative, humor actually lands.",
  "Tony Hawk's Pro Skater 2": "Two-minute runs, perfect flow state. The soundtrack alone is worth it.",
  "Deus Ex: Human Revolution - Director's Cut": "Cyberpunk immersive sim. Multiple solutions to everything. Your call.",
  "Castlevania: Aria of Sorrow": "Best GBA Castlevania. The soul system is addictive. Beatable in a weekend.",
  "Dark Souls II": "The weird middle child. Slower, stranger, still rewarding. Majula's music haunts.",
  "Baldur's Gate": "The CRPG that started it all. Dense, demanding, worth the learning curve.",
  "Shadow of the Colossus": "Sixteen bosses. No filler. Every fight is a puzzle made of fur and stone.",
  "Halo 3": "The campaign that finished the fight. Still the gold standard for sci-fi shooter setpieces.",
  "DRAGON QUEST XI S: Echoes of an Elusive Age - Definitive Edition": "Classic JRPG comfort food. 80 hours of charm, zero cynicism.",
  "The Longest Journey": "Point-and-click epic with writing that still holds up. Slow, wordy, rewarding.",
  "Rez Infinite": "Synesthesia as a rail shooter. Short, hypnotic, unlike anything else.",
  "Metal Gear Solid V: The Phantom Pain": "Best stealth sandbox ever made. The story trails off. The gameplay never does.",
  "Fallout 3": "Step out of the vault. The Capital Wasteland is bleak and impossible to stop exploring.",
  "Planescape: Torment": "The best-written RPG ever made. Combat is forgettable. Everything else is unforgettable.",
  "Dragon Age: Origins": "BioWare's last great RPG. Choices matter, companions are memorable.",
  "Ori and the Will of the Wisps": "Gorgeous Metroidvania with combat that actually bites. Better than Blind Forest.",
  "Resident Evil": "Fixed cameras, limited ammo, real dread. The original survival horror template still works.",
  "Golden Sun": "GBA JRPG with puzzle dungeons and djinn. Comfort-tier handheld RPG.",

  // Batch 4
  "Tony Hawk's Pro Skater 4": "Arcade skating at its loosest. Open levels, no timer pressure, just flow.",
  "Twisted Metal: Black": "Car combat soaked in grim PS2 atmosphere. Short, violent, singular.",
  "Legacy of Kain: Soul Reaver": "Shift between life and death to solve puzzles. The writing carries it hard.",
  "Dishonored": "First-person stealth where every room is a puzzle box. Replay it differently every time.",
  "Batman: Arkham Asylum": "Tight, contained, the one that proved superhero games could work.",
  "Shovel Knight: Treasure Trove": "Four campaigns of retro platforming that earns the nostalgia. Tight and generous.",
  "Halo: Reach": "Bungie's farewell. You know how it ends. Play it anyway.",
  "N++ (NPLUSPLUS)": "Minimalist platforming, thousands of levels. Zen or rage, your call.",
  "Metroid Prime 3: Corruption": "Wii controls finally clicked for a shooter. Weaker story, still great exploration.",
  "Gears of War": "Cover shooter that invented the cover shooter. Chainsaw gun. That's the pitch.",
  "Grand Theft Auto: Chinatown Wars": "Top-down GTA with actual drug trading mechanics. Handheld, but vicious.",
  "Microsoft Flight Simulator 2020": "The entire planet, rendered. Meditative if you let it be.",
  "Mario and Luigi: Bowser's Inside Story": "You play as Bowser. The bros are stuck inside him. Funnier than it should be.",
  "Tony Hawk's Underground": "Story mode in a skating game. Sounds dumb. It works.",
  "ICO": "Hold her hand, solve the castle. Quiet in a way games forgot how to be.",
  "Deus Ex": "The immersive sim. Every problem has four solutions. Janky, brilliant, unrepeated.",
  "The Legend of Zelda: The Wind Waker": "Cel-shaded Zelda that aged better than every 'realistic' game around it.",
  "Banjo-Tooie": "Bigger than Kazooie. Maybe too big. Interconnected worlds that reward the stubborn.",
  "Tom Clancy's Splinter Cell: Pandora Tomorrow": "Stealth that punishes impatience. Play it for the shadows.",
  "The World Ends with You": "Action RPG set in Shibuya with style to burn. The combat is unlike anything else.",
  "Viewtiful Joe (2003)": "Side-scrolling action with time-bending style. Hard, flashy, short.",
  "DRAGON QUEST V": "Three generations of one family. Monster recruiting came first. Comfort food JRPG.",
  "Halo: Combat Evolved": "The 30 seconds of fun that built a console. Library level and all.",
  "Sea of Stars": "Turn-based RPG with Chrono Trigger energy. Gorgeous, warm, doesn't overstay.",
  "Total War: SHOGUN 2": "The tightest Total War. Fewer factions, sharper focus. Campaign eats a week.",
  "Sekiro: Shadows Die Twice": "Parry or die. No build variety, no crutches. Pure swordplay.",
  "Odin Sphere Leifthrasir": "Five characters, one interlocking story. Vanillaware at their most lush.",
  "Ape Escape": "Catch monkeys with gadgets. PS1 charm that hasn't been matched since.",
  "Donkey Kong 64": "Collect-a-thon that maybe has too much stuff. Nostalgic, exhausting, unforgettable.",
  "Mario & Luigi: Superstar Saga": "GBA RPG with timing-based combat. Bros attacks never get old.",
  "The Room Three": "Puzzle boxes inside puzzle boxes. Tactile, creepy, perfect for a single sitting.",
  "Bayonetta": "Stylish action at maximum volume. Combos reward creativity. Witch time never gets old.",
  "FINAL FANTASY VIII": "Draw magic from enemies, junction it to stats. Weird system, underrated story.",
  "Spelunky 2": "Harder than the first. Every death teaches something. Bottomless depth in a platformer.",
  "Brothers: A Tale of Two Sons": "One controller, two brothers. Three hours. The mechanic IS the story.",
  "Mass Effect 3": "The trilogy closer. Combat's the best it's been. Bring tissues for Tuchanka.",
  "Sid Meier's Civilization V": "One more turn. You know the trap. Fall in willingly.",
  "Into the Breach": "Tiny mech tactics, perfect information. Every move matters. Short runs, huge depth.",
  "Diablo IV": "Loot, click, loot, click. The loop works. Dark fantasy comfort food.",
  "Animal Crossing: New Horizons": "Your island, your pace. 20 minutes a day adds up to something real.",
  "The Legend of Zelda: Phantom Hourglass": "DS Zelda with stylus controls. The ocean exploration works.",
  "Forza Horizon 4": "Open-world driving through Britain's seasons. Not a sim. A road trip with 500 cars.",
  "Jak and Daxter: The Precursor Legacy": "PS2 platformer with no loading screens. Bright, breezy, a weekend clear.",
  "Black & White": "Play god. Literally. Train a giant creature, answer prayers, smite villages.",
};

// ── Supplemental games (not in RAWG results but should be in pool) ──

const SUPPLEMENTAL: PoolEntry[] = [
  { title: "The Witness", lengthHours: 25, moods: ["strategic", "atmospheric", "chill"], blurb: "An island of line puzzles. Sounds boring. Isn't. Teaches without a single word." },
  { title: "Inside", lengthHours: 3, moods: ["atmospheric", "spooky", "emotional"], blurb: "Three hours of pure dread. No dialogue. The ending won't leave you alone." },
  { title: "Limbo", lengthHours: 3, moods: ["atmospheric", "spooky"], blurb: "Black and white puzzle platformer. A dead boy. A spider. You'll remember it." },
  { title: "What Remains of Edith Finch", lengthHours: 2, moods: ["story-rich", "emotional", "atmospheric"], blurb: "Walk through a family house. Each room is a different kind of gutpunch." },
  { title: "Firewatch", lengthHours: 4, moods: ["story-rich", "atmospheric", "emotional"], blurb: "Summer job as a fire lookout. Talk to your boss on a walkie-talkie. Feel things." },
  { title: "Gone Home", lengthHours: 2, moods: ["story-rich", "emotional", "atmospheric"], blurb: "Walk through your family's empty house. Read everything. Trust the payoff." },
  { title: "Control", lengthHours: 12, moods: ["atmospheric", "intense", "story-rich"], blurb: "Federal building full of things that don't obey physics. The Ashtray Maze alone." },
  { title: "Psychonauts 2", lengthHours: 15, moods: ["creative", "story-rich", "atmospheric"], blurb: "Platforming through people's brains. Funnier and more thoughtful than it has any right to be." },
  { title: "Titanfall 2", lengthHours: 6, moods: ["intense", "story-rich"], blurb: "Wall-running mech shooter with a 6-hour campaign that punches above everything. Effect and Cause." },
  { title: "Doom (2016)", lengthHours: 12, moods: ["intense", "brain-off"], blurb: "Rip and tear. The reboot that remembered shooters should feel good." },
  { title: "Doom Eternal", lengthHours: 18, moods: ["intense"], blurb: "Doom 2016 cranked to eleven. Resource management disguised as ultraviolence." },
  { title: "Death Stranding", lengthHours: 40, moods: ["atmospheric", "story-rich", "chill"], blurb: "Walking simulator where 'walking simulator' is the whole point. Strangely meditative." },
  { title: "It Takes Two", lengthHours: 12, moods: ["creative", "chill", "emotional"], blurb: "Co-op mandatory. Every level reinvents the rules. Best couples therapy in gaming." },
  { title: "Cyberpunk 2077", lengthHours: 25, moods: ["story-rich", "intense", "atmospheric"], blurb: "Night City earned its reputation. The side stories are the real main quest." },
  { title: "Horizon Zero Dawn", lengthHours: 25, moods: ["story-rich", "atmospheric", "intense"], blurb: "Robot dinosaurs in a post-apocalypse. The lore reveal is worth the 25 hours alone." },
  { title: "Ghost of Tsushima", lengthHours: 25, moods: ["atmospheric", "intense", "story-rich"], blurb: "Samurai open world. Wind guides you, not waypoints. Kurosawa mode exists for a reason." },
  { title: "Spiritfarer", lengthHours: 25, moods: ["chill", "emotional", "creative"], blurb: "Ferry the dead to the afterlife. Hug them first. Will absolutely make you cry." },
  { title: "Cocoon", lengthHours: 5, moods: ["strategic", "atmospheric"], blurb: "Worlds inside worlds inside worlds. Puzzle design that makes you feel like a genius." },
  { title: "The Talos Principle", lengthHours: 15, moods: ["strategic", "atmospheric", "story-rich"], blurb: "First-person puzzles with philosophical arguments. Patient, smart, surprisingly moving." },
  { title: "Prey (2017)", lengthHours: 16, moods: ["atmospheric", "spooky", "strategic"], blurb: "Anything in the room could be a mimic. Immersive sim in a space station. Criminally overlooked." },
  { title: "Dead Cells", lengthHours: 20, moods: ["intense", "strategic"], blurb: "Metroidvania roguelite. Every run feels tighter. The combat clicks and never lets go." },
  { title: "Dark Souls", lengthHours: 45, moods: ["intense", "atmospheric"], blurb: "The one that started it. Lordran rewards curiosity and punishes greed." },
  { title: "Dark Souls III", lengthHours: 30, moods: ["intense", "atmospheric"], blurb: "Fastest Souls game. The boss fights are the high point. Finale the series earned." },
  { title: "Returnal", lengthHours: 20, moods: ["intense", "atmospheric", "spooky"], blurb: "Die, loop, improve. Roguelite bullet hell with a story that earns the confusion." },
  { title: "Alan Wake 2", lengthHours: 18, moods: ["spooky", "story-rich", "atmospheric"], blurb: "Survival horror where the writer is the weapon. The musical number is real." },
  { title: "Resident Evil Village", lengthHours: 10, moods: ["spooky", "intense"], blurb: "Tall vampire lady. Also: tight horror with wild pacing. Each section a different flavor." },
  { title: "Resident Evil 4 (2023)", lengthHours: 16, moods: ["intense", "spooky"], blurb: "The remake that nailed it. Tense, replayable, the attache case still satisfies." },
  { title: "Hi-Fi Rush", lengthHours: 10, moods: ["intense", "brain-off", "creative"], blurb: "Rhythm action brawler. Everything moves to the beat. Pure joy, criminally undersold." },
  { title: "Sifu", lengthHours: 8, moods: ["intense"], blurb: "You age every time you die. Kung fu roguelite. Tight, brutal, fair." },
  { title: "Neon White", lengthHours: 8, moods: ["intense", "strategic"], blurb: "FPS speedrunning with cards. Chase the leaderboard. One more try. One more." },
  { title: "Katana ZERO", lengthHours: 5, moods: ["intense", "story-rich"], blurb: "One-hit-kill action platformer. Time slows, you plan, you execute." },
  { title: "Oxenfree", lengthHours: 4, moods: ["story-rich", "spooky", "atmospheric"], blurb: "Teens on an island with a radio. The dialogue system feels genuinely natural." },
  { title: "Night in the Woods", lengthHours: 8, moods: ["story-rich", "emotional", "atmospheric"], blurb: "College dropout returns to a dying town. Platforming and feelings in equal measure." },
  { title: "Hellblade: Senua's Sacrifice", lengthHours: 7, moods: ["atmospheric", "emotional", "intense"], blurb: "Psychosis rendered as game mechanics. Headphones mandatory. Short, searing, important." },
  { title: "Ori and the Blind Forest", lengthHours: 9, moods: ["atmospheric", "emotional", "intense"], blurb: "Gorgeous Metroidvania that will make you cry in the first ten minutes." },
  { title: "Cuphead", lengthHours: 10, moods: ["intense"], blurb: "1930s cartoon boss rush. Frame-perfect art, frame-perfect difficulty. Worth the pain." },
  { title: "Final Fantasy VII Remake", lengthHours: 33, moods: ["story-rich", "intense", "emotional"], blurb: "Midgar expanded into a full game. The combat system earned the reimagining." },
  { title: "Yakuza 0", lengthHours: 30, moods: ["story-rich", "intense", "brain-off"], blurb: "Crime drama that pivots to karaoke, real estate, and bowling. Absurd and sincere." },
  { title: "13 Sentinels: Aegis Rim", lengthHours: 30, moods: ["story-rich", "strategic", "emotional"], blurb: "13 timelines, mechs, time travel. Vanillaware made a visual novel that actually needs a flowchart." },
  { title: "Little Nightmares", lengthHours: 3, moods: ["spooky", "atmospheric"], blurb: "Tiny child, huge monsters. Three hours of perfectly paced dread." },
  { title: "A Plague Tale: Innocence", lengthHours: 10, moods: ["story-rich", "atmospheric", "emotional"], blurb: "Siblings surviving the Black Death. The rat swarms are unforgettable." },
  { title: "Transistor", lengthHours: 6, moods: ["atmospheric", "strategic", "story-rich"], blurb: "Cyberpunk action RPG with a talking sword. The combat pauses for strategy. Gorgeous." },
  { title: "Bastion", lengthHours: 6, moods: ["atmospheric", "intense", "story-rich"], blurb: "The narrator reacts to everything you do. That hook never gets old." },
  { title: "Pyre", lengthHours: 10, moods: ["story-rich", "atmospheric", "strategic"], blurb: "Magical basketball with exiles. Losing changes the story. Supergiant's most underrated." },
  { title: "The Forgotten City", lengthHours: 6, moods: ["story-rich", "strategic", "atmospheric"], blurb: "Roman time loop mystery. Started as a Skyrim mod. Better than it had any right to be." },
  { title: "Chicory: A Colorful Tale", lengthHours: 8, moods: ["chill", "emotional", "creative"], blurb: "You paint the world. Literally. Gentle adventure about creativity and self-doubt." },
  { title: "Stray", lengthHours: 5, moods: ["atmospheric", "chill"], blurb: "You are a cat. In a robot city. The meow button exists. Enough said." },
  { title: "Her Story", lengthHours: 3, moods: ["story-rich", "strategic"], blurb: "Search a police database. Watch interview clips. Piece it together yourself." },
  { title: "Citizen Sleeper", lengthHours: 8, moods: ["story-rich", "atmospheric", "strategic"], blurb: "Tabletop RPG on a space station. Dice determine your day. Gorgeous writing." },
  { title: "Loop Hero", lengthHours: 15, moods: ["strategic", "brain-off"], blurb: "Build the road. Watch the hero walk it. Tile placement roguelite. Deceptively deep." },
  { title: "Hyper Light Drifter", lengthHours: 8, moods: ["atmospheric", "intense"], blurb: "Pixel art action with zero dialogue. The world tells its own story through color and ruin." },
  { title: "CrossCode", lengthHours: 35, moods: ["story-rich", "strategic", "intense"], blurb: "Action RPG disguised as an MMO. The puzzle dungeons rival Zelda. Criminally long and worth it." },
  { title: "Astro Bot", lengthHours: 10, moods: ["chill", "creative"], blurb: "Pure 3D platforming joy. Every level a toy box. PlayStation's answer to Mario." },
  { title: "Animal Well", lengthHours: 8, moods: ["atmospheric", "strategic", "spooky"], blurb: "Looks simple. Has layers. Puzzle Metroidvania that keeps revealing secrets weeks later." },
  { title: "Outer Worlds", lengthHours: 20, moods: ["story-rich", "strategic"], blurb: "Fallout in space, smaller scope, sharper writing. Doesn't overstay its welcome." },
  { title: "Monster Hunter: World", lengthHours: 50, moods: ["intense", "strategic", "chill"], blurb: "Hunt monsters, wear them, hunt bigger monsters. The loop is perfect. Bring friends or don't." },
  { title: "Celeste 2: Lani's Trek", lengthHours: 1, moods: ["intense", "emotional"], blurb: "Tiny follow-up to Celeste. Free, short, still surprisingly hard." },
  { title: "The Pathless", lengthHours: 5, moods: ["atmospheric", "chill"], blurb: "Run, glide, hunt. Open world with no map. The movement is the reward." },
  { title: "Unpacking", lengthHours: 3, moods: ["chill", "emotional"], blurb: "Unpack boxes into apartments. A life told through stuff. Quiet and devastating." },
  { title: "Hades II", lengthHours: 30, moods: ["intense", "story-rich", "atmospheric"], blurb: "Supergiant did it again. Melinoe fights differently, the story cuts just as deep." },
  { title: "Clair Obscur: Expedition 33", lengthHours: 35, moods: ["story-rich", "intense", "atmospheric"], blurb: "French RPG with real consequences. The art direction alone justifies the hours." },

  // ── Game Awards 2023–2024 nominees (filling gaps) ──
  { title: "Final Fantasy XVI", lengthHours: 35, moods: ["intense", "story-rich", "atmospheric"], blurb: "Eikon fights shake the screen. More action than RPG. Clive's story earns every hour." },
  { title: "Marvel's Spider-Man 2", lengthHours: 17, moods: ["intense", "story-rich"], blurb: "Two Spider-Men, one New York. Symbiote arc hits. The swinging still feels perfect." },
  { title: "Dave the Diver", lengthHours: 20, moods: ["chill", "creative", "brain-off"], blurb: "Dive by day, run a sushi restaurant by night. Shouldn't work. Absolutely works." },
  { title: "Dredge", lengthHours: 12, moods: ["atmospheric", "spooky", "chill"], blurb: "Fishing game with Lovecraftian dread. The catch of the day might have too many eyes." },
  { title: "Lies of P", lengthHours: 30, moods: ["intense", "atmospheric"], blurb: "Pinocchio souls-like. Sounds absurd. Plays beautifully. The weapon system is genuinely clever." },
  { title: "Super Mario Bros. Wonder", lengthHours: 8, moods: ["chill", "creative", "brain-off"], blurb: "Mario got weird again. Talking flowers, elephant Mario, every level a surprise." },
  { title: "Pikmin 4", lengthHours: 15, moods: ["strategic", "chill", "creative"], blurb: "Grow tiny plant soldiers, solve puzzles, fight bugs. Charming, strategic, weirdly relaxing." },
  { title: "Armored Core VI: Fires of Rubicon", lengthHours: 15, moods: ["intense", "strategic"], blurb: "FromSoft made a mech game and it plays like a boss rush. Build, fight, rebuild." },
  { title: "Black Myth: Wukong", lengthHours: 20, moods: ["intense", "atmospheric", "story-rich"], blurb: "Monkey King action RPG. Visually staggering, mechanically tight. Boss fights demand respect." },
  { title: "Metaphor: ReFantazio", lengthHours: 80, moods: ["story-rich", "strategic", "atmospheric"], blurb: "Atlus made a fantasy Persona. 80 hours of systems, story, and style. Worth every minute." },
  { title: "Final Fantasy VII Rebirth", lengthHours: 60, moods: ["story-rich", "emotional", "intense"], blurb: "Midgar to the Forgotten Capital. Open world that earns the detours. The Gold Saucer alone." },
  { title: "Silent Hill 2 (2024)", lengthHours: 12, moods: ["spooky", "atmospheric", "emotional"], blurb: "The remake that understood the assignment. Fog, guilt, and creature design that disturbs." },
  { title: "Like a Dragon: Infinite Wealth", lengthHours: 55, moods: ["story-rich", "brain-off", "emotional"], blurb: "Ichiban goes to Hawaii. Turn-based RPG with minigame madness. Heart on its sleeve." },
  { title: "UFO 50", lengthHours: 30, moods: ["creative", "strategic", "intense"], blurb: "Fifty fake retro games. Most of them are genuinely great. The meta-game ties them together." },
  { title: "Lorelei and the Laser Eyes", lengthHours: 8, moods: ["strategic", "atmospheric", "spooky"], blurb: "Black and white puzzle game. Every room a riddle. Aesthetic commitment that rewards patience." },
  { title: "Neva", lengthHours: 4, moods: ["atmospheric", "emotional"], blurb: "Wordless companion adventure. Short, gorgeous, emotionally devastating." },
  { title: "Senua's Saga: Hellblade II", lengthHours: 7, moods: ["atmospheric", "emotional", "intense"], blurb: "Iceland as a nightmare. Seven hours of sensory overload. Headphones still mandatory." },
  { title: "Indiana Jones and the Great Circle", lengthHours: 13, moods: ["story-rich", "intense", "atmospheric"], blurb: "MachineGames made an Indy game and it works. Vatican, pyramids, punching Nazis." },
  { title: "Thank Goodness You're Here!", lengthHours: 2, moods: ["brain-off", "chill"], blurb: "Slapstick adventure in a Yorkshire town. Two hours of genuine belly laughs." },
  { title: "Marvel's Spider-Man: Miles Morales", lengthHours: 7, moods: ["intense", "story-rich"], blurb: "Shorter, tighter, Miles's own story. The venom powers feel electric." },
  { title: "Marvel's Spider-Man Remastered", lengthHours: 17, moods: ["intense", "story-rich", "brain-off"], blurb: "Web-slinging through Manhattan never stopped feeling good. The benchmark superhero game." },
  { title: "Remnant II", lengthHours: 18, moods: ["intense", "strategic"], blurb: "Souls-like shooter with procedural worlds. Co-op shines. Solo works. Every run different." },
  { title: "Warhammer 40,000: Space Marine 2", lengthHours: 8, moods: ["intense", "brain-off"], blurb: "Chainsword through a Tyranid horde. Eight hours of spectacle, zero pretense." },

  // ── Mood-gap fills (chill/brain-off/creative/emotional/spooky coverage) ──
  { title: "Townscaper", lengthHours: 2, moods: ["chill", "creative"], blurb: "Click to build a town. No goals, no failure. Just colors and rooftops." },
  { title: "PowerWash Simulator", lengthHours: 15, moods: ["chill", "brain-off"], blurb: "Pressure-wash dirt off things. Aggressively satisfying. The podcast game." },
  { title: "Katamari Damacy REROLL", lengthHours: 4, moods: ["brain-off", "chill", "creative"], blurb: "Roll things into a ball. Bigger and bigger. The soundtrack is permanent." },
  { title: "Untitled Goose Game", lengthHours: 3, moods: ["brain-off", "chill", "creative"], blurb: "Be a horrible goose. Ruin a village. Honk button. That's the whole game." },
  { title: "Dorfromantik", lengthHours: 10, moods: ["chill", "creative", "brain-off"], blurb: "Tile-placement puzzle. Build countryside landscapes. Meditative and endlessly replayable." },
  { title: "Abzu", lengthHours: 2, moods: ["chill", "atmospheric", "emotional"], blurb: "Swim with whales. No combat, no death. Journey, but underwater." },
  { title: "Gris", lengthHours: 3, moods: ["atmospheric", "emotional", "chill"], blurb: "Watercolor platformer about grief. No words needed. Every frame a painting." },
  { title: "Kind Words", lengthHours: 3, moods: ["chill", "emotional"], blurb: "Write letters to strangers. Get letters back. Radical sincerity in lo-fi form." },
  { title: "Eastshade", lengthHours: 6, moods: ["chill", "creative", "atmospheric"], blurb: "Open-world game where you paint landscapes. No combat. Pure exploration and vibes." },
  { title: "Wylde Flowers", lengthHours: 20, moods: ["chill", "story-rich", "creative"], blurb: "Farm sim with actual witchcraft. Cozy surface, surprisingly good story underneath." },
  { title: "The Gardens Between", lengthHours: 3, moods: ["chill", "emotional", "atmospheric"], blurb: "Manipulate time on tiny islands. Friendship told through objects. Short and warm." },
  { title: "Soma", lengthHours: 9, moods: ["spooky", "story-rich", "atmospheric"], blurb: "Underwater horror that asks what makes you you. The safe mode is legit." },
  { title: "Amnesia: The Dark Descent", lengthHours: 8, moods: ["spooky", "atmospheric"], blurb: "Can't fight back. Can only hide. The game that launched a thousand streamers." },
  { title: "Phasmophobia", lengthHours: 15, moods: ["spooky", "brain-off"], blurb: "Ghost hunting with friends and a spirit box. Terrifying until someone screams, then hilarious." },
  { title: "Peglin", lengthHours: 12, moods: ["brain-off", "strategic"], blurb: "Peggle meets roguelite. Bounce orbs, deal damage, zone out completely." },
  { title: "Webbed", lengthHours: 3, moods: ["chill", "creative"], blurb: "You're a tiny spider building webs. Swinging physics, no stakes, pure charm." },
  { title: "Wandersong", lengthHours: 8, moods: ["chill", "emotional", "story-rich"], blurb: "Sing your way through problems. Relentlessly positive. Will sneak up and move you." },
  { title: "Teardown", lengthHours: 10, moods: ["creative", "brain-off"], blurb: "Voxel destruction sandbox. Plan a heist, then smash walls to execute it. Endlessly satisfying." },
  { title: "Overcooked 2", lengthHours: 8, moods: ["brain-off", "intense", "chill"], blurb: "Co-op cooking chaos. Friendships tested. Kitchens on fire. Someone chop the onions." },
  { title: "Trombone Champ", lengthHours: 3, moods: ["brain-off", "chill"], blurb: "Rhythm game where you're bad at trombone on purpose. Genuine art form." },
  { title: "Celeste 64: Fragments of the Mountain", lengthHours: 1, moods: ["intense", "chill"], blurb: "Fifteen minutes of 3D Celeste. Free. The dash still feels perfect." },
  { title: "Before Your Eyes", lengthHours: 2, moods: ["emotional", "story-rich"], blurb: "Blink to advance time. Your webcam controls the game. Two hours, permanent damage." },
  { title: "To the Moon", lengthHours: 4, moods: ["emotional", "story-rich"], blurb: "Walk through someone's memories backward. RPG Maker, no combat, devastating." },
  { title: "Florence", lengthHours: 1, moods: ["emotional", "chill"], blurb: "A relationship told in vignettes. Thirty minutes. Touchscreen interactions that mean something." },
  { title: "Venba", lengthHours: 2, moods: ["emotional", "story-rich", "chill"], blurb: "Cook Tamil recipes. Raise a son. Immigration story told through food. Ninety minutes, stays." },
  { title: "Baba Is You", lengthHours: 10, moods: ["strategic", "creative"], blurb: "Push the words that make the rules. The puzzles will break your brain. Brilliantly." },
  { title: "Papers, Please", lengthHours: 5, moods: ["strategic", "emotional", "atmospheric"], blurb: "Stamp passports. Follow rules. Feel the moral weight. Glory to Arstotzka." },
  { title: "Sable", lengthHours: 8, moods: ["chill", "atmospheric", "creative"], blurb: "Hoverbike across a desert. Find your mask. Open world with nothing to kill." },
  { title: "Viewfinder", lengthHours: 4, moods: ["creative", "atmospheric", "chill"], blurb: "Take a photo, place it in the world, walk into it. Perspective puzzles done fresh." },

  // ── Spooky large-session gap fills ──
  { title: "Resident Evil 2 (2019)", lengthHours: 8, moods: ["spooky", "intense"], blurb: "The remake that set the standard. Mr. X is always coming. Two campaigns, both essential." },
  { title: "Pathologic 2", lengthHours: 35, moods: ["spooky", "atmospheric", "story-rich"], blurb: "Plague town survival. Deliberately hostile. The greatest game you might not enjoy playing." },
  { title: "Darkest Dungeon", lengthHours: 55, moods: ["spooky", "strategic"], blurb: "Your heroes will go mad. Manage their sanity and yours. Narrator alone is worth it." },
  { title: "Elden Ring: Shadow of the Erdtree", lengthHours: 40, moods: ["intense", "atmospheric", "spooky"], blurb: "DLC-sized like a full game. The Lands of Shadow out-creep the base game." },

  // ── Gap fills: creative+large, brain-off+large, emotional+medium, spooky+large ──
  { title: "Factorio", lengthHours: 80, moods: ["creative", "strategic"], blurb: "Automate everything. Conveyor belts stretch to the horizon. You will dream about production ratios." },
  { title: "Satisfactory", lengthHours: 60, moods: ["creative", "chill"], blurb: "3D factory building in a gorgeous world. Optimize, rebuild, optimize again. The factory must grow." },
  { title: "Minecraft", lengthHours: 50, moods: ["creative", "chill", "brain-off"], blurb: "Build anything. Mine everything. You already know. You just haven't gone back lately." },
  { title: "Terraria", lengthHours: 50, moods: ["creative", "intense"], blurb: "2D Minecraft with actual bosses. Dig down, gear up, fight gods. Endlessly generous." },
  { title: "No Man's Sky", lengthHours: 50, moods: ["creative", "atmospheric", "chill"], blurb: "Explore a universe. Or just build a base. Redemption arc of the decade." },
  { title: "Rimworld", lengthHours: 60, moods: ["creative", "strategic"], blurb: "Colony sim that generates stories. Your pawns will do terrible things. You'll let them." },
  { title: "Cities: Skylines", lengthHours: 50, moods: ["creative", "strategic", "chill"], blurb: "Build a city. Watch traffic break it. Fix the traffic. That is the game." },
  { title: "Anno 1800", lengthHours: 50, moods: ["creative", "strategic", "chill"], blurb: "Industrial revolution city builder. Supply chains, trade routes, islands. Time vanishes." },
  { title: "Planet Zoo", lengthHours: 40, moods: ["creative", "chill"], blurb: "Design a zoo. Obsess over enclosures. The animals judge your paths. You fix the paths." },
  { title: "Astroneer", lengthHours: 25, moods: ["creative", "chill"], blurb: "Terraforming sandbox on alien planets. Chill, colorful, surprisingly deep." },
  { title: "Borderlands 3", lengthHours: 30, moods: ["brain-off", "intense"], blurb: "A billion procedural guns. Shoot the thing, pick up the loot. Pure dopamine loop." },
  { title: "Just Cause 3", lengthHours: 30, moods: ["brain-off", "intense"], blurb: "Grapple hook, wingsuit, explosions. The open world is your demolition playground." },
  { title: "The Binding of Isaac: Rebirth", lengthHours: 50, moods: ["brain-off", "intense"], blurb: "Crying baby fights nightmares. Thousands of item combos. Every run different. Bottomless." },
  { title: "LEGO Star Wars: The Skywalker Saga", lengthHours: 30, moods: ["brain-off", "chill"], blurb: "Nine movies, one game. Brick everything. Great with a kid or without one." },
  { title: "Risk of Rain 2", lengthHours: 35, moods: ["brain-off", "intense"], blurb: "Third-person roguelite that scales until the screen melts. Loop until you can't." },
  { title: "Far Cry 6", lengthHours: 30, moods: ["brain-off", "intense"], blurb: "Tropical dictatorship sandbox. The formula works when you stop thinking about it." },
  { title: "Grim Dawn", lengthHours: 35, moods: ["brain-off", "intense", "atmospheric"], blurb: "Diablo-style ARPG with build depth. Dark, crunchy, doesn't demand your full attention." },
  { title: "Monster Train", lengthHours: 15, moods: ["brain-off", "strategic"], blurb: "Slay the Spire on a train going to hell. Faster, wilder, equally addictive." },
  { title: "Brotato", lengthHours: 15, moods: ["brain-off", "intense"], blurb: "Arena survivor with a potato. Fast runs, absurd builds. Pure one-more-run energy." },
  { title: "Assassin's Creed Odyssey", lengthHours: 45, moods: ["brain-off", "atmospheric"], blurb: "Ancient Greece is gorgeous. Climb, fight, sail. Turn your brain off for 40 hours." },
  { title: "Life is Strange", lengthHours: 14, moods: ["emotional", "story-rich"], blurb: "Time-rewind teen drama. Choices haunt. The soundtrack will follow you home." },
  { title: "The Last Guardian", lengthHours: 12, moods: ["emotional", "atmospheric"], blurb: "A boy and his giant bird-dog. Frustrating, beautiful, unforgettable." },
  { title: "Omori", lengthHours: 20, moods: ["emotional", "story-rich", "spooky"], blurb: "RPG that hides something dark. Cute surface, devastating underneath. Don't spoil it." },
  { title: "STALKER 2: Heart of Chornobyl", lengthHours: 40, moods: ["spooky", "atmospheric", "intense"], blurb: "The Zone doesn't care about you. Ukrainian post-apocalypse with atmosphere for days." },
  { title: "The Forest", lengthHours: 30, moods: ["spooky", "creative"], blurb: "Crash-land. Build shelter. Discover what's in the caves. Survival horror that earns both words." },
  { title: "Alien: Isolation", lengthHours: 18, moods: ["spooky", "atmospheric", "intense"], blurb: "One xenomorph. No weapons that matter. Fifteen hours of hiding under desks." },
  { title: "Project Zomboid", lengthHours: 50, moods: ["spooky", "strategic"], blurb: "Zombie survival sim. You will die. The question is how long you can delay it." },
  { title: "Dead Space (2023)", lengthHours: 12, moods: ["spooky", "intense", "atmospheric"], blurb: "The remake that made the Ishimura gorgeous and terrible. Plasma cutter still king." },
  { title: "Metro Exodus", lengthHours: 15, moods: ["spooky", "atmospheric", "story-rich"], blurb: "Post-apocalyptic train journey through Russia. Linear shooter that opens up. Gorgeous bleakness." },
];

// ── Known play times (HLTB is down, using known values) ──

const PLAY_TIMES: Record<string, number> = {
  "The Legend of Zelda: Ocarina of Time": 26,
  "Soulcalibur": 8,
  "Super Mario Galaxy": 15,
  "Metroid Prime": 14,
  "Super Mario Galaxy 2": 13,
  "Perfect Dark": 8,
  "Super Mario Odyssey": 12,
  "The Legend of Zelda: Breath of the Wild": 50,
  "Baldur's Gate III": 100,
  "The Legend of Zelda: Tears of the Kingdom": 55,
  "Half-Life": 12,
  "Uncharted 2: Among Thieves": 10,
  "Red Dead Redemption 2": 50,
  "BioShock": 12,
  "Half-Life 2": 13,
  "Tekken 3": 5,
  "Metal Gear Solid 2: Sons of Liberty": 12,
  "The Legend of Zelda: Majora's Mask": 20,
  "Baldur's Gate II: Shadows of Amn": 60,
  "Portal 2": 8,
  "LittleBigPlanet": 8,
  "The Legend of Zelda: A Link to the Past": 16,
  "Grand Theft Auto IV": 28,
  "The Last Of Us": 15,
  "Red Dead Redemption": 18,
  "XCOM 2: War of the Chosen": 35,
  "Elden Ring": 55,
  "The Orange Box": 15,
  "Burnout 3: Takedown": 10,
  "Chrono Cross": 35,
  "Resident Evil Code: Veronica": 12,
  "The Elder Scrolls IV: Oblivion": 30,
  "Grand Theft Auto: Vice City": 18,
  "God of War I": 9,
  "Diablo": 15,
  "The Elder Scrolls V: Skyrim": 35,
  "Batman: Arkham City": 12,
  "BioShock Infinite": 11,
  "Divinity: Original Sin 2 - Definitive Edition": 60,
  "Metal Gear Solid 3: Subsistence": 16,
  "Divinity: Original Sin - Enhanced Edition": 45,
  "Metal Gear Solid": 11,
  "Grim Fandango": 9,
  "Command & Conquer": 12,
  "Super Mario 64": 12,
  "Metal Gear Solid 4: Guns of the Patriots": 16,
  "Mass Effect 2": 25,
  "Persona 5 Royal": 100,
  "Sid Meier's Civilization IV": 40,
  "Jet Set Radio": 6,
  "God of War (2018)": 20,
  "StarCraft II: Wings of Liberty": 16,
  "Company of Heroes": 15,
  "Gears of War 2": 9,
  "Dwarf Fortress": 80,
  "Okami": 35,
  "Grand Theft Auto III": 15,
  "The Last of Us Part II": 24,
  "Maniac Mansion: Day of the Tentacle": 6,
  "Castlevania: Symphony of the Night": 8,
  "Uncharted 4: A Thief's End": 15,
  "SSX 3": 8,
  "Paper Mario (2000)": 20,
  "Skies of Arcadia": 40,
  "Grand Theft Auto: San Andreas": 30,
  "Super Mario 3D World": 9,
  "The Legend of Zelda: Skyward Sword": 35,
  "Homeworld": 12,
  "Super Smash Bros. Ultimate": 25,
  "God of War II": 10,
  "Demon's Souls (2020)": 22,
  "Sid Meier's Alpha Centauri": 30,
  "Soul Calibur II": 8,
  "FINAL FANTASY VI": 35,
  "The Walking Dead: Season 1": 10,
  "God of War III": 8,
  "Uncharted 3: Drake's Deception": 9,
  "Eternal Darkness: Sanity's Requiem": 11,
  "Vagrant Story (2000)": 25,
  "Mario Kart 8 Deluxe": 10,
  "Call of Duty 4: Modern Warfare": 6,
  "Super Mario World": 5,
  "Metroid Fusion": 5,
  "Fire Emblem Awakening": 30,
  "Super Mario Sunshine": 16,
  "Bloodborne": 30,
  "Undertale": 6,
  "Final Fantasy X": 40,
  "Tom Clancy's Splinter Cell Chaos Theory": 10,
  "Final Fantasy XII": 60,
  "A Monster's Expedition": 10,
  "Thief: The Dark Project": 15,
  "Warcraft 3: Reign of Chaos": 18,
  "Braid": 5,
  "Bayonetta 2": 8,
  "Metroid Prime 2: Echoes": 15,
  "Age of Empires II: Age of Kings": 20,
  "Grand Theft Auto V": 30,
  "Conker's Bad Fur Day": 8,
  "Banjo-Kazooie": 10,
  "Journey": 2,
  "System Shock 2": 12,
  "The Witcher 3: Wild Hunt": 50,
  "Crash Bandicoot 3: Warped": 6,
  "Gears of War 3": 9,
  "Tom Clancy's Splinter Cell": 10,
  "Crysis": 10,
  "The Legend of Zelda: A Link Between Worlds": 15,
  "Klonoa 2: Lunatea's Veil": 6,
  "Ninja Gaiden (2004)": 10,
  "Super Mario World 2: Yoshi's Island": 8,
  "Mark of the Ninja": 7,
  "NieR:Automata": 20,
  "Death Road to Canada": 8,
  "FEZ": 5,
  "Spyro: Year of the Dragon": 8,
  "Call of Duty": 7,
  "Resident Evil 2": 8,
  "God of War: Chains of Olympus": 5,
  "Ratchet & Clank: Up Your Arsenal": 10,
  "Tony Hawk's Pro Skater 2": 5,
  "Deus Ex: Human Revolution - Director's Cut": 20,
  "Castlevania: Aria of Sorrow": 7,
  "Dark Souls II": 35,
  "Baldur's Gate": 40,
  "Shadow of the Colossus": 8,
  "Halo 3": 8,
  "DRAGON QUEST XI S: Echoes of an Elusive Age - Definitive Edition": 80,
  "The Longest Journey": 18,
  "Rez Infinite": 2,
  "Metal Gear Solid V: The Phantom Pain": 46,
  "Fallout 3": 25,
  "Planescape: Torment": 30,
  "Dragon Age: Origins": 40,
  "Ori and the Will of the Wisps": 8,
  "Resident Evil": 7,
  "Golden Sun": 20,
  "Tony Hawk's Pro Skater 4": 8,
  "Twisted Metal: Black": 5,
  "Legacy of Kain: Soul Reaver": 12,
  "Dishonored": 12,
  "Batman: Arkham Asylum": 10,
  "Shovel Knight: Treasure Trove": 15,
  "Halo: Reach": 8,
  "N++ (NPLUSPLUS)": 15,
  "Metroid Prime 3: Corruption": 12,
  "Gears of War": 8,
  "Grand Theft Auto: Chinatown Wars": 8,
  "Microsoft Flight Simulator 2020": 30,
  "Mario and Luigi: Bowser's Inside Story": 22,
  "Tony Hawk's Underground": 8,
  "ICO": 6,
  "Deus Ex": 20,
  "The Legend of Zelda: The Wind Waker": 25,
  "Banjo-Tooie": 14,
  "Tom Clancy's Splinter Cell: Pandora Tomorrow": 8,
  "The World Ends with You": 20,
  "Viewtiful Joe (2003)": 6,
  "DRAGON QUEST V": 25,
  "Halo: Combat Evolved": 10,
  "Sea of Stars": 25,
  "Total War: SHOGUN 2": 25,
  "Sekiro: Shadows Die Twice": 25,
  "Odin Sphere Leifthrasir": 20,
  "Ape Escape": 6,
  "Donkey Kong 64": 20,
  "Mario & Luigi: Superstar Saga": 18,
  "The Room Three": 3,
  "Bayonetta": 8,
  "FINAL FANTASY VIII": 40,
  "Spelunky 2": 15,
  "Brothers: A Tale of Two Sons": 3,
  "Mass Effect 3": 24,
  "Sid Meier's Civilization V": 40,
  "Into the Breach": 10,
  "Diablo IV": 25,
  "Animal Crossing: New Horizons": 50,
  "The Legend of Zelda: Phantom Hourglass": 15,
  "Forza Horizon 4": 15,
  "Jak and Daxter: The Precursor Legacy": 9,
  "Black & White": 15,
};

// ── Mood overrides (fix auto-mapping errors) ──

const MOOD_OVERRIDES: Record<string, string[]> = {
  "Portal 2": ["strategic", "story-rich", "brain-off"],
  "Braid": ["strategic", "atmospheric"],
  "Batman: Arkham Asylum": ["intense", "atmospheric", "story-rich"],
  "N++ (NPLUSPLUS)": ["intense", "brain-off"],
  "Overcooked 2": ["brain-off", "intense"],
  "Celeste 64: Fragments of the Mountain": ["intense"],
  "Bloodborne": ["intense", "atmospheric", "spooky"],
  "Diablo IV": ["brain-off", "intense"],
  "Diablo": ["brain-off", "intense"],
  "Animal Crossing: New Horizons": ["chill", "brain-off", "creative"],
  "Doom Eternal": ["intense", "brain-off"],
  "Slime Rancher 2": ["chill", "brain-off", "creative"],
};

// ── Assembly ──

function main() {
  const draft: PoolEntry[] = JSON.parse(readFileSync(DRAFT_PATH, 'utf-8'));
  const existing = draft.filter((e) => e.blurb !== '');
  console.log(`Existing entries with blurbs: ${existing.length}`);

  // Apply blurbs to draft entries
  const kept: PoolEntry[] = [...existing];
  const skippedTitles = new Set<string>();

  for (const entry of draft) {
    if (entry.blurb) continue; // already in existing
    const blurb = BLURBS[entry.title];
    if (blurb) {
      const hours = PLAY_TIMES[entry.title] || entry.lengthHours || 15;
      kept.push({ ...entry, blurb, lengthHours: hours });
    } else {
      skippedTitles.add(entry.title);
    }
  }

  console.log(`Entries with blurbs from subagents: ${kept.length - existing.length}`);
  console.log(`Skipped (no blurb / flagged): ${skippedTitles.size}`);

  // Add supplemental games (skip if already in pool)
  const poolTitles = new Set(kept.map((e) => e.title.toLowerCase()));
  let added = 0;
  for (const s of SUPPLEMENTAL) {
    if (!poolTitles.has(s.title.toLowerCase())) {
      kept.push(s);
      poolTitles.add(s.title.toLowerCase());
      added++;
    }
  }
  console.log(`Supplemental games added: ${added}`);

  // Fix Wind Waker (subagent skipped HD but original isn't in pool)
  if (!poolTitles.has("the legend of zelda: the wind waker")) {
    kept.push({
      title: "The Legend of Zelda: The Wind Waker",
      lengthHours: 25,
      moods: ["atmospheric", "story-rich", "chill"],
      blurb: "Cel-shaded Zelda that aged better than every 'realistic' game around it.",
    });
  }

  // Apply mood overrides
  for (const entry of kept) {
    if (MOOD_OVERRIDES[entry.title]) {
      entry.moods = MOOD_OVERRIDES[entry.title];
    }
  }

  console.log(`\nFinal pool: ${kept.length} entries`);

  // Verify all entries have blurbs
  const missing = kept.filter((e) => !e.blurb);
  if (missing.length > 0) {
    console.warn(`WARNING: ${missing.length} entries still missing blurbs:`);
    missing.forEach((e) => console.warn(`  - ${e.title}`));
  }

  // Mood distribution check
  const moodCounts: Record<string, number> = {};
  for (const e of kept) {
    for (const m of e.moods) {
      moodCounts[m] = (moodCounts[m] || 0) + 1;
    }
  }
  console.log('\nMood distribution:');
  for (const [mood, count] of Object.entries(moodCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${mood}: ${count}`);
  }

  // Length distribution
  const small = kept.filter((e) => e.lengthHours <= 10).length;
  const medium = kept.filter((e) => e.lengthHours > 10 && e.lengthHours <= 30).length;
  const large = kept.filter((e) => e.lengthHours > 30).length;
  console.log(`\nLength tiers: small(≤10h)=${small} medium(11-30h)=${medium} large(>30h)=${large}`);

  writeFileSync(OUTPUT_PATH, JSON.stringify(kept, null, 2));
  console.log(`\nWritten to ${OUTPUT_PATH}`);
}

main();
