# Archetypes Catalogue

Full list of every archetype defined in [lib/archetypes.ts](../lib/archetypes.ts), with current live status and audit notes.

**Status as of 2026-04-20:** all 36 archetypes are **LIVE**. Every one of them can fire today via `getAllMatchingArchetypes()`. There is no dead code in this file.

The Apr 3 feature-creep audit ([docs/feature-creep-audit-2026-04-03.md](feature-creep-audit-2026-04-03.md)) flagged the whole system for simplification — "keep 1 archetype, remove re-roll." That cut has not shipped. This doc exists so you can mark the ones to keep vs. cut without having to hold 36 definitions in your head.

**Columns:**
- **Live** — ✅ currently fireable in code
- **Keep?** — blank for you to mark (✅ / ❌ / ?)
- **Tone** — roast / respect / neutral
- **Trigger gist** — one-line summary of when it matches

---

## Behavioral Archetypes (28)

| Archetype | Icon | Live | Keep? | Tone | Trigger gist |
|---|---|---|---|---|---|
| Pure Collector | 🏛️ | ✅ | | roast | Massive library, barely plays |
| The Hoarder | 📦 | ✅ | | roast | Big library, low completion |
| The Dabbler | 🦋 | ✅ | | roast | Samples everything, commits to nothing |
| The Quitter | 🚪 | ✅ | | roast | High bail rate, aggressive curation |
| The Juggler | 🤹 | ✅ | | roast | Too many games in flight at once |
| The Archaeologist | 🏺 | ✅ | | roast | Ancient backlog, games waiting years |
| The Window Shopper | 🪟 | ✅ | | roast | Lots collected, rarely played |
| Backlog Zero | 👑 | ✅ | | respect | Actually cleared everything |
| The Completionist | 🏆 | ✅ | | respect | High completion rate |
| The Sniper | 🎯 | ✅ | | respect | Small library, high completion |
| The Redeemer | ⚡ | ✅ | | respect | Big pile but chipping away |
| The Critic | 🧐 | ✅ | | neutral | Rates everything harshly |
| The Enthusiast | 🌟 | ✅ | | neutral | Rates everything highly |
| The Deep Diver | 🫧 | ✅ | | neutral | Huge hours per game |
| The Balanced Gamer | ⚖️ | ✅ | | neutral | Healthy mix of play / clear / collect |
| The Omni-Gamer | 🌐 | ✅ | | roast | Games on 3+ platforms |
| Steam Loyalist | 🚂 | ✅ | | neutral | 90%+ Steam |
| PlayStation Purist | 🎮 | ✅ | | neutral | 70%+ PlayStation |
| [Genre] Addict | 🧬 | ✅ | | roast | One genre dominates (40%+) |
| The Quick Draw | ⚡ | ✅ | | neutral | Library of quick-hit games |
| The Endurance Runner | 🏔️ | ✅ | | roast | Lots of marathons (60+ hrs) |
| The Optimizer | 💾 | ✅ | | roast | Tons installed, not playing |
| The Wishful Thinker | 🌠 | ✅ | | roast | Wishlisting before clearing |
| The Eclectic | 🎨 | ✅ | | neutral | 10+ different genres |
| Cozy Craver | 🏕️ | ✅ | | neutral | 2+ comfort games, 50+ hrs each |
| The Infinite Player | ♾️ | ✅ | | neutral | 5+ non-finishable games (MMOs, sandboxes) |
| The Momentum Builder | 🚀 | ✅ | | respect | Clearing at good clip, fewer bailouts |
| The Bargain Hunter | 🏷️ | ✅ | | roast | Lots of sale-bought, unplayed |
| The Night Owl | 🦉 | ✅ | | neutral | Library of long-session games |

## Theme Archetypes (8)

These fire based on theme usage data from localStorage, not library behavior.

| Archetype | Icon | Live | Keep? | Tone | Trigger gist |
|---|---|---|---|---|---|
| Dino Devotee | 🦖 | ✅ | | neutral | Heavy dino-theme user |
| Webmaster Supreme | 🚧 | ✅ | | neutral | Lives in 90s theme |
| Synthwave Surfer | 🌆 | ✅ | | neutral | Heavy 80s neon theme |
| ULTRA Devotee | ⚡ | ✅ | | neutral | Consumed by ULTRA mode |
| Holographic Entity | 🔮 | ✅ | | neutral | Future theme main |
| The Unsettling One | 👁️ | ✅ | | neutral | Weird mode and stayed |
| The Lighthouse | ☀️ | ✅ | | roast | Light mode voluntarily |
| The Minimalist | 🫥 | ✅ | | respect | Void mode: no distractions |

## Fallback (1)

| Archetype | Icon | Live | Keep? | Tone | Trigger gist |
|---|---|---|---|---|---|
| The Gamer | 🎮 | ✅ | | neutral | <3 games or nothing else matched |

---

## Apr 3 audit context

From [docs/feature-creep-audit-2026-04-03.md](feature-creep-audit-2026-04-03.md) — "1. Player Archetype System (15+ types)":

> **Concern:** Fun to build, fun to read once. But 15+ archetypes with re-roll is a mini-game inside a tool that should get people OUT of the app. Does it help anyone play a game tonight?
>
> **Verdict:** Keep 1 archetype (the primary one). Remove re-roll. Simplify to "here's your type" not "here's a personality quiz."

The audit was written before this catalogue grew to 36. The concern scales accordingly.

---

## How to use this doc

1. Go down the Keep? column. Mark `✅` (keep), `❌` (cut), or `?` (needs data) on each row.
2. When done, the cuts need:
   - Remove the matching entry from `ARCHETYPES` in [lib/archetypes.ts](../lib/archetypes.ts)
   - Any copy/flavor text tied to that archetype
   - Sweep for references in stats components / share cards
3. Reroll decision is separate: keep the surface, or cut it per Apr 3 audit?

Pairs with the feature-creep audit work in the Apr 20 session resume.
