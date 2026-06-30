# Smaller Surgeries — Lined Up

**Status:** PLANNING — assembled 2026-05-05.
**What this is:** A queue of self-contained ~30–60 min surgeries. Each one stands alone — pick any in any order. Don't batch unless explicitly noted.
**Why this exists:** Items kept rolling forward in `session-resume-*.md` open-questions lists. This doc gives each one a real spec so the next session can pick one and ship without re-deriving the design.

---

## Shipped

| # | Item | Date |
|---|------|------|
| 1 | Roll Modal Hierarchy — filter collapse, one-line summary, ↻ change, Roll Again as text link, skip feedback gating | 2026-06-29 |
| 2 | Moved On Undo Toast — captures previousStatus, 5s toast with ↩ Undo, implemented in `GameCard.tsx` handleBail | 2026-06-29 |
| 3 | retroKids Archetype Trigger — releaseYear parsed in `enrichGame.ts`, trigger logic in `archetypes.ts`, sprite + pixel data present | 2026-06-29 |
| 4 | Stats Hero Metric — valueReclaimed sums purchasePrice for played+bailed ($15 fallback), share buttons reduced 3→1 | 2026-06-29 |

---

## 1. Roll modal hierarchy

**Status: SHIPPED 2026-06-29**

**Surface:** `components/Reroll.tsx` (the Pick My Game flow).
**Why:** post-pick screen is loud. Every control competes equally with the primary "Let's go" CTA. Defaults aren't honored visually.

**Changes:**
- Collapse filter controls (mood + session length) to a one-line summary by default once a pick is presented. Format: `mood · session length · ↻ change` — clicking ↻ re-expands.
- Gate "why'd you skip?" feedback prompt until *after* a skip happens. Currently it's pre-rendered which clutters and pre-loads the negative framing.
- Demote "Roll Again" from a primary-styled button to a ghost link below "Let's go". Voice-charter principle: confident in action moments, hedge has to live somewhere lower.

**Estimate:** ~50 LOC in `Reroll.tsx`. No new components.

**Risk:** less. Filters disclosed by default could confuse first-time users; mitigate by leaving them expanded on first roll, collapsing on subsequent rolls in the same session.

**Done means:** post-pick view has 1 dominant CTA, 1 ghost CTA, 1 collapsed summary. Three tiers.

---

## 2. Stats hero metric pattern

**Status: SHIPPED 2026-06-29**

**Surface:** `app/stats/page.tsx` and any stats components rendered there.
**Why:** current stats hero is a list of metrics with no narrative anchor. Brady identified the right metric is "value reclaimed" — sunk cost on games the user has now actually played.

**Changes:**
- Compute `valueReclaimed = sum(game.purchasePrice ?? estimatedAvgPrice for game in played)`. Estimated avg price ~$15–20 per Steam game; survey RAWG/IGDB pricing if available, else use a flat `$15` per played game as a v1 floor.
- Hero pattern: big number = `Cleared games count`, subhead = `~$N reclaimed from your pile`.
- Move "Share Your Type" CTA up — it's currently buried below the fold per recon. Hero zone: cleared count → value reclaimed → Share Your Type.
- Audit and delete duplicate post/repost/copy buttons. Recon notes 3 separate share affordances on stats page; one is enough.

**Estimate:** ~80 LOC. Mostly layout reshuffle + new value-reclaimed util in `lib/stats.ts` (or wherever stats compute lives).

**Risk:** "value reclaimed" framing can read as money-anxious if executed wrong. Voice-charter test: must not shame, must not hedge. Try copy options before locking:
- "≈$N reclaimed from your pile" (factual, light)
- "≈$N worth of games, actually played" (re-frames sunk cost)
- "≈$N you didn't waste" (too negative — flag for rejection)

**Done means:** stats hero scans top-to-bottom: cleared count → reclaimed value → share. One share button only.

---

## 3. Moved On undo toast

**Status: SHIPPED 2026-06-29**

**Surface:** wherever `moveToMovedOn` action fires in `lib/store.ts` + UI in `components/GameCard.tsx`.
**Why:** Moving On is a high-friction commitment moment. Industry-standard 5s undo lowers the perceived cost of the action without diluting "Moving on is deciding too" — the toast affirms the decision while leaving an out.

**Changes:**
- After Move On fires, render a toast: "Moved on. ↩ Undo (5s)". Auto-dismiss after 5s. Click ↩ → revert status to previous.
- **Do NOT add this to Cleared.** Cleared is sacred (CompletionCelebration) — adding undo dilutes the moment.
- Track previous status in toast state so undo restores correctly (e.g. Moved On from Playing Now → undo returns to Playing Now, not Backlog).

**Estimate:** ~60 LOC. Need a lightweight toast component if none exists; check `components/` first. If a toast lib is already in use, reuse it.

**Risk:** none material. Standard pattern.

**Done means:** moving on a game shows a transient toast with working undo. Cleared celebration is unchanged.

---

## 4. retroKids archetype trigger (release-year enrichment)

**Status: SHIPPED 2026-06-29**

**Surface:** `lib/enrichment.ts`, `lib/types.ts`, `lib/archetypes.ts`.
**Why:** retroKids archetype was wired in `8ead582` (2026-05-04) but ships untriggered because we don't pull `released` field from RAWG. Sprite is in `public/sprites/h2/` already.

**Changes:**
- Add `releaseYear?: number` to `Game` type
- Update RAWG enrichment to populate from `released` field (string `YYYY-MM-DD` → parse year)
- Backfill via re-enrichment cycle (existing mechanism)
- Re-wire retroKids trigger in `lib/archetypes.ts` to fire when ≥40% of played games have `releaseYear ≤ 2010`

**Estimate:** ~30 min total. ~30 LOC.

**Risk:** RAWG `released` is sometimes null for older or unreleased games — handle with optional chaining; missing year = skip the game from retroKids math (don't penalize).

**Done means:** retroKids archetype actually fires on test users with retro-heavy libraries. Sprite renders as expected.

---

## 5. FinishCheckNudge HLTB framing (deferred — review only)

**Surface:** `components/FinishCheckNudge.tsx:95`.
**Why:** the 2026-05-05 humble-HLTB pass (`39f8797`) intentionally left this assertion intact. Its job is to *check* whether the user is nearly done — a structural assertion that reads differently from passive nudges. But a designer reviewing might flag it.

**Decision (pending):** leave as-is until either (a) a designer explicitly flags it, or (b) the assertion's prediction confidence comes into question. If revisited, swap "Only ~Xh left" pattern to "Most are done by ~Xh from your point" matching the other three sites.

**Estimate if shipped:** ~10 LOC. Trivial.

**Status:** parked. Don't act unless prompted.

---

## 6. Ko-fi progress widget reality check

**Surface:** wherever Brady wants the tip-jar progress shown.
**Why:** Ko-fi removed/gated the embeddable progress widget on free tier (Gold-only).

**Options:**
- **(a)** Link to public goal page from a "Support" CTA — no visual progress, but zero infrastructure.
- **(b)** Build a custom component that scrapes Ko-fi's public goal page server-side (Edge function, cache 5 min). ~120 LOC + a Vercel cron + CORS handling.
- **(c)** Do nothing while goal is at $0/$60. Revisit at first $5 tip.

**Recommended:** **(c)** until first tip. Then upgrade to **(a)**. Skip **(b)** unless the tip jar becomes a real revenue line and the visual progress is load-bearing for community signaling.

**Status:** parked at (c). Trigger to act = first tip.

---

## How to use this doc

- Pick any item. Each is independent.
- Read the item's spec; the recon is already done.
- Run `/pre-push-review` before pushing.
- After shipping, delete that item's section from this doc + add a one-line note to `docs/DECISIONS.md` if any choice locked.

If a new surgery emerges from a session, append it here with the same structure (Surface / Why / Changes / Estimate / Risk / Done means).
