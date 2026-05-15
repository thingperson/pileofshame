# Decision Engine Improvement Plan — April 3, 2026

## Current State
The Reroll system picks games using basic random selection with mode-based filtering:
- **Anything**: random from entire library
- **Quick Session**: filters to quick-hit + wind-down tiers
- **Deep Cut**: filters to deep-cut + marathon tiers
- **Continue**: filters to games with >0 hours played

No weighting. No mood matching. No learning. A game with 98 metacritic and a game with no data have equal chance.

## Goal
Make recommendations feel trustworthy. Users should think "yeah, that's a good pick" more often than "nah, skip." Reduce skip rate without removing user agency.

---

## Priority Items

### 1. Weighted Random Selection
**Effort**: Small | **Impact**: High | **Priority**: P0

Replace Math.random() with weighted selection based on available signals:

```
Weight factors:
- Metacritic score: 90+ → 3x, 75-89 → 2x, 50-74 → 1x, <50 or none → 0.5x
- Enrichment completeness: has description + cover + mood tags → 2x, missing data → 0.5x
- Backlog age: >1 year in pile → 1.5x (surface forgotten games)
- Time tier match (mode-dependent): exact match → 2x
- Hours played: 0h → 1x, 1-20h → 1.5x (started but not deep), 50+ → 0.5x (might be a comfort game)
- Recently skipped: if skipped in last 3 rolls → 0.3x (don't re-suggest rejected games)
```

Weights multiply together. Final weight is clamped to [0.1, 20] to prevent any single game from dominating.

**Files to modify**: `components/Reroll.tsx` (pickGame function)

### 2. Mood Mode in Reroll
**Effort**: Small | **Impact**: High | **Priority**: P0

Add mood tag pills to the Reroll modal. When the user taps a mood (e.g., "Chill", "Intense", "Story-Rich"), filter candidates to games with matching `moodTags` before applying weighted random.

UI: row of pill buttons below the mode switcher. Multiple moods can be selected (AND filter). Tapping a selected mood deselects it.

**Mood tags available** (from enrichment): chill, intense, story-rich, competitive, creative, spooky, cozy, strategic, chaotic, atmospheric, nostalgic, experimental

**Files to modify**: `components/Reroll.tsx` (add mood filter UI + filter logic), `lib/enrichment.ts` (reference MOOD_TAG_CONFIG)

### 3. Skip Memory (Short-Term)
**Effort**: Small | **Impact**: Medium | **Priority**: P1

Track which games were skipped in the current session. Don't re-suggest them until the session resets (modal close). Simple Set<string> in component state.

Already partially implemented via abuse protection (forced choice at roll 10). This makes rolls 1-9 smarter.

**Files to modify**: `components/Reroll.tsx`

### 4. Improved Forced Choice UI
**Effort**: Medium | **Impact**: Medium | **Priority**: P1

Current forced choice at roll 10 shows 3 random games. Improve:
- Show cover art for all 3
- Show metacritic + session length + mood tags for each
- Brief description (1 line)
- Make it feel like a genuine "pick your adventure" moment, not a punishment

**Files to modify**: `components/Reroll.tsx` (ForceChoiceCard subcomponent)

### 5. Post-Recommendation Nudge
**Effort**: Small | **Impact**: Medium | **Priority**: P1

After the user accepts a recommendation (clicks "Let's Go" or similar), show a brief nudge:
- Game launch link (Steam protocol link if Steam game)
- "Close app and go play" CTA
- Session length estimate ("~2 hours for a good session")

Reinforces the core loop: decide → leave app → play.

**Files to modify**: `components/Reroll.tsx` (post-accept state)

### 6. Time-of-Day Awareness (Optional)
**Effort**: Small | **Impact**: Low-Medium | **Priority**: P2

Soft preference based on local time:
- After 9pm: slightly boost chill/wind-down games
- Morning/afternoon: no change
- Weekend detection: slightly boost marathon/deep-cut

Not a hard filter — just a 1.3x weight multiplier. User never sees this, it just makes recommendations feel more "right."

**Files to modify**: `components/Reroll.tsx` (weight calculation)

### 7. "Why This Game?" Tooltip
**Effort**: Small | **Impact**: Low | **Priority**: P2

After recommendation, small text explaining why: "High-rated RPG you haven't started. ~15 hours to beat."

Builds trust in the recommendation system. Users understand the app isn't just random.

**Files to modify**: `components/Reroll.tsx`

### 8. Genre Balance (Learning)
**Effort**: Medium | **Impact**: Medium | **Priority**: P3

Track what genres the user has been playing/clearing. If they've cleared 5 RPGs in a row, slightly boost non-RPG games. Prevents recommendation tunnel vision.

Requires persisted play history analysis. More complex, build later.

**Files to modify**: `lib/store.ts` (play history tracking), `components/Reroll.tsx`

---

## What NOT to Build

- ❌ **Swipe mechanics** (Tinder for games) — adds a whole interaction paradigm, doesn't help decide faster
- ❌ **Streaks** — gamifies app usage, not game playing. Against our anti-overgamification stance.
- ❌ **Fake social proof** ("87% of players loved this") — dishonest, we don't have the data
- ❌ **ML recommendation model** — overkill for current scale, weighted random is good enough
- ❌ **Collaborative filtering** ("people like you played...") — need thousands of users first
- ❌ **Complex preference questionnaire** — more setup = more friction. Infer from behavior instead.

---

## Implementation Order

```
Sprint 1 (Now):  #1 Weighted Random + #2 Mood Mode + #3 Skip Memory
Sprint 2 (Next): #4 Forced Choice UI + #5 Post-Recommendation Nudge
Sprint 3 (Later): #6 Time-of-Day + #7 Why This Game
Backlog:          #8 Genre Balance
```

## Success Metric
Reduce average skips-before-accept from current ~3-4 to ~1-2. Users should feel "yeah, good pick" on the first or second recommendation most of the time.
