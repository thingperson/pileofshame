# iOS deep-read — triage outcome & follow-ups

*2026-06-30. Records what was actioned from the iOS handoffs (`docs/ios-deepread-feedback-2026-06-30.md` + the `web-ios-interop` inbox note) so nothing drifts. The inbox items themselves get moved to `processed/` once this lands.*

## Actioned this session
- **B6 status-event log** — SHIPPED (local). `lib/statusEvents.ts` + wired into all 7 store status sites. Supabase mirror tracked in [specs/status-events-supabase-mirror.md](specs/status-events-supabase-mirror.md). The perishable item; clock now running.
- **A1 dead code** — `lib/recommendations.ts` DELETED (would violate legal + one-pick psychology if wired; recoverable from git).
- **A2 misleading labels** — FIXED in `PostImportSummary.tsx` (removed "we guessed N beaten / auto-moved / sorted by playtime"; honest no-auto-assign framing).
- **A4 worktrees** — 6 pruned (branches preserved).
- **F bridge** — inbound SessionStart hook + iOS-facing outbound channel + doc↔reality reconcile wired into `settings.json` and the session-close skill.

## Corrections to the handoff (fed back to iOS)
- **`retroKids` is NOT orphaned** — wired at `lib/archetypes.ts:735`. Only `dinoRider` is unreferenced (harmless unused sprite entry; left in place — may be a planned archetype, deleting an asset isn't ours to call).
- **`GameCard.tsx:898`** is a *documented intentional* placeholder (hourglass reused until wave-2.1 stat sprite), not a loose end.
- **B6 had 7 call sites, not 5** — the spec missed `newGamePlus` and the `updateGame` catch-all.

## D — Cross-platform items to reconcile (don't let drift)
- **Web↔iOS interop (D1–D6)** — now a first-class spec: [specs/web-ios-interop.md](specs/web-ios-interop.md). D1 (`merge_library` RPC) + D3 (identity linking) are **blocking the iOS prod launch**; mostly web+Supabase work. **This is the biggest open item the deep-read surfaced.**
- **Pricing-model parity — UNRECONCILED.** Web = cosmetic subscription ($4/mo) + $5/yr Year-in-Pile; iOS brief = **$9.99 one-time** bundling Year-in-Backlog. Apple forbids pointing to web payment from the app, so the two can't cross-subsidize. **Decide the parity story before either platform monetizes** (`monetization-plan.md:101` vs the iOS brief). Not a code task — a Brady decision; flagged here so it isn't discovered at launch.

## C — Buried ideas the iOS read flagged as high-value (already in-repo, NOT re-specced)
Left where they live; listed here so the launch crunch doesn't bury them. Promote to a spec only if/when Brady picks one up.
- **One Game Mode** — voluntary straitjacket; most original monetization idea. `docs/IDEAS.md:658`.
- **Spoiler-aware "5-minute version" graceful exit** — `docs/archive/BLUE_SKY.md:61`.
- **Auto-import Steam wishlist on library import** (`action=wishlist` already supported) — `docs/archive/BLUE_SKY.md:60`.
- **Series detection / play-in-order** — `docs/IDEAS.md:135`.
- **"Objectively wrong not to have played this" shelf** (metacritic 90+) — `docs/archive/BLUE_SKY.md:51`.
- **Comfort-game departure as shareable metric** — `docs/IDEAS.md:596`.
- **"How did it know" inferred picker** (called the long-term moat, parked post-launch) — `docs/ROADMAP.md:462`.
- **Dynamic AI enrichment** (build-ready, ~$2/mo @2k DAU, fixes the "wrong genre tip" trust bug) — `docs/specs/dynamic-enrichment.md`.
