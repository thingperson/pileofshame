# Inventory Full — Blue Sky & Philosophy

Underlying philosophy, psychological foundations, speculative feature ideas, brand/naming history, and design tokens. Reference when thinking about new features, positioning, or the bigger picture.

---

## Philosophy & Psychology

### Why We Exist
Pile of Shame solves analysis paralysis. Our users aren't lazy. They're overwhelmed. They have executive function disruption around entertainment choices. Too many options leads to choosing nothing. We break that cycle.

### Our Approach to Shame
Shame is in our name. We get the emotional state. We don't attack it. We heal it. We solve it. We steer when users can't, in ways that aren't aggressive, hostile, or unwelcome.

Real psychology informs how we treat our users:
- Analysis paralysis (Schwartz, "The Paradox of Choice")
- Decision fatigue and executive function
- Commitment avoidance and fear of missing out (FOMO)
- The psychology of collecting vs. experiencing
- Gamification: variable reward schedules, loss aversion, progress tracking

We can really check psychology research around these topics and have real science inform how we treat our users, so we can treat them better than any other tool would dream of doing. This isn't ambitious. It's practical. It's logical. Follow what psychology tells us about how our users operate and leverage that TO HELP THEM.

### Onboarding Psychology
The user's first 5 minutes determine everything. They need to:
1. Feel understood ("you've got a pile, we get it")
2. See their games enriched without effort ("zero work, all the info")
3. Make one decision easily ("how about this one? 10k positive reviews")
4. Feel rewarded for that decision ("you did the hard part: deciding")

We make committing frictionless. We convince the user they've committed before they even realized it, or had time to question it. The deciding has happened before they had time to second-guess. Mini celebrations reward and gamify taking action.

### Ethical Boundaries
- We collect only data users consent to share
- Psychological insights serve the user, never exploit them
- Personalization improves their experience, not our metrics
- We're transparent about affiliate links and data usage
- Light touch first on behavioral analysis. Test the waters. Only go deeper if it clearly benefits users.

### Reference Documents
- `.claude/rules/voice-and-tone.md` — copy/tone guidelines, banned patterns, terminology
- `.claude/rules/user-persona.md` — detailed personas, sub-personas, psychology, design principles

---

## Blue Sky Wishlist (Ripe for Exploration)

Ideas we haven't figured out how to build yet, but are worth exploring when we can:

### Gaming Features
- **"You're objectively wrong not to have played this" shelf** — auto-generated from metacritic 90+, overwhelmingly positive Steam reviews, and cultural significance. "Hades is sitting in your pile. That's a crime."
- **Archetype visuals** — tarot-style cards or illustrated portraits for each archetype. Jungian/esoteric flavor. Shareable images.
- **Comfort game detection** — flag games with 500+ hours that users keep returning to. Celebrate the comfort game while gently nudging toward something new.
- **"Speed run your pile" mode** — aggressive session: give each game 30 minutes. Keep or bail. Clear 10 decisions in an evening.
- **Community challenges** — "Clear 5 games this month" with leaderboards. Cross-pollinate with Backlog Clearer's streak/badge model but with our personality.
- **Purchase shame timeline** — "You bought Disco Elysium on Dec 23, 2021. That was 4 years ago. It's a 30-hour game. You could have beaten it 48 times by now."
- **AI game matchmaker** — use LLM to explain WHY a specific game matches the user's mood/preferences, like Backlog Boss does but without requiring self-hosting
- **Sorting presets for shelves** — sort by rating, by community popularity, by time to complete, by how long it's been in your pile. Standard and essentially required.
- **Mini celebrations for milestones** — first game added, first Play Next pick, first clear, 10th clear, 50th clear. Each with escalating personality.
- **Auto-import wishlists on library import** — when a user imports their Steam library and we save their linkedSteamId, automatically fetch their wishlist too. No extra modal. The API already supports `action=wishlist`. Just chain the call after library import completes, add games with `isWishlisted: true`, and show a combined toast. PSN can't do this (token is ephemeral), but Steam can. Xbox could too if we store the gamertag.
- **Spoiler-aware media consumption** — the cultural shelf life problem. You intended to read/watch/play something 3 years ago. By now it's been memed to death and you already know the beats. At some point the shame shifts from "I should experience this" to "I should just get the gist and move on." Offer a graceful exit: "You've had this for 3 years. Want the 5-minute version instead?" Could integrate with AI summarization. This applies across verticals (books, shows, games with heavy narrative). Related to the "bail with dignity" philosophy. Not Cliffs Notes exactly. More like: "you're clearly never doing this. Here's what you missed. Now you can talk about it at dinner."
- **Remote game launch / deep-linking** — click "Get Playing" and have Steam, Game Pass, or PS Remote Play actually launch the game. Steam has `steam://rungameid/` protocol. Xbox Game Pass has `ms-xbl-*://` deep links. PS5 remote play is harder. Even partial support (Steam on desktop) would be magical. Blue sky but worth exploring.
- **Steam for Mac preference** — users who primarily play Steam on Mac should be able to set a platform preference that filters to Mac-compatible titles. Steam API has platform data.
- **Spotify playlist matching** — suggest public Spotify playlists that match the vibe/mood of the game you're about to play. Could be as simple as searching Spotify for "[game name] soundtrack" or "[mood] gaming playlist." Respectful of soundtrack creators — supplement, not replace.
- **Trophy Case view** — dedicated shelf/view for showcasing achievements and trophies across platforms. GameAchievements type already exists. Could be a visual showcase similar to the planned shelf view. Makes users feel good about what they've accomplished.
- **Fake error/glitch modal for theme discovery** — whimsical easter egg: a "you have glitched into dino mode" style fake error that reveals hidden themes. An easter egg people might never find, "and that would be kinda funny."
- **Webring as real community tool** — the 90s mode webring could be a real cross-promotion feature. "Show some love kinda deal." Affiliate/goodwill cross-promotion with other gaming sites/tools.
- **Search bar collapse** — search bar sits next to "Add a Game" and expands into input only when clicked. Saves vertical pixels, especially on mobile.
- **Game list pagination** — start with 20 games visible, option to show 50, 100, or all. Performance + UX win for large libraries.
- **Energy matching by time of day** — suggest different game types based on time of day (morning = energetic, evening = wind-down). Concerns about VPNs and accuracy, but worth exploring as opt-in.
- **Celebrate bail as a healthy boundary** — bailing deserves a mini-celebration, not confetti but acknowledgment. "You drew a line. That's a choice." Reframe bail as a positive act of self-knowledge. 🙌 toast already implemented in Just 5 Minutes triage.

### Naming & Brand Considerations
- **Domain exploration** — `pileofsha.me` is clever but not memorable, doesn't roll off the tongue. Exploring alternatives: `backlog.lol`, `getplaying.app`, `unplayed.lol`, `playalready.lol`, `whatdoiplay.com`. Cheap TLDs: `.lol` (~$2/yr), `.wtf` (~$5/yr), `.app` (~$13/yr). `.gg` is ideal but $50+/yr.
- **Name sensitivity** — "Pile of Shame" as a name could be problematic given shame sensitivity in the target audience. It's tongue-in-cheek and self-referential enough that most users will get it, but worth being aware of. "The tightrope has effect."
- **Existing iOS app** — "Pile of Shame - Game Tracker" exists on the App Store (id6758886606). Trademark/competitive concern worth monitoring.

### Monetization & Marketing
- **Gaming-specific tip language** — not "buy me a coffee." Something different: "grab me a slice" 🍕, "buy me an ice cream" 🍦. Simple but a little different. Avoid "support pile of shame" which reads like "support the idea of shame."
- **Pick-your-price monthly membership** — users pick their own monthly price to keep tipping if the service is helping. Not quite freemium, more like patronage.
- **Email collection + marketing consent** — proper email capture with consent for marketing. Bells and whistles of a commercialized app.
- **30-second landing page explainer** — marketing-style landing page separate from the app itself. Needed for full rollout to explain the value prop instantly.
- **Connected accounts visibility** — clear UX showing which platform libraries are imported. "How can I see if I have my Steam and PS libraries imported?" Settings now shows this.

### Beyond Digital Media (The Analog Pile)
The core insight: shame piles aren't just digital. The psychology is identical whether it's 200 unplayed games or a chair covered in unfolded laundry. What we learn building the gaming tool (shame as motivation, celebration for action, breaking paralysis) could translate to real-world analog problems.

Speculative verticals worth watching:
- **The Laundry Chair** — habit tracking meets shame motivation. That chair in your home with all the unfolded clothes on it. Real. Universal. Potentially fixable. Not with this app, but with what we learn building it.
- **The Gym Habit** — maintaining exercise routines. Same commitment avoidance psychology as gaming backlogs. "You said you'd go 4 times this week. You went once. That's 25% completion rate. The Dabbler archetype applies here too."
- **The Cleaning Schedule** — household maintenance pile. Everyone has rooms they avoid cleaning. Same paralysis, same shame, same "I'll do it tomorrow."
- **Photo Library Cleanup** — cloud storage crunch is real. People pay $3-10/month for storage filled with screenshots, duplicates, and photos of whiteboards from 2019. Help people organize 70% of it properly, trim the junk, and potentially reduce their cloud storage tier. If you save someone $3/month, you're literally giving them money. That's the definition of value.
- **Bookmarks** — does anyone even use bookmarks anymore? Probably not in the traditional sense. But "saved for later" across platforms (Reddit saves, Twitter bookmarks, Instagram saves, Pocket, Instapaper) is a massive unmanaged pile. 500 saved articles, read 12.
- **Online Courses** — Udemy, Coursera, Skillshare. Same buy-and-guilt psychology as games. "You own 47 courses. You've completed 2. Your learning pile is worth $800."
- **Side Projects** — GitHub repos started and abandoned. Developer-specific but deeply relatable. "You have 23 repos with one commit. That's 23 good ideas you ghosted."
- **Saved Recipes** — Pinterest, Instagram saves. "Saved 200 recipes, cooked 3." The cooking pile of shame.

### The Bigger Vision
None of these require building right now. But the engine we're building (mood matching, shame-as-motivation, celebration loops, archetype profiling, zero-effort enrichment) is fundamentally about helping overwhelmed people take action on accumulated intentions. Gaming is where we prove it works. The framework transfers.

### External Feedback (April 2026)

**Shareable Stats Cards Design:**
- Theme-matched card designs: Polaroid for 90s mode, Receipt (thermal printer) for 80s/Neon, 8-bit sprite for Dino, clean minimal for default
- OpenGraph images should auto-update to show current Level + Last Cleared Game when sharing Cleared list URL
- "Anti-Annoyance Rule": Only offer share for Big Moments — beating a 40+ hour game, new Backlog Buster Level, hitting a Reclaimed Value milestone ($500+)
- Avoid "AI slop" — no over-designed achievement cards that look like mobile game ads

**Naming Recommendations (from early external analysis — superseded by Final Decision Phase below):**
- ~~Best brand name candidates: 1) Playback, 2) Inventory Full, 3) Dead Save Society~~ — Playback was later eliminated (direct competitor at playbacklog.app). Inventory Full and Dead Save Society advanced to finals.
- Best value proposition phrase: "Backlog Payback" — confirmed across all rounds
- ~~Recommended brand architecture: **Playback** (brand) + **Backlog Payback** (core feature/value system) + Dead Save Society (community/editorial layer)~~ — see updated brand systems in Final Decision Phase
- "Continue Club" diagnosed as "linguistically toddler milk-scented" — spirit is right, phrase is not
- Key insight: separate the app name job (ownable, memorable) from the promise/mechanic job (explains value)

### Naming & Brand Architecture — Final Decision Phase

**Status: DONE — Inventory Full. Domain: `inventoryfull.gg` registered on Porkbun ($51.80/yr). Gmail: inventoryfull.gg@gmail.com.**

**The Core Insight:**
"You are not lazy. You are overloaded." The name must signal empathy and action, not storage or shame. We're a behavioral tool, not a library.

**What's Locked (regardless of brand name):**
- **Backlog Payback** = core value metric/feature name. Confirmed across all analysis rounds.
- **pileofsha.me** = permanent redirect / easter egg. Cultural recognition stays forever.
- **backlog.quest** = supporting/campaign URL, not the main brand. Good thematic fit but not fresh enough for flagship.

**The Final Three (ranked after 4 rounds of analysis):**

**#1: Inventory Full** — The Smart Pick (FRONTRUNNER)
- Best emotional intelligence. "You are not lazy. You are overloaded."
- Names the pain in gamer-native language everyone instantly gets
- Best UI/copy language built in: Clear Space, Overflow, Open Slots, Priority Loadout
- Personality: warm, witty, non-judgmental. "Let's make this manageable."
- Risk: lives in problem state — product must show transformation fast (we already do this)
- Domains to check: `inventoryfull.app`, `inventoryfull.gg`, `getinventoryfull.com`, `playinventoryfull.com`, `inventoryfull.games`
- Brand system: **Inventory Full** + **Backlog Payback** (feature) + **Mission Clear** (celebration) + `backlog.quest` (campaign)

**#2: Dead Save Society** — The Bold Pick
- Most memorable, most shareable, most "I want to tell someone about this"
- Strongest worldbuilding: Society Rank, Resurrections, "Worth Saving," Revive
- Personality: confident, flavorful, cool, a little dramatic. Most swagger.
- Risk: needs confident design to avoid feeling like community project vs product
- Domains to check: `deadsavesociety.com`, `joindeadsavesociety.com`, `deadsave.club`
- Brand system: **Dead Save Society** + **Backlog Payback** (feature) + **Revive** (action verb)

**#3: ClearQuest** — The Safe Pick
- Easiest to explain, cleanest onboarding, most "normal app" feel
- But IBM Rational ClearQuest is a real SEO collision
- Also the most replaceable — doesn't carve moat
- Domains to check: `getclearquest.com`, `clearquest.app`, `clearquest.games`
- Brand system: **ClearQuest** + **Backlog Payback** (feature) + **Quest Clear** (state)

**Names ELIMINATED (all rounds):**
- Playback — direct competitor at playbacklog.app
- Runback — "backtracking chore smell. Not heroic."
- Reclaim — too generic, domain competition
- Dust Off — warm but not distinctive enough
- Unfinished Business — existing web presence
- Hoard — heavily used across gaming
- Delve — SEO dominated by WoW mechanic
- Continue Club — "linguistically toddler milk-scented"
- Unplayed.gg — taken
- QuestLog.gg — taken
- Backlog.quest — taken (but worth checking as campaign URL)

**Brand Mythology (lives underneath any name):**
- **The Dragon Metaphor:** "The dragon isn't the hoard — the dragon is *guarding* the hoard. The dragon is that paralysis loop sitting between you and your own gold."
- **Kairos:** Greek god of the fleeting moment. Every time you scroll past something incredible and boot up Rocket League instead, Kairos just passed you.

**Decision Framework:**
- Feel understood → **Inventory Full**
- Feel cool → **Dead Save Society**
- Just ship it → **ClearQuest** (but you'll rebrand in 6 months)

**The Brand System (LOCKED):**
- **Brand:** Inventory Full
- **Domain:** `inventoryfull.gg` (Porkbun, $51.80/yr)
- **Tagline:** Your backlog is full. Your time doesn't have to be.
- **Hero copy layer:** "Be the hero of your own library." (used in marketing/copy, not the brand name)
- **Core feature:** Backlog Payback
- **CTA:** Clear some space
- **Celebration state:** Mission Clear
- **Campaign URL:** `backlog.quest` (if available, optional)
- **Easter egg redirect:** `pileofsha.me` → `inventoryfull.gg`
- **Brand metaphor:** RPG encumbrance. Every gamer has stood in a menu dropping cheese wheels to keep moving. That's the backlog condition.

**In-app terminology (to adopt during branding pass):**
- Backlog Payback = recovered value feature
- Clear Space = main CTA
- Overflow = backlog pressure indicator
- Open Slots = room created in play plan
- Priority Loadout = selected current games

**Action items:**
1. ✅ Domain search and naming decision complete
2. ✅ `inventoryfull.gg` registered on Porkbun (2026-04-02)
3. ✅ `inventoryfull.gg@gmail.com` created for WHOIS / support
4. TODO: Branding pass on app (rename, update copy, adjust metadata)
5. TODO: Point `inventoryfull.gg` DNS to Vercel (CNAME record)
6. TODO: Set up `pileofsha.me` → `inventoryfull.gg` redirect
7. TODO: Update OG image, share cards, and social metadata with new brand
8. TODO: Update manifest.ts, privacy/terms pages with new brand name

---

## Key Design Tokens
- BG: `#0a0a0f`, Cards: `#111118`, Elevated: `#1e293b`
- Text: `#f8fafc` / `#e2e8f0` / `#b0bec9` / `#8896a7` / `#6b7d8f` (bumped for legibility)
- Borders: `#232333` / `#3d4f63` (bumped for visibility)
- Accents: purple `#a78bfa`, pink `#f9a8d4`
- Card radius: 12px, padding: 12px 14px, max-width: 960px
