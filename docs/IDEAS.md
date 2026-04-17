# Ideas & Brainstorm Dump

Running list of ideas, rambles, and half-formed thoughts. Gets synthesized into proper specs when actionable.

---

## Active Ideas (ready to spec or build soon)

### ~~HLTB Progress Inference & Nudges~~ — SHIPPED ✅
The data already exists (hoursPlayed + hltbMain). We just need to tell stories with it.

**Display layer:**
- "~3 hours to finish" on cards where remainingHours < 5
- Progress percentage in Jump Back In cheat sheet (already exists there)
- "Closest to Done" sort option in backlog

**Nudge types (in-app only, not push):**
- "Pick up where you left off" — stalled game card, 1 per session, rotates
- "You're right there" — games at 85%+ completion, highlight in backlog
- "Quick win" — short games already started, under 5h remaining
- "Did you finish this?" — games at 130%+ HLTB, might be done but not marked

**Edge cases Brady identified:**
- Final boss collectors: leave game right before end to collect everything. Nudge is perfect here.
- Multi-character playtime: 3 chars x 15h ≠ 45h progress on a single playthrough. Can't detect, but if they respond to nudge great, if they dismiss we back off.
- Games with unreliable HLTB: some sandbox/RPG times are wildly variable. Use a confidence threshold — if hltbMain is > 60h, the estimate is less precise.

**"Did you finish this?" prompt (85%+ HLTB) — copy direction:**
- If they say YES: "Wait, you actually got through it? That's an impressive win! You finished faster than most." → auto-mark as Cleared, trigger celebration
- If they say NO: "Well that's great news — you only have around ~Xh left. That's a win in the bank. You're so close." → offer to move to Now Playing

**Dismiss behavior:**
- Dismiss 1x: skip this session
- Dismiss 3x for same game: stop nudging about it (not the same as ignoring)
- Reset available from game detail

### ~~PS+ Sub Shuffle~~ — SHIPPED ✅
We know:
- `psn-api` returns `membership: "PS_PLUS"` field on each game
- Users tell us their tier (Essential / Extra / Premium)
- We can see which monthly games they've claimed
- We can deduce catalog access from tier + claimed games

**PS+ Catalog API (researched April 2026):**
- Endpoint: `https://web.np.playstation.com/api/graphql/v1/op` (same base URL psn-api uses)
- **NO PSN auth needed** — public endpoint, just needs sha256Hash + locale header
- Header: `x-psn-store-locale-override: en-US`

Category UUIDs:
- `3a7006fe-e26f-49fe-87e5-4473d7ed0fb2` — PS Plus Game Catalog (all games, ~250-300 titles)
- `05a2d027-cedc-4ac0-abeb-8fc26fec7180` — Game Catalog (all games)
- `038b4df3-bb4c-48f8-8290-3feb35f0f0fd` — PS Plus (general)

Operations:
- `categoryGridRetrieve` — browse catalog by category UUID
  - variables: `{ id: "<UUID>", pageArgs: { size: 24, offset: 0 }, sortBy: { name: "productReleaseDate", isAscending: false } }`
  - sha256Hash: `4ce7d410a4db2c8b635a48c1dcec375906ff63b19dadd87e073f8fd0c0481d35`
- `featuresRetrieve` — tier-specific content
  - TIER_10 = Essential, TIER_20 = Extra, TIER_30 = Premium
  - sha256Hash: `010870e8e9269c5bcf06b60190edbf5229310d8fae5b86515ad73f05bd11c4d1`

Risk: sha256 hashes can rotate. Hashes have been stable since PS Store redesign (2020+). If broken, refresh from browser DevTools on store.playstation.com.

References:
- `mrt1m/playstation-store-api` (GitHub) — PHP wrapper with Postman collection, all hashes
- `store.playstation.com/en-us/category/3a7006fe-e26f-49fe-87e5-4473d7ed0fb2` — live page
- `platprices.com/developers.php` — third-party alternative API
- `olegshulyakov.github.io/psn-swagger/` — community swagger docs

**Implementation:**
- Build `/api/psplus/route.ts` mirroring the Game Pass catalog route
- No auth needed — simpler than Game Pass route
- Add tier selector to PS import or settings
- Cross-reference catalog against user's library
- Filter Sub Shuffle to show games available on their tier
- Parity with Game Pass browse experience

### Sub Shuffle Logo Fix
Current platform logos on Sub Shuffle button are generic/tiny. Options:
- Use official Xbox Game Pass and PlayStation Plus logos (check trademark usage for web apps)
- If not allowed: stylized text badges "GP" / "PS+" in brand colors
- Size up to at least 20x20px, currently unreadable

---

## Parking Lot (interesting but not urgent)

### "Why did I stop?" Quick-tap on Stalled Games
When a stalled game surfaces, offer one-tap reasons:
- Got distracted / Hit a wall / Lost interest / Waiting for something / Too long
Powers smarter future nudges and self-insight stats.

### Weekend Mode
Weekend detection (Sat/Sun) → suggest longer games, deeper cuts. Currently time-of-day is wired but day-of-week isn't.

### Completion Streaks (light, not gamified)
"You've cleared 3 games this month" — stated as fact, not as a score to chase.
Anti-pattern: no streak counters, no "don't break your streak" guilt.

### Series Detection
If user owns Dark Souls 1, 2, and 3 — suggest playing in order.
Requires RAWG series data or manual mapping.

### ~~"Almost Done" Reroll Mode~~ — SHIPPED ✅
Filters to games within 20% of HLTB completion. Live in reroll modal.

---

## UX Feedback (April 6, 2026 PDF review)

Captured from Brady's feedback document (April 6, 2026 PDF).

### 1. Tab auto-follow on game move ✅ SHIPPED
Tabs auto-switch to destination after moving a game. Nudge actions also switch tabs.

### 2. Stalled game nudge button confusion ✅ SHIPPED
Added "Move this game to:" label above action buttons.

### 3. List view title truncation ✅ SHIPPED
Platform badge hidden on mobile (< sm breakpoint). Full platform info visible in expanded details and on desktop.

### 4. After tab switch disorientation ✅ SHIPPED
Nudge cards now only show on the Backlog tab, not on destination tabs.

### 5. Now Playing cap ✅ SHIPPED
NOW_PLAYING_CAP = 3 enforced across all entry points: moveGameForward, Reroll, StalledGameNudge, FinishCheckNudge, JustFiveMinutes, and playAgain. Cap message shown in Now Playing tab when full.

### 6. "Playing" tab label ✅ SHIPPED
Mobile short label changed from "Playing" to "Now" in TabNav.

### 7. Sample library banner auto-dismiss ✅ SHIPPED
Banner auto-dismisses after first game action (move forward/back). Also dismissed when sample library is cleared or replaced by import.

### 8. Library status indicator ✅ SHIPPED
Subtle pill below header showing library state: "Sample Library" (purple), "Synced as [name]" (green), or "Your Library - not synced" (dim). Uses colored dot indicator.

### 9. Search no-results inline ✅ VERIFIED
Already positioned correctly. No-results message and add prompt appear immediately below search indicator, not below game cards.

### 10. + button removed, merged into search ✅ SHIPPED
Standalone + button removed from header. A + icon now appears inside the search bar when expanded, opening the Add Game modal. Reduces header clutter.

### 11. Import emoji labeling ✅ SHIPPED
Button shows emoji on mobile, "📥 Import" on desktop. Title attribute provides tooltip.

### 12. Search-to-add merged ✅ SHIPPED
+ button removed. Search now handles both finding existing games and adding new ones. "+ Add manually" icon appears when search is expanded.

### 13. Grid/list toggle placement ✅ SHIPPED
ViewToggle now appears at top of game list (next to sort controls) as well as at the bottom.

### 14. "Inventory Full" header clickable ✅ SHIPPED
Header click resets to Backlog tab and scrolls to top. /about page built for landing content access.

### 15. Return to landing page ✅ SHIPPED
/about route created with landing page content (no import CTAs). "About" link in bottom nav bar. "Open App" button links back to /.

### 16. Stats page discoverability ✅ SHIPPED
Stats button (📊) now visible in header on mobile, not just desktop.

### + Landing page sign-in affordance ✅ SHIPPED
"Already have an account?" + AuthButton added to landing page hero. Returning users can sign in directly without re-importing.

---

## Bug Fixes (April 6, 2026 — ongoing notes PDF)

### 1. "Closest to Done" sort showing A-Z ✅ FIXED
Sort fell through to alphabetical tiebreaker when games lacked HLTB data (common during enrichment). Now uses 4-tier sort: games with HLTB+progress (by remaining hours) > games with playtime only (by most hours) > games with HLTB only (short games first) > A-Z fallback.

### 2. Theme picker inconsistent close ✅ FIXED
Clicking a theme updated the theme but did not close the settings menu. Backdrop clicks closed it, button clicks didn't. Now closes on theme selection.

### 3. Sample banner "Clear" wiped library ✅ FIXED
"Clear" button on sample library banner was calling `setState({ games: [] })`, sending user to landing page. Renamed to "Dismiss" and now just hides the banner. The auto-dismiss-on-first-action behavior still works too.

### 4. iOS Home Screen icon too small ✅ FIXED
Source image `if-icon.png` has massive internal padding. PWA icons (192px, 512px) were rendering the full padded image. Cropped to center artwork and regenerated at correct sizes. Apple-icon also scaled up to crop padding.

**Note:** For a permanent fix, the source `if-icon.png` should be re-exported from DALL-E or edited to fill the full 1024x1024 frame without padding. Current fix crops the existing image.

### 5. Just 5 Minutes card crammed into button row ✅ FIXED
Game suggestion card was rendering inline inside the horizontal scroll mode button row, causing it to appear crammed/overlapping. Card now renders as a bottom-sheet overlay (matching the Reroll modal pattern) while the button stays in the row.

### 6. Reroll suggesting same game repeatedly ✅ FIXED
PowerWash Simulator appeared 6/20 rolls because the engine only applied a 0.2x weight penalty to skipped games but didn't track or exclude previously shown games. Now tracks all shown games per session and excludes them from future picks. When the entire eligible pool has been shown, displays "You've seen all X games in this category." Shown tracking resets on mode switch and session start.

---

## UX Feedback (April 7, 2026 — Visual Density Pass)

Brady flagged that nudge cards and import summary consume too much viewport real estate, disconnecting users from their library and current tab.

### 1. Nudge cards too tall — collapse by default
**Problem:** "Pick up where you left off" and "Did you finish this?" each take a full viewport of space. Stacked together they push the actual game library completely off screen.
**Fix:** Render as compact header (icon + title only), click to expand. Still visible, still actionable, but ~40px tall instead of ~200px. Dense page = good problem to have, but solve with progressive disclosure.

### 2. Import summary should be a one-time modal
**Problem:** The "39 games imported" card persists as an inline card, eating real estate every session.
**Fix:** Show as a centered modal/popup on import completion. User reads it, clicks "Got it", never sees it again. Store dismissal in localStorage.

### 3. Re-import handling
**Question:** When a user imports again (adding to existing library), the summary should sound different. "12 new games added to your library" vs "39 games imported" — the first import is a fresh start, subsequent imports are additions. Detect existing library size and adjust copy.

### 4. Info density sweep (recurring practice)
Add to review cadence: periodic visual density audit. Flag screens where information competes for attention, recommend collapsible sections, progressive disclosure, or removal. Brady audits visually, Claude flags code-side density issues.

---

## Icon Generation Strategy (April 7, 2026)

### Current state
- DALL-E icons look great at large sizes but are illegible below ~36px
- Too much illustrated detail for emoji-scale usage (14-32px)
- Emojis still outperform at small sizes due to bold silhouettes and high contrast
- Decision: keep emojis on production, continue icon experiments on `icon-preview` branch

### What we need for small-scale icons
- **Flat, bold silhouettes** — not illustrated scenes
- **2-3 colors max** — single shape with one accent
- **No fine detail** — test every icon at 16px before accepting
- **Think SF Symbols / Material Icons** — geometric, not artistic
- **Transparent backgrounds** — mandatory

### Tool options to explore
- **DALL-E (current)**: Great for larger illustrations, struggles with icon constraints. Context drifts, doesn't self-test at target sizes.
- **Google Gemini / Imagen 3**: Worth testing — may handle geometric/flat constraints better. Free tier available.
- **Midjourney**: Strong at flat/vector styles with `--style raw` flag. Paid only.
- **Recraft.ai**: Specifically designed for icon/logo generation. Free tier. Best bet for this use case.
- **Figma + manual**: Design flat icons manually using geometric primitives. Most control, most effort.
- **SVG icon libraries (Lucide, Phosphor, Heroicons)**: Free, already optimized for small sizes. Could tint/customize. Fastest path to good small icons.

### Recommendation
Try Recraft.ai or an SVG icon library (Phosphor/Lucide) as alternatives. If neither hits the brand feel, manual Figma work gives full control. Keep DALL-E icons for larger surfaces (theme banners, celebration screens, marketing).

---

## Native Mobile App Planning (April 7, 2026)

### Current state
- Web app is responsive and mobile-optimized (375px+ tested)
- PWA manifest exists with home screen icons
- Primary use case is already mobile (phone in hand, sitting in front of console)

### Path to native (rough priority order)

#### Phase 1: Enhanced PWA (lowest effort, no app store)
- Add service worker for offline library access
- Push notification support (with explicit consent per legal rules)
- Better install prompt UX
- Cache game data and cover art for offline browsing
- This might be "enough" — test with real users first

#### Phase 2: Capacitor/Expo wrapper (medium effort, app store presence)
- Wrap the existing Next.js app in Capacitor (Ionic) or build with Expo
- Gets you on App Store and Google Play with minimal rewrite
- Capacitor: keep the web codebase, add native shell
- Expo/React Native: more rewrite but better native feel
- Requires Apple Developer account ($99/yr) and Google Play Console ($25 one-time)

#### Phase 3: Full React Native rewrite (high effort, best experience)
- Only if Phase 2 feels too janky
- Share business logic (stores, API calls) but rewrite all UI components
- Native navigation, haptics, animations
- 3-6 month project for a solo builder

### Key decisions (not yet made)
- Is PWA sufficient for the target audience? (gamers tend to prefer native apps)
- Which platform first? (iOS likely, given the user base and PWA limitations on iOS)
- Revenue model in app stores? (free with no IAP initially, same as web)
- Does the app need to work offline? (library browsing yes, import/enrichment no)

### What changes on web that affects native planning
- Keep state management in Zustand (portable to React Native)
- Keep API routes as separate endpoints (reusable from native client)
- Avoid web-only patterns where possible (CSS-heavy animations → consider alternatives)
- localStorage works in both web and Capacitor; would need AsyncStorage for React Native

---

## Base Font Size Review (April 7, 2026)

Brady reports the app feels better at 110-125% browser zoom. This suggests our base sizing runs small for the target audience (25-40 year old gamers, often on laptops).

### Observations
- No base font-size set on body (inherits browser 16px default)
- Heavy use of `text-xs` (12px) and `text-[10px]` throughout — especially in the reroll modal, mood pills, and mono labels
- Mobile is the primary use case where 12px text is even harder to read on small screens
- The reroll modal is the most text-dense surface and the most impacted

### Proposed approach
- Bump smallest text from 10px → 12px and 12px → 13-14px across the app
- Keep `text-base` (16px) and `text-lg` (18px) as anchors for primary content
- Do this as a dedicated typography pass, not piecemeal
- Test on actual mobile device at native zoom before shipping

---

## PageSpeed Performance Fix (April 7, 2026)

**Score: 61 mobile** (98 accessibility, 100 best practices, 100 SEO)

### The problem: 5MB of unoptimized PNGs on the landing page

| Image | File | Current Size | Displayed At | Est. Savings |
|-------|------|-------------|-------------|-------------|
| Landing BG | `IF-landing-BG.png` | 1,753 KB | CSS background | ~1,497 KB |
| Hero illustration | `inventoryfull-hero-transparent.png` | 1,702 KB | 336x224px | ~1,690 KB |
| Logomark | `inventoryfull-logomark.png` | 1,544 KB | 56x56px | ~1,543 KB |

**LCP is 27 seconds** because `IF-landing-BG.png` is the LCP element — 1.75MB loading over slow 4G.

### Fix list (priority order)

1. **Convert all 3 PNGs to WebP** — ~80% size reduction with no visible quality loss
   - `sips` can't do WebP, use `cwebp` (install via `brew install webp`) or Python Pillow
   - Or use Next.js `<Image>` component which auto-converts to WebP

2. **Resize to actual display dimensions**
   - Hero: source is 1536x1024, displayed at max 288px wide → resize to 576x384 (2x for retina)
   - Logomark: source is 1024x1024, displayed at 56x56 → resize to 128x128 (2x for retina)
   - BG: keep larger but compress aggressively (quality 60-70)

3. **Add `fetchpriority="high"` to LCP image** — the BG is loaded via CSS `background-image` which the browser discovers late. Either:
   - Add a `<link rel="preload" as="image" href="/IF-landing-BG.webp">` in `<head>`
   - Or switch from CSS background-image to a Next.js `<Image>` with `priority`

4. **Add `width` and `height` to hero image** — prevents CLS (currently flagged)

5. **Add `<link rel="preconnect" href="https://o4511175748419584.ingest.us.sentry.io">` in layout.tsx** — saves ~310ms on Sentry connection

6. **Render-blocking CSS** (300ms savings) — the main CSS chunk blocks render. Consider inlining critical CSS or using `media="print"` trick. Lower priority.

### Expected result
These fixes should take performance from **61 → 85+** on mobile. The image optimization alone accounts for ~4.7MB savings which fixes LCP, Speed Index, and total payload.

### What's fine (don't touch)
- TBT: 100ms (good)
- CLS: 0 (perfect)
- JS bundle size: reasonable for a React app
- 3rd party impact: minimal (GA4 153KB, Sentry 1KB)

---

## Gemini Feedback Analysis (April 7, 2026)

External feedback reviewed from `notes/feedback.txt`. Gemini positioned the app as a "gaming companion" vs. a "tracker" and identified the Jump Back In feature as the strongest USP. Key takeaways below, sorted by actionability.

### Take action on (quick wins)

1. **Share card on completion ("Loot Receipt")** — Generate a themed image in the celebration modal: game name, time spent, $ reclaimed. We already have a stripped `/api/share-card` in the codebase. Turn user wins into organic marketing. 2-3 hours.

2. **PWA install prompt** — ✅ SHIPPED (Apr 8). Settings menu, uses beforeinstallprompt API.

3. **Bail animation** — ✅ SHIPPED (Apr 8). 300ms scale-down + fade.

4. **User avatar squish on mobile** — ✅ FIXED (Apr 8). shrink-0 + gap-0 + min-h-[44px].

### Consider for next sprint

5. **"Inventory Weight" visualization** — Grid subtly shifts (opacity, saturation) as cleared-to-total ratio improves. Low effort, reinforces the "Inventory Full → Inventory Clearing" narrative.

6. **Themed share "Postcards"** — Share cards that match the active theme. The 90s theme card looks different from Void. Medium effort, great marketing.

7. **Jump Back In expansion** — Current static tips work. Next step: manually curate "verified" re-entry packs for top 50 most-imported games (controls, story-so-far, last major milestone). Not AI-generated yet. Build the format, prove the value, then consider automation.

### File for later (not now)

8. **Push notifications** — Already roadmapped in Phase 5. Needs service worker + consent. Not quick.

9. **Full RAG-based recap pipeline** — Gemini's proposed architecture (vector DB + SLM inference + Redis cache + milestone gating) is sound but massively over-scoped for a solo dev. This is a Phase 7+ feature if we get funding or a team. Keep the architecture notes in case we get there.

10. **Community-submitted re-entry tips** — Content moderation nightmare. Way too early.

11. **"Hype Mode" soundscape** — Audio in web apps is almost always annoying. Pass.

### Key framing from Gemini worth keeping

- "No other tool bridges the 30-second hesitation where a user decides to either play or watch Netflix." — Good positioning language for marketing.
- "Bailing is a victory, not a failure" — They noticed our brand. Good signal.
- "The app should not become a new backlog item" — They echoed our anti-overgamification stance without us saying it. The brand is landing.
- Competitors (Backloggd, Stash, Playnite) solve "What do I own?" We solve "What should I play right now?" — Clean differentiator for copy.

---

## ChatGPT Feedback Analysis (April 7, 2026)

External critique from ChatGPT after reviewing the live landing page, privacy/terms pages, and product disclosures. Could not access inner app screens. Sharper on strategy/positioning than feature specifics.

### Already built (ChatGPT didn't know)

- **"Why this pick?" explanation chips** — Already shipped. Every reroll shows pick reasons ("fits your mood," "short enough for tonight," "high metacritic," etc.).
- **Skip reasons that train the engine** — Already shipped as V3 #4 (skip feedback pills: not-in-mood, too-long, played-recently, hit-a-wall, not-interested). Feeds back into weights.
- **"Continue mode" / resume suggestions** — Already built: Stalled game nudge, "Pick up where you left off?" cards, "Almost Done" reroll mode.
- **Ongoing/Endless status** — We handle this via `isNonFinishable` flag. Auto-detected for MMOs, sandboxes, multiplayer-only. These games never show "Did you finish?" nudges.

### Strong strategic points worth keeping

1. **"The promise is clearer than the product shape."** — Landing sells "instant game choice" but the actual product is broader (stats, archetypes, nudges, deals, catalog). The story needs to stay focused on the core wedge even as features grow. Action: keep the "decide what to play now" framing primary in all copy.

2. **"Sample demo should be the star, not the sidekick."** — ✅ ADDRESSED (Apr 8). GetStartedModal flipped: import/sample now above the fold, auth below divider. Sample data auto-opens reroll picker so users hit the core loop instantly.

3. **"Monetization is fuzzy."** — Fair. Free app + affiliate deals on owned games is thin commercially. No immediate action needed (pre-revenue), but worth thinking about as we grow.

4. **"No sign-up" vs "already have an account?" split-brain** — ✅ ADDRESSED (Apr 8). GetStartedModal reordered: action-first (import/sample) above fold, auth below "want to sync across devices?" divider. Clear progression: start local → optionally sync.

5. **"The moat is the engine, not the tracking."** — Direct quote: "the moat has to become: this is the fastest and most trusted way to decide what to play from what I already own." Agree. Everything else is infrastructure for that one moment.

### Ideas worth considering

6. **Readiness filters** — Installed, supports controller, Deck verified, local co-op, low setup friction. Some of this data is available from Steam/RAWG. Would add meaningful signal to reroll without much UI complexity. Good candidate for a future enrichment pass.

7. **Checkpoint notes / "where was I?"** — Simpler than the full AI recap Gemini proposed. Just let users write 1-2 lines ("last goal," "controls reminder") on any game. We already have a notes field on GameCard. Could surface the note in the "Jump Back In" section. Low effort, high value.

8. **Better sample experience** — Partially addressed (Apr 8). Sample data now auto-opens reroll picker after 800ms, so users immediately experience mood → pick → game card. Still worth considering: pre-set moods, instant "here's why" on first pick, guided mini-tour.

### Filed / disagree

9. **"Scope drift" warning** — Partially valid. The feature surface has grown. But most of it (stats, archetypes, nudges) serves the core decision loop. We're not drifting into social/reviews/news territory. The anti-overgamification stance keeps us honest.

10. **Import fragility concerns** — Real risk, but already mitigated (retry logic, error handling, Sentry monitoring). Worth watching but not actionable right now.

11. **"Competitor clonability"** — True of any product at this stage. The defense is velocity + taste + engine quality, not features-as-moat.

---

## ChatGPT Feedback Round 2 (April 8, 2026)

Second review, this time from actual screenshots. Much sharper than the first round. Full product critique across design, strategy, competitor, and investor lenses.

### Bugs to fix

1. **Import summary math omits Now Playing** — ✅ FIXED (Apr 8). Added Now Playing row to PostImportSummary.

2. **Enrichment progress messaging unclear** — ✅ FIXED (Apr 8). Now says "Fetching art, descriptions & play times..."

3. **Landing page "Zero decisions" is overpromising** — ✅ FIXED (Apr 8). Changed to "Three steps. We do the hard part."

### Design improvements worth considering

4. **Stats confidence framing** — "$22,018 untapped library value" and "11,822 hours to clear" are engaging headlines but feel fake-precise. Add "estimated" qualifier or confidence note closer to the number, not just in fine print.

5. **Auto-classification review** — When import guesses "completed" or "now playing" from playtime, there's no way to review those guesses after dismissing the import summary. Consider a one-time "Review our guesses" flow or a persistent link in settings.

6. **Chip state clarity** — Selected, hover, inactive, disabled states on mood pills and mode buttons could be more visually distinct. Some look disabled when they're actually selectable.

7. **Enrichment progress context** — Show which batch is being enriched and what it means. "Getting cover art, descriptions, and play times from RAWG and HLTB" is clearer than "Enriching."

### Strategic takeaways (worth remembering)

- **"The moat is trustworthy recommendation behavior plus brand voice."** Both AI reviewers independently arrived at this. The decision engine + tone is the defensible part, not the feature surface.
- **"Play initiation engine, not backlog app."** Best single-line positioning from either review. Consider adopting this framing.
- **"Reduce ambiguity, not add surfaces."** Next design phase should tighten the core loop, not expand it.
- **Default theme = canonical face.** Keep weird/retro themes as unlocks/options, but always demo/screenshot in the default dark theme.
- **"Product character is rarer than polish."** Nice validation that the voice and attitude are landing.

### Already built (ChatGPT suggested, didn't know we had)

- "Why this pick?" explanation chips — shipped
- Skip reasons that train engine — shipped (V3 #4)
- Resume intelligence — stalled game nudge + Almost Done + Keep Playing mode
- Ongoing/Endless status — isNonFinishable auto-detection
- Full ranking system — mood, time, metacritic, skip history, genre fatigue, behavioral learning, energy

### Filed for later

- Readiness filters (installed, controller-friendly, Deck verified) — good idea, needs platform data we partially have
- "Leaving soon" subscription intelligence — neither GP nor PS+ expose departure dates via API
- Commitment loop with reminders — Phase 5 (push notifications)
- Status inference provenance system — overkill for current stage, revisit at scale

## ChatGPT Feedback Round 3 — Detail Page (April 8, 2026)

Review of game detail page screenshots. Sharpest feedback yet. Core insight: the detail page is where trust lives or dies.

### Fixed immediately

1. **Slay the Spire Jump Back In tips** — Genre fallback gave RPG advice ("check your quest log") for a roguelike deckbuilder. Added game-specific tips. This is the exact "trust bug" ChatGPT warned about. If users catch one wrong tip, they question everything.

### Worth acting on

2. **Notes box prompts** — ✅ SHIPPED (Apr 8). Contextual placeholders by status: "Where did you leave off?" for playing, "Anything to remember before starting?" for on-deck, etc.

3. **Action taxonomy cleanup** — ✅ SHIPPED (Apr 8). Removed Shelf/Session dropdowns entirely. Renamed "Ignore" → "Don't suggest", "Remove" → "Delete from library". Cleaner mental model: status chip, bail, don't suggest, delete.

4. **"Give up on this one" softening** — ✅ SHIPPED (Apr 8). Default label now "Not for me". Toast copy stays punchy.

5. **Content provenance labels** — Tiny labels like "Critic score", "Community rating", "Estimated time", "Auto-tagged" would improve trust. Users should know where data comes from.

6. **Store description too raw** — Game descriptions are raw RAWG paste. Could be shorter, more human. But manual curation doesn't scale. Consider truncating more aggressively (150 chars max?) with "read more" expand.

### Strategic alignment

- **"Never show game-specific guidance unless you can justify it."** A dumber but honest version beats a clever fake one. This applies to all AI/auto-generated content in the app.
- **"The winning version is the most believable, useful bridge between owning a game and actually playing it."** Third reviewer to independently arrive at "bridge between owning and playing" as the core value prop.
- **"Trust is a feature."** Content quality directly impacts recommendation credibility. One wrong Jump Back In tip undermines the whole engine.

### Filed

- On Hold / Paused / Archived status nuance — interesting but adds complexity. Current bail + ignore covers the emotional range.
- User-authored checkpoint templates — already possible via notes field, but structured templates could help
- Resume friction score — interesting but hard to compute without more data
- "Leaving soon" subscription alerts — still blocked by API limitations

---

## Smart Re-Entry System (April 8, 2026 — strategic thinking)

The Jump Back In tips are static and genre-based. The next evolution is **personalized re-entry intelligence** that actually knows where the user is in a game.

### The tension with user notes
Personal notes help US know where they are, but our target user won't do it. Writing "I just beat the fire boss" after a session is friction. If the app requires homework to stay useful, the rational move is to never use the app. Notes should exist (they do) but can't be load-bearing.

### Notes as community data (crowdsourced enrichment)
The fraction of users who DO write notes could inform everyone else. "Last thing I remember: the fire temple" from 50 users at ~20 hours of playtime tells us something about where ~20h players are in that game. This creates a **network effect**: app gets richer the more people use it.

**Data quality challenges:**
- Pollution: bad/joke/spoiler notes overwriting good data
- Conflicting info: different users at same playtime in different places (multiple paths, DLC, etc.)
- Provenance: need to weight quality (notes from users who completed > notes from users who bailed)
- Output safety: never surface spoilers or wrong-game info

### Smart re-entry prompts (minimum viable questions)
Instead of asking users to journal, ask the **least number of questions** to determine where they are:

1. Look at their playtime vs HLTB data to estimate rough progression
2. Ask one question: **"What's the last thing you remember happening?"** (free text or multiple choice from known milestones)
3. Use that to output the most useful advice: controls reminder, next objective hint, "you were about to..."

This could work for the verified top-50 titles first. Each game gets a **milestone map**: key story beats at approximate hour marks. User's playtime + one answer = localized tips.

### What this ISN'T
- Not a wiki. Not GameFAQs. Not a walkthrough.
- It's a **30-second re-orientation**: "Oh right, I was in the fire temple and I need the hookshot. Left trigger to aim."
- The goal is removing the friction of "I don't remember where I was" that keeps people from reopening a game.

---

## Share Card Strategy (April 8, 2026 — strategic thinking)

### The problem with static share cards
We built share cards before and shelved them. Static PNGs are generic, look the same for every user, and don't convert. Nobody runs to Discord to paste a card that looks like everyone else's.

### What makes someone actually share
- **Self-expression, not reporting.** The card should feel like the user is saying something about themselves, not filing a status update.
- **Novelty and whimsy.** Voice and personality in the card copy. Not "Game Completed" but "Finally done after 3 years in the pile."
- **Composable / user-curated.** The user CHOOSES what to show. Composing the card makes it precious. Checkboxes for what to include, not a fixed template.
- **Unique enough to not feel duplicative.** If everyone's card looks the same, sharing fatigue hits fast (Spotify Wrapped problem).

### What makes the VIEWER click through
- The card should make the viewer think about THEIR pile. "I've been meaning to play that too."
- Clean CTA on the landing page: "What's in YOUR pile?"
- The URL itself should be clean and tweetable: `inventoryfull.gg/clear/abc123`

### Data points users might want to share (all opt-in via checkboxes)
- **Time in the pile**: "Finally cleared after 3 years" (purchase/add date vs completion date)
- **Dollar value reclaimed**: "$70 of value recovered, $324 total reclaimed" — makes the pile tangible
- **HLTB comparison**: "Cleared Elden Ring in 10 fewer hours than average (I probably missed some good items)"
- **HLTB exceeded**: "Took 20 more hours than most — I explored every corner"
- **Backlog remaining**: "47 games left. The pile trembles."
- **Comfort game departure**: "Stopped playing Stardew Valley for 3 weeks because I was exploring new games" — measuring behavioral change
- **Total cleared count**: "Game #12 cleared this year"
- **Game cover art** as card background (blurred/tinted)
- **Display name** (opt-in, default anonymous)

### Implementation: Dynamic OG images
Not a static PNG. A **unique URL per completion** (`/share/clear/[id]`) with a dynamic `opengraph-image` route. When pasted into Discord/Slack/Twitter, the platform fetches the OG image and unfurls a rich card. The page itself is a lightweight landing page with the card content + app CTA.

The user composes what to include (checkboxes in the celebration modal), we generate the unique URL, they copy/paste it. The unfurl IS the share.

### Copy direction for cards
- "Avoid backlog shame. Get into your game." (tagline candidate)
- "Finally got [Game] out of my pile. That's $70 I actually used."
- "[Game] → Cleared. 3 years in the pile. No regrets."
- "I just cleared [Game] in 10 fewer hours than most people take. (I definitely missed some good items on the way.)"
- Tone: warm, slightly braggy, self-deprecating where it fits. Never corporate.

---

## Discord Integration Strategy (April 8, 2026)

### Login privacy
Discord OAuth (`identify` scope) is read-only: email, username, avatar. Does NOT join servers, post anything, or expose activity status. Server members won't know the user has the app unless they share.

### Integration ideas (ranked by impact/effort)
1. **Webhook-based share** — Users paste a Discord webhook URL in settings. On completion, we POST a rich embed to their channel. No bot hosting, no approval process, users control the channel. Best first step.
2. **Bot: `/whatshouldiplay` slash command** — Returns a pick from the user's linked library using the decision engine. Requires full engine running server-side. Medium effort.
3. **Bot: completion announcements** — "Brady just cleared Hollow Knight (47h). The pile trembles." Opt-in per user.
4. **Rich Presence** — "Playing via Inventory Full" in Discord status. Niche value.

### Parking for now
Discord bot requires bot application approval for servers with 100+ members. Webhooks don't. Start with webhooks.

---

## Copy Ideas Bank (ongoing)

### Locked — shipped and consistent

- **"Get playing."** — Primary tagline. Everywhere. Locked Apr 17 (replaces "Stop stalling. Get playing." from Apr 8 — see `docs/DECISIONS.md`).
- **"Your backlog's not gonna play itself."** — Subhead / supporting line.
- **"Less shame. More game."** — Share card / celebration CTA headline.
- **"Your pile won't clear itself. That's where we come in."** — Share card CTA subhead.
- "Three steps. We do the hard part." (landing page)
- "The pile trembles." (completion celebration / share card)

### Banked — good ideas, save for later

- **"Unpause"** — verb/concept for campaigns, feature names, push copy. "Let's unpause that game for you." Strong gaming metaphor. Don't lose this one.
- **"Playcrastinate"** — portmanteau. Could be a blog post title, a social campaign, a loading screen quip.
- **"Stop playing your library. Start playing the games."** — Longer form, good for editorial/blog.
- **"Dodge enemies, not fun."** — Punchy, gaming-native. Good for social posts or merch.
- **"Stop hesitation for your PlayStation"** — Funny. Internal joke only. Maybe a loading screen easter egg.
- **"Don't delay the play"** — Clean rhyme. Could work for push notifications.
- "Stop deciding. Start playing." (close runner-up, good for variety in long-form copy)
- "Your backlog isn't a failure. It's an inventory."
- "Avoid backlog shame. Get into your game." (alternate direction)

---

## Monetization Ideas (April 8, 2026)

### One Game Mode — "voluntary straitjacket"
$1-2/month. The app picks one game. UI locks to just that game. You don't get your next pick until you clear it or formally bail. A commitment device people pay for because they know their own weakness.

Why this might work:
- Psychology is sound — commitment devices are proven (personal trainers, website blockers, gym memberships)
- It's a story that markets itself. "I'm paying an app $1/month to stop me from browsing my own library." People would screenshot and share that.
- On-brand: the app that solves decision paralysis sells you the ultimate version of that solution
- Low price = impulse buy, high retention because the constraint IS the product
- Radiohead "pay what you want" energy — not the same mechanic, but the same "wait, what?" reaction that generates press and word of mouth

Don't build yet. Prove the free product first. But this has legs.

### Premium tier ($15-20/month)
Advanced stats, themed share postcards, unlimited re-entry packs, priority enrichment, maybe multi-platform sync. The free version stays generous — premium is for power users deep in the ecosystem.

### Affiliate deals on owned/wishlisted games
Price drop alerts via IsThereAnyDeal. Only for games users already own or wishlisted — never "you might like this." Clean under our legal framework. FTC disclosure required.

### Broader vision (not now, but worth noting)
The decision paralysis problem isn't gaming-specific. Streaming shows, books, podcasts — same psychology. If Inventory Full proves the approach works for games, the methodology (mood matching, commitment devices, progress celebration, anti-shame voice) could apply to other media verticals. Each would be a separate product, but the user approach and design philosophy is the transferable moat. Worth pitching to investors even if we never build it ourselves.

---

## Raw Rambles (unsorted, dump here)

(Brady: drop notes here when you're away from desktop. I'll sort them when you're back.)
