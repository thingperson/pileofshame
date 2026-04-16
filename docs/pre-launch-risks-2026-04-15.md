# Pre-Launch Risks — Non-Landing Work

**Captured:** Apr 15, 2026 from strategist critique
**Scope:** Items surfaced in the design strategy OS critique that live *outside* the landing page but need attention before Reddit/PH launch.
**Source:** `~/Library/Mobile Documents/iCloud~md~obsidian/.../inventoryfull-gg-critique.md`

Landing-page items are being handled in `docs/landing-pr-preview-2026-04-15.md`. This doc tracks everything else.

---

## 🔴 High — Must fix before launch

### 1. QA every reroll-mode → output mapping
**Risk:** If a user clicks "Quick Session" and gets a 41-hour Marathon-tagged game, trust breaks instantly on day one. This is the "single biggest promise-vs-delivery moment in the app" per the strategist.

**Action:** Systematic sweep. For each of the 5 reroll modes:
- `anything` — no filter, all eligible
- `quick-session` — should ONLY surface games tagged as wind-down / short session
- `deep-cut` — should surface buried backlog games, not active ones
- `continue` — should ONLY surface games already started
- `almost-done` — should ONLY surface games close to completion

Test each mode 10+ times against the sample library AND against a real library (Brady's). Confirm no Marathon-tagged game ever surfaces under Quick Session. Confirm no untouched game surfaces under "Keep Playing."

**Owner:** Brady. **Estimated time:** 30-45 min manual sweep. Could also be automated with a Playwright test against sample data.

### 2. Audit completion share-card OG preview
**Risk:** The completion share-card may be the primary growth engine (identity content, Letterboxd/Strava pattern). If OG tags render broken across Discord/Twitter/Reddit/BlueSky/iMessage, the growth loop stalls silently.

**Action:** Generate a share card URL. Test unfurl on:
- Discord (biggest gaming audience)
- Twitter / X
- Bluesky
- Reddit (as a comment link + as a post)
- iMessage (iOS default unfurl)
- Slack (for the dev-curious audience)

Fix any broken previews before launch. Priority order: Discord > Twitter > Reddit > iMessage > Bluesky > Slack.

**Owner:** Brady. **Estimated time:** 15 min to test, variable to fix depending on what breaks.

---

## 🟡 Medium — Should fix, not blocking

### 3. Reframe Nintendo Switch onboarding
**Risk:** Current copy "No API exists. Add games manually" is honest but invites bounce from Switch-primary users (a large audience segment).

**Proposed reframe:**
> Switch library: no official API, so we help you add them by hand. Start with a few games you've played recently — we'll suggest more.

Could include an assist feature: user enters 3-5 Switch games, we suggest popular Switch games from RAWG to quickly populate.

**File(s):** Import hub / Switch-specific import flow.
**Owner:** Brady to decide if assist feature is in-scope for launch or deferred.

### 4. Four-button rejection row density on game detail
**Risk:** "Return to The Pile / Not for me / Don't suggest / Delete from library" — four actions with similar visual weight and subtle semantic differences. First-time users will hesitate.

**Proposed fixes (pick one):**
- **A.** Primary row: *Return to The Pile* + *Don't suggest*. Secondary/danger row: *Not for me* + *Delete*.
- **B.** Tooltip-on-hover clarifying each action's effect.
- **C.** Collapse to 2 buttons + an "other options" overflow menu.

My vote: **A.** Two-row structure makes severity obvious.

**File(s):** `components/GameCard.tsx` or `components/GameDetailModal.tsx`.

### 5. Prepared answers for Reddit skeptics
Have tight 2-3 sentence responses ready for:

- **"How is this different from [Backloggd/HowLongToBeat/etc.]?"**
  > Backloggd and HLTB are trackers. They log what you played and how long it took. Inventory Full picks what you play next from your library based on mood and time. Different job — we decide for you, they remember for you.

- **"Why should I trust you with my Steam library?"**
  > We only read public data — your owned games and playtimes. We never write, never buy, never post, never touch anything else. Everything lives in your browser unless you sign in to sync.

- **"Is this a data grab?"**
  > No. We don't sell anything, have no ads, and don't share your library with anyone. It's a side project — free because I wanted this to exist for myself.

- **"What's the business model?"**
  > Free because it's a side project. If it takes off, paid features for power users eventually. Your data stays yours either way.

**Owner:** Brady. Store in `docs/reddit-launch-prep.md` for reference during launch.

### 6. Sample library first-pick tuning
**Risk:** The product makes a promise the first 2-3 recommendations have to deliver on. For sample-library users, those first rolls are load-bearing.

**Action:** Review the sample library (`lib/sampleLibrary.ts`) and make sure the games surfaced by each mode on the first roll feel like genuine "oh, nice" picks. Consider weighting the first roll toward widely-loved titles to bias toward aha moments.

**File:** `lib/sampleLibrary.ts`, `lib/reroll.ts` (sample-only weighting?).

---

## 🟢 Low — Post-launch polish

### 7. Test "Onward. Back to the pile." alternatives
Post-completion CTA copy. Strategist flagged as slightly undercutting the victory. Candidates:
- "One down. Who's next?"
- "Pick my next one."
- "Back to the pile. Let's do it again."

**Action:** No change yet. Track in copy backlog.

### 8. Playnite gateway friction for GOG/Epic/Switch users
Users without Playnite face a chicken-and-egg. Add a one-sentence nudge: "Don't have Playnite? Here's a 60-second install →" with a link to Playnite's site.

**File:** Import hub, GOG/Epic/Switch sections.

---

## Strategic notes (from the critique, worth preserving)

### The "One Insight" to repeat ruthlessly
> **"Every other app wants you to catalogue and organize. We want you to close the app and go play."**

Per the strategist, this is the category-defining line. Use it as the unofficial brand tagline in:
- Reddit posts
- Twitter bio for the project account
- ProductHunt opening line
- Anywhere we pitch cold

Repetition is what turns category-defining language into category ownership.

### Trend anchors for marketing
Named cultural moments the critique suggests we lean into:
- Game Pass library explosion
- Steam Summer Sale backlog guilt
- The "500-game-library" meme

Sample angle: *"Your Steam library finally has an answer to 'what should I play tonight?'"*

These belong in Reddit posts, not on the landing page.

### Strategic NOs to preserve as we scale
The critique flagged these as discipline points worth preserving:
- No catalog-management bloat
- No social-comparison features
- No completionist-tracking complexity beyond current status cycle
- No ads, no upsells, no dark patterns
- No email capture at signup
- No "share this to unlock" virality coercion

If post-launch metrics tempt us to add any of these, re-read the strategist's category-creator warning first.
