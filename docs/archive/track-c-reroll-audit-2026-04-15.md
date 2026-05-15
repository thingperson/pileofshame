# Track C — Reroll Mode Audit

_Date: 2026-04-15. Source of truth: `lib/reroll.ts`, `components/LandingPage.tsx`, `lib/sampleLibrary.ts`, `lib/types.ts`, `lib/enrichment.ts`._

## Summary

Five reroll modes were audited. Two modes have **serious promise-vs-logic mismatches** that will blow user trust on day one: **Deep Cut** doesn't actually find forgotten games (it just returns long games), and **Keep Playing** is so narrow it surfaces exactly one game in the sample library when the landing page promises "five." Quick Session has a softer mismatch (a 52-hour cozy sim qualifies as "20 minutes before bed"). Almost Done and Anything are broadly correct.

**Count of issues:** 2 critical, 1 moderate, 2 minor.

## Mode-by-mode findings

### Anything

- **Promise to user:** "Just pick something. We'll figure out what fits right now." (`components/LandingPage.tsx:334-336`)
- **Filter logic:** Baseline filters only (exclude ignored, soft-ignored, not-interested, `played`, `bailed`, platform mismatch, mood mismatch). All remaining games are eligible. Weighting in `calculateWeight` then factors in metacritic, enrichment completeness, backlog age, hours played, energy, genre balance, genre cooldown, skip history, "hit a wall" suppression, "too-long" signal, behavioral weight, session skips. (`lib/reroll.ts:69-71`, `173-251`)
- **Findings:** PASS. The promise is intentionally loose ("we'll figure out"), and the weighting does serve "fits right now" via energy matching and skip deprioritization. Bailed and played games are excluded (line 58). Session skips drop to 0.2× weight but aren't hard-excluded — acceptable because the user can re-roll out.
- **Recommendation:** None.

### Quick Session

- **Promise to user:** "20 minutes before bed? We know which games are built for that." (`components/LandingPage.tsx:341-343`)
- **Filter logic:** `game.timeTier === 'quick-hit' || game.timeTier === 'wind-down'` (`lib/reroll.ts:72-73`). Time tiers are auto-assigned from HLTB main-story hours: quick-hit ≤3h, wind-down 4–12h (`lib/enrichment.ts:148-153`).
- **Findings:** MODERATE ISSUE.
  1. The tier gate is the only time check. Sample data overrides the inferred tier in several places — e.g. **Stardew Valley** has `hltbMain: 52` but `timeTier: 'wind-down'` (`lib/sampleLibrary.ts:69-91`). Quick Session will happily surface a 52-hour sim when the user asked for "20 minutes before bed." Same story for **Slay the Spire** (`hltbMain: 28`, tier `wind-down`, `lib/sampleLibrary.ts:450-472`). For a non-finishable drop-in game this is arguably on-brand, but the landing copy is explicit about the 20-minute framing and the tier label says "30–60 min session" (`lib/constants.ts:97`).
  2. `isNonFinishable` is not excluded. Vampire Survivors, Stardew, Slay the Spire, Factorio-style drop-ins all qualify. Probably fine for quick sessions specifically, but worth flagging.
- **Recommendation:** Add a secondary check: if `hltbMain` exists and is >12 for wind-down or >3 for quick-hit, exclude unless `isNonFinishable` (which signals "short session friendly" for drop-ins). Or tighten the copy from "20 minutes" to something like "a short session tonight."

### Deep Cut

- **Promise to user:** "Something you forgot you owned. The pile's full of them." (`components/LandingPage.tsx:348-350`)  
  Mode dropdown description: "A game buried in your backlog you may have forgotten about" (`lib/reroll.ts:12`).
- **Filter logic:** `game.timeTier === 'deep-cut' || game.timeTier === 'marathon'` (`lib/reroll.ts:74-75`). That's it. No backlog-age check, no `addedAt` threshold, no `status === 'buried'` requirement.
- **Findings:** CRITICAL. The filter has nothing to do with "forgotten." It just returns **long games** (deep-cut = 13–35h, marathon = 35h+). A marathon game added 50 days ago qualifies; a quick-hit added 3 years ago does not. Example mismatches from the sample library:
  - **Hades II** — marathon, added 50 days ago, explicitly noted as an active early-access release (`lib/sampleLibrary.ts:929-952`). User did NOT forget this. Surfaces as "Deep Cut."
  - **Elden Ring** — marathon, status `on-deck`, 38 hours played, added 60 days ago (`lib/sampleLibrary.ts:44-66`). This is the opposite of forgotten — it's actively in rotation.
  - **Baldur's Gate 3** — marathon, status `playing`. Would be excluded only because `on-deck`/`playing` aren't excluded here... wait, actually BG3 stays in. It's currently being played and would surface as a "Deep Cut you forgot about."
  - **Unpacking** — `timeTier: 'quick-hit'`, added 100 days ago, never touched, truly buried. Does NOT surface as a Deep Cut because it's short.
  
  The backlog-age boost in `calculateWeight` (`lib/reroll.ts:199-201`) gives a 1.5× multiplier for games added >365 days ago, but that's a weighting nudge applied to every mode — it doesn't make Deep Cut specifically about forgotten games, it just makes old games slightly preferred in any mode.
- **Recommendation:** Rewrite the filter. Either:
  - `status === 'buried'` AND `daysSinceAdded > 180` AND `hoursPlayed === 0` (strict "forgotten")
  - OR `daysSinceAdded > 365` regardless of tier (soft "been in your pile forever")
  - Remove the tier-based filter entirely — "forgotten" and "long" are orthogonal.

### Keep Playing

- **Promise to user:** "You started five games. We'll tell you which one to finish." (`components/LandingPage.tsx:355-357`)
- **Filter logic:** `game.status === 'playing'` (`lib/reroll.ts:76-77`). Status is only set to `playing` when the user explicitly promotes a game (`lib/store.ts:243`).
- **Findings:** CRITICAL. Landing copy explicitly says "five games" (as in: five games with progress). The filter pulls only games the user has manually marked as actively playing. In the 32-game sample library, **exactly one** game has `status: 'playing'`: Baldur's Gate 3. Meanwhile:
  - Elden Ring: 38 hours played, paused, `status: 'on-deck'` — excluded.
  - Hades: 2 hours played, `status: 'on-deck'` — excluded.
  - Hollow Knight: 6 hours played, `status: 'buried'` — excluded.
  - Darkest Dungeon: 3 hours played, `status: 'buried'` — excluded.
  - Divinity: Original Sin 2: 4 hours played, `status: 'buried'` — excluded.
  
  The promise of "five started games" is completely unfulfilled. A user with a realistic library of dropped-in-progress games will get one pick or an empty state.
- **Recommendation:** Broaden to `hoursPlayed > 0` (some minimum threshold like ≥1h to exclude trivial touches) AND `status !== 'played'` AND `status !== 'bailed'` (already excluded). Optionally still favor `status === 'playing'` via weighting rather than hard filter. This matches the intuitive user model of "games with meaningful progress you haven't finished or abandoned."

### Almost Done

- **Promise to user:** "That game you're 80% through? Let's roll the credits." (`components/LandingPage.tsx:362-364`)
- **Filter logic:** Excludes `isNonFinishable`. Requires `hltbMain > 0` and `hoursPlayed > 0`. Computes `remaining = (hltbMain - hoursPlayed) / hltbMain`, returns `remaining < 0.20`. Games past the HLTB estimate (negative remaining) also qualify, per the comment. (`lib/reroll.ts:78-84`)
- **Findings:** PASS. Logic matches the promise. 20% threshold aligns with "80% through" copy. Zero-hours games correctly excluded (they can't be almost done if you haven't started). Non-finishable games correctly excluded (Stardew, Vampire Survivors, Factorio, Slay the Spire don't have credits to roll). Bailed/played games already excluded upstream.
  - One tiny semantic oddity: a `buried` game with `hoursPlayed` near `hltbMain` will surface. That's probably desirable — it's a "you were close, go finish" nudge. Keep it.
  - Edge case: very small `hltbMain` values (e.g. A Short Hike at 2h) produce a very sensitive threshold — 1.6h played = 20% remaining exactly. Not a bug.
- **Recommendation:** None. Optionally consider an upper bound on `remaining < 0` (if someone has 200% over the estimate, maybe they're not "almost done" they're "still playing for the vibes"). Low priority.

## Cross-cutting issues

1. **No mode re-verifies time cost via `hltbMain`.** Modes that care about time (Quick Session, Almost Done) use `timeTier` or a ratio, but nothing cross-checks that `hltbMain` matches the tier bucket. Sample data has tier overrides that diverge from `hltbMain` (Stardew wind-down with 52h, Slay the Spire wind-down with 28h), and enrichment could produce similar drift for real user libraries if HLTB changes between runs or a user manually edits the tier.
2. **`isNonFinishable` only blocks Almost Done.** It's not checked by any other mode. In practice this is fine (you want Vampire Survivors to appear in Quick Session and Anything) — noting for completeness.
3. **`status: 'buried'` is surfaced by every mode except Keep Playing.** This is correct — buried games ARE the backlog — but combined with the Deep Cut bug it's not doing what the user expects.
4. **Nothing explicitly guards against re-recommending a recently-bailed game beyond the top-level `bailed` exclusion.** `bailed` is a terminal status (`lib/reroll.ts:58`) so this is fine, unless a user un-bails a game (currently not exposed as a UX). Noting for future-proofing.
5. **Mood filter applies universally** (`lib/reroll.ts:64-67`), including in Keep Playing. Combined with the Keep Playing narrowness bug, this makes empty-state even more likely.

## Priority fixes

Ordered hardest/highest-impact first.

1. **Fix Keep Playing filter.** Change from `status === 'playing'` to `hoursPlayed >= 1 && status !== 'played' && status !== 'bailed'`. This single change turns a one-result mode into a meaningful one and aligns with the literal landing copy ("five games"). Highest trust impact — a user who tries Keep Playing and gets "no games" when they can see a dozen started games in their library will never trust the app again. (`lib/reroll.ts:76-77`)

2. **Fix Deep Cut filter.** Replace the tier-based filter with a backlog-age filter. Recommended: `(daysSinceAdded > 365 && hoursPlayed === 0) || (status === 'buried' && daysSinceAdded > 180)`. This makes the mode actually do what the name and copy promise. (`lib/reroll.ts:74-75`)

3. **Tighten Quick Session copy or logic.** Two options:
   - (preferred) Relax landing copy from "20 minutes" to "short session" to match the wind-down tier's 30–60 min reality, OR
   - Enforce `hltbMain <= 12` as a secondary gate (with an exception for `isNonFinishable` drop-in games). (`lib/reroll.ts:72-73`, `components/LandingPage.tsx:341-343`)

4. **(Low) Document the `isNonFinishable` policy.** If the intent is that non-finishable games should be surfaceable in all non-completion modes, add a comment in `getEligibleGames` explaining why. Small doc task.

5. **(Low) Consider excluding `status: 'playing'` games from Deep Cut** once the Deep Cut fix ships — a game you're actively playing isn't forgotten.

No code was changed. Audit only.

---

## 2026-04-16 — Fixes landed

All three priority issues addressed in a single sweep.

1. **Keep Playing** (critical): filter rewritten from `status === 'playing'` to `hoursPlayed >= 1 && status !== 'played' && status !== 'bailed'`. Started-then-paused games now surface. Landing copy "You started five games. We'll tell you which one to finish." now has backing logic. (`lib/reroll.ts:94-101`)

2. **Deep Cut** (critical): filter and semantic both reframed. Rather than "forgotten," Deep Cut is now a **personal deep cut with evidence** — a world you sank real hours into and stepped away from. Filter: `hoursPlayed >= 5 && status !== 'playing' && (status === 'on-deck' || status === 'buried')`. Landing/about copy updated to "A world you lived in. Your save's still there." (`lib/reroll.ts:84-93`, `components/LandingPage.tsx:346-347`, `app/about/page.tsx:224`)

3. **Quick Session** (moderate): added cross-check against `hltbMain`. If tier is quick-hit or wind-down but `hltbMain > 12`, exclude unless `isNonFinishable`. Stardew/Slay the Spire still qualify as drop-in friendly; a 52h sim mis-tagged `wind-down` no longer leaks in. Landing copy relaxed from "20 minutes before bed" to "Short session tonight?" in an earlier pass. (`lib/reroll.ts:74-83`)

4. **Stale user-facing references** updated:
   - `components/HelpModal.tsx:73` mode descriptions rewritten to match new semantics (all 5 modes, including Almost Done).
   - `app/page.tsx:710` Deep Cut aria-label rewritten to reflect new filter meaning.

### Known follow-up (deferred)

- **Deep Cut label naming** — `'deep-cut'` is both a `TimeTier` key AND a reroll mode name, which is confusing internally. Brady flagged "let's think more on the label" — candidates to pitch: "Take Me Back", "Open Save", "Worth Another Run", or keep "Deep Cut" with the sharpened "personal with evidence" framing. Copy-only change; filter logic stays put.
- **Low-priority #4/#5 from above** (doc the `isNonFinishable` policy, exclude `status: 'playing'` from Deep Cut): the #5 concern is now actually enforced — the new Deep Cut filter excludes `status: 'playing'` explicitly. The #4 doc task remains open but is not blocking.
