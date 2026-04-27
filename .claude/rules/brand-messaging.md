---
paths:
  - "components/**/*.tsx"
  - "app/**/*.tsx"
  - "lib/archetypes.ts"
  - "lib/descriptors.ts"
---

# Inventory Full — Brand Messaging Guide

> **Deep-dive reference only.** The canonical enforcement doc is [`voice-charter.md`](./voice-charter.md) — 1 page, memorable, the ship-or-don't-ship bar. Load this file for messaging hierarchy, positioning rationale, or the extended social-copy examples. If this file contradicts the charter, the charter wins.

## North Star — Mission Statement (Locked 2026-04-26)

**Enjoy your games again.**

This is the internal thesis. Not the public tagline (`get playing.` is — see below). Not user-facing copy yet. **Every product, design, copy, and distribution decision must defend itself against this line.**

Three things the mission carries:

1. **Enjoy** — not track, not manage, not catalog. The product exists so the user has fun. If we add a feature that doesn't terminate in actual joy at the controller, we're building the wrong thing.
2. **Your games** — they already chose these. They already paid for them. They already decided these were worth it. We are not introducing new options. We are reuniting the user with what they own.
3. **Again** — the most important word. It acknowledges the user used to love this. They got overwhelmed. We are returning them to themselves, not changing who they are.

### How to apply this

Before shipping a feature, copy line, or channel decision, ask:

- Does this help the user enjoy a game they already own, or does it make Inventory Full a new thing to manage?
- Does this respect the "again" — i.e., trust that they were already capable of choosing well, and that they just got buried — or does it treat them as needing to be taught what to like?
- If we removed this from the app entirely, would users be more or less likely to actually play tonight?

Anything that fails any of those three questions doesn't ship.

### Why this isn't the public tagline

`get playing.` is the action-oriented invitation — what we say at the door. "Enjoy your games again" is the deeper *why* — the reason we built the door. If the mission ever earns a public moment (app store description, hero subhead, launch-post opening line), that's downstream. First it has to live as the internal compass.

---

## Brand Description (Master)

Inventory Full is a new app for people with too many games, too many half-started campaigns, and too much decision paralysis. It helps you decide what to play now, make ongoing progress on the games you already own, and recover more value from your collection.

## Three Messaging Pillars

Always return to these. This is the spine:

1. **Decide what to play now** (based on mood, time, shelves)
2. **Make ongoing progress on games you already own**
3. **Recover more value from your collection**

## Primary Tagline (Locked — Apr 17, 2026)

**"get playing."** (lowercase, with the period)

This is THE tagline. Use it everywhere: page titles, OG metadata, headers, footers, share cards. One message, one voice.

Case matters. The lowercase is intentional — it reads friendlier, more casual, matches the "friend who games, texting you" voice. Do not sentence-case it ("Get playing."). The one exception is the retired-form quote below for historical reference. `<title>` tags and OG alt text also use the lowercase form for consistency; the browser tab will render "Inventory Full - get playing." which is the intended look.

The h1 on the landing page remains "Inventory Full" (the wordmark). "get playing." sits under it as a supporting line, not as a replacement h1.

The earlier "Stop stalling. Get playing." is retired. Reasons (recorded in `docs/DECISIONS.md`, 2026-04-17):
- The name "Inventory Full" already names the backlog-overload pain; "Stop stalling" restated it and read as scolding.
- Forward imperatives ("Get playing") trigger less reactance than correction imperatives ("Stop stalling") — see `.claude/rules/user-psychology.md` §4.
- The symmetrical two-beat cadence was an AI-tell flagged in `.claude/rules/voice-and-tone.md`.
- Fewer words to say the same thing is the product's thesis in microcosm.

Supporting lines (use as subheads, not alternatives):
- "Your pile's not gonna play itself." — landing subhead (on-page voice). Use "backlog" in meta description / JSON-LD for SEO; on-page h1/h2 uses "pile" to match our terminology (backlog = status column, pile = whole collection).
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
4. **Tagline:** get playing.

Starts with immediate user pain, then moves to richer payoff.

## In-App Terminology (Locked)

### Status cycle
Canonical labels, retired terms, and celebration copy live in `.claude/rules/voice-and-tone.md` §In-app terminology. Do not duplicate here.

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
