# Status-events Supabase mirror — Year-in-Pile Phase 1 fast-follow

*Captured 2026-06-30. The local append-only status-event log shipped this session (`lib/statusEvents.ts`, key `if-status-events`, wired into all 7 store status-mutation sites). This stub tracks the remaining server-sync half.*

## What shipped (2026-06-30)
- `lib/statusEvents.ts` — append-only log in localStorage, event `{ id, gameId, from, to, at }`, FIFO cap 5000, SSR-safe, fail-silent (never breaks a status change).
- Wired into `store.ts`: `cycleStatus`, `setBailed`, `unBail`, `shelveGame`, `playAgain`, `newGamePlus`, **and the `updateGame` catch-all** (the spec's "5 call sites" missed `newGamePlus` and `updateGame` — both are real status paths).
- **Why now, ahead of the Sep schedule:** status events can't be backfilled. Every day without logging = Year-1 "Wrapped" data that can never be reconstructed. Local capture now starts the clock on every device.

## What's left (this spec)
Per `year-in-pile-spec.md` §7:
- New Supabase table `status_events` (`id, user_id, game_id, from, to, at`), RLS = user reads/writes own rows only.
- Sync the local log to Supabase for cloud-synced users on save, mirror on load.
- Without this, a synced user on multiple devices accumulates a *per-device* event log — Year-in-Pile would undercount. Local-only is fine for guests; multi-device synced users need the mirror to be complete.

## Gate
Moving a new data category client→server requires a **Privacy Policy update before shipping** (legal-compliance.md). The local log added no server data, so it shipped without a policy change; the mirror does not get that pass.

## Decision needed
Mirror as its own `status_events` table (spec's design, queryable) vs. folding the event array into the existing `library_data` blob (auto-syncs via current `cloudSync.ts`, simpler, but bloats the blob and couples to the merge work in [web-ios-interop.md](web-ios-interop.md) D1). Recommend the dedicated table once D1's `merge_library` lands, so events merge server-side too rather than racing the blob.
