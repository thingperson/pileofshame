# Inventory Full — Roadmap (Phase 3-5 Planning)

Forward-looking planning docs: queued priorities, the Phase 3 paradigm shift, Phase 3 (Smart Library + Mood-First UX), Phase 4 (Future), and Phase 5 (Multi-Vertical Expansion).

---

## Next Priorities (Queued)

### HIGH — Moat Work
1. **Custom icon sets** — Replace emoji icons with DALL-E illustrated icons per theme. Mood tags, status badges, time tiers. Brady has DALL-E generating the custom icons MD now. Wire them in when assets arrive.
2. **Decision engine V2** — time-of-day awareness (evening = wind-down suggestions), genre balance (don't recommend 3 RPGs in a row), "Why not this game?" on skip (optional feedback loop).
2. **Decision engine V2** — time-of-day awareness (evening = wind-down suggestions), genre balance (don't recommend 3 RPGs in a row), "Why not this game?" on skip (optional feedback loop).
3. **Jump Back In V2** — story progress estimation, Supabase caching of cheat sheet data, pre-seed top 200 games.

### MEDIUM — Polish
4. **Mobile Google login testing** — needs real device testing, can't verify remotely.
5. **Enrichment reliability audit** — test RAWG/HLTB match accuracy with real large libraries. Measure and reduce failure rate.
6. **Platform visibility on cards** — already implemented per agent review, but worth visual QA on live site.

### LOW — Future
7. **Share overhaul** — OG link previews, public profile route, shareable URL system.
8. **DealBadge rebuild** — DLC/sequel deals with intent-based logic.
9. **Drag-to-reorder Up Next queue** — dnd-kit installed but not wired.

---

## The Paradigm Shift (Phase 3 redesign)

**Original problem** (largely addressed by auto-enrichment): We built a library organizer. Users needed a game matchmaker. The app used to ask users to pre-categorize every game before it could help them. Auto-enrichment (Phase 2, items 36a-36e) fixed this — moods, session tiers, and descriptions are now auto-inferred from RAWG/HLTB data.

**Remaining gap**: The UX doesn't yet leverage enrichment data for mood-first discovery. The user's real intent — "I have 45 minutes and want something chill" → app shows matching games — requires the Mood-First Discovery UX (item 37) which is still TODO.

**Key failures in current UX** (assessed at time of Phase 3 planning — status updated):
1. ~~No game descriptions~~ — ✅ Fixed. Auto-enrichment adds RAWG descriptions on import.
2. ~~Vibes/tags are manual busywork~~ — ✅ Fixed. Moods auto-inferred from genre data.
3. ~~Time tiers are manual busywork~~ — ✅ Fixed. HLTB auto-assigns session tiers.
4. ~~Filters show empty results because nothing is pre-tagged~~ — ✅ Fixed. Auto-enrichment populates tags.
5. Shelves exist as categories but there's no shelf browsing view — still TODO
6. No mixtapes — no saved criteria-based queues — still TODO
7. ~~Bail button is cryptic~~ — ✅ Fixed. Bail has confirmation flow + personality copy (item 30).
8. High-playtime games get no ribbing (1874h in Rocket League = missed roast) — still TODO
9. ~~Search bar doesn't add games intuitively enough~~ — ✅ Fixed. Search-to-Add (item 35).
10. No affiliate revenue on deal links — still TODO

---

## Phase 3 — Smart Library + Mood-First UX

### 36. Auto-Enrichment Pipeline ✅ (see Phase 2 items 36a-36e)
**Completed.** `useAutoEnrich` hook handles background enrichment on import. RAWG provides descriptions/genres/metacritic, HLTB provides completion times, genre→mood and HLTB→session tier mappings are auto-inferred. `EnrichmentIndicator` shows progress.

**Remaining work (enrichment reliability)**:
- RAWG search sometimes returns wrong game (e.g., "Portal" matching a random indie). HLTB is fuzzy-match. Needs testing with real large libraries to measure and reduce failure rate.

### 37. Mood-First Discovery UX
**Goal**: Top of page becomes "What do you want to play?" not a library dump.

The hero section becomes a discovery prompt:
- **Time input**: "I have [15 min | 30 min | 1 hour | 2-3 hours | all night]"
- **Mood input**: "I want something [chill | intense | story-rich | brainless | spooky | competitive]"
- Hit go → app filters library by auto-inferred tags + HLTB time and shows matching games
- Each result shows: cover art, synopsis (2-3 lines), HLTB estimate, metacritic, mood tags, deal if available
- "Shuffle" picks randomly from matches
- This replaces/augments the current reroll — it's reroll but smarter

### 38. Game Info Cards — Mostly Complete (see Phase 2 items 28, 32)
Expanded cards already show: synopsis, HLTB time, mood tags, metacritic, deal badges, session tier.

**Remaining work**:
- **Playtime roasts**: High hours on certain games should trigger personality comments
  - "1874h in Rocket League. No wonder your pile isn't shrinking."
  - "You've sunk 200h into Stardew. We get it, the farm isn't going to water itself."
- **Metacritic one-line review summary** (not yet implemented)

### 39. Shelf View — SUPERSEDED by Tab Layout (Item 70)
**Original goal**: Visual bookshelf metaphor. **Replaced by**: Tab-based pipeline layout (Backlog → Up Next → Now Playing → Completed). The "shelf" metaphor was wrong — we're a pipeline, not a library. "Bailed" games now live under the Completed tab as "Moved On." Genre-based sub-grouping within tabs is a future nice-to-have but not the organizing principle.

### 40. Mixtapes (Smart Play-Next Shelves)
**Goal**: Auto-generated or criteria-based play queues with intentional sequencing.

- App generates a "play next" shelf with logic: a quick-hit easy finish → a deeper narrative game → a fun palette cleanser → repeat
- Some randomness, some intentional sequencing (variety in length/mood)
- User can optionally inform with criteria: mood, time budget, genre preferences
- Can pin/unpin specific games, regenerate the rest
- Multiple mixtapes allowed
- Examples:
  - "Bedtime Stories" — narrative + wind-down + unplayed
  - "Sunday Marathon" — deep-cut + RPG + unplayed
  - "Palette Cleanser" — quick-hit + puzzle/casual
- Mixtape view shows games with descriptions and time estimates
- Nice-to-have, not critical path — build after auto-enrichment + mood-first UX

### 41. Smarter Bail
**Goal**: Bail should feel like a deliberate, informed decision.

- Better copy: "I'm never gonna finish this one" or "Life's too short"
- Bail reasons (optional): "Not my thing", "Too long", "Got bored", "Moved on"
- Bailed games section shows reason + "Reconsider?" option
- Stats: "You've bailed on 12 games worth $180. No judgment."

### 42. Search-to-Add Enhancement — Partially Complete (see Phase 2 item 35)
Basic search-to-add is done: when search finds no results, shows "Add [query] to your pile?" CTA that opens AddGameModal.

**Remaining work** (nice-to-have):
- Show RAWG results BELOW library results as user types (live autocomplete)
- Separated by a divider: "Your Library" results above, "Add from RAWG" below
- One click adds from RAWG with auto-enrichment, pre-filling cover art, genres, metacritic, HLTB, description

### 43. Playtime Roasts & Insights
**Goal**: Use playtime data to give users personality-driven nudges.

- High playtime detection: flag games with 100h+, 500h+, 1000h+ with escalating roasts
- "Comfort game" detection: games with high playtime but still in backlog
- "Time sink analysis": "You've spent 3000h across 3 games. Your other 97 games are jealous."
- Weekly/monthly playtime comparison if Steam hours refresh is used

### 44. Affiliate Revenue
**Goal**: Earn commission on deal clicks.

- **CheapShark**: Already integrated. Has affiliate program — append store redirect ID to deal URLs. Free, simple. Covers Steam, Humble, Fanatical, GOG, etc.
- **IsThereAnyDeal (ITAD)**: Better affiliate support, more stores, higher commission rates. API requires key (free). Better data quality. Worth migrating to if we outgrow CheapShark.
- **GG.deals**: Another option with affiliate program.
- Recommendation: Start with CheapShark affiliate (already integrated, just need account + URL param). Migrate to ITAD later if volume justifies it.
- Transparent: "Links may earn us a small commission" footnote
- Track click-throughs (optional analytics)

### 45. Competitive Audit ✅

#### The Landscape

| Tool | What It Is | Strengths | Weaknesses |
|------|-----------|-----------|------------|
| **Backloggd** | Letterboxd for games. Social reviews, ratings, curated lists, game journals. | Beautiful UI. Strong community. Great for logging what you've played and reading reviews. Detailed game pages with screenshots, DLC tracking. | Zero "what should I play?" features. No import automation — every game is manual search + add. No mood/time matching. It's about *recording*, not *clearing*. No personality. |
| **HowLongToBeat** | The definitive source for game completion times. Also has a basic backlog tracker. | Best-in-class time data. Large community submitting playtimes. Backlog list with % completion tracking. | The backlog feature is an afterthought — flat list, no recommendations, no mood matching, no personality. UI feels 2010. Adding games is manual. No import from platforms. Time data is great but they don't *do* anything with it to help you decide. |
| **GG.deals** | Price comparison and deal tracker. Wishlists, price history, collection management. | Best deal data. Price history charts. Alerts. Covers every store. Strong affiliate model. | Not a backlog tool at all. Tracks what you want to *buy*, not what you should *play*. No playtime data, no mood matching, no status tracking beyond owned/wishlisted. |
| **Playnite** | Open-source desktop app that unifies all launchers into one library. | Unifies Steam, Epic, GOG, Ubisoft, EA, emulators — everything. Highly customizable (themes, plugins, metadata scrapers). Launches games directly. | Desktop-only (Windows). No web/mobile. No cloud. No "what to play" intelligence. It's a launcher/organizer, not a motivator. Power-user tool — setup requires effort. |
| **GOG Galaxy** | CDProjekt's multi-platform game launcher. | Official integrations with PSN, Xbox, Steam, Epic, etc. Clean UI. Game time tracking across platforms. | Development appears stalled/slow. Community plugins break regularly. No backlog management beyond "owned" lists. No recommendations, no personality. Just a unified library view. |
| **Grouvee** | GoodReads for games. Shelves, reviews, status tracking. | Simple shelf metaphor (Playing, Played, Backlog, Wishlist). Community reviews. | Tiny community. Basic UI. No enrichment, no import automation, no mood matching, no personality. Feels abandoned. |
| **Infinite Backlog** | Web-based backlog manager with HLTB integration. | HLTB times inline. Backlog time estimates. Some prioritization features. | Basic UI, no personality, no mood matching, no auto-import. Functional but not compelling. Nothing that makes you want to share it. |

#### What They ALL Do That We Don't (Yet)
- **Social/community features**: Reviews, friend comparisons, public profiles (Backloggd, Grouvee)
- **Broader platform coverage**: Playnite and GOG Galaxy connect to 10+ platforms natively (we have Steam, Xbox, PlayStation, CSV)
- **Deal price history charts**: GG.deals tracks price over time, not just current price
- **Game database depth**: Backloggd has detailed game pages (DLC, editions, platforms, screenshots, release dates)

#### What We Do That NONE Of Them Do
1. **Mood-first discovery**: "I have 45 min, want something chill" → matching games. Nobody does this.
2. **Personality-driven experience**: Roasts, archetypes, shame-as-motivation. Every other tool is sterile/clinical.
3. **Auto-enrichment with zero user effort**: Import → we fill in descriptions, mood tags, time estimates, session tiers. Others make you tag everything yourself.
4. **Completion celebration**: Confetti, stats impact, star rating, personality copy. Others just flip a status flag.
5. **Reroll with abuse protection**: Dramatic game picker with escalating sass. Nobody has this.
6. **Player archetypes**: "You're The Hoarder" with behavioral analysis. Nobody does personality profiling of your gaming habits.
7. **Playtime roasts**: Game-specific personality comments on excessive hours. Zero competitors do this.
8. **Shareable shame stats**: "I have 347 unplayed games worth $4,200" formatted for Twitter/Reddit/Discord.

#### The Whitespace We Own
**The "what should I play right now?" problem.** Every existing tool helps you *catalog* games. None of them help you *decide* what to play tonight. The closest is HLTB giving you time estimates, but they don't combine that with mood, don't auto-tag anything, and don't have any opinion about it.

Our whitespace is: **opinionated, personality-driven backlog matchmaking with zero setup effort.**

The user imports their Steam library → within seconds, every game has a description, mood tags, session length, and the app can answer "what should I play?" based on how they feel right now. No other tool does this.

#### One-Line Value Prop
> **"Import your pile, tell us your mood, we'll find your game."** Zero tagging, zero organizing — we do the work so you can just play.

#### Where We're Vulnerable
- **No social layer**: Can't see friends' piles, no community. This is fine for MVP but matters for retention.
- **Platform coverage**: Steam, PlayStation, and Xbox/Game Pass. No Nintendo, no Epic, no GOG. Playnite wins on breadth.
- **Game database**: We depend on RAWG which can be spotty. Backloggd has richer game pages.
- **Deal data**: CheapShark is good but GG.deals is better. Not critical for MVP.

---

### 46. MVP Definition ✅
**Goal**: Define the minimum feature set for "send this link to friends" moment.

#### The "Ready Ready" Checklist

MVP is ready when a friend can:
1. **Land on pileofsha.me and immediately understand what it is** (3 seconds)
2. **Import their Steam library in under 60 seconds** (already works ✅)
3. **See their games with descriptions, mood tags, and time estimates** without manually tagging anything (auto-enrichment runs on import ✅)
4. **Ask "what should I play?" and get a good answer** based on mood + time (reroll modes work ✅, but the mood-first hero UX would make this stickier — **NICE TO HAVE**)
5. **Clear a game and feel something** (celebration works ✅)
6. **See their stats and laugh** (archetypes, shame stats, playtime roasts — ✅)
7. **Share their pile stats somewhere** and it reads well (Twitter/Reddit/Discord sharing — ✅)
8. **Come back on their phone and it works** (responsive + PWA — ✅)

#### What's Blocking MVP Right Now

| Blocker | Status | Effort | Why It Matters |
|---------|--------|--------|----------------|
| **Auto-enrich on import** | ✅ Done | Small | `useAutoEnrich` hook watches for unenriched games, processes in background with rate limiting. `EnrichmentIndicator` shows progress. |
| **Play Next onboarding** | ✅ Done | Medium | Smart suggestion picks a game from library (scored by enrichment, metacritic, HLTB, cover art). One-click "Add to Play Next" button. Randomized from top 5 candidates. |
| **Grid view → detail panel** | ✅ Done | Medium | Tapping grid card opens `GameDetailModal` (slide-up on mobile, centered on desktop). Wraps `GameCard` in `forceExpanded` mode. Full detail experience: descriptions, mood tags, deals, editing, celebration flow. |
| **Status badge discoverability** | ✅ Done | Small | Pulse animation + "tap to advance →" text hint on first cards. Persists until user taps a status badge (localStorage flag). |
| **Enrichment reliability** | 🟡 Partial | Medium | RAWG search sometimes returns wrong game (e.g., "Portal" might match a random indie). HLTB is fuzzy-match. Need to test with real libraries and see failure rate. |
| **First-time experience** | ✅ Done | Small | OnboardingWelcome 2-step flow (item 53). EnrichmentIndicator shows progress. Play Next suggests games. Status badge has hints. |
| **Accessibility basics** | ✅ Done | Medium | Focus trapping in modals, Escape-to-close, role/aria attributes, keyboard-accessible cards, form labels. |
| **Terminology consistency** | ✅ Done | Small | Locked: Play Next, What Should I Play?, Moods (not Vibes), Session length (not Time tier), Shelf (not Category). |
| **Mobile polish** | 🟡 Mostly OK | Small | Needs a pass on the expanded card view on small screens. FilterBar dropdowns may overflow. |

#### What's NOT Required for MVP
- ❌ Mood-first hero UX redesign (nice, but current reroll is good enough)
- ❌ Shelf view / visual bookshelf (post-MVP)
- ❌ Mixtapes / smart playlists (post-MVP)
- ❌ Social features / public profiles (post-MVP)
- ~~❌ Xbox/Nintendo/Epic import~~ — Xbox/Game Pass shipped (item 14). Nintendo and Epic still post-MVP.
- ❌ Affiliate revenue (figure out later)
- ❌ Smarter bail with reasons (current bail flow works)
- ~~❌ Search-to-add from RAWG autocomplete~~ — basic version shipped (item 35). Full RAWG autocomplete still post-MVP.
- ❌ Drag-to-reorder (nice but not essential)
- ❌ Server-side game database cache (optimization, not MVP)

#### MVP Build Order — All Complete ✅

All 10 original MVP build items have been shipped:
1. ✅ Auto-enrich on import (useAutoEnrich hook + EnrichmentIndicator)
2. ✅ Play Next onboarding (smart suggestion with scoring)
3. ✅ Grid view detail panel (GameDetailModal)
4. ✅ Status badge discoverability (pulse animation + tap hint)
5. ✅ Terminology consolidation (Moods, Session Length, Shelf)
6. ✅ Accessibility batch (focus trapping, keyboard nav, ARIA)
7. ✅ First-time UX polish (OnboardingWelcome flow)
8. 🟡 Enrichment reliability audit — still needs real-world testing at scale
9. 🟡 Mobile pass — mostly OK, expanded card + FilterBar need small-screen pass
10. ✅ Deployed and live at pileofsha.me

#### The "Wow Moment" That Makes Someone Share
It's not one feature — it's the sequence: **Import 200 games → see them all enriched with descriptions and mood tags in 2 minutes → hit "🎲 Get Playing" → get a game recommendation with a dramatic reveal → clear it → confetti + "You've cleared 1 of 200. Only 199 to go."**

That sequence, end-to-end, is something no other tool does. If that works smoothly, people will share it.

#### Competitive Reality Check (April 2026)

We do NOT own the "mood-based game picking" whitespace. Real competitors exist:
- **Backlog Roulette** (backlogrouletteapp.com) — genre/mood + completion time filters. Steam import. Premium tier.
- **Backlog Clearer** (backlogclearer.com) — mood-weighted selection, badges, streaks, leaderboards. Free.
- **Backlog Boss** (github.com/MydKnight/backlog-boss) — AI/LLM taste-aware recommendations. Self-hosted Docker. Most technically ambitious.
- **DeckFilter** (deckfilter.app) — mobile mood + availability filtering. Steam Deck focused.
- **MyBacklog.gg** — recommendation engine based on ratings. Multi-platform import.
- **Pick a Game** (pickaga.me) — advanced Steam filters, HLTB, presets for quick sessions.

**What we actually own**: the COMBINATION of personality (roasts, archetypes, shame) + zero-effort enrichment (auto-infer everything) + celebration (confetti + stats) + multi-platform web app. Nobody else has voice. Nobody else auto-enriches. Nobody else celebrates completions.

**Revised positioning**: "The only backlog tool with opinions."

#### Broader Competitive Landscape (April 2026, external analysis)

**Competitor groups:**
1. **Social catalog / review worlds**: Backloggd, Grouvee, Infinite Backlog, Stash, GG. For people who like cataloging, reviewing, collecting stats, following others. Not our lane.
2. **Utility trackers**: GameTrack, IGN Playlist, "Backlog" app. Closest feature overlap. GameTrack pitches "track, manage, discover what to play next." IGN Playlist has HLTB integration and "beat your backlog" framing. Polished but no personality.
3. **Recommendation engines**: Playbacklog (playbacklog.app). Closest philosophical overlap. "Personalized game recommendations based on your library and preferences, analyzes gaming patterns." Uncomfortably adjacent to our "help me decide" territory.

**Our actual positioning vs. all of these:**
Inventory Full is not a game tracker. It is a decision-and-momentum system for people with overloaded libraries. The product should be ruthlessly optimized around: deciding what to play now, staying in motion on current games, explicitly releasing games not worth saving, showing recovered value/payback, and creating a loop that feels rewarding not managerial.

**The moat is positioning + tone, not product defensibility yet.** Any competitor can add "we help you decide" messaging on a Tuesday. The moat has to come from:
1. **Better decision quality** — inference-based recommendations using playtime patterns, drop-off risk, completion likelihood, session history. Not just random filters.
2. **Better momentum design** — nudges, return loops, progress visibility. "You're 12h into Hades, one more session might clear it."
3. **Better payback/value framing** — Backlog Payback is unique. Nobody else owns "recovering value from what you already bought."
4. **Lower-friction triage** — import-to-playing speed. Get from 200 games to "play this now" in under 2 minutes.
5. **More humane tone** — already strongest differentiator. The line between "fun help" and "you've turned games into homework" is real.

**Strategic danger:** Becoming "another tracker with nicer tone." Every tracker feature (shelves, sorting, stats, social) moves toward commodity. Every decision/momentum feature moves toward moat.

**Priority shift:** Stop building tracker features. Double down on the decision + momentum loop. Personality infrastructure (themes, archetypes, share cards) is good but doesn't widen the moat. The next sprint should be moat work.

#### Product Thesis (Locked, April 2026)

**Inventory Full should shorten the distance between wanting to play and actually playing.**

Not a tracker. Not a social catalog. Not a stats playground. A lightweight decision and progress tool for overloaded libraries. It helps you decide what to play now based on mood, available time, and your own shelves, then gets out of the way.

**The key question every feature must answer:** Can someone open Inventory Full and get to "play this tonight" in under 30-60 seconds?

**Design principle:** Every extra minute spent in Inventory Full should justify itself against a minute that could have been spent playing.

**Anti-overgamification stance:** We are not building a guilt casino. The app should not become a new backlog item. No streak obsession, no endless feed behavior, no productivity dungeon. Light triage layer, decision engine, progress mirror, then get out of the way.

#### Competitor "Beat Them At" Matrix

| Competitor | Their Game | Don't Compete On | Beat Them At |
|---|---|---|---|
| **Backloggd** | Letterboxd for games: social logging, reviews, journals | Social graph, reviews, community, catalog identity | Faster decisions, less app-time, better "what tonight?", anti-homework posture |
| **GameTrack** | Polished general-purpose tracker | Breadth, general-purpose completeness | Contextual mood+time decisions, minimal interaction, "decide then leave", Backlog Payback |
| **IGN Playlist** | "Beat your backlog" + list/creator ecosystem | Media ecosystem reach, list infrastructure, mass-market breadth | Precision for owned-library decisions, time/mood matching, less noise |
| **Stash** | Tracker + gamer social network | Social engagement, collection flexing, "gamer network" | Lower cognitive overhead, not becoming its own hobby, anti-overwhelm |
| **Infinite Backlog** | Deep collection tracking + achievements + community | Depth, achievement data density, power-user collector appeal | Simplicity of action, triage speed, decision quality with minimal effort |
| **Playbacklog** | Recommendation engine based on library patterns | Pattern analysis depth | Personality, value recovery framing, humane tone, zero-setup enrichment |

#### Next Priorities (Moat Work)

**Build order based on strategic value:**

1. **Decision engine refinement** — mood + time + shelf quick-pick flow. Make outputs feel trustworthy. Fast reroll/refine without starting over. This is the wedge.
2. **Continue / revive / let-go triage** — not just "what should I start?" but "what should I continue?", "what's worth reviving?", "what should I release?" Distinguish short-session fit from high-commitment fit. Identify stalled-but-worth-it games.
3. **"Leave the app" optimization** — fewer taps, less config, clear "I'm good, go play" moment. Session-start quick-pick flow. Summaries over rabbit holes.
4. **Backlog Payback refinement** — calm payoff, not gamified addiction. Mirror of recovered value, reminder that owned games contain payoff, satisfying "getting something back" layer. Not min-maxing collection like a tax shelter with boss fights.
5. **Humane triage language** — not every game deserves saving, not every purchase deserves completion, not every unfinished title is a failure. Language around letting go, removing guilt from pausing or abandoning.

**Explicitly de-prioritized (unless extremely cheap):**
- Deep social features (Backloggd/Stash already there)
- Rich review/journaling systems (not central to wedge)
- Achievement rabbit holes (Infinite Backlog serves that user)
- Over-detailed dashboarding (don't build backlog operations command center)
- Discovery beyond owned library (careful: "discover new games" works against "play what you own")

#### Language to Lean Into vs. Away From

| Lean Into | Lean Away From |
|---|---|
| decide | score |
| continue | streak |
| make progress | rank |
| pick the right game for right now | hero tier |
| recover value | completion hunter |
| clear space | crush your backlog |

---

## Phase 4 — Future

### 45. Drag-to-Reorder Play Next Queue
- dnd-kit installed but not wired up
- Also need sorting presets: by rating, by time to beat, by how long in pile, by community popularity

### 46. Shelves as Playlists Refactor
- Current "categories" (The Pile, etc.) are organizational buckets that don't mean much
- Shelves should be playlists: ordered lists of games to play through in sequence
- Genres/tags (RPG, FPS, roguelike) replace the current "category" concept — auto-inferred from RAWG
- The default shelf is "The Pile" (Pile of Shame) — everything imports here
- Users can create custom shelves ("My RPG Marathon", "Quick Hits for Lunch Break")
- Auto-generated shelves from genre clusters ("Your RPGs", "Your Indies")
- "You're Objectively Wrong Not To Have Played This" — auto-generated from metacritic 90+

### 47. Wire Up Duplicate Game Nudges
- `getDupeNudge` function written but not integrated

### 48. Social Features
- Public profile pages / shareable pile
- Compare piles with friends
- Community challenges ("Clear 5 games this month")
- Discord bot integration

### 48b. Notifications
- "You haven't touched [game] in 30 days" nudges
- Weekly shame digest email

### 49. Platform Integrations
- Nintendo (no API — manual only)
- GOG (GOG Galaxy DB or direct API)
- Epic Games (EGS unofficial API or web scraping)

### 49b. Cross-Platform Game Launching
**Goal:** Let users launch games directly from Inventory Full into the right app on the right device.

**What works now:**
- ✅ Steam desktop: `steam://run/{appid}` — already built in GameCard expanded view

**To build:**
- Steam Link (mobile): Same `steam://run/{appid}` protocol works if Steam Link app is installed. Detect mobile user agent and show launch button on mobile too. Priority: HIGH — easy win.
- Xbox / Game Pass (desktop): Try `ms-xbl-{titleId}://` or `xbox://` protocol links. Worth attempting — may work for Game Pass PC app. Priority: MEDIUM — experimental, worth a spike.
- Xbox (mobile): Xbox app deep linking — investigate `xbox://` on mobile. Priority: LOW.
- PlayStation Remote Play (mobile): No URL scheme for launching specific games. PS App can link to store pages but can't trigger Remote Play for a specific title. Sony's ecosystem is locked down. Priority: WATCH — monitor for API changes but don't invest time now.
- PlayStation (desktop): No PC launcher exists. Dead end. Priority: NONE.

**API watch list:** Keep eyes on Sony and Microsoft developer portals for any new deep linking or remote play APIs. Unlikely to change soon but worth periodic checks.

### 49c. Add to Home Screen (PWA) Prompt
**Status:** PWA manifest already configured (`display: 'standalone'`). Add to Home Screen works on iOS Safari and Android Chrome RIGHT NOW.

**To build:**
- Subtle one-time prompt for iOS mobile users: small banner or settings panel hint saying "Add to your home screen for quick access" with dismiss. Not a popup — respect the gravity principle.
- Android: Chrome handles this with its own install prompt. We may be able to hook into `beforeinstallprompt` event for a custom prompt.
- Detection: use `navigator.standalone` (iOS) or `matchMedia('(display-mode: standalone)')` to detect if already installed and suppress the prompt.
- Priority: LOW — nice for power users, not a growth lever.

### 50. Game Database (Server-Side)
- Cache enrichment results server-side (Supabase)
- Once we've enriched a game for one user, serve cached data to the next user
- Builds a shared game database over time
- Reduces API calls, faster enrichment for new users

### 51b. Bot Proofing & Rate Limiting
- Rate limiting on API routes (Steam import, PSN, RAWG, deals, HLTB) — prevent abuse
- Consider Vercel's built-in rate limiting (vercel.json rewrites with rate limit headers)
- Cloudflare free tier as a CDN/WAF layer if bot traffic becomes a problem
- CAPTCHA (Turnstile by Cloudflare, not reCAPTCHA — lighter, more privacy-friendly) as last resort on import flows
- Monitor via GA for suspicious traffic patterns (high import volume from single IPs)
- Supabase has built-in auth rate limiting already (login attempts)
- Priority: LOW until traffic warrants it. Build the pipes, monitor, react.

### 51. Legal Compliance Pages ✅
**Required even without cookies:**
- **Privacy Policy** — must disclose: data collected (emails via Supabase auth, Steam IDs, PSN tokens temporarily, IP addresses via server logs), purposes, third-party sharing (Supabase, RAWG API, CheapShark, HLTB), user rights, data retention, contact info
- **Terms of Service** — usage terms, account termination, liability limitations, intellectual property, user-generated content (notes, ratings)
- No cookie banner needed if we genuinely use no cookies (Supabase auth may use localStorage, not cookies — verify)
- Both pages should be accessible from footer on every page
- Use plain language, not legalese — consistent with our voice
- Consider using a generator (Termly, PrivacyPolicies.com) as a starting template, then customize
- **Key disclosures needed:**
  - Steam Web API data (playtime, game list) — stored in localStorage
  - PSN token (ephemeral, not stored server-side)
  - CheapShark/RAWG/HLTB — external API calls with game names
  - Supabase — email + synced library data
  - No analytics/tracking currently (add disclosure if we add any)
  - Affiliate links (CheapShark) — must disclose commission potential

---

## Phase 5 — Multi-Vertical Expansion (Post-Gaming MVP)

**Thesis**: The "what should I [verb] right now?" problem exists everywhere digital backlogs accumulate. The core engine (mood matching, reroll, celebration, archetypes, enrichment pipeline, share formatting) is vertical-agnostic. The data sources are vertical-specific.

### Architecture Strategy
**Option C now, designed for Option B later.** Don't build for 6 verticals before validating one. But when expanding, abstract the enrichment pipeline to accept "source adapters" (RAWG for games, TMDB for movies, Google Books for books) and vertical-specific mood taxonomies. The reroll engine, celebration flow, and archetype system are already content-agnostic in logic.

### Expansion Priority (based on competitive research April 2026)

| Priority | Vertical | Whitespace | Competition | Data Sources |
|----------|----------|-----------|-------------|-------------|
| **1** | **YouTube Watch Later** | Wide open. Only Chrome extensions exist (organizers/deleters). Nobody does mood/time picking from your queue. | None with personality or intelligence | YouTube Data API v3 |
| **2** | **Music (Albums)** | Completely unserved. No tool manages a listening backlog of saved albums. | Nothing exists | Spotify API, Apple Music API |
| **3** | **Books / TBR** | Partially served. StoryGraph has mood/pace matching but no personality. Goodreads is a catalog. | StoryGraph (mood matching, no personality). Goodreads (dominant but static). | Google Books API, Open Library. Goodreads API deprecated. |
| **4** | **Movies/TV** | Competitive but personality gap. Watchworthy + Boredflix do mood matching. JustWatch unifies streaming. None have shame/archetypes. | Watchworthy, Boredflix, JustWatch, Movie Tracker | TMDB API (excellent, free), JustWatch API |
| **5** | **Podcasts** | Unserved but unclear if shame/backlog resonates for podcasts | None | RSS feeds, podcast directory APIs |

### What Transfers Across Verticals (Reusable Core)
- Mood-first discovery UX ("I have X time, I want Y mood")
- Reroll / "Get [Watching/Reading/Listening]" with modes
- Completion celebration (confetti, stats impact, rating)
- Player/viewer/reader archetype system
- Shame stats + sharing (Twitter/Reddit/Discord formatting)
- Status cycle (backlog → up next → in progress → done → bailed)
- Enrichment pipeline pattern (fetch metadata → infer mood → infer time commitment)

### What's Vertical-Specific
- Import sources and APIs
- Mood taxonomy (gaming moods ≠ movie moods ≠ book moods)
- Time tier definitions (a "quick" game ≠ a "quick" movie ≠ a "quick" book)
- Enrichment sources (RAWG vs TMDB vs Google Books)
- Roast/personality copy (gaming roasts don't work for books)
- Source/platform icons and labels

### Additional Verticals to Explore
*(See also "Beyond Digital Media" in Blue Sky Wishlist for analog verticals.)*
- **Online courses** (Udemy, Coursera, Skillshare) — same buy-and-guilt psychology as games. Strong shame parallel.
- **Read Later articles** (Pocket, Instapaper) — 500 saved articles, read 12. Universal.
- **Side projects** (GitHub repos started and abandoned) — developer-specific but deeply relatable.
- **Saved recipes** (Pinterest, Instagram saves) — saved 200 recipes, cooked 3.

### The Music Whitespace Is Real
Not just "albums you haven't listened to." The deeper problem: algorithms push you into discovery loops that pull you AWAY from artists you already love. People find out a favorite artist released 3 albums they never encountered because the algo never surfaced them. We can help people get unstuck from algorithmic tunnel vision and reconnect with music they actually chose to save. That's a real problem meeting a real solution.

### Podcast Angle
People's podcast queues fill up with new episodes daily. They triage to "latest episode" and the backlog of older episodes they intended to listen to grows forever. We can dig gems out of what they intended to listen to but never did. Worth exploring.

### Domain Strategy
- `pileofsha.me` — gaming (current, flagship)
- Subpaths for expansion: `pileofsha.me/watch`, `pileofsha.me/read`, `pileofsha.me/listen`
- No extra domains at first phase. Keep it simple.
- Shared auth across all piles via Supabase
- Cross-pile stats: "You have 847 unfinished things across 4 piles"
- Nav menu will become necessary when multiple verticals exist

### When to Start
- Not until gaming MVP is validated (users sharing, returning, clearing games)
- YouTube Watch Later is the first attack vector (widest whitespace, zero competition)
- Music is second (Spotify API is developer-friendly, real problem to solve)
- Don't touch Movies/TV until we have a clear differentiator beyond personality (Watchworthy is good)
- We own gaming first and foremost. We're not painting into a corner. We're putting down borders and saying "we own this corner." Then we annex new corners.

### User Preference Profiles (Feature to Build)
- Users can enrich their own profile so we know more about them
- Favorite genres, mood preferences, time availability patterns
- Informs Play Next suggestions, reroll weighting, enrichment prioritization
- The better we know them, the more dynamic we can make celebrations, roasts, recommendations
- Transfers across verticals: "you like chill + story-rich" applies to games, movies, and books
- Start simple: 3-5 preference questions on first import. Refine over time from behavior.
- This carves moat. Better personalization = harder to leave.

### Wishlist / Deal Alerts (Feature to Build)
- We maintain a wishlist for users (games they want but don't own yet)
- Deal alerts when wishlisted games go on sale
- Steam and other platforms don't have to be the only ones offering this function
- Yes, this adds more games to conquer. But it also generates affiliate revenue and users will love it.
- We're working the way our users already think. That's good user-centered design.
- Creates a natural funnel: wishlist → buy → pile → play → clear
