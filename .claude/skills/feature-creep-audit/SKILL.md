---
name: feature-creep-audit
description: Audit the app against its core value proposition. Identify features that dilute focus, add bloat, or distract from the main loop. Run periodically or before big pushes.
---

# Feature Creep Audit

## The Core Loop
Everything we build should serve this sequence:

**Import your games -> Tell us your mood -> We find your game -> Play -> Celebrate**

That's it. If a feature doesn't make one of those steps better, faster, or more fun, it needs to justify its existence.

## The Core Value Proposition
"Import your pile, tell us your mood, we'll find your game." Zero tagging, zero organizing. We do the work so you can just play.

## What to Audit

### 1. Feature Inventory
List every user-facing feature in the app. For each one, answer:
- **Which step of the core loop does this serve?** (Import / Discover / Play / Celebrate / None)
- **Does the user need this to get value from the app?** (Yes / Nice-to-have / No)
- **Does this add cognitive load?** (buttons, options, modals, settings the user has to understand)
- **Would a new user be confused by this?** (First 5 minutes test)

### 2. UI Surface Area Check
Count the number of:
- Buttons visible on the main page (without scrolling)
- Modal/panel types the user can trigger
- Settings/options available
- Import sources
- Share destinations

Flag if any of these feel excessive for a backlog tool.

### 3. Core Loop Friction Test
Walk through the core loop as a new user:
1. Land on the page. Is it immediately clear what this does? (3-second test)
2. Import games. How many clicks? Any confusion points?
3. Get a recommendation. Does "What Should I Play?" work well with a fresh import?
4. Clear a game. Is the celebration satisfying?
5. Come back tomorrow. Is there a reason to return?

Flag any step where the user might get lost, distracted, or overwhelmed.

### 4. Feature Justification
For features that don't directly serve the core loop, check if they:
- **Delight** (themes, easter eggs, archetypes) — OK if lightweight and discoverable, not in the way
- **Retain** (stats, streaks, sharing) — OK if they motivate continued use
- **Monetize** (deals, affiliates) — OK if transparent and non-intrusive

Features that do none of these are candidates for removal or simplification.

### 5. Bloat Signals
Watch for these red flags:
- Settings panel has more than 10 options
- Main page requires more than 3 scrolls to see everything
- New users need to understand more than 3 concepts to start
- Multiple features doing overlapping things
- Features that were built but nobody would miss if removed
- UI elements competing for attention

## Output Format

Produce a report with:

### Healthy
Features that are core, well-integrated, and serving the loop.

### Watch List
Features that are fine now but could become bloat if expanded further.

### Candidates for Simplification
Features that could be streamlined, hidden behind progressive disclosure, or merged.

### Candidates for Removal
Features that don't serve the core loop and add cognitive load. Be honest but not destructive. Consider whether the feature was fun to build vs. whether users actually need it.

### Recommendations
Concrete suggestions: what to simplify, what to hide, what to cut, what to double down on.

## How to Run

Read the main page component (`app/page.tsx`), the key UI components, and the store to understand what's exposed to users. Cross-reference with the plan doc for feature list. Walk through the app mentally as a first-time user, a returning user, and a power user.

## When to Run
- Before major feature additions (will this make the app better or just bigger?)
- After shipping 3+ features in a sprint
- When the plan doc grows a new phase
- When something feels "off" about the app's focus
- Periodically every 2-4 weeks during active development

## Philosophy
More features != better product. The best version of this app is one where a user imports their library, gets a great recommendation in 30 seconds, and closes the app to go play. Everything else is support structure for that moment. If we're spending more time on the support structure than the moment itself, we've drifted.
