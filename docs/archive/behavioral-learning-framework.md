# Behavioral Learning Framework

How we detect, understand, and respond to user play patterns to help them actually play their games.

## Core Philosophy

We're not tracking users to sell them things. We're learning their patterns to remove friction between "I want to play" and "I'm playing." Every behavioral signal exists to serve the user's stated or implied intent.

---

## 1. Skip Tracking — SHIPPED ✅

**What:** When the decision engine suggests a game and the user hits "Not now," record that skip.

**Implementation:** `lib/skipTracking.ts`

**Logic:**
- Skip count per game, stored in localStorage ✅
- After 3 skips: reduce weighting by 50% in pickWeighted ✅
- After 5 skips: soft-ignore (filtered from suggestions, but not from library) ✅
- Soft-ignored games get a 💤 indicator on cards (different from hard-ignore 🚫) ✅
- User can reset skip count from game detail (button appears at 3+ skips) ✅

**Why it matters:** Users skip games for reasons they can't always articulate. The pattern reveals preference better than any survey.

---

## 2. Momentum Detection — SHIPPED ✅

**What:** Detect games with meaningful playtime that dropped off the user's radar and gently surface them.

### The "Stalled" Calculation

A game is potentially stalled when:
- `hoursPlayed > 2` AND `hoursPlayed < hltbMain * 0.85` (they started but didn't finish)
- Status is NOT `played` or `bailed` (they haven't consciously categorized it)
- Last activity was > 14 days ago (it's fallen off their radar)

### Playtime Significance Tiers

| Hours Played | What It Likely Means |
|---|---|
| 0 | Never launched. Truly buried. |
| 0.5-1h | Tried it, bounced. Quick rejection or brief curiosity. |
| 2-4h | **Significant.** Made a character, got through intro, learned controls. Then stopped. High reactivation potential. |
| 5-15h | Deep investment. Either hit a wall (boss, difficulty spike, complexity) or life intervened. Highest value recovery target. |
| 15h+ but < 85% HLTB | Committed but didn't finish. Might be "almost done" or might have stalled at a specific friction point. |
| > 85% HLTB | Probably finished but didn't formally complete. "Did you finish this?" nudge territory. |

### The "Why Did They Stop?" Framework

We can't know for certain, but we can infer from game characteristics:

| Game Characteristic | Likely Stall Reason | How We Help |
|---|---|---|
| Story-rich + long (40h+ HLTB) | Forgot the plot, intimidated to restart | "Pick up where you left off — here's a story recap" (link to recap resource) |
| Difficult / souls-like | Frustrated at progression wall | "Take another crack at it? You were making progress." — frame as challenge, not obligation |
| Open world / sandbox | Choice paralysis within the game itself | "Just 30 minutes — pick one quest and go" — scope reduction |
| RPG with multiple builds | Character decision paralysis (Brady's experience) | Future: "Which character are you taking forward?" — help them commit |
| Multiplayer / co-op | No crew to play with | Future: crew matchmaking (see below) |
| Long + recently released | Waiting for patches/DLC? | Don't nudge too aggressively, they might be intentionally waiting |
| Series entry (sequel) | Might want to play the predecessor first | Detect series ordering, suggest the right starting point |

### Nudge UI (In-App, Non-Intrusive)

NOT a push notification or email. An in-app element visible when they open the app:

```
┌────────────────────────────────────────┐
│ 🔄 Pick up where you left off?        │
│                                        │
│ You put 8 hours into Disco Elysium    │
│ before it fell off your radar.         │
│                                        │
│ [Now Playing] [Up Next] [Backlog] [✕] │
└────────────────────────────────────────┘
```

- Shows max 1 stalled game per session
- Rotates through stalled games across sessions
- Quick action buttons: move to Now Playing, Up Next, back to Backlog, or dismiss
- Dismissing does NOT ignore the game — it just skips this nudge for this session
- If dismissed 3 times for the same game, stop nudging about it

---

## 3. Session-Start Bias (Priority: MEDIUM)

**What:** The first suggestion from the decision engine should account for context signals.

**Available signals (no new data collection needed):**
- Time of day (evening = longer, wind-down games; morning/afternoon = quicker sessions)
- Day of week (weekend = more time available)
- Recent completion (just finished a 60h RPG? suggest something short and different)
- Recent bails (just bailed on 2 story games? don't suggest another one)

**Not available without new data:**
- User age (would inform session length expectations, but we don't collect this — see legal compliance)
- Location/timezone (available from browser but not worth the privacy tradeoff)

---

## 4. Completion Proximity — SHIPPED ✅

**What:** Surface games where the user is close to finishing.

**Calculation:** `remainingHours = hltbMain - hoursPlayed`

**Display:**
- In game card: "~3 hours to finish" when remainingHours < 5 and > 0
- In decision engine: boost weighting for games with low remainingHours
- Special mode in Reroll: "Almost Done" — only shows games where remainingHours < 20% of hltbMain

**Edge cases Brady identified:**
- User leaves a game right before the final boss to "collect everything first" — then never returns. The "almost done" nudge is perfect here.
- Playtime may include multiple character builds (3 characters each at 15h ≠ 1 character at 45h). We can't detect this — but if they respond to the nudge, great. If they dismiss it, we back off.

**Sorting:** Add "closest to done" as a backlog sort option. `ORDER BY (hltbMain - hoursPlayed) ASC WHERE hoursPlayed > 0 AND hltbMain > 0`

---

## 5. Cooldown / Genre Fatigue (Priority: MEDIUM)

**What:** After completing or bailing on a game, avoid suggesting similar games immediately.

**Logic:**
- Track the last 3 completed/bailed games' genres
- Temporarily reduce weighting for games sharing dominant genres
- Cooldown period: ~7 days after completion, ~14 days after bail
- This creates natural variety in suggestions without the user having to think about it

**Example:** User completes Elden Ring (Action RPG, 80h). The engine should suggest something like Stardew Valley or Outer Wilds next, not another 80h action RPG.

---

## 6. Crew Matchmaking for Multiplayer (Priority: LOW — Future / Ambitious)

**The Problem Brady Identified:**
Users may have multiplayer games they want to play but lack a group. This is especially real for older gamers (30-45+) whose friend groups may have stopped gaming.

**The Signal:**
- User owns Call of Duty, Helldivers 2, Deep Rock Galactic, etc.
- Low or zero playtime on these titles
- Potentially tagged as "would play if I had a crew"

**Potential Solutions (increasing complexity):**
1. **Tag system:** Let users mark games as "looking for crew" — visible only to them for now
2. **Discord integration:** Bot that creates LFG channels per game from user tags
3. **In-app matchmaking:** Match users by game ownership + play schedule + genre preference
4. **Crew rooms:** Persistent groups of 4-6 matched players with shared game libraries

**Privacy note:** Any social feature defaults to opt-in, private by default. See `.claude/rules/legal-compliance.md`.

---

## 7. Stall Reasons — User Input (Priority: LOW — Future)

**Concept:** When a user ignores, bails, or stalls on a game, optionally ask WHY.

**Quick-tap reasons (not a form, just buttons):**
- "Got distracted" (life interrupted — high reactivation potential)
- "Hit a wall" (difficulty/progression — might need encouragement)
- "Lost interest" (the game itself didn't hold — low reactivation)
- "Waiting for something" (DLC, patch, co-op partner)
- "Too long/overwhelming" (scope anxiety — suggest time-boxed sessions)

**This data powers:**
- Better weighting in the decision engine
- Smarter stall detection (if they always bail for "hit a wall," weight easier games higher)
- User self-insight ("You tend to drop games around the 5-hour mark — here's why that's normal")

---

## Implementation Order

1. ~~**Skip tracking**~~ — **SHIPPED** ✅ `lib/skipTracking.ts`
2. ~~**Stalled game detection + nudge UI**~~ — **SHIPPED** ✅ `components/StalledGameNudge.tsx` + `components/FinishCheckNudge.tsx`
3. ~~**Completion proximity display**~~ — **SHIPPED** ✅ Progress badges on GridCard/GameCard, "Closest to Done" sort
4. **Cooldown/genre fatigue** — track last completed genres, reduce weighting.
5. **Session-start bias** — time-of-day and recent-activity weighting in pickWeighted. (Time-of-day already shipped in V2)
6. **Stall reason input** — optional quick-tap on bail/ignore.
7. **Crew matchmaking** — requires social features, Discord integration. Phase 3+.

---

## Data Storage

All behavioral data lives in:
- **localStorage** (no-account users): skipCount, stall detection, cooldown history
- **Supabase** (signed-in users): same data, synced

No behavioral data is sent to third parties. No behavioral data is used for advertising. See `.claude/rules/legal-compliance.md`.

## References

- Decision engine: `lib/reroll.ts`
- Game type: `lib/types.ts`
- Store actions: `lib/store.ts`
- Legal guardrails: `.claude/rules/legal-compliance.md`
- User cognitive profile: `memory/user_brady.md`
