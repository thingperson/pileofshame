# Game Detail Modal — Redesign Spec

**Status:** PLANNING — recon completed 2026-05-05 PDT.
**Trigger to build:** Brady has a focused 60–90 min session per item below. Items are independent; ship in any order.
**Why this exists:** Three modal items remain after the 2026-05-05 modal quick-wins push (`39f8797`: Why we picked, humble HLTB, Discord affordance). Each needs its own session. This doc preserves the recon so the next pass starts hot.

---

## Item 1 — Destructive-action collapse

### Current state (verified)
Three destructive actions, three different patterns. Inconsistent.

| Action | File / Lines | Card view | Modal view |
|---|---|---|---|
| Delete from library | `components/GameCard.tsx:1331–1407` | Always-visible button, low-opacity red, right-aligned | Demoted to ghost link, centered below, inline confirm |
| "Not for me" / Bail | `components/GameCard.tsx:1230–1272` | Always visible, dashed red border | Same — never collapsed |
| Return to The Pile / Shelve | `components/GameCard.tsx:1192–1209` | Status-gated visibility (only `playing`/`on-deck`) | Same |

Confirmation flow is consistent — inline reveal on click ("Drawing the line?", "Gone forever?"). That pattern is reusable; no need to change.

### Problem
- Delete uses dual-path collapse logic; Bail never collapses; Shelve is status-gated. No unified pattern.
- Action row layout is `flex flex-wrap` (card) and `grid grid-cols-2` (modal). Destructive buttons compete with primary CTAs ("I beat it", "Replay?") for visual attention.
- Mobile: all buttons remain visible, just reflow. No collapse affordance on small screens.

### Spec
**Goal:** all three destructive actions live behind a single disclosure widget in the modal view. Card view stays as-is (low-density inline) since the card isn't the modal's job.

**UI pattern:** add a "More actions" disclosure (chevron or "···") to the modal action row. Inside: Bail, Delete, plus a label-only group divider above them ("Last resorts"). Confirmation flow stays inline once an action is clicked. Closing the disclosure cancels any active confirm.

**Visual hierarchy:**
- Primary: status-cycle CTAs ("I beat it", "Replay?", "Launch in Steam" once Item 2 lands)
- Secondary: Return to The Pile, Reset skip count
- Disclosed (behind "More actions"): Bail, Delete
- Don't suggest stays in disclosed group too — it's not destructive but it is an opt-out

**Mobile:** disclosure stays the same pattern. On viewport < 640px, the disclosure can default to collapsed even more aggressively (chevron only, no label).

### Estimate
~40–60 LOC in `GameCard.tsx`, conditionally wrapping lines 1192–1372 in a disclosure component when `forceExpanded === true`. Confirmation logic stays. Optional: extract to `<DestructiveActionsDisclosure>` component if it grows past 80 LOC.

### Risk
- Hiding Bail behind a disclosure may reduce its usage; "Moving on is deciding too" is psychologically load-bearing per voice-charter. **Mitigation:** keep Bail visible at the second tier (not disclosed) and only disclose Delete + Don't suggest. That preserves the agency-affirming exit at top level.

**Recommended scope:** disclose Delete + Don't suggest only. Leave Bail at second tier alongside Return to The Pile. Re-visit if the action row still feels crowded after.

---

## Item 2 — Adaptive primary CTA

### Current state (verified)
Steam-only by accident. The launch button at `components/GameCard.tsx:1089–1119` only renders if `game.steamAppId` exists. Six other platforms (`playstation`, `epic`, `xbox`, `switch`, `gog`, `other` per `lib/types.ts`) show no launch CTA. Desktop/mobile differentiation is a tooltip hint ("or Steam Link on mobile" line 1114) with no actual mobile-specific routing.

### Adaptive matrix

| Status | Launch CTA? | Copy | Behavior |
|---|---|---|---|
| Backlog | No | — | Status badge advances on tap |
| Up Next | No | — | Status badge advances on tap |
| Playing Now | **Yes** | "Launch in [Platform]" or "Open in [Platform] Store" | Platform/device-aware — see below |
| Completed | No | "Replay?" + "DLC / New Game+?" | Existing |
| Moved On | No | "Give it another shot?" | Existing |

### Platform × device matrix (Playing Now only)

| Platform | Game ID field | Desktop URI | iOS fallback | Android | Notes |
|---|---|---|---|---|---|
| Steam | `steamAppId` ✓ | `steam://rungameid/{id}` | `https://store.steampowered.com/app/{id}` | `steam://rungameid/{id}` | Already shipped for Steam |
| PlayStation | `psnTitleId` (NEW) | PSN store URL | PS App deeplink → store fallback | PSN App URI | Needs enrichment update |
| Xbox | `xboxGameId` (NEW) | Xbox Game Pass / `xbox://launch/{id}` | Xbox App or store | Xbox App URI | Game Pass detection optional v2 |
| Epic | `epicAppId` (NEW) | `com.epicgames.launcher://launch/{id}` | Epic store URL | Epic App URI | |
| GOG | `gogAppId` (NEW) | `goggalaxy://launch/{id}` | GOG store URL | GOG store URL | No mobile native deeplink |
| Switch | (eShop URL) | eShop URL | eShop URL | eShop URL | No URI scheme exists |
| other | — | Disabled CTA | "Launch not available" with tooltip | — | Graceful no-op |

### New utility
```typescript
// lib/launch.ts (new file)
function getAdaptiveLaunchURL(
  game: Game,
  deviceType: 'desktop' | 'ios' | 'android'
): { url: string; label: string; fallbackLabel?: string } | null
```

Returns null when nothing is available → render disabled-state CTA explaining why.

### Estimate
~340 LOC total per recon:
- Types: ~30 LOC (4 new optional platform-id fields on `Game`)
- Constants: ~50 LOC (protocol schemes, device detection helper)
- `lib/launch.ts`: ~120 LOC (matrix dispatch + fallback chain)
- `GameCard.tsx`: ~80 LOC (replace hardcoded Steam button with adaptive component)
- Tests / smoke: ~60 LOC

### Phasing
Don't ship the whole matrix in one PR. Order:
1. **Phase 1** (~80 LOC): Extract Steam logic into `lib/launch.ts` + device detection helper. No behavior change. Commit alone so the refactor is reversible.
2. **Phase 2** (~100 LOC): Add PSN + Xbox (the two platforms with the most user games after Steam). Requires one enrichment update for `psnTitleId` lookup; defer Xbox if OpenXBL doesn't return a usable launch ID.
3. **Phase 3** (~80 LOC): Add Epic + GOG + Switch. These are smaller user populations; OK to ship together.
4. **Phase 4** (~50 LOC): Disabled state copy polish + fallback chain for missing IDs.

### Risk
- Mobile deeplinks are unreliable across iOS Safari versions. Steam URI works on Android but iOS Safari often blocks. **Mitigation:** always fall back to a store URL if the deeplink can't be detected as installed; never silent-fail.
- Adding 4 new optional fields to `Game` type means localStorage games need migration tolerance. Use optional chaining everywhere; never throw on missing fields.

---

## Item 3 — "More like this from your library" (Completed only)

### Current state (verified)
No similarity logic exists. `lib/reroll.ts` has a sophisticated weighted-pick algorithm but no `findSimilar()` helper. Game type carries strong signals (genres, moodTags, timeTier, hltbMain, metacritic, source, rating) — enough for a v1 heuristic without ML.

### When this fires
**Only on the Completed (`played`) modal.** Psychological rationale:
- Backlog/Up Next/Playing Now: user is already mid-decision; surfacing more options re-introduces the paralysis we're solving (Iyengar).
- Completed: the just-finished moment is one of the few times "what next" is welcome — they're not paralyzed, they just won (Amabile).
- Moved On: would feel like guilt-tripping. Skip.

### Heuristic (v1)
`findSimilarGames(target: Game, allGames: Game[], limit = 5): Game[]`

Scoring (sum of weighted components):
- **Genre overlap** 40% — Jaccard similarity on `genres`
- **Mood match** 25% — overlap on `moodTags`
- **Time tier proximity** 20% — same tier = 1.0; ±1 = 0.5; further = 0
- **Metacritic bracket** 15% — both ≥75 or both <75 = 1.0; gap >25 = 0.5; else 0.75

Multiply by recency boost (more-recent completions weighted slightly higher, 0.8–1.5×). Sort desc, return top 5.

**Eligibility filter:** only games with `status === 'played'`, exclude the target itself.

**Fallback:** if no candidate scores >0.15, return 5 most-recent completions instead. If <2 completions exist, render nothing.

### UI
Horizontal scroll strip below the JumpBackIn block, before Notes — `components/GameCard.tsx:1010–1024` insertion point. 5 micro-cards: cover thumb (60–80px) + 1-line title. Tap a card → opens its modal.

Label: "From your shelf" or "You loved these too" (match voice-charter — confidence, not hedge).

Reuse: TabNav scroll pattern (`flex gap-2 overflow-x-auto scrollbar-hide`). Either inline a slim renderer or extract `<SimilarGameCard>` component (~30 LOC).

### Estimate
~110 LOC total:
- `lib/similarity.ts` (new): 50 LOC for `findSimilarGames` + scoring helpers
- `<SimilarGameCard>` or inline: 40 LOC
- `GameCard.tsx` integration: 20 LOC

### Edge cases
- 0 completions → don't render
- 1 completion (the target itself) → don't render
- 2–4 completions → render whatever exists, no padding
- All candidates score 0 → fallback to recent completions

### Risk
- Recency boost could cause "you just finished X, here's the other game you finished yesterday" — feels redundant. **Mitigation:** dampen recency for games completed within 7 days of target; user already knows about them.

---

## Common scope notes

- All three items live in `components/GameCard.tsx` (~1000 lines). Do NOT rewrite the file. Use targeted `Edit` calls on the action-row region (lines ~1080–1410) and the modal-only block (~1010–1024 for Item 3).
- All items only affect the modal/expanded view (`forceExpanded === true`). Do not touch the collapsed card path.
- Voice charter applies to all new copy. Run `/pre-push-review` before push.
- These items don't touch user data or third parties → no privacy update needed.
- These items don't change the core loop → no product-axiom flag.

---

## Order of operations recommendation

1. **Item 2 Phase 1** (extract launch logic, no behavior change) — small, reversible, unblocks the rest.
2. **Item 1** (destructive-action disclosure) — visible cleanup, makes room for Item 2's adaptive CTA.
3. **Item 2 Phases 2–4** (full matrix) — once the action row is decluttered.
4. **Item 3** (more like this) — independent, can ship anytime.

Each item is its own session. Don't batch.
