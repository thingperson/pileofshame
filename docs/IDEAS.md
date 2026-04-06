# Ideas & Brainstorm Dump

Running list of ideas, rambles, and half-formed thoughts. Gets synthesized into proper specs when actionable.

---

## Active Ideas (ready to spec or build soon)

### HLTB Progress Inference & Nudges
The data already exists (hoursPlayed + hltbMain). We just need to tell stories with it.

**Display layer:**
- "~3 hours to finish" on cards where remainingHours < 5
- Progress percentage in Jump Back In cheat sheet (already exists there)
- "Closest to Done" sort option in backlog

**Nudge types (in-app only, not push):**
- "Pick up where you left off" — stalled game card, 1 per session, rotates
- "You're right there" — games at 85%+ completion, highlight in backlog
- "Quick win" — short games already started, under 5h remaining
- "Did you finish this?" — games at 130%+ HLTB, might be done but not marked

**Edge cases Brady identified:**
- Final boss collectors: leave game right before end to collect everything. Nudge is perfect here.
- Multi-character playtime: 3 chars x 15h ≠ 45h progress on a single playthrough. Can't detect, but if they respond to nudge great, if they dismiss we back off.
- Games with unreliable HLTB: some sandbox/RPG times are wildly variable. Use a confidence threshold — if hltbMain is > 60h, the estimate is less precise.

**"Did you finish this?" prompt (85%+ HLTB) — copy direction:**
- If they say YES: "Wait, you actually got through it? That's an impressive win! You finished faster than most." → auto-mark as Cleared, trigger celebration
- If they say NO: "Well that's great news — you only have around ~Xh left. That's a win in the bank. You're so close." → offer to move to Now Playing

**Dismiss behavior:**
- Dismiss 1x: skip this session
- Dismiss 3x for same game: stop nudging about it (not the same as ignoring)
- Reset available from game detail

### PS+ Sub Shuffle
We know:
- `psn-api` returns `membership: "PS_PLUS"` field
- Users tell us their tier (Essential / Extra / Premium)
- We can see which monthly games they've claimed
- We can deduce catalog access from tier + claimed games

**Implementation:**
- Add tier selector to PS import or settings
- Match claimed games against known PS+ catalog
- Filter Sub Shuffle to show games available on their tier
- Parity with Game Pass browse experience

### Sub Shuffle Logo Fix
Current platform logos on Sub Shuffle button are generic/tiny. Options:
- Use official Xbox Game Pass and PlayStation Plus logos (check trademark usage for web apps)
- If not allowed: stylized text badges "GP" / "PS+" in brand colors
- Size up to at least 20x20px, currently unreadable

---

## Parking Lot (interesting but not urgent)

### "Why did I stop?" Quick-tap on Stalled Games
When a stalled game surfaces, offer one-tap reasons:
- Got distracted / Hit a wall / Lost interest / Waiting for something / Too long
Powers smarter future nudges and self-insight stats.

### Weekend Mode
Weekend detection (Sat/Sun) → suggest longer games, deeper cuts. Currently time-of-day is wired but day-of-week isn't.

### Completion Streaks (light, not gamified)
"You've cleared 3 games this month" — stated as fact, not as a score to chase.
Anti-pattern: no streak counters, no "don't break your streak" guilt.

### Series Detection
If user owns Dark Souls 1, 2, and 3 — suggest playing in order.
Requires RAWG series data or manual mapping.

### "Almost Done" Reroll Mode
New mode in the reroll picker: only shows games where remainingHours < 20% of hltbMain.
Targeted at clearing the backlog, not just picking something to play.

---

## Raw Rambles (unsorted, dump here)

(Brady: drop notes here when you're away from desktop. I'll sort them when you're back.)
