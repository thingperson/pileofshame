# AI Lingo Sweep - Changelog (April 2, 2026)

Full sweep of public-facing copy against the updated voice-and-tone guide. All changes are copy-only (no logic changes).

---

## Voice Guide Update

**File:** `.claude/rules/voice-and-tone.md`

The "Never sound like AI" section was expanded from a short banned-patterns list into a comprehensive 5-layer framework:
- **Banned vocabulary**: Full watchlists for verbs, adjectives, nouns, adverbs, and phrases
- **Banned structural patterns**: Em-dash dramatic pauses, "That's not X, that's Y" reframes, mic-drop closers, uniform paragraph lengths, hedging, symmetrical enthusiasm
- **Banned emotional patterns**: Performative empathy, sycophantic openers, excessive validation
- **What human writing does**: Sentence length variation, mid-thought starts, unexpected endings, specific positions, imperfect thoughts
- **The test**: Read-aloud rhythm check + "could anyone have written this?" test

---

## Archetype Descriptions (archetypes.ts)

All 10 em-dash dramatic pauses replaced with periods or restructured sentences. All 3 "That's not X, that's Y" patterns eliminated.

| Archetype | Before | After |
|---|---|---|
| **Pure Collector** | "That's not a backlog, that's an empire. The collection is immaculate — now pick one" | "You don't have a backlog. You have an empire. The collection is immaculate. Now pick one" |
| **The Hoarder** | "Every Steam sale adds to the pile — but hey" | "Every Steam sale adds to the pile, but" |
| **The Dabbler** | "commit to nothing — yet" | "commit to nothing. Yet." |
| **The Juggler** | "That's not indecision — that's range" | "Call it range." |
| **The Archaeologist** | "They're not dead — they're patient" | "Not dead. Patient." |
| **The Window Shopper** | "You've built an incredible library — now it's time" | "You've built an incredible library. Now it's time" |
| **The Optimizer** | "The hard part is done — they're right there" | "The hard part is done. They're right there." |
| **The Infinite Player** | "That's not a flaw in your taste — some games" | "Nothing wrong with that. Some games" |
| **The Bargain Hunter** | "The library is stacked — now it's time" | "The library is stacked. Time to" |
| **The Night Owl** | "You're not a casual player — you're someone who" | "You block out entire evenings for this." |

---

## Seed Data (seedData.ts)

| Game | Before | After |
|---|---|---|
| **Disco Elysium** | "A **groundbreaking** open-world RPG about being a cop..." | "An open-world RPG about being a cop..." |
| **God of War Ragnarok** | "Kratos and Atreus **embark** on a mythic **journey**" | "Kratos and Atreus set out on a mythic quest" |

---

## Enrichment Roasts (enrichment.ts)

| Game | Before | After |
|---|---|---|
| **Fallout playtime roast** | "Your backlog is its own post-apocalyptic **landscape**" | "Your backlog has its own post-apocalyptic vibe at this point" |

---

## Descriptors (descriptors.ts)

| Game | Before | After |
|---|---|---|
| **Gran Turismo 7** | "Beautiful and **meticulous**" | "Beautiful and obsessively detailed" |

---

## Components (em-dash removal)

| File | Before | After |
|---|---|---|
| **OnboardingWelcome.tsx** | "Descriptions, mood tags, completion times — we pull it all in" | "Descriptions, mood tags, completion times. We pull it all in" |
| **HelpModal.tsx** | "We're always improving — check back" | "We're always improving. Check back" |
| **PlayniteImportModal.tsx** | "Playnite can export your entire library — including" | "Playnite can export your entire library, including" |
| **JustFiveMinutes.tsx** | "go play — we'll wait" | "go play. we'll wait" |
| **GridCard.tsx** | "— Platinum!" (tooltip) | "- Platinum!" |
| **terms/page.tsx** | "We always show the actual price — we never" | "We always show the actual price. We never" |

---

## Left Unchanged (assessed, no action needed)

| Item | Reason |
|---|---|
| **privacy/page.tsx em-dashes** | Used as list separators (RAWG API — description), not dramatic pauses. Standard formatting. |
| **descriptors.ts triple-adjective lists** (6 instances) | Read as punchy game reviews, not AI-generated filler. Adjective choices are specific and opinionated. Low priority. |
| **The Sniper** archetype triple pattern | "Disciplined. Focused. Honestly kind of intimidating." The deflection at the end saves it. |
| **"optimize" in Factorio descriptor** | Intentional joke about the game literally being about optimization. |
| **"journey" in Celeste/Mass Effect 3** | Refers to literal physical/narrative journey, not AI filler. |
| **90s Mode em-dashes** | Intentional retro style ("WELCOME TO INVENTORY FULL -- THE #1"). |
| **layout.tsx em-dashes** | SEO structured data, not user-facing copy. |

---

## Summary

- **20 changes** across **10 files**
- **0 logic changes** (copy only)
- Primary patterns eliminated: em-dash dramatic pauses (10), "That's not X, that's Y" (3), banned vocabulary (4)
