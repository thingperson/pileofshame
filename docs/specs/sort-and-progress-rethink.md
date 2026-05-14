# Spec: Sort Logic + Progress Assumptions Rethink

**Status:** Specced, needs decision  
**Priority:** Medium — affects data trust and user perception  
**Created:** 2026-05-14  
**Origin:** ClankerView review flagged "Quick to clear" showing RDR2 near top, Brady's recurring point that we can't assume where a player is in a game based on hours played

---

## The core problem

The "Quick to clear" sort calculates `hltbMain - hoursPlayed` and treats the result as "time remaining." This assumes:

- The user is playing the main story path
- Hours played maps linearly to progress
- We can infer completion proximity from two numbers

We can't. A user with 20 hours in a 30-hour game might have:
- Rerolled their character 8 times
- AFK'd in menus
- Explored extensively without advancing the story
- Played and dropped the game twice before

Brady has raised this point multiple times across sessions. The principle: **we can ask the user where they are. We can't assume.**

## Current sort logic

```
"Quick to clear" (closest-to-done):
  Tier 1: Has both HLTB + playtime → sort by (hltbMain - hoursPlayed), lowest first
  Tier 2: Has playtime but no HLTB → sort by most hours played
  Tier 3: Has HLTB but no playtime → sort by shortest HLTB
  Tier 4: No data → alphabetical
```

Tier 1 is the problematic one. Tier 3 is actually fine — "shortest HLTB with no playtime" = genuine quick wins.

## Options

### Option A: Rename and reframe

Keep the sort logic but rename it so it doesn't promise something we can't deliver.

- Rename "Quick to clear" → "Shortest games" or "Quick wins"
- Sort purely by HLTB main time (ignore user playtime entirely)
- This is honest: "these are short games you own"
- Loses: the "closest to done" angle entirely

### Option B: Ask the user

Add an optional "How far along are you?" field to the game card. Three options:
- Just started
- Somewhere in the middle
- Almost done

If the user sets this, use it for the sort. If they don't, fall back to HLTB-only sorting (Tier 3 behavior). Never infer from hours.

This aligns with the agency principle: the user decides, we don't guess.

### Option C: Nudge, don't sort

Instead of a sort, surface a nudge: "You've played 20 hours of this 30-hour game. Feeling close?" User confirms or dismisses. The nudge is an invitation, not an assumption. Use the response to inform future picks but not as a sort axis.

### Recommended: Option A as immediate fix, Option B as follow-up

Option A is a rename + logic simplification — shippable in 10 minutes. Option B is a UX addition that's consistent with our agency-first principle but needs design work.

## Related: Tier 2 also makes assumptions

"Has playtime but no HLTB → sort by most hours played" assumes most-played = furthest along. Same problem. With no HLTB data, we genuinely don't know anything about completion proximity. This tier should probably sort alphabetically or by most-recently-played rather than implying progress.

## All 8 sort options (for context)

| Sort | Logic | Issue? |
|------|-------|--------|
| Best for You | Smart sort algorithm | No |
| A → Z | Alpha | No |
| Z → A | Alpha reverse | No |
| Recently added | By addedAt desc | No |
| Earliest added | By addedAt asc | No |
| Quick to clear | hltbMain - hoursPlayed | **Yes — assumes progress** |
| Most playtime | By hoursPlayed desc | No |
| Least playtime | By hoursPlayed asc | No |

Only "Quick to clear" has the problem. The other 7 sorts are factual.

---

*This has been raised in conversation multiple times and not acted on. The sort rename (Option A) is a 10-minute fix. It should happen.*
