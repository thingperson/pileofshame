# SEO Long-Tail Pages — Spec

**Date:** 2026-05-15
**Status:** Draft spec — ready for review
**Author:** Claude (research pass)

---

## Current SEO footprint

| URL | Primary keyword | Type |
|-----|----------------|------|
| `/steam-backlog-picker` | steam backlog picker | Platform landing |
| `/xbox-backlog-picker` | xbox backlog picker | Platform landing |
| `/playstation-backlog-picker` | playstation backlog picker | Platform landing |
| `/alternatives` | game backlog app alternatives | Comparison |
| `/why-deciding-is-hard` | why can't I decide what game to play | Psychology content |

**Gaps identified:**
- No content targeting the raw problem queries ("too many games," "can't decide what to play")
- No content targeting the solution queries ("how to clear gaming backlog," "best way to reduce backlog")
- No content for the Game Pass / PS Plus specific paralysis (subscription fatigue angle)
- No content for the "short games" / quick-win searchers who want tactical advice
- No content for the Nintendo/Switch audience (third largest console platform, no picker page)
- No content bridging the psychology page to actionable tactics

---

## Proposed pages (7 total, ranked by estimated impact)

### 1. `/cant-decide-what-to-play` — HIGH IMPACT

**Target keyword cluster:**
- "can't decide what to play" (primary)
- "what game should I play"
- "can't choose a game to play"
- "I don't know what to play"
- "what should I play tonight"

**Why this matters:** This is the highest-intent query in our category. Someone typing this is experiencing the exact problem we solve, right now, probably with a controller in reach. Reddit threads with this exact title get hundreds of replies. Every competitor targets "backlog" terminology, but the actual user query is often this plain-language frustration.

**Competition:** Low-medium. Reddit threads dominate. A few listicle sites. No purpose-built tool ranks well for this. We can own it with genuine content + a clear CTA.

**Content outline:**
- H1: "Can't decide what to play? Here's why, and what to do about it."
- Section: The scroll-and-close loop (recognize the pattern — 200 words)
- Section: Why this happens to everyone (choice overload in 3 paragraphs — 250 words, links to `/why-deciding-is-hard` for the deep dive)
- Section: Three things that actually work (constrain choices, decide on mood not game, treat quitting as progress — 400 words)
- Section: What Inventory Full does (the pitch — 150 words)
- CTA: "Pick my game" button
- Estimated total: ~1,100 words

**Internal links:**
- Links TO: `/why-deciding-is-hard` (deep psychology), `/alternatives` (if they want to compare tools), home (CTA)
- Links FROM: `/why-deciding-is-hard` should add a link to this page as the "what to do about it" companion

**JSON-LD:** Article + FAQPage (FAQ schema for "why can't I decide what to play?" / "how do I pick a game?" / "what game should I play tonight?")

---

### 2. `/how-to-clear-your-backlog` — HIGH IMPACT

**Target keyword cluster:**
- "how to clear gaming backlog" (primary)
- "how to reduce game backlog"
- "best way to tackle gaming backlog"
- "gaming backlog tips"
- "backlog management strategies"

**Why this matters:** This is the solution-seeking query. The person has already identified the problem and is actively looking for strategies. High commercial intent — they're ready to try a tool. Tons of blog posts and Reddit threads rank here, but most give generic advice ("make a list," "play shorter games"). We can differentiate with psychology-backed tactics and a tool that actually implements them.

**Competition:** Medium. Lots of blog content, but mostly shallow listicles. No tool-backed content page that turns the advice into a product demo.

**Content outline:**
- H1: "How to actually clear your gaming backlog"
- Section: Why the usual advice doesn't work (lists, spreadsheets, willpower — 200 words)
- Section: The real problem is deciding, not organizing (link to psychology — 200 words)
- Section: Five strategies that work (each ~150 words):
  1. Pick on mood, not title
  2. Time-box the audition (20-minute rule)
  3. Moving on counts as clearing
  4. Stop adding faster than you play
  5. Let something else pick for you
- Section: Where Inventory Full fits (150 words)
- CTA: "Start clearing" button
- Estimated total: ~1,200 words

**Internal links:**
- Links TO: `/why-deciding-is-hard`, `/alternatives`, home
- Links FROM: all platform picker pages could reference this as the "strategy" companion

---

### 3. `/game-pass-what-to-play` — MEDIUM-HIGH IMPACT

**Target keyword cluster:**
- "what to play on Game Pass" (primary)
- "best Game Pass games to play first"
- "Game Pass too many games"
- "Game Pass decision paralysis"
- "Game Pass backlog"
- "Game Pass leaving soon what to play"

**Why this matters:** Game Pass is the single biggest driver of library bloat in 2026. 500+ games, monthly rotation, "leaving soon" anxiety. This query has massive volume and seasonal spikes (every time new games drop). The existing `/xbox-backlog-picker` targets the platform but not the subscription-specific paralysis. Game Pass users are a distinct psychological profile: they didn't even buy most of their games, so the sunk-cost framing is different.

**Competition:** Medium-high. Gaming sites publish "best Game Pass games" lists constantly, but those are discovery content, not paralysis-reduction content. Nobody owns the "I have Game Pass and still can't pick something" angle.

**Content outline:**
- H1: "500 games on Game Pass. You've played six."
- Section: The subscription paradox (unlimited access makes choosing harder, not easier — 250 words)
- Section: The "leaving soon" trap (urgency that paralyzes instead of motivating — 200 words)
- Section: How to use Game Pass without drowning in it (mood-first, session-length-first, ignore the marketing rows — 300 words)
- Section: Inventory Full + Game Pass (Sub Shuffle feature, import, pick — 150 words)
- CTA: "Pick from Game Pass" button
- Estimated total: ~1,000 words

**Internal links:**
- Links TO: `/xbox-backlog-picker`, `/why-deciding-is-hard`, `/how-to-clear-your-backlog`, home
- Links FROM: `/xbox-backlog-picker` should cross-link

---

### 4. `/short-games-to-play` — MEDIUM IMPACT

**Target keyword cluster:**
- "short games to play" (primary)
- "games you can beat in one sitting"
- "quick games to clear backlog"
- "best short games"
- "games under 5 hours"
- "games to play when you don't have much time"

**Why this matters:** "Short games" is a massive search category. For our audience specifically, short games are the backlog-clearing quick wins that build momentum. The Amabile progress-principle research supports this: small wins compound. Users who clear one short game are more likely to tackle the next thing. This page bridges the gap between general "short games" discovery content and our specific backlog-clearing use case.

**Competition:** High for "best short games" (IGN, PC Gamer, etc. own this). Lower for "short games to clear backlog" and "games you can finish in one sitting." We don't try to out-list the gaming sites. We own the angle: short games as a backlog strategy, not a recommendation list.

**Content outline:**
- H1: "Short games are backlog medicine."
- Section: Why starting short works (progress principle, momentum, the 20-minute audition — 250 words)
- Section: What counts as short (HLTB tiers, the difference between "short" and "easy" — 200 words)
- Section: The strategy: clear two short ones, then tackle the big one (alternating pattern — 200 words)
- Section: How Inventory Full handles this (session length filter, "Almost Done" mode — 150 words)
- CTA: "Find a short game in your library" button
- Estimated total: ~900 words

**Internal links:**
- Links TO: `/how-to-clear-your-backlog`, `/why-deciding-is-hard`, home
- Links FROM: `/how-to-clear-your-backlog` references this as the tactical companion

---

### 5. `/nintendo-switch-backlog` — MEDIUM IMPACT

**Target keyword cluster:**
- "Nintendo Switch backlog" (primary)
- "too many Switch games"
- "Switch backlog picker"
- "what to play on Switch"
- "Switch eShop backlog"

**Why this matters:** Switch is the third major platform we don't have a dedicated page for. eShop sales are notorious for impulse buys (frequent deep discounts on indie games). Switch users have a distinct backlog shape: heavy on indies, lighter on 100-hour AAA games, lots of $2-5 impulse buys. Manual import via Playnite CSV or manual add covers the import path.

**Competition:** Low. Nobody targets "Switch backlog picker" specifically. Generic "best Switch games" lists dominate but don't serve the backlog audience.

**Content outline:**
- H1: "Your Switch library has 200 games and you're replaying Breath of the Wild."
- Section: The eShop sale problem (cheap games accumulate faster than any other platform — 200 words)
- Section: Switch backlogs are different (mostly indie, shorter, more variety — 200 words)
- Section: How to work through it (the same mood + session-length framework, applied to Switch's strengths — 250 words)
- Section: Using Inventory Full with Switch (manual add, Playnite CSV, RAWG search — 150 words)
- CTA: "Add your Switch games" button
- Estimated total: ~900 words

**Internal links:**
- Links TO: `/how-to-clear-your-backlog`, `/short-games-to-play`, home
- Links FROM: `/alternatives` could mention Switch support

---

### 6. `/pc-game-backlog` — MEDIUM IMPACT

**Target keyword cluster:**
- "PC game backlog" (primary)
- "too many PC games"
- "PC gaming backlog management"
- "Steam Epic GOG backlog"
- "multi-launcher backlog"

**Why this matters:** PC gamers have the worst backlog problem of any platform because they accumulate games across multiple storefronts (Steam, Epic free games, GOG, Humble Bundle, Game Pass PC). The multi-launcher angle is underserved. Existing Steam-specific pages don't address Epic free game hoarders or the GOG-DRM-free collector. This page targets the platform-agnostic PC gamer who has games everywhere.

**Competition:** Low-medium. "Steam backlog" is well-contested but "PC game backlog" (multi-launcher) is underserved.

**Content outline:**
- H1: "Steam, Epic, GOG, Game Pass. Your PC backlog lives in four places."
- Section: The multi-launcher problem (each store has its own library, its own sales, its own free games — 250 words)
- Section: Epic's free games made it worse (200 words)
- Section: Why Playnite / GOG Galaxy don't solve the actual problem (they unify the list but the list is still 500 games — 200 words)
- Section: How Inventory Full handles multi-launcher (Steam API import, Playnite CSV for everything else, manual add with RAWG search — 200 words)
- CTA: "Import your PC library" button
- Estimated total: ~950 words

**Internal links:**
- Links TO: `/steam-backlog-picker`, `/how-to-clear-your-backlog`, `/alternatives`, home
- Links FROM: `/steam-backlog-picker` could cross-link for users with multi-launcher setups

---

### 7. `/gaming-decision-fatigue` — LOWER IMPACT (long-term authority play)

**Target keyword cluster:**
- "gaming decision fatigue" (primary)
- "decision fatigue gaming"
- "choice overload gaming"
- "too many choices in games"
- "paradox of choice gaming"

**Why this matters:** This is the academic/content-marketing play. Lower search volume than the tactical queries, but high authority-building potential. Targets the user who's read about decision fatigue generally and is looking for the gaming-specific application. Complements `/why-deciding-is-hard` (which is more narrative) with a more research-forward framing. Good for backlinks from gaming journalism and psychology-adjacent content.

**Competition:** Low. This exact intersection (decision fatigue + gaming specifically) has minimal dedicated content. Psychology sites cover decision fatigue generally. Gaming sites don't use the research terminology.

**Content outline:**
- H1: "Decision fatigue is why you can't pick a game."
- Section: What decision fatigue actually is (Baumeister, ego depletion, the "choosing after choosing" problem — 300 words)
- Section: Why gaming is a perfect storm for it (evening timing, leisure-choice paradox, library size — 250 words)
- Section: The subscription multiplier (Game Pass, PS+, bundles — 200 words)
- Section: What the research says helps (constrain options, externalize the decision, reduce stakes — 300 words)
- Section: How we built Inventory Full around this (brief product tie-in — 150 words)
- CTA: subtle, end-of-article
- Estimated total: ~1,300 words

**Internal links:**
- Links TO: `/why-deciding-is-hard`, `/cant-decide-what-to-play`, `/how-to-clear-your-backlog`, home
- Links FROM: `/why-deciding-is-hard` should cross-link as the "research deep-dive" companion

---

## Pages selected for full draft

Based on impact, search intent alignment, and conversion potential:

1. **`/cant-decide-what-to-play`** — Highest-intent query. Someone typing this is our exact user, right now.
2. **`/how-to-clear-your-backlog`** — Highest-volume solution query. Converts the "I know I have a problem" searcher into a user.

These two cover the top of the funnel (problem awareness) and the mid-funnel (solution seeking), both funneling to the app.

---

## Implementation notes

- All pages follow the existing pattern: inline styles, `var(--color-*)` tokens, 42rem max-width article layout, JSON-LD, canonical URLs
- All pages get added to `app/sitemap.ts`
- Cross-linking from existing pages is a separate task (flagged in each spec above)
- No images required for V1 (Pip illustrations could be added later like `/why-deciding-is-hard`)
- FAQ schema on `/cant-decide-what-to-play` is a SERP feature play for featured snippets
