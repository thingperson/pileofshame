# Ideas & Brainstorm Dump

Running list of ideas, rambles, and half-formed thoughts. Gets synthesized into proper specs when actionable.

---

## Active Ideas (ready to spec or build soon)

### HLTB Progress Inference & Nudges
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

### PS+ Sub Shuffle
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

### "Almost Done" Reroll Mode
New mode in the reroll picker: only shows games where remainingHours < 20% of hltbMain.
Targeted at clearing the backlog, not just picking something to play.

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

## Raw Rambles (unsorted, dump here)

(Brady: drop notes here when you're away from desktop. I'll sort them when you're back.)
