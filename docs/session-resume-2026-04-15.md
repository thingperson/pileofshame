# Session Resume — Apr 15, 2026

**Purpose:** If this session breaks (token limit, crash, etc.), this doc is the single entry point for picking up where we left off.

---

## State at handoff

Brady used afternoon session to:
- Run a full landing page critique/rewrite (Cowork strategist gave a second opinion, both agreed on direction)
- Execute Option 2 (highest-leverage landing changes only)
- Workshop copy decisions for landing + OG share cards

All major decisions are **locked**. Execution is **partial**. Resuming = continuing execution against the locked plan.

---

## Key docs in this session (read in this order when resuming)

1. `docs/landing-pr-preview-2026-04-15.md` — The PR-style review of 15 landing changes. Approval state marked inline.
2. `docs/landing-critique-2026-04-15.md` — The critique that drove the PR preview. Decisions locked in the bottom section.
3. `docs/pre-launch-risks-2026-04-15.md` — Non-landing pre-launch work surfaced by the strategist. QA, share cards OG audit, Switch onboarding, etc.
4. `docs/og-cards-improvements-2026-04-15.md` — OG share card improvement plan. 6-item shipping order. Estimated 2-3 hrs.
5. `docs/marketing-5-ways-to-decide.md` — Marketing hook doc for "5 ways to pick tonight's game" — social copy angles.

All decisions captured in those docs. This one is the meta-index.

---

## What SHIPPED in this session (Option 2)

Landing changes applied to `components/LandingPage.tsx`:

- **Hero CTAs inlined.** Primary "Import My Library" + secondary "Try a sample first" live directly on the hero. No more modal gate. Modal removed from LandingPage entirely.
- **Hero subhead rewritten.** `Can't decide what to play? Yeah, we know.` → `We'll pick the game. You do the playing.` ("do the playing" is intentional — conversational, not slogan-polished.)
- **Sign-in moved to top-right nav.** Removed from hero. New minimal `<nav>` above hero with just `<AuthButton />`.
- **Bottom CTA unified.** Button label `Import My Library - It's Free` → `Import My Library`. `Free. No account required.` moved to microcopy line underneath (matches hero pattern).
- **Differentiator line locked (Item 12, option B):** `Backloggd is more library to manage. Managing isn't playing. We pick. You play.` — the YouTube paragraph was already flagged for removal in the PR plan; this replaces the generic "every other app" line.

**Build status:** Verify with `npm run build` before committing. Voice sweep on changed files required per `.claude/rules/deploy-gates.md`.

**Commit status:** NOT COMMITTED. Brady reviews the diff first, then commits himself (or asks Claude to).

---

## What's NEXT when Brady resumes tonight

### Track A — Finish the landing PR (remaining items from Option 1)

Items still to apply from `docs/landing-pr-preview-2026-04-15.md`:

- **Item 3** — Differentiator section cleanup (trim to single block, "our app"). Largely superseded by item 12 — verify the section reads right after item 12 lands.
- **Item 4 (revised)** — Replace features grid with "5 ways to pick tonight's game." Pulls from `REROLL_MODES` in `lib/reroll.ts`. Drop `FeatureCard`, unused icon components.
- **Item 6** — GetStartedModal demoted to pure sign-in helper. Drop Import + Sample buttons from it. Keep Discord/Google/Email auth. Header copy changes.
- **Item 7** — New `components/SampleImportNudge.tsx` component. Post-first-commit prompt. Gated by `if-sample-pending` flag clearing + `if-sample-nudge-shown` localStorage flag.
- **Item 8** — "Sample Library" pill in `app/page.tsx` line ~594 becomes tappable `<button>` opening Import Hub.
- **Item 9A** — Icon legend section added to `components/HelpModal.tsx` listing persistent card icons (⭐🚫💤🏆 + status icons).
- **Item 11** — "Your backlog should feel exciting, not a warehouse of good intentions." Placed between differentiator and 5-ways grid as quiet pull-quote.
- **Item 14** — Rename "Vibe Check" → "Match today's vibe" in How It Works step 2.

### Track B — Start OG share card improvements (Option 3)

All decisions locked in `docs/og-cards-improvements-2026-04-15.md`. Shipping order:

1. Persona auto-title with username ("[USERNAME] is an Archaeologist with 39 games waiting to be played")
2. "Reclaimed" language swap across stats/persona cards (replaces "unlocked")
3. Rotating completion-card tagline pool (5-8 variants, trait-based or random)
4. $ value as rotation variant on completion card
5. "Less shame. More game." in OG meta description across both card types
6. 18% stat label + dollar explainer tooltip

Relevant files: `app/api/share-card/route.tsx` (render), `components/CompletionCelebration.tsx` (cleared card), persona card route (TBD — grep `persona` + `share`).

### Track C — Pre-launch QA (from strategist critique, see `docs/pre-launch-risks-2026-04-15.md`)

Highest priority:
1. QA every reroll-mode → output mapping (make sure Quick Session never surfaces Marathon-tagged games)
2. Audit completion share-card OG preview across Discord/Twitter/Reddit/BlueSky/iMessage
3. Draft prepared answers for Reddit skeptics

### Track D — Items deferred (not urgent, do if time allows)

- Item 9B — First-visit tooltip on card icons
- Item 10 — Demo GIF above the fold (requires Brady to record a capture)
- Item 13 — Flip 3-step to outcome-first (skipped; Brady agreed it's worse in practice)
- Item 15 — Founder anchor in footer (deferred pending Brady's handle choice)

---

## Locked decisions reference

| Decision | Value |
|---|---|
| Hero subhead | `We'll pick the game. You do the playing.` |
| Bottom button | `Import My Library` (with microcopy: `Free. No account required.`) |
| Differentiator line | `Backloggd is more library to manage. Managing isn't playing. We pick. You play.` |
| Vibe Check rename | `Match today's vibe` |
| Warehouse line placement | Between differentiator block and 5-ways grid (quiet pull-quote styling) |
| Sample→Import bridge | Keep current banner; add post-first-commit nudge component |
| GetStartedModal | Demote to sign-in only; remove Import/Sample buttons |
| OG persona title | `[USERNAME] is an Archaeologist with 39 games waiting to be played` |
| OG value language | "reclaimed" replaces "unlocked" everywhere |
| OG meta description | Include `Less shame. More game.` in all share card meta |

---

## How to pick up tonight

1. Read this doc
2. Skim `docs/landing-pr-preview-2026-04-15.md` items 3, 4, 6, 7, 8, 9A, 11, 14 (the remaining Option 1 work)
3. Skim `docs/og-cards-improvements-2026-04-15.md` for OG work (Option 3)
4. Ask Brady which track he wants to resume on: Track A (finish landing), B (OG cards), C (pre-launch QA), or combination
5. Execute. Don't re-workshop — decisions are locked.

---

## Progress log

- **Apr 15 afternoon** — Landing critique shipped, PR preview built, Cowork strategist critique integrated, OG critique captured, all decisions locked
- **Apr 15 afternoon end** — Option 2 landing changes applied (hero inline CTAs, subhead, sign-in nav, bottom CTA, competitor line). Build + voice sweep pending. Not committed.
- **Apr 15 tonight (session 2)** — Track A items 14, 11, 6, 9A, 3 applied. Track B items 1 (persona auto-title), 2 (reclaimed language swap), 5 (Less shame. More game. in OG meta). Track C reddit-launch-prep.md created. All build-verified + voice-swept. Not committed.
- **Apr 15 tonight (session 3)** — Favicon mis-named-PNG fixed (`app/favicon.ico` + `app/icon.tsx` replaced with single `app/icon.png`). Track A items 4 (5-ways-to-pick grid), 7 (SampleImportNudge), 8 (tappable Sample pill) applied. Track B items 3 (trait-based rotating flavor pool), 4 ($ variant in rotation), 6 (explored label + dollar tooltips). Build-verified + voice-swept. Pushed as its own commit.
