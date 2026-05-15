# Decision Engine V3 -- Specification

> **STATUS: SHIPPED (April 2026) — historical reference.** All six features below are live in production. This spec documents what was built, not what's planned. See ROADMAP.md "SHIPPED" section for live-status references.

**Date:** April 6, 2026
**Status:** Shipped April 2026 (all 6 features live)
**Depends on:** Decision Engine V2 (shipped), Skip Tracking (shipped), Stalled Game Detection (shipped)
**Files affected:** `lib/reroll.ts`, `lib/skipTracking.ts`, `lib/types.ts`, `components/Reroll.tsx`, `components/StatsPanel.tsx`

---

## What V3 Does

V2 picks games using metacritic, enrichment, backlog age, hours played, time-of-day, genre balance, and skip history. It works. But it treats every user the same. V3 makes the engine personal.

Six features, in order of build priority:

1. "Almost Done" reroll mode
2. Post-recommendation nudge
3. Cooldown / genre fatigue
4. Skip feedback ("Why'd you skip?")
5. Energy matching
6. Behavioral learning

The first three can ship in a day. Skip feedback and energy matching are a weekend. Behavioral learning is a full sprint.

---

## 1. "Almost Done" Reroll Mode

**Effort:** 1 hour | **Priority:** Build first

A new mode in the reroll picker. Only surfaces games where the user is close to finishing.

### Logic

A game qualifies when:
- `hoursPlayed > 0`
- `hltbMain > 0`
- `(hltbMain - hoursPlayed) / hltbMain < 0.20` (less than 20% remaining)
- Game is not `played`, `bailed`, or `ignored`

If no games qualify, show: **"Nothing's close to done yet. Keep playing."**

### Implementation

Add to `REROLL_MODES` in `lib/reroll.ts`:

```ts
{ mode: 'almost-done', label: 'Almost Done', icon: '🏁', description: 'Games you\'re close to finishing' }
```

Update `RerollMode` type:

```ts
export type RerollMode = 'anything' | 'quick-session' | 'deep-cut' | 'continue' | 'almost-done';
```

Add case in `getEligibleGames`:

```ts
case 'almost-done': {
  if (!game.hltbMain || game.hltbMain <= 0 || game.hoursPlayed <= 0) return false;
  const remaining = (game.hltbMain - game.hoursPlayed) / game.hltbMain;
  return remaining > 0 && remaining < 0.20;
}
```

### Edge Cases

- Games with no HLTB data are excluded (can't calculate proximity)
- Games where `hoursPlayed > hltbMain` still qualify (they're past the estimate, probably close)
- Non-finishable games (`isNonFinishable === true`) should be excluded from this mode

---

## 2. Post-Recommendation Nudge

**Effort:** 1-2 hours | **Priority:** Build second

After the user clicks "Let's Go" on a reroll pick, show a brief motivational overlay. Reinforces the core product axiom: every minute in the app should justify itself against a minute playing.

### UI

- Overlay card that appears after "Let's Go" tap
- Auto-dismisses after 3 seconds, or on tap anywhere
- Not a new screen. Not a modal. A fade-in card on top of the existing modal, then fade-out.

### Content

The card shows:

1. **Game name** (bold)
2. **Session length estimate** (from HLTB: `~${hltbMain}h to beat` or `~${Math.ceil(hltbMain - hoursPlayed)}h left` if in progress)
3. **One motivational line** (randomly selected from pool below)
4. **Launch CTA** if applicable

### Copy Pool

Rotate randomly. No two consecutive sessions should show the same line.

```
"Go. We'll be here when you get back."
"{game} isn't going to play itself. Close the app."
"You made a decision. That's the hard part. Now play."
"The pile just got smaller. Go."
"You picked it. Trust your gut."
"One less game to wonder about. Go find out."
```

### Launch Link

If `game.steamAppId` exists: show "Launch on Steam" button linking to `steam://run/${game.steamAppId}`

If `game.source === 'playstation'`: show "Go play" (no deep link available)

If `game.source === 'xbox'`: show "Go play" (no deep link available)

All other sources: show "Go play" with no link.

### Implementation

New state in the Reroll component: `postAccept: Game | null`. When set, render the nudge overlay instead of the game card. After 3 seconds or tap, close the entire reroll modal.

No new files needed. This lives inside `components/Reroll.tsx`.

---

## 3. Cooldown / Genre Fatigue

**Effort:** 1-2 hours | **Priority:** Build third

After completing a long game, the engine should suggest something different. If you just finished a 40-hour RPG, another 40-hour RPG right away feels like homework.

### Logic

Track the last 3 games that moved to `played` status along with their genres and completion date. Store in localStorage.

When scoring a game in `calculateWeight`:
- Check if the game shares a primary genre with any of the last 3 completions
- If a completion happened within the last 7 days: apply 0.6x multiplier per genre overlap
- If a completion happened 7-14 days ago: apply 0.8x multiplier
- After 14 days: no penalty

This stacks with genre balance (which tracks within a single reroll session). Cooldown tracks across sessions.

### Data Schema

```ts
// localStorage key: 'if-genre-cooldowns'
interface GenreCooldownEntry {
  gameId: string;
  genres: string[];       // lowercased
  completedAt: string;    // ISO date
}

// Stored as GenreCooldownEntry[] (max 3, newest first)
```

### Where to Record

When a game's status changes to `played` (in `components/GameCard.tsx` or wherever `updateGame` is dispatched with `status: 'played'`), write to the cooldown store. Keep only the 3 most recent entries.

### Edge Cases

- Games with no genres: no cooldown applies to them, and they don't create cooldown for others
- User clears 3 games from the same genre in a row: the multiplier stacks (0.6 * 0.6 = 0.36 for that genre). This is intentional. Variety is the point.
- Bailed games do NOT trigger cooldown. Bailing means the user is done with that specific game, not necessarily the genre.

---

## 4. Skip Feedback ("Why'd you skip?")

**Effort:** 3-4 hours | **Priority:** Build fourth

After a user skips a game in reroll, show an optional quick-tap overlay. Not blocking. Not required. Just there if they want to tell us something.

### UI

- Small pill row that slides down below the game card area after a skip
- Appears with a short slide-down animation (150ms)
- Header text: **"Why'd you skip?"** (small, muted)
- 5 pill buttons in a single row (wrap on narrow screens)
- Auto-dismisses after 3 seconds if no tap
- Tapping a pill records the reason, shows a brief checkmark flash, then dismisses
- The next game suggestion loads immediately on skip. The pill row is non-blocking; it overlays beneath the new suggestion.

### Reason Options

| Pill Label | Internal Key | What It Means |
|---|---|---|
| Not in the mood | `not-in-mood` | Temporary. No permanent weight change. |
| Too long | `too-long` | Session length mismatch. |
| Played recently | `played-recently` | Wants variety. |
| Hit a wall | `hit-a-wall` | Stuck, frustrated, needs cooldown. |
| Not interested | `not-interested` | Soft signal toward ignore. |

### Data Schema

```ts
// localStorage key: 'if-skip-reasons'
interface SkipReasonData {
  reasons: Record<string, number>;  // reason key -> count
  lastReason: string;               // most recent reason key
  lastReasonAt: string;             // ISO date
}

// Stored as Record<string, SkipReasonData> keyed by gameId
// Example:
// {
//   "game-123": {
//     "reasons": { "not-in-mood": 3, "too-long": 1 },
//     "lastReason": "not-in-mood",
//     "lastReasonAt": "2026-04-06T22:15:00.000Z"
//   }
// }
```

### How Reasons Feed Back Into the Engine

These adjustments happen in `calculateWeight` (or a new helper called from it):

**"Too long" (3+ total across all games tagged "too-long" where the game's timeTier is 'marathon' or 'deep-cut'):**
- Compute the user's total "too-long" reason count across all games
- If >= 3: apply 0.7x to marathon games, 0.85x to deep-cut games
- If >= 6: apply 0.5x to marathon, 0.7x to deep-cut
- This is a global user preference signal, not per-game

**"Not in the mood":**
- No permanent weight change. This is transient.
- The existing session-skip penalty (0.2x) already handles the current session.

**"Hit a wall":**
- After recording, suppress the game for 7 days (check `lastReasonAt`)
- After 7 days, the game returns to normal weight
- Implementation: in `calculateWeight`, if the game's last reason is `hit-a-wall` and it was recorded less than 7 days ago, return weight * 0.1

**"Not interested" (2+ for the same game):**
- Treat as soft-ignore equivalent
- In `getEligibleGames`, if a game has 2+ "not-interested" reasons, filter it out
- This is additive with the existing skip-count soft-ignore (5+ skips)

**"Played recently":**
- Boost the genre cooldown timer for that genre
- If the game's genres overlap with recent completions, extend the cooldown period from 7 days to 14 days
- Also: if this reason appears 3+ times across different games of the same genre, apply a 0.8x genre-wide weight

### Migration

The `if-skip-reasons` key is new. No migration needed from existing `if-skip-counts`. Both coexist. `if-skip-counts` tracks raw skip counts (already shipped). `if-skip-reasons` adds optional context.

A skip without a reason tap still records in `if-skip-counts` as before. The reason is bonus data.

---

## 5. Energy Matching

**Effort:** 3-4 hours | **Priority:** Build fifth

Let the user declare their energy level before rolling. The engine adjusts game selection accordingly.

### UI

Three-option selector shown in the reroll modal, above the mode picker:

```
How's your energy?
[🔋 Low]  [⚡ Medium]  [🔥 High]
```

Styled as pill buttons, same pattern as mood tags. One selected at a time. Default is auto-selected based on time of day.

### Time-of-Day Defaults

| Time Window | Default Energy |
|---|---|
| 6am - 11am | High |
| 11am - 5pm | Medium |
| 5pm - 9pm | Medium (leaning Low) |
| 9pm - midnight | Low |
| midnight - 6am | Low |

The user can override. Override persists for the current reroll session only. Closing and reopening the modal resets to the time-based default.

### Energy-to-Game Mapping

Each energy level applies multipliers to games based on their mood tags and time tier.

**Low Energy:**

| Signal | Multiplier |
|---|---|
| moodTag: chill | 1.8x |
| moodTag: brainless | 1.8x |
| moodTag: atmospheric | 1.4x |
| moodTag: story-rich | 1.2x |
| timeTier: quick-hit | 1.6x |
| timeTier: wind-down | 1.5x |
| moodTag: intense | 0.4x |
| moodTag: competitive | 0.4x |
| moodTag: strategic | 0.5x |
| timeTier: marathon | 0.4x |
| timeTier: deep-cut | 0.6x |

**Medium Energy:**

| Signal | Multiplier |
|---|---|
| moodTag: atmospheric | 1.3x |
| moodTag: story-rich | 1.3x |
| moodTag: creative | 1.2x |
| All other signals | 1.0x (neutral) |

**High Energy:**

| Signal | Multiplier |
|---|---|
| moodTag: intense | 1.8x |
| moodTag: competitive | 1.6x |
| moodTag: strategic | 1.5x |
| timeTier: deep-cut | 1.3x |
| timeTier: marathon | 1.2x |
| moodTag: brainless | 0.5x |
| moodTag: chill | 0.6x |
| timeTier: quick-hit | 0.7x |

### Interaction with Time-of-Day Weights

Energy matching **replaces** the current `getTimeOfDayWeight` function in `lib/reroll.ts`. The current time-of-day system (lines 77-122) becomes the default energy selection logic, but the actual weight calculation moves to energy-based multipliers.

Before V3: time-of-day directly modifies weights.
After V3: time-of-day sets a default energy level, and energy level modifies weights.

The user can override, which is the whole point. The current system has no user control.

### Implementation

New function in `lib/reroll.ts`:

```ts
export type EnergyLevel = 'low' | 'medium' | 'high';

export function getDefaultEnergy(): EnergyLevel {
  const hour = new Date().getHours();
  if (hour >= 21 || hour < 6) return 'low';
  if (hour >= 6 && hour < 11) return 'high';
  return 'medium'; // 11am-9pm
}

function getEnergyWeight(game: Game, energy: EnergyLevel): number {
  // Implementation per tables above
  // Multiple matching signals multiply together, clamped to [0.2, 4.0]
}
```

In `calculateWeight`, replace `weight *= getTimeOfDayWeight(game, getTimeOfDay())` with `weight *= getEnergyWeight(game, energy)`.

The `energy` parameter needs to flow from the UI through `pickWeighted`. Update the function signature:

```ts
export function pickWeighted(
  games: Game[],
  skippedIds?: Set<string>,
  recentPicks?: Game[],
  energy?: EnergyLevel,  // NEW
): Game | null
```

### State Management

Energy selection is component state in `Reroll.tsx`. Not persisted. Not in localStorage. Resets when the modal closes.

---

## 6. Behavioral Learning

**Effort:** 8-12 hours | **Priority:** Build last

This is the big one. The engine tracks what the user accepts and skips over time, then adjusts weights based on observed patterns. The goal is simple: if someone always picks RPGs and always skips platformers, stop suggesting platformers so often.

### Data Collection

Every time the user interacts with a reroll suggestion (accept or skip), record it.

```ts
// localStorage key: 'if-decision-history'
interface DecisionRecord {
  gameId: string;
  gameName: string;         // for Stats UI display
  mode: RerollMode;
  action: 'accept' | 'skip';
  moodFilters: MoodTag[];   // active mood filters at decision time
  energy: EnergyLevel;      // energy level at decision time
  genres: string[];          // game's genres (lowercased)
  timeTier: TimeTier;
  timestamp: string;         // ISO date
}

// Stored as DecisionRecord[] -- rolling window of last 100 entries
// When array exceeds 100, drop the oldest entries
```

### Recording

In `Reroll.tsx`, when the user:
- **Skips**: push a record with `action: 'skip'`
- **Accepts** ("Let's Go"): push a record with `action: 'accept'`

Helper function in a new file `lib/decisionHistory.ts`:

```ts
const STORAGE_KEY = 'if-decision-history';
const MAX_ENTRIES = 100;

export function recordDecision(record: DecisionRecord): void { ... }
export function getDecisionHistory(): DecisionRecord[] { ... }
export function clearDecisionHistory(): void { ... }
```

### Derived Signals

Computed on each roll, not pre-cached. With 100 records max, computation is trivial.

**Genre Affinity**

```
For each genre that appears in the history:
  acceptCount = decisions where action='accept' and genres includes this genre
  totalCount = decisions where genres includes this genre
  acceptRate = acceptCount / totalCount

Overall average acceptance rate:
  avgRate = total accepts / total decisions

Genre affinity multiplier = (acceptRate / avgRate), clamped to [0.5, 2.0]
```

Example: User has 40% overall accept rate. RPGs have 80% accept rate. RPG affinity = 80/40 = 2.0x. Platformers have 10% accept rate. Platformer affinity = 10/40 = 0.25, clamped to 0.5x.

**Time Tier Preference**

Same formula as genre affinity, but grouped by `timeTier` instead of genre.

```
For each time tier:
  acceptRate = accepts in this tier / total decisions in this tier
  tierMultiplier = (acceptRate / avgRate), clamped to [0.5, 2.0]
```

**Mood Correlation**

Track which mood filter combinations lead to accepts vs skips. This is informational for the Stats page but does not directly modify weights. The mood filters are user-selected, so they already express preference. We don't need to second-guess them.

**Session Variety Preference**

Measure genre entropy across accepted games:
- High entropy (user accepts games from many genres) = the engine should maintain variety
- Low entropy (user mostly accepts one genre) = the engine can lean into that genre harder

This adjusts how aggressively genre affinity weights are applied:
- High variety user: clamp genre affinity to [0.7, 1.5] instead of [0.5, 2.0]
- Low variety user: use full [0.5, 2.0] range

Entropy calculation: Shannon entropy over genre distribution of accepted games. Threshold: entropy > 2.0 = high variety, < 1.0 = low variety, between = default.

### Weight Integration

In `calculateWeight`, after all existing weights:

```ts
// Behavioral learning weights (only active with 10+ decisions)
const history = getDecisionHistory();
if (history.length >= 10) {
  const genreAffinity = computeGenreAffinity(game, history);
  const tierPref = computeTierPreference(game, history);
  weight *= genreAffinity;
  weight *= tierPref;
}
```

These multiply on top of everything else. The clamp at the end of `calculateWeight` ([0.1, 20]) still applies.

### Cold Start

Fewer than 10 decisions: no behavioral weights applied. The engine behaves exactly like V2. No degradation, no guessing.

At 10-25 decisions: behavioral weights are applied but with dampening (multiply the deviation from 1.0 by 0.5). So a 2.0x affinity becomes 1.5x, and a 0.5x becomes 0.75x.

At 25+ decisions: full behavioral weights.

### Stats Page: "Your Decision Engine"

New section in `components/StatsPanel.tsx`. Only appears when the user has 10+ decisions recorded.

**Header:** "Your Decision Engine"

**Content (examples):**

```
You tend to pick: RPGs, story-rich games
You usually skip: platformers, competitive games
Your sweet spot: 15-30 hour games
Decisions tracked: 47
```

The "tend to pick" line shows the top 2 genres by acceptance rate (minimum 3 decisions in that genre to qualify).

The "usually skip" line shows the bottom 2 genres by acceptance rate (minimum 3 decisions).

The "sweet spot" line maps the highest-acceptance time tier to a human-readable range:
- quick-hit: "under 10 hours"
- wind-down: "10-20 hours"
- deep-cut: "20-40 hours"
- marathon: "40+ hours"

**Reset button:** "Reset learned preferences" -- clears `if-decision-history` from localStorage. Confirmation dialog: "This resets the engine to factory settings. Your skip counts and library aren't affected."

### Privacy

All data lives in localStorage. Never sent to a server. Never synced to Supabase (unless the user explicitly requests cloud sync of preferences in a future phase, with consent). Deletable from the Stats page. Exportable as part of any future data export feature.

No third party ever sees this data. See `.claude/rules/legal-compliance.md`.

---

## Complete Data Schema Reference

### Existing Keys (no changes)

| Key | Type | Purpose |
|---|---|---|
| `if-skip-counts` | `Record<string, SkipData>` | Per-game skip count + last skip date |

### New Keys

| Key | Type | Purpose |
|---|---|---|
| `if-skip-reasons` | `Record<string, SkipReasonData>` | Per-game skip reason breakdown |
| `if-genre-cooldowns` | `GenreCooldownEntry[]` | Last 3 completed games + genres + dates |
| `if-decision-history` | `DecisionRecord[]` | Rolling 100-entry decision log |

### Full TypeScript Interfaces

```ts
// ── Skip Reasons ──────────────────────────────────────────────────

type SkipReasonKey = 'not-in-mood' | 'too-long' | 'played-recently' | 'hit-a-wall' | 'not-interested';

interface SkipReasonData {
  reasons: Partial<Record<SkipReasonKey, number>>;
  lastReason: SkipReasonKey;
  lastReasonAt: string; // ISO date
}

// localStorage 'if-skip-reasons': Record<string, SkipReasonData>
// Key is gameId

// ── Genre Cooldowns ───────────────────────────────────────────────

interface GenreCooldownEntry {
  gameId: string;
  genres: string[];     // lowercased
  completedAt: string;  // ISO date
}

// localStorage 'if-genre-cooldowns': GenreCooldownEntry[]
// Max 3 entries, newest first

// ── Decision History ──────────────────────────────────────────────

interface DecisionRecord {
  gameId: string;
  gameName: string;
  mode: RerollMode;
  action: 'accept' | 'skip';
  moodFilters: MoodTag[];
  energy: EnergyLevel;
  genres: string[];     // lowercased
  timeTier: TimeTier;
  timestamp: string;    // ISO date
}

// localStorage 'if-decision-history': DecisionRecord[]
// Max 100 entries, oldest dropped when exceeded

// ── Energy Level ──────────────────────────────────────────────────

type EnergyLevel = 'low' | 'medium' | 'high';
```

### Migration Notes

- No existing localStorage keys are modified
- All V3 keys are additive
- If a V3 key doesn't exist, the feature gracefully degrades (no behavioral weights, no cooldown, no skip reasons)
- Clearing localStorage returns the engine to V2 behavior automatically
- No Supabase schema changes for V3

---

## Implementation Priority and Estimates

| # | Feature | Effort | Dependencies | New Files |
|---|---|---|---|---|
| 1 | Almost Done mode | 1h | None | None |
| 2 | Post-recommendation nudge | 1-2h | None | None |
| 3 | Cooldown / genre fatigue | 1-2h | None | `lib/genreCooldown.ts` |
| 4 | Skip feedback | 3-4h | None | `lib/skipReasons.ts` |
| 5 | Energy matching | 3-4h | None | None (extends `lib/reroll.ts`) |
| 6 | Behavioral learning | 8-12h | Features 4+5 (for recording context) | `lib/decisionHistory.ts` |

**Total estimated effort:** 17-25 hours

Features 1-3 have zero dependencies on each other. Build and ship them independently.

Feature 4 (skip feedback) and Feature 5 (energy matching) are also independent of each other but both feed data into Feature 6 (behavioral learning). Ship 4 and 5 before 6 so the decision history records include skip reasons and energy levels from day one.

Feature 6 should ship last. It needs accumulated data from features 4 and 5 to be useful, and it benefits from a few days of user decisions piling up before the weights activate.

---

## Testing Approach

### Almost Done Mode

1. Create a test game with `hltbMain: 20, hoursPlayed: 18` (10% remaining). Verify it appears in Almost Done mode.
2. Create a game with `hltbMain: 20, hoursPlayed: 10` (50% remaining). Verify it does NOT appear.
3. Create a game with `hltbMain: 0`. Verify it does not appear (no HLTB data).
4. Set all games to > 20% remaining. Verify the "Nothing's close to done yet" message shows.
5. Verify `isNonFinishable` games are excluded.
6. Verify `ignored` games are excluded.

### Post-Recommendation Nudge

1. Accept a Steam game. Verify the nudge shows with "Launch on Steam" button.
2. Accept a PlayStation game. Verify the nudge shows "Go play" without a link.
3. Verify the nudge auto-dismisses after 3 seconds.
4. Tap the nudge before 3 seconds. Verify it dismisses and closes the reroll modal.
5. Accept a game with no HLTB data. Verify the session estimate line is omitted (not "~NaNh").
6. Accept the same game twice across sessions. Verify copy lines rotate.

### Cooldown / Genre Fatigue

1. Complete an RPG. Open reroll. Verify other RPGs have reduced weight (check by rolling 20 times and counting genre distribution).
2. Complete 3 games of different genres. Verify cooldown entries cap at 3.
3. Wait 7 days (or mock the date). Verify cooldown penalty expires.
4. Bail on a game. Verify no cooldown is created.
5. Complete a game with no genres. Verify no cooldown created.

### Skip Feedback

1. Skip a game. Verify pill row appears below the next suggestion.
2. Wait 3 seconds without tapping. Verify pills auto-dismiss.
3. Tap "Too long." Verify checkmark flash, then dismiss.
4. Check `if-skip-reasons` in localStorage. Verify the reason was recorded correctly.
5. Skip the same game 3 times with "too-long." Verify marathon games have reduced weight on next rolls.
6. Give a game 2x "not-interested." Verify it stops appearing in suggestions.
7. Give a game "hit-a-wall." Verify it doesn't appear for 7 days, then reappears.
8. Skip without tapping any reason pill. Verify `if-skip-counts` still increments (existing behavior), and `if-skip-reasons` is unchanged for that game.

### Energy Matching

1. Set system clock to 10pm. Open reroll. Verify "Low" is pre-selected.
2. Set system clock to 9am. Verify "High" is pre-selected.
3. Select "Low." Roll 20 times. Verify chill/brainless/quick-hit games appear more often than intense/marathon.
4. Select "High." Roll 20 times. Verify intense/competitive/strategic games appear more often.
5. Override default, close modal, reopen. Verify default resets to time-based.
6. Verify the old `getTimeOfDayWeight` function is no longer called (replaced by energy).

### Behavioral Learning

1. With fewer than 10 decisions recorded, verify no behavioral weight is applied (engine behaves like V2).
2. Accept 10 RPGs, skip 10 platformers. Verify RPGs appear more frequently on subsequent rolls.
3. Verify the Stats page "Your Decision Engine" section appears after 10 decisions.
4. Verify "tend to pick" shows correct genres.
5. Verify "usually skip" shows correct genres.
6. Click "Reset learned preferences." Verify `if-decision-history` is cleared.
7. Verify the section disappears after reset (back below 10 decisions).
8. Record 101 decisions. Verify only 100 are stored (oldest dropped).
9. Verify genre affinity clamp: no multiplier exceeds 2.0x or drops below 0.5x.
10. With 15 decisions (dampened range): verify multipliers are less extreme than at 30+ decisions.

---

## What V3 Does NOT Do

- No server-side storage. Everything is localStorage.
- No ML model. Weighted heuristics only.
- No collaborative filtering ("people like you"). We don't have the user base for it, and it's a privacy minefield.
- No push notifications. All feedback is in-app, during active use.
- No new data sent to any third party. GA4 events for reroll/commit are unchanged.
- No complex preference questionnaire. The engine infers from behavior. The user never fills out a form.

---

## Copy Direction

All user-facing copy in V3 follows the voice guide (`.claude/rules/voice-and-tone.md`).

**Skip feedback header:** "Why'd you skip?" (casual, not "Please provide feedback on this recommendation")

**Energy selector:** "How's your energy?" (direct question, not "Select your current energy level")

**Stats section:** "Your Decision Engine" (ownership language, it's THEIR engine). Descriptions are short declarative statements, not paragraphs.

**Post-nudge copy:** Short. Imperative mood. Period at the end, not exclamation marks. The user just made a decision. We're confirming it, not celebrating it with confetti (that's for completions).

**Empty states:**
- Almost Done with no games: "Nothing's close to done yet. Keep playing."
- Stats with < 10 decisions: section simply doesn't render. No "keep using the app to unlock insights" message. That's needy.

---

## Success Metrics

V2 baseline: users skip ~3-4 times before accepting a suggestion.

V3 target: reduce to ~1-2 skips on average after 2 weeks of use (behavioral learning needs time to accumulate data).

Secondary: users who provide skip feedback should have a lower skip rate than those who don't, because the engine learns faster with explicit signals.

Tertiary: "Almost Done" mode should have the highest accept-on-first-roll rate of any mode, because every game it shows is already in progress and close to finishing.

---

## References

- Current engine: `lib/reroll.ts`
- Skip tracking: `lib/skipTracking.ts`
- Game types: `lib/types.ts`
- Behavioral framework: `docs/behavioral-learning-framework.md`
- V1/V2 plan: `docs/decision-engine-plan-2026-04-03.md`
- Psychology research: `.claude/plans/psychology-informed-features.md`
- Legal guardrails: `.claude/rules/legal-compliance.md`
- Voice guide: `.claude/rules/voice-and-tone.md`
- Brand messaging: `.claude/rules/brand-messaging.md`
