---
paths:
  - "components/**/*.tsx"
  - "app/**/*.tsx"
  - "lib/archetypes.ts"
  - "lib/descriptors.ts"
---

# Inventory Full — Brand Messaging Guide

## Brand Description (Master)

Inventory Full is a new app for people with too many games, too many half-started campaigns, and too much decision paralysis. It helps you decide what to play now, make ongoing progress on the games you already own, and recover more value from your collection.

## Three Messaging Pillars

Always return to these. This is the spine:

1. **Decide what to play now** (based on mood, time, shelves)
2. **Make ongoing progress on games you already own**
3. **Recover more value from your collection**

## Primary Tagline (Locked — Apr 17, 2026)

**"Get playing."**

This is THE tagline. Use it everywhere: page titles, OG metadata, headers, footers, share cards. One message, one voice.

The earlier "Stop stalling. Get playing." is retired. Reasons (recorded in `docs/DECISIONS.md`, 2026-04-17):
- The name "Inventory Full" already names the backlog-overload pain; "Stop stalling" restated it and read as scolding.
- Forward imperatives ("Get playing") trigger less reactance than correction imperatives ("Stop stalling") — see `.claude/rules/user-psychology.md` §4.
- The symmetrical two-beat cadence was an AI-tell flagged in `.claude/rules/voice-and-tone.md`.
- Fewer words to say the same thing is the product's thesis in microcosm.

Supporting lines (use as subheads, not alternatives):
- "Your backlog's not gonna play itself." — subhead
- "Less shame. More game." — celebration/share context only

## Core Attitude Lines

- "Your backlog is full. Your time doesn't have to be."
- "You bought the games. Now let's get something back."
- "Less browsing your backlog like a warehouse of good intentions. More actually playing it."

## Message Hierarchy

Use this order consistently:

1. **Main promise:** Decide what to play now
2. **Supporting outcome:** Make ongoing progress on the games you already own
3. **Differentiator:** Recover more value from your collection
4. **Tagline:** Get playing.

Starts with immediate user pain, then moves to richer payoff.

## In-App Terminology (Locked)

### Status cycle (Apr 9, 2026 — locked)
**Backlog > Up Next > Playing Now > Completed > Moved On**

The order reads as a natural sentence: a game sits in the Backlog, moves Up Next, becomes Playing Now, ends at Completed or Moved On. Use these exact terms everywhere a user sees them.

- "Not for me" is the action label that moves a game into Moved On.
- "Bail" / "Cleared" / "Play Next" are retired from user-facing copy (internal IDs may still say `bailed`, `played`, `on-deck` — the type keys are fine, labels are not).

### Feature vocabulary
- **Backlog Payback** = recovered value feature
- **Clear Space** = main CTA
- **Overflow** = backlog pressure indicator
- **Open Slots** = room created in play plan
- **Priority Loadout** = selected current games
- **Mission Clear** = celebration state

## Brand Personality

Warm, witty, non-judgmental. More "let's make this manageable" than "let's dominate this."

## Language to Lean Into

- decide, continue, make progress
- pick the right game for right now
- recover value, clear space

## Language to Lean Away From

- score, streak, rank, hero tier
- completion hunter, crush your backlog
- anything that makes the app feel like homework

## Product Positioning (Not a Tracker)

We are NOT building: a social graph, a review platform, a collector flex app, a stats playground, a productivity dungeon.

We ARE building: a lightweight decision and progress tool for overloaded libraries.

"Inventory Full helps people decide what to play now based on mood, available time, and their own shelves, then get back to actually playing."

## The Anti-Overgamification Stance

The app should not become a new backlog item. No streak obsession, no endless feed behavior, no productivity dungeon. Light triage layer, decision engine, progress mirror, then get out of the way.

**Design principle:** Every extra minute in Inventory Full should justify itself against a minute that could have been spent playing.

## Social Copy Style

Best social posts feel like: a friend who games texting you something real. Not marketing copy. Not announcements. Short, conversational, slightly self-aware.

Examples:
- "Too many games. Not enough momentum."
- "Your backlog should feel exciting. Not administratively haunted."
- "We're not trying to optimize your soul. We just want to help you play your games."
- "Not every unfinished game deserves redemption. But some absolutely do."

## Share Card / Social Proof

Only offer share for Big Moments:
- Beating a 40+ hour game
- New Backlog Buster Level
- Hitting a Reclaimed Value milestone ($500+)

Share cards should feel like self-expression, not a report card.
