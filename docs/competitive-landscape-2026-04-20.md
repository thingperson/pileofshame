# Competitive Landscape — Inventory Full

**Scan date:** 2026-04-20
**Scope:** apps, sites, and built-in platform features that overlap with Inventory Full's job — help someone with a bloated game library pick one and go play.
**Author:** Research pass via WebSearch / WebFetch + public product pages, changelogs, store listings, and press coverage.

---

## 1. Direct competitors

Apps whose stated job is reducing pick-time friction from an existing library.

### Backlog Roulette (backlogrouletteapp.com)
- **What:** Steam-only roulette that surfaces unplayed games (<30 min playtime), avoids recent picks, supports genre + completion-time filters.
- **Platforms:** iOS (listed "coming soon" as of this scan). Steam library only.
- **Pricing:** Free (5 daily spins). Premium $2.99/mo or $29.99/yr for unlimited spins + genre/time filters.
- **Differentiator:** The positioning is almost identical to ours ("stop staring at your library"). Filters live behind paywall.
- **Weaknesses:** Steam-only. Paywalled filters. Mobile-only (iOS pending). No multi-platform. No mood concept; genre is a proxy.

### Pick a Game (pickaga.me)
- **What:** Web random-picker for Steam libraries with heavyweight filtering: release year, review ratio, Metacritic, HLTB durations, playtime, current players, Steam Deck/GFN compatibility. Preset filters for co-op, party, quick sessions, hidden gems, Steam Deck.
- **Platforms:** Web. Steam only.
- **Pricing:** Appears free.
- **Differentiator:** Most feature-rich filter stack in the category. Power-user tool.
- **Weaknesses:** Steam-only. Filter-first UX is the opposite of our thesis — adds cognitive load instead of removing it. The user still has to decide *how* to filter before they get a pick.

### Steam Roulette (steam-roulette.com)
- **What:** Free Steam-based random picker. Genre, co-op, playtime filters. Refreshed for 2026 as a successor to the 2017 original.
- **Platforms:** Web. Steam only.
- **Pricing:** Free.
- **Differentiator:** Simple, brand-recognized URL, casual audience.
- **Weaknesses:** Steam-only. Pure randomness; no mood concept. No multi-platform. No tracking/state.

### Steam Randomizer (steamrandomizer.com)
- **What:** Random game + random achievement picker over a Steam library.
- **Platforms:** Web. Steam only.
- **Weaknesses:** Utility-first; no decision-reduction framing.

### What Should I Steam? (whatshouldisteam.com)
- **What:** Steam discovery engine built by a solo CS-trained dev; filters + recommendations for library and new releases. Donation-supported with light ads/affiliates.
- **Platforms:** Web. Steam only.
- **Pricing:** Free; donation unlocks API/data trends.
- **Weaknesses:** Ads and affiliate partnerships (we don't do those). Discovery-flavored, not paralysis-first.

### SteamRandomPicker (Steam store app)
- **What:** Native app on the Steam store for random selection + library stats visualization.
- **Platforms:** Steam only.
- **Weaknesses:** Only works if your launcher is already open — which is where the paralysis happens.

### Playnite Random Game Picker (built-in + community plugins)
- **What:** Dice button in Playnite's top panel; respects current library filters. Community "RandomSorting" plugin tags games with a random number.
- **Platforms:** Playnite (Windows desktop) — federates Steam, Epic, GOG, Xbox PC, emulators.
- **Pricing:** Free / open source.
- **Differentiator:** Multi-launcher on PC. Sits inside the launcher the user is already wrestling with.
- **Weaknesses:** PC desktop only. Tech-user audience. No mood/time concept. Just pure random.

### GameGenie (studentai.app/gamegenie)
- **What:** AI recommender taking preferences, mood, and target platform; suggests from a broad catalogue including indies.
- **Platforms:** Web.
- **Weaknesses:** Recommends what to buy/play generally, not scoped to user's owned library. Student-hackathon tier surface; unclear longevity.

### PlayNxt (Google Play)
- **What:** Mobile app; recommends games by mood + available time.
- **Weaknesses:** Recommends from catalogue, not personal library. No evidence it imports owned games across platforms.

### Mood Twist AI (iOS)
- **What:** General activity suggester with a Game Mode (time limit + mood).
- **Weaknesses:** Not backlog-scoped. Catalogue-broad.

---

## 2. Adjacent / indirect competitors

These don't pick for you today, but they hold audience and could pivot.

### Backloggd (backloggd.com)
- Social-first tracker with reviews, ratings, lists, follows. March 2026 added adult-content toggle and re-enabled Trending sort. Personalized recommendations are listed on roadmap but not yet shipped. Large, engaged user base. **Biggest pivot risk in the category.**

### Grouvee (grouvee.com)
- Shelf-based tracker with infinite custom shelves. Shipped a new Lists system in March 2026 (public/private/community, drag-to-order); April 2026 rewrote front-end in Turbo/Stimulus. Actively developed.

### Backloggery (backloggery.com)
- Long-running hand-entry tracker. Retro aesthetic, loyal niche. No auto-pick.

### Infinite Backlog (infinitebacklog.net)
- Cross-platform collection tracker with stats focus. Catalogue/stats, not pick-reduction.

### HowLongToBeat (howlongtobeat.com)
- Playtime database with a backlog feature. No personalized recommendations. Heavily used as a data source (including by us).

### GG| (ggapp.io)
- Social tracker with Backlog/Wishlist/Beaten/Playing/Completed/Shelved/Abandoned shelves. $5/mo Elite tier. Social-discovery flavor.

### PlayTracker (playtracker.net)
- EU-based multi-platform federator (Steam, PS, Xbox, GOG). Strong privacy posture ("doesn't sell personal data," aggregated analytics only). Quest + Insight + Social pillars. Overwolf desktop client. Stats-first, not pick-first. **The closest philosophical cousin on privacy.**

### GAMEYE (gameye.app)
- Collection + resale-value tracker for physical collectors. 100+ platforms incl. retro. Not a picker.

### TrueAchievements
- Xbox achievement community. Users have begged for a backlog sorter for years; wishlist remains the workaround.

### Launcher-native picks
- **Steam Discovery Queue / "Recommended For You":** sells new games; not focused on owned unplayed.
- **Epic "Pick for me":** limited traction.
- **Xbox homepage / PS curated rails:** platform-biased promotional surfaces, not paralysis tools.

### AI chatbot use cases (ChatGPT, Claude, Gemini)
- Users increasingly paste library lists and ask "pick one." Zero integration, zero memory across sessions, but zero marginal cost and arbitrary intelligence. This is the sleeper threat: any user who already uses ChatGPT can do 60% of our job in a text box.

---

## 3. Overlap matrix

| Axis | Inventory Full | Backlog Roulette | Pick a Game | Steam Roulette | Playnite Picker | Backloggd | PlayTracker | ChatGPT-style |
|---|---|---|---|---|---|---|---|---|
| Solves paralysis (primary job) | Yes | Yes | Partial | Yes | Partial | No | No | Yes (ad hoc) |
| One pick vs list | One | One | One (after filters) | One | One | n/a | n/a | Variable |
| Mood input | Yes | No (genre only) | Genre/tags | Genre | No | n/a | n/a | Yes |
| Time input | Yes | Yes (paid) | Yes (HLTB) | Yes | No | n/a | n/a | Yes |
| Multi-platform import | Steam/PSN/Xbox | Steam | Steam | Steam | PC launchers | Manual | Steam/PS/Xbox/GOG | Manual paste |
| Privacy: no ads/tracking | Yes | Unclear | Light ads (site) | Unclear | N/A | Ads present | Yes (EU, strong) | Varies |
| Freemium posture | Free, no paywall | Paywalled filters | Free | Free | Free/OSS | Free + perks | Free | Free |
| Mobile-first | Responsive web | iOS-only (pending) | Web | Web | Desktop | Web | Web + desktop | App |
| Thesis coherence (less time in app = win) | Yes | Yes | No (filter-heavy) | Yes | Yes | No (engagement-driven) | No (stats-driven) | Yes |
| Community features | No | No | No | No | No | Heavy | Medium | No |

---

## 4. Threat assessment

| Competitor | Threat | Why | What would change it |
|---|---|---|---|
| Backlog Roulette | **High** | Nearly identical positioning, native mobile, active dev. | If they ship Android + multi-platform imports, or drop filter paywall, threat goes critical. We mitigate by shipping mood + multi-platform + free-forever first. |
| Backloggd | **High (latent)** | Largest audience in category; recommendations on roadmap. If they ship a paralysis-solver, they have distribution we don't. | Watch their medium dev updates. Our move: own the "less time in app" position before they can claim it. |
| ChatGPT / Claude as habit | **Medium-high and growing** | Zero integration cost for users already in the chat tab. | Our moat is owned-library awareness + state (status cycle, cooldowns, archetypes) across sessions. Keep building memory that a chatbot can't replicate without paste-in. |
| Pick a Game | **Medium** | Most powerful filters, free. Appeals to power users. | Anti-thesis for our audience but competes on the same SEO terms. Unlikely to pivot toward simplicity. |
| Playnite Picker | **Medium** | Inside the launcher. Tech-user default on PC. | Platform-limited. Would need a cross-launcher hosted product to threaten us. |
| Steam Roulette | **Low** | Single-purpose, Steam-only, commodity. | Brand familiarity is the only asset. |
| Grouvee / GG / Backloggery / Infinite Backlog | **Low-medium** | Trackers, not pickers. | Watch for "pick one" features in their roadmaps. |
| PlayTracker | **Low** | Stats-first, different job. | Would have to pivot hard. Philosophically aligned on privacy but wouldn't copy our pick flow. |
| GameGenie / PlayNxt / Mood Twist | **Low** | Catalogue-broad; don't own the user's library. | Library import is the moat. |

---

## 5. Gaps we're filling that nobody else is

Honest read, not self-flattery.

- **Mood + time as the only two inputs, across owned library, across platforms.** Every competitor either picks from a catalogue (not owned) or scopes to one platform (usually Steam). Backlog Roulette is closest but Steam-only and paywalls time filtering.
- **Guest-mode-first, localStorage-authoritative, genuinely no-account pick flow.** Every tracker demands an account. Every Steam picker demands a public profile. We're the only product where a user can import, get a pick, and leave without handing over anything.
- **"Moved On" as a first-class exit.** No competitor treats abandoning a game as equal to completing it. Backloggd has "Abandoned" but it's framed as a failure shelf. We're alone in the loss-aversion framing.
- **Archetype + behavioral state used only for better picks, never for ad targeting or social surfacing.** PlayTracker is privacy-aligned but stats-focused. Trackers with recommendations use engagement, not a paralysis solver, as the goal.
- **Sub-60-second import → pick loop as the explicit success metric.** Nobody else has adopted "less time in our app = win" as a product axiom. Most competitors are measured on DAU/retention, which structurally pushes the other direction.

## 6. Gaps nobody fills (open white space)

With a thesis flag on each.

- **Couch / co-op pick flow for shared libraries (Family Sharing, PS Family, Xbox Home Console).** Nobody solves "we have 3 accounts, one couch, 20 minutes — pick one." Thesis-aligned if kept to 2 inputs + shared pool.
- **"Start here" onboarding for a specific owned game** (tiny tutorial-replacement card for long-paused games). Thesis-aligned — reduces the restart friction that keeps backlog games dead.
- **Launcher-side integration** (Steam overlay, Xbox Game Bar widget) that picks at the moment of paralysis without leaving the launcher. Feasibility is hard; thesis-aligned.
- **Time-aware auto-pick from calendar** ("you have 45 min before your meeting, here's a game that fits"). Requires calendar data — **breaks our privacy posture**, flag to not build.
- **Friend pick-trading** ("my friend picks for me tonight"). Social, fun, but **expands scope and introduces community moderation surface**. Thesis-risky; only if kept anonymous and ephemeral.
- **Physical library support** (GAMEYE territory — barcode/retro). Adjacent audience, thesis-aligned in principle but different import stack.
- **Subscription-library pick mode** (Game Pass, PS+ Catalogue, GeForce NOW). Pick from what's already included in what I already pay for. Thesis-aligned, high-leverage.

Against thesis (don't build even if tempting):
- Community lists, rankings, follows. Pulls time-in-app up, which is the wrong direction.
- Deal/wishlist surfacing on non-owned games. Already flagged in legal rules — purchase-driving based on behavior.
- Notifications to "come back and pick." Re-engagement contradicts the metric.

---

## 7. Reference / methodology

**Sources consulted (2026-04-20 scan):**
- backlogrouletteapp.com (WebFetch)
- whatshouldisteam.com (WebFetch)
- Search results citing: backloggd.com (+ Backloggd March 2026 dev update on Medium), grouvee.com (+ April 2026 update thread), backloggery.com, infinitebacklog.net, howlongtobeat.com, ggapp.io, playtracker.net, gameye.app, trueachievements.com, pickaga.me, steam-roulette.com, steamrandomizer.com, Playnite Random Game Picker docs + GitHub, Steam Discovery Queue docs, studentai.app/gamegenie, play.google.com PlayNxt, apps.apple.com Mood Twist, quanticfoundry.com recommendation engine.

**Methodology:** WebSearch across category-defining queries (random pickers, backlog trackers, AI game recommenders, launcher-native discovery). WebFetch on the two most thesis-adjacent competitors (Backlog Roulette, What Should I Steam). Triangulation via press coverage and community discussion threads (ResetEra, NeoGAF, Destructoid, Digital Trends, MakeUseOf).

**Known limits:**
- Did not create test accounts; feature depth for paid tiers inferred from landing copy and changelogs, not hands-on.
- AI-recommender landscape moves weekly; new entrants likely already exist.
- No traffic / user-count data — relative size of user bases is directional, not measured.
- Steam-adjacent tools dominate results; non-Steam pickers may be under-surfaced.
- Inventory Full's own usage data and Sentry telemetry not in scope here.
- Solo-builder weakness honestly: we have no marketing spend, no PR, no team — any of the funded-team competitors above (Backloggd, PlayTracker, Grouvee) can out-ship us on raw feature count. Our only durable edge is thesis discipline.
