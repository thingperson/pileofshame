# OG Share Card Improvements

**Captured:** Apr 15, 2026 from Cowork DesignOS critique + Brady decisions
**Scope:** Viral growth work. Separate from landing PR. Land after landing ships.

---

## Decisions locked

### 1. Persona card auto-title — use username when available

**Current:** `Someone has 39 games tracked, 5 completed | Inventory Full`
**New pattern:** `[USERNAME] is an Archaeologist with 39 games waiting to be played | Inventory Full`

**Fallback when no username:** `The Archaeologist has 39 games waiting to be played | Inventory Full`

Username pulled from whatever display-name field the user has filled (Supabase auth name, user-set display name, etc.). If empty, fall back to persona-led title without a name.

**Why this matters:** Title is often the only thing that loads before the preview image renders. Persona name is the hook, not the raw count.

---

### 2. Rotating completion-card tagline variants

**Current:** Static "Knocked out [Game]. Feels good."
**New:** A pool of 5–8 Brady-voice variants, picked based on game traits or random rotation.

**Principle Brady called out:** the more customized to the user's moment, the better. "Hey my card says this instead of yours" is a nice surprise and signals thoughtfulness. Repetition kills that surprise.

**Proposed pool (workshop more before shipping):**
- "Crushed [Game] after [X] years of guilt." *(triggered when play stretched across years)*
- "[Game]: done. Onto the next one."
- "Finally beat [Game]. Only [N] left." *(uses remaining backlog count)*
- "[Game] — cleared. No shame."
- "Closed out [Game]. Pile down to [N]."
- "Knocked out [Game]. Feels good." *(keep the original in rotation)*
- "[Game] done. That's one more off the list."
- "Cleared [Game]. [$X] of library played so far."

**Trait-based picking examples:**
- Long game (40+ hrs) → "Crushed" variant
- First completion ever → "That's one more off the list"
- Completion after long gap → "Finally beat" variant
- Randomize within the eligible pool

---

### 3. Library Value — rename "unlocked" to "reclaimed"

**Brady's reframe:** "unlocked" sounds like gaming-DLC language. "Reclaimed" is stronger — we gave them value back from their hoard. Positions the product as an act of recovery, not unlocking.

**Proposed language:**
- "Reclaimed from the backlog: $277"
- "$984 still waiting to be won back"
- Or: "$984 in backlog waiting to be reclaimed"

**Where this copy lives:**
- Stats panel
- Persona card (current)
- **NEW:** Completion share card (see #4)

---

### 4. Library Value on completion card

**Add $ context to every completion share:**
- "Knocked out Baldur's Gate 3. $60 reclaimed. $984 still waiting."
- "Game #8 cleared. $277 reclaimed from the backlog so far."

Every completion share becomes a re-hit of the dollar-value insight. No competitor surfaces this metric.

**Tradeoff:** Longer line may not fit the share-card layout as cleanly as the current single-line tagline. Test before committing to it as the default; may be an optional variant in the rotation pool instead of a forced addition.

---

### 5. "Less shame. More game." in OG unfurl description

**Ship this.** Include the tagline in the OG meta description across both card types (persona + completion). Brand rules previously gated it to celebration/share contexts only; the OG unfurl *is* a share context, so it's compliant.

**Proposed meta description patterns:**
- Persona: `[USERNAME] is an Archaeologist — 39 games waiting, $984 to reclaim. Less shame. More game.`
- Completion: `[USERNAME] just cleared [Game]. $60 reclaimed. Less shame. More game.`

---

## Deferred / open for future consideration

### Horizontal OG variant for Twitter/Discord
Cowork flagged the persona card as vertical-optimized, suggesting a landscape variant for platform unfurls. **Defer** — generate per-platform variants once we have real unfurl data post-launch showing which platforms matter most.

### Label for "18%" stat on persona card
Minor fix. Add a single-word label ("explored" or "cleared") next to the percentage. **Ship with the other persona card improvements** — tiny change, real clarity win.

### Explainer for dollar figures
Hover tooltip or asterisk note: "based on [data source]". **Ship alongside** the reclaimed-language change — same surface, same PR.

---

## Brady's strategic disagreement with Cowork

Cowork's claim: **persona cards are probably more viral than completion cards** because they're identity content (persistent URL, updatable, Spotify Wrapped-style identity claim) vs. episodic achievement bursts.

**Brady's position:** completion celebrations carry equal meaning. Both serve different moments. Don't deprioritize one for the other. This is a 50–50 call without real data — we're guessing.

**Resolution:** ship improvements to both card types with equal investment. Let real share metrics post-launch tell us which is carrying more weight.

---

## Shipping order (proposed)

1. Persona auto-title with username (smallest, highest leverage — do first)
2. "Reclaimed" language swap across existing copy
3. Rotating completion tagline pool
4. $ value on completion card (as rotation variant, not forced)
5. "Less shame. More game." in OG meta description
6. 18% stat label + dollar explainer tooltip

Total estimated scope: 2–3 hours if done in one pass. Can be a follow-up commit after landing PR ships, or split across two sessions.
