# Spec: Share Card UX Overhaul

**Status:** SHIPPED 2026-06-29  
**Shipped:** All four proposals (D+A+B+C) landed in commit `1aca880`.  
**Created:** 2026-05-14  
**Origin:** ClankerView UX review (reviewer didn't know share cards existed), Brady's own friction observation ("click 3 things on a modal to copy a URL you can't preview")

### What shipped
- **D** — Preview-first: `GameClearShare` auto-creates card on mount, no manual "Create share link" step
- **A** — Live in celebration: share section opens with card already being created
- **B** — Share button on completed game cards: compact `🔗 Share`, modal `↗ Share this clear` — tap to create + copy
- **C** — `StatsShareComposer` wired into StatsPanel (was built but never rendered)

### Open questions (park for later)
- Mobile vs desktop preview sizing for the stats card
- Flavor text: lock it (game clears, current) or make rerollable (stats, current)? Pick one for consistency.

---

## Problem

Share cards are a completed feature that nobody uses because:

1. **Game clear share:** Buried inside the completion celebration modal. 3-4 clicks to get a URL. No preview before creation.
2. **Stats share:** Buried 3+ levels deep (Stats page → expand panel → scroll → calculation → composer). 7+ clicks to get a URL. No preview before creation.
3. **No ambient visibility:** Nothing in the normal app flow suggests share cards exist. A user who completes a game might dismiss the celebration without noticing the share option.
4. **No preview before commit:** User creates the card blind, then sees what it looks like. Can't iterate.

The ClankerView reviewer specifically noted: "There is no streaming or sharing layer." Share cards DO exist. The problem is surfacing.

## Goals

1. Reduce game-clear share to 1-2 clicks
2. Show a live preview of the card before sharing
3. Make share cards discoverable outside the completion flow
4. Keep it lightweight — share is an opt-in moment, not a mandatory flow

## Proposals

### A. Live preview in celebration modal

When the completion celebration shows, include a small preview thumbnail of what the share card would look like. One tap: "Share this" → copies URL to clipboard, shows the preview full-size. No separate composer step.

### B. Share button on completed game cards

Add a small share icon on game cards in the Completed tab. Tapping it generates (or retrieves cached) the share card and shows the preview + copy-URL in one step. This makes sharing discoverable outside the completion moment — user can share old completions too.

### C. Stats share shortcut

Move the stats share entry point to a more visible location. Current: buried inside an expandable panel behind a calculation. Proposed: visible button on the stats page header, or in the nav/settings area.

### D. Preview-first flow

For both card types: show the card preview FIRST, then offer "Copy link" / "Share to..." as actions on the preview. Current flow is backwards (configure → create → see). Should be: see → share.

## What exists today

- **Routes:** `/pile/[id]` (stats), `/clear/[id]` (game clear)
- **OG images:** Both routes have `opengraph-image.tsx` that renders cards with archetype art, flavor text, stats
- **API:** `POST /api/share` (game clear), `POST /api/share-stats` (stats)
- **Components:** `GameClearShare`, `CompletionCelebration`, stats composer in `ValueCalculator`
- **Flavor text:** Auto-selected for game clears (no reroll), rerollable for stats (inconsistent — should pick one approach)

## Game card status-change UX (related)

Brady flagged: the status pill (how you progress a game through the cycle) lives at the top-right of the game card, but the action buttons ("I beat it", "I'm moving on") live at the bottom. This creates a split where the natural action area (bottom) has contextual buttons, but the primary progression mechanism (status cycling) is a small pill at the top-right.

This is related to share cards because the completion flow starts from the status change. If "I beat it" → celebration → share were a more natural downward flow, the share card would be more discoverable.

### Current layout (top to bottom):
- Status pill (top-right) — tappable, cycles through statuses
- Cover art + metadata (middle)
- Launch button
- Action buttons ("I beat it", "I'm moving on", "Return to The Pile") (bottom)

### The disconnect:
- Moving Backlog → Up Next → Playing Now happens via the top-right pill
- Moving Playing Now → Completed happens via the bottom "I beat it" button
- This is inconsistent — some progressions are top-right, some are bottom

### Possible improvement:
Unify the progression actions into the bottom section. The status pill can still show current status (as a label), but the "move to next status" action should be near the other action buttons where users are already looking. Exploration needed — this is a UX rethink, not a quick fix.

## Open questions

1. What happens on mobile vs. desktop for the preview? Mobile has less room for an inline preview.
2. Should we add a "Share" tab or section to the stats page, separate from the value calculator?
3. Flavor text: lock it (game clears) or make it rerollable (stats)? Pick one for consistency.
4. Should old completions be shareable retroactively? (They can be today, but nobody knows.)

---

*Near-term priority. The feature works. The problem is entirely UX surfacing and flow.*
