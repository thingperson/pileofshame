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

## Track status (as of session 4, commit `5221321`)

- **Track A (landing PR)** — ✅ ALL SHIPPED. Items 3, 4, 6, 7, 8, 9A, 11, 12, 14 live. (Items 9B, 10, 13, 15 explicitly deferred.)
- **Track B (OG share card improvements)** — ✅ ALL 6 SHIPPED.
- **Track C (pre-launch QA)** — ⏳ Open. See current "What's NEXT" section below for the list.
- **Track D (deferred nice-to-haves)** — 9B, 10, 15 still open. 13 killed.

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

## How to pick up next session

1. Read this doc (top to bottom — track status + "What's NEXT" at the bottom of the progress log are what matter now).
2. Landing + OG work are done. Next up is Brady-driven: either visual QA on the fresh deploy, or Track C pre-launch QA.
3. If diving into Track C, skim `docs/pre-launch-risks-2026-04-15.md` and `docs/reddit-launch-prep.md`.
4. If Brady reports visual issues from the fresh deploy, fix those first - they're cheaper to catch now than post-launch.

---

## Progress log

- **Apr 15 afternoon** — Landing critique shipped, PR preview built, Cowork strategist critique integrated, OG critique captured, all decisions locked
- **Apr 15 afternoon end** — Option 2 landing changes applied (hero inline CTAs, subhead, sign-in nav, bottom CTA, competitor line). Build + voice sweep pending. Not committed.
- **Apr 15 tonight (session 2)** — Track A items 14, 11, 6, 9A, 3 applied. Track B items 1 (persona auto-title), 2 (reclaimed language swap), 5 (Less shame. More game. in OG meta). Track C reddit-launch-prep.md created. All build-verified + voice-swept. Not committed.
- **Apr 15 tonight (session 3)** — Favicon mis-named-PNG fixed (`app/favicon.ico` + `app/icon.tsx` replaced with single `app/icon.png`). Track A items 4 (5-ways-to-pick grid), 7 (SampleImportNudge), 8 (tappable Sample pill) applied. Track B items 3 (trait-based rotating flavor pool), 4 ($ variant in rotation), 6 (explored label + dollar tooltips). Build-verified + voice-swept. Pushed as its own commit.
- **Apr 15 tonight (session 4, commit `5221321`)** — Post-visual-check fixes shipped as one push:
  - OG card: fixed "The The [Archetype]" duplication bug (strip leading `The ` before template prepends one).
  - OG card: removed 100-char truncation on archetype descriptor.
  - OG card: clustered `INVENTORY FULL` tight with logomark, dropped the redundant bottom row (compact stats + CTA + inventoryfull.gg).
  - Landing: new inline `Reveal` component (IntersectionObserver, opacity + translateY, 700ms ease, one-shot, honors `prefers-reduced-motion`). Wraps each section; the two grids (How It Works, 5 Ways) stagger their reveals.
  - Landing: copy cadence sweep - smoothed Step 01 ("We grab everything. You do nothing." → "We grab everything while you do nothing."), Step 02 (combined), Step 03 ("No judgement. Moving on is deciding too." → "just move on without guilt. Moving on is deciding too."), and Keep Playing card ("Finish one. We'll tell you which." → "We'll tell you which one to finish."). Locked punchlines preserved.
  - Sample library: moved Elden Ring + Stardew Valley from `playing` → `on-deck`. BG3 is the only Playing Now; 2 slots open by default so new users can park something immediately.
  - Build clean, voice sweep clean. Pushed to main → Vercel deploy triggered.

---

## What's NEXT when Brady resumes

All Track A + Track B items are now shipped. Landing-facing work is done pending visual/device QA.

### Immediate (next short session)

1. **Visual QA on the fresh deploy** — live inventoryfull.gg, preferably on phone + desktop:
   - Scroll-reveal feel: is the 700ms ease right? Stagger too slow/fast? Any flash-of-unstyled-content on first paint?
   - Landing copy flow: does the rhythm feel more varied after the sweep, or still pair-heavy somewhere?
   - Sample library: load the sample, confirm Playing Now shows 1/3 occupied with 2 open slots visible.
   - OG card: share a stats card to Discord/iMessage, confirm "The The" bug gone, descriptor renders in full, INVENTORY FULL clusters with logomark.
2. **Track C pre-launch QA** (from `docs/pre-launch-risks-2026-04-15.md`) — the only remaining launch-blocker-shaped work:
   - QA every reroll-mode → output mapping (make sure Quick Session never surfaces Marathon-tagged games, Almost Done only pulls 80%+ progress games, etc.)
   - Audit completion share-card OG preview across Discord / Twitter / Reddit / BlueSky / iMessage. (`/clear/[id]` card, not the pile card we just fixed.)
   - Review `docs/reddit-launch-prep.md` (drafted session 2) - any holes in the prepared-skeptic-answers?

### Nice-to-haves / deferred

- **Track D Item 15 (founder anchor in footer)** - still pending Brady's handle choice. 30s of work once decided.
- **Track D Item 10 (demo GIF above the fold)** - needs Brady to record a capture. Scroll-reveals already soften the empty-space problem, so this is less urgent than it was.
- **Track D Item 9B (first-visit tooltip on card icons)** - deferred; icon legend in HelpModal already handles discovery.

### Notes / watch-items

- The scroll-reveals use `willChange: 'opacity, transform'` only until shown. Keep an eye on perf on older Androids; if there's jank, threshold can be tightened or rootMargin widened to reveal earlier.
- `sampleLibrary.ts` comment `NOW PLAYING (1)` and `ON DECK (5)` are now authoritative - if more sample games get added later, keep those counts accurate or switch to "N" placeholders.
- The OG bottom row drop means `statParts` is gone; if we ever want compact stats on the card again, rebuild as a header element rather than a footer.
