# Session Resume — 2026-07-16

⚡ **START HERE.** Prior context: [`session-resume-2026-07-15.md`](session-resume-2026-07-15.md) — GA4→Vercel Analytics swap, `game_metadata` cache built, deploy-token refresh. This session was handoff processing + one bug fix.

---

## 🎯 NEXT SESSION STARTS HERE — build in-app account deletion (web)

**This is the very next task.** Full spec + rationale in [`DECISIONS.md`](DECISIONS.md) 2026-07-16.

The iOS session built a reusable `delete-account` Supabase Edge Function. Web should stop saying "contact us" and offer real in-app deletion. Export-my-data is already done on web (`lib/backup.ts` + Settings "Export Backup") — no work there; iOS is the side missing export.

**Order of work:**
1. **Deploy `delete-account` to prod** (`lrzjszthlmcivgyprqnb` — currently has ZERO edge functions). It's on dev (`xafdnhsuiygbsfuqtdav`) only. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in prod; smoke-test (anon-key → 401, then real-JWT happy path). Source: iOS repo `supabase/functions/delete-account/index.ts`. **Hard gate — the web UI can't be tested end-to-end until this lands.** Shared with the iOS launch, so coordinate.
2. **Web UI:** signed-in-only danger-zone row in `components/SettingsMenu.tsx` → type-to-confirm "DELETE" modal → `supabase.functions.invoke('delete-account')` (POST, JWT auto-attached, no body) → sign out → wipe local → typed error handling. Mirror iOS `DeleteAccountView` + server-delete-first ordering.
3. **Copy:** `app/privacy/page.tsx` (~L276, L297) + `app/support/page.tsx` → immediate in-app deletion; no em dashes; ship WITH the feature (legal gate).

Contract: `POST /functions/v1/delete-account`, Bearer JWT, no body → `{ok:true}` or typed errors (`401 invalid_token`, `500 *_delete_failed`). Deletes `libraries` + `profiles` + auth user synchronously. CORS already `*`.

---

## What shipped this session (1 commit, deployed)

| Commit | What |
|---|---|
| `6115723` | **Smart Pick % bug fixed.** `renderSmartPickHeadline` was fed `metacritic` as `ratingPct` for every pick type, so `almost-there` rendered a critic score as "% of the way through" and `forgotten-gem` as "% positive on Steam." Now passes real progress (`hours / HLTB`, capped 99) only for `almost-there`; `undefined` elsewhere so forgotten-gem's Steam-% line self-filters. Matches iOS fix D-037. Files: `components/Reroll.tsx:798`, `lib/smartPickCopy.ts:14` (doc comment). |

Verified: typecheck clean, `npm run build` passed full route table, pick flow exercised in preview (no console errors).

---

## 🔴 CI has been red since ~2026-07-06 (pre-existing, NOT this session)

The GitHub Actions gate (`.github/workflows/ci.yml`, added Jul 6) runs `./verify.sh`, whose **first step is `npm run lint`** under `set -euo pipefail`. `npm run lint` reports **35 errors** (81 problems total) → job dies at lint in ~56s, before building.

- **`next build` does NOT run eslint in Next 16** — that's why local `npm run build` and Vercel deploys pass while CI fails. **CI red does not block prod.**
- The gate has never been green: the Fable audit handoff warned `verify.sh` "has NEVER been executed."
- Every push since Jul 6 has failed CI, including this session's `6115723` (the failure email that surfaced it). None of the 35 errors are in the Smart Pick files.

**Error breakdown:** 18 `react-hooks/set-state-in-effect`, 6 `no-explicit-any`, 4 `no-html-link-for-pages`, 3 `preserve-manual-memoization`, 3 `no-unescaped-entities` (all in `early-examples/` dead code), 1 `react-hooks/purity`.

**Chipped** for a dedicated fresh-session fix (task `task_9124c6ea`). Decision: **full fix, not relax the gate** (Brady's call). Suggested order: ignore `early-examples/` → fix trivial (link/quotes/easy any) → work through the 18 setState-in-effect per-case (many are hydration guards; restructure or disable-with-reason, don't blanket-disable).

---

## Privacy copy — resolved into the deletion build (see NEXT SESSION above)

Earlier this session I held the "immediate in-app deletion" privacy rewrite because the feature didn't exist on web. After checking the iOS state, the resolution is: **build it** (the Edge Function is reusable), and flip the copy WITH the feature. Rolled into the next-session task + DECISIONS 2026-07-16. Do not flip the copy before the feature ships.

---

## Handoffs processed

Filed to `processed/2026-07/` on the bus (`ec8fa5e`, local only — bus not pushed, see below):
- `2026-07-03 inventory-full → getplaying: smartpick-pct-bug` — fixed this session.
- `2026-07-13 brady-os: game_metadata 404` — resolved 07-15 (migration 002 applied).

**Left in `inbox/` (open actions):**
- `2026-07-14 inventory-full → getplaying: appstore-privacy-support-pages` — pages are live, but the deletion-copy action is held (above).
- `2026-07-06 brady-os: fable-audit-changes` — verify.sh green (now chipped), regress-watch weekly, AGENTS.md refresh all still open.

---

## Still open (carried)

- **In-app account deletion (web)** — the next task, see top. Prod-deploy `delete-account` + web UI + copy.
- **Fable audit queue:** CI green / lint cleanup (task `task_9124c6ea`), regress-watch weekly registration, GitHub Actions already exists, AGENTS.md evergreen refresh (stale: dated 05-05, no iOS-sibling mention).
- **Sentry triage** from 2026-06-30.
- **3 live-only regress-watch items** (90s theme contrast, import-modal overflow, mood banner) — 60s dev-server pass clears all.

---

## Health snapshot

- **Build:** clean locally. **CI:** 🔴 red (pre-existing lint debt, not a regression).
- **main tip:** `6115723`, pushed, nothing ahead of origin.
- **Prod:** Smart Pick fix live via Vercel.
- **Handoffs bus:** `[ahead 2]` with heavy other-session uncommitted work — **not pushed** (owner's call; not swept up here).

---

*Closed 2026-07-17 ~19:40 PDT (session spanned from 07-16 evening).*
