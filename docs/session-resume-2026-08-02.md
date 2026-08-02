# Session Resume — 2026-08-02

⚡ **START HERE.** Prior: [`session-resume-2026-07-25.md`](session-resume-2026-07-25.md) — but note it's now **stale on the move**: it framed the iCloud repo move as *pending*. **The move is DONE.** This doc supersedes it. Short session: finished the move + handled the 2026-07-29 regress-watch audit.

---

## 🎯 NEXT SESSION STARTS HERE

### PRIORITY 1 — in-app account deletion (web) — still carried, still untouched

`delete-account` Edge Function exists on **Dev only** (`xafdnhsuiygbsfuqtdav`); **prod (`lrzjszthlmcivgyprqnb`) has zero edge functions** — deploy to prod first. Then danger-zone row in `SettingsMenu.tsx` → type-to-confirm modal → `supabase.functions.invoke('delete-account')` → sign out + wipe local. Copy flip in `app/privacy/page.tsx` + `app/support/page.tsx`. Detail in `session-resume-2026-07-16.md` + `DECISIONS.md` 2026-07-16.

### Inbound handoff still not actioned

`Handoffs/inbox/2026-07-24-inventory-full-to-getplaying-contract-bugs.md` (addressed **to getplaying**) — still not read/actioned. Handle it, then move to `processed/`.

### Optional — highest-value audit gap

The 07-29 audit flagged the **strongest missing `decision-*`**: "imports default to Backlog / no auto-status" (LOCKED user-agency, `DECISIONS.md` 2026-05-20 + 2026-05-13). Maps to the recurring Xbox/Steam auto-status agency-theft pattern (both rolled back). Cheaply greppable: import mappers must set `status: 'buried'`, never `playing`/`played`/`on-deck` from data signals. Add it to `.claude/skills/regress-watch/assertions.md` if you want it audited weekly.

---

## What happened this session

**The iCloud repo move is complete.** Repo now lives at `~/dev/getplaying`, off the iCloud-synced Desktop.
- Ref-sweep committed (`abfce39`): `Desktop/getplaying` → `dev/getplaying` in `.claude/settings.json`, `.claude/launch.json`, deploy + pre-push-review `SKILL.md`, `scripts/demo-capture.ts`.
- Claude Desktop "pileofshame" project re-pointed and working (this session ran from the new path).
- **The `.next` symlink-resurrection gotcha is gone** — no longer on iCloud, so it can't recur. (Historical `docs/` still say `Desktop/getplaying` on purpose — records.)

**Handled the 2026-07-29 regress-watch decisions-audit.**
- **1 real drift fixed** (`77c1659`): `JustFiveMinutes.tsx:262` triage button "📋 Play Next" (retired term) → "🎯 Up Next" (canon; matches `constants.ts:46` + the file's own toast). Gate passed.
- **Audit artifact committed** (`366c317`).
- **2 false-flags fixed at the source** (`ebf27d7`, `.claude/skills/regress-watch/assertions.md`):
  - Picker **R shortcut** — the audit called it "unverifiable" because it grepped `app/`+`components/`; the handler lives in `hooks/useKeyboardShortcuts.ts` (`onRoll` → `handleOpenReroll`). **Verified live: `r` opens the picker.** Assertion now points at the right file.
  - **Pile share-card subhead** "Your backlog's not gonna play itself." — whitelisted as a deliberate share-card variant (Brady's call). Stops the 3-week recurring soft-flag; retired-stem check is landing-only now.

## Health snapshot

- **Build:** passing. **Typecheck:** clean. **Lint:** 0 errors.
- **CI:** green (since `9a4607b`, 2026-07-25 — the first green after the multi-week red streak).
- **`main` tip:** `ebf27d7` (plus this session-close commit). Working tree clean, in sync with origin.
- **Repo location:** `~/dev/getplaying` (off iCloud).

---

*Closed 2026-08-02 ~07:10 PDT.*
