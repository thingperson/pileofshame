# Handoff → iOS: import status logic (honest completion)

*Written 2026-08-03 from the web repo (`getplaying`, product source of truth). This is a shared-behavior contract: both clients import from the same platforms and must treat completion identically, or a cross-client sync will make a game's status flip depending on which app imported it. Web canon: `docs/DECISIONS.md` 2026-08-03 (supersedes 2026-05-20). Interop context: `docs/specs/web-ios-interop.md`.*

> Status: **web-side shipped/staged 2026-08-03; iOS to inherit.** No schema change — this is import-mapping + one stats filter. Safe to adopt independently of the D1 merge work.

---

## The rule (one paragraph)

Imports may set **Completed** only when completion is *honest*: an **unambiguous data signal** (PSN 100% progress, Xbox 100% achievements) **or** a **user-declared** status (Playnite's own Completed/Playing/Abandoned tags). Everything ambiguous defaults to **Backlog**. Never infer Up Next / Playing Now / Moved On from a data heuristic — only from an explicit user declaration. **Importers never stamp the completion timestamp** (`completedAt` on web) — that field marks in-app completions only, and any "reclaimed with us" figure filters on it so pre-app completions don't inflate it.

This *refines*, doesn't reverse, the old "everything → Backlog" lock. The thing that lock really protected — never nudge a user back toward a finished game, always let them decide — is fully intact. We just stopped pretending we don't know a game is done when the platform plainly says so.

## Per-source mapping (match these exactly)

| Source | → Completed when | Otherwise | Notes |
|---|---|---|---|
| **PSN** | `progress === 100` | Backlog | Platinum/100% is the unambiguous ceiling. Partial progress is ambiguous → Backlog. |
| **Xbox** | `achievements.earned === achievements.total && total > 0` | Backlog | Same bar as PSN. Do **not** leave Xbox on blanket-Backlog — that platform-dependent split is the exact drift this replaces. |
| **Playnite** | user-declared "Completed"/"Beaten"/"100%" | maps declared "Playing"→Playing Now, "Abandoned"/"Dropped"→Moved On, else Backlog | The **only** source allowed to set Playing Now / Moved On on import — and only because the user typed it. Declared ≠ inferred. |
| **Steam, Game Pass, manual add** | never (no completion signal) | Backlog | Game Pass "add and play" is a deliberate user action → Playing Now, and must respect the Playing-Now cap (3). |

## The `completedAt` invariant (the load-bearing part)

- Set the completion timestamp **only** on in-app completion (user marks it done in the app), never in an import mapper.
- An imported-as-Completed game shows in the Completed tab (it *is* completed) but has no completion timestamp.
- Any "reclaimed / value freed **with us**" figure counts `playing || (played && has completedAt)` — never raw `played`. On web that's `components/StatsPanel.tsx`; iOS should apply the identical filter wherever it computes a reclaim/value number.
- **Known open item (both clients):** the headline "Cleared" count / archetype inputs still read raw `played` (i.e. include imports). Accepted as-is for now — those describe the whole library, not just app-attributed wins. If iOS surfaces a "games completed with Inventory Full" stat, filter on the timestamp there too.

## Web reference (files to mirror the logic from)

- `components/PSNImportModal.tsx` — `status: progress === 100 ? 'played' : 'buried'`
- `components/XboxImportModal.tsx` — `fullyAchieved` gate → `'played' : 'buried'`
- `components/PlayniteImportModal.tsx` — `mapStatus()` (declared → status)
- `components/GamePassBrowse.tsx` — add-and-play, Playing-Now cap guard
- `components/StatsPanel.tsx` — reclaim filter (`played && completedAt`)
- Guard assertion: `.claude/skills/regress-watch/assertions.md` → `decision-imports-honest-completion`

## Why iOS should care now

If iOS keeps the old blanket-Backlog behavior while web imports honest completion, then two clients pointed at the same library (post-D1 merge) will disagree on a game's status by `updatedAt` race — a game the user platinumed shows Completed after a web import and Backlog after an iOS import. Adopt this before, or in lockstep with, the shared merge work in `web-ios-interop.md`.
