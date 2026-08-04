# Env path migration — verification checklist

**Status: 🟡 OPEN — awaiting first session after Brady re-points the Claude Desktop app.**
*(A future session: run this top-to-bottom. If every check passes, do the cleanup steps, then flip the status line to ✅ DONE with the date and commit. If a check fails, the app re-point didn't fully take — report which one.)*

---

## Background (what was wrong)

The repo moved `~/Desktop/getplaying` → `~/dev/getplaying` on 2026-07-25 (off iCloud). But through 2026-08-03 the **Claude Desktop "pileofshame" project still opened the old `~/Desktop/getplaying`** folder. That one stale app setting drove three things to the dead husk:

1. **Default shell cwd** → `~/Desktop/getplaying` (sessions had to `cd` to dev on every command).
2. **Permission writes** → harness dropped `~/Desktop/getplaying/.claude/settings.local.json`.
3. **Memory key** → sessions loaded `…/-Users-bradywhitteker-Desktop-getplaying/memory/` instead of the dev-keyed dir.

**The real mechanism (confirmed 2026-08-03):** this session was launched by a **routine** (the weekly `inventory-full-decisions-audit-weekly` cron), not a "project." A routine's working directory is bound at the **app level** to the directory it's associated with — it is *not* stored in the task's `SKILL.md` (that's just the prompt) nor in the scheduled-tasks service config (which exposes only prompt/schedule/enabled — no cwd field, so it can't be re-pointed via `update_scheduled_task`). This routine was created while `~/Desktop/getplaying` was the active directory, so it inherited that path, which then set the memory key + permission-write location too.

**The change Brady made:** an app-side edit to the routine (the `SKILL.md` on disk was unchanged), re-associating it toward `~/dev/getplaying`. Verified only on the routine's next launch (below).

**⚠️ Both routines share this exposure** — `inventory-full-decisions-audit-weekly` (Mon) AND `inventory-full-regress-watch-weekly` (Sun). Re-pointing one doesn't fix the other. The durable fix is to **remove the Desktop entry from the app's getplaying directory dropdown entirely** + delete the husk, so nothing can bind to Desktop again. Each routine's `SKILL.md` keeps `cd /Users/bradywhitteker/dev/getplaying` as a backstop regardless.

Actual work was never affected — code always went to dev via explicit `cd` and is pushed (`4511e87` on `origin/main`). This is hygiene, not recovery.

---

## Verification (run these)

### 1. Default cwd is now dev
```bash
pwd   # run with NO leading cd
```
- ✅ Expect `/Users/bradywhitteker/dev/getplaying`.
- ❌ If it's `…/Desktop/getplaying` (or a Bash result says "cwd was reset to …/Desktop/getplaying"), the app re-point didn't take — stop and tell Brady.

### 2. Memory key is now dev
- Look at the memory dir path in THIS session's system prompt (the MEMORY.md line).
- ✅ Expect `…/-Users-bradywhitteker-dev-getplaying/memory/`.
- ❌ If it still says `-Desktop-getplaying`, the app is still misconfigured.

### 3. Permission writes land in dev, not Desktop
```bash
# after approving any command this session:
ls -la /Users/bradywhitteker/dev/getplaying/.claude/settings.local.json      # should update
ls -la /Users/bradywhitteker/Desktop/getplaying/.claude 2>&1                 # should NOT be recreated
```
- ✅ dev's settings.local.json is the one that grows; no new `.claude` appears under Desktop.

### 4. Reconcile the forked memory dirs
The two dirs diverged while the app was misconfigured (as of 2026-08-03):
- **dev-key** (`…-dev-getplaying/memory/`): 32 files — the base going forward. Has `feedback_agent_fanout_leash.md` that Desktop-key lacks.
- **Desktop-key** (`…-Desktop-getplaying/memory/`): 31 files. Differs on `MEMORY.md` and `reference_web_repo_path.md`.
```bash
D=/Users/bradywhitteker/.claude/projects/-Users-bradywhitteker-Desktop-getplaying/memory
V=/Users/bradywhitteker/.claude/projects/-Users-bradywhitteker-dev-getplaying/memory
diff "$D/reference_web_repo_path.md" "$V/reference_web_repo_path.md"   # keep whichever is more current in dev-key
diff "$D/MEMORY.md" "$V/MEMORY.md"                                     # ensure dev-key index has every real entry
```
- Action: dev-key is authoritative. Port anything **Desktop-key-only** that's still true into dev-key, then the Desktop-key memory dir is dead and can be deleted with the husk (step 5). Don't blindly overwrite dev-key with Desktop-key — dev-key is newer.

### 5. Confirm BOTH routines launch in dev
The proof of the app-side re-point is a routine actually running from dev. On the next scheduled run (or a manual run) of each routine, that session's system-prompt "Primary working directory" should read `…/dev/getplaying`, not Desktop:
- `inventory-full-decisions-audit-weekly` (Mon 08:09)
- `inventory-full-regress-watch-weekly` (Sun 07:10)
If either still launches in Desktop, its app-side directory association wasn't re-pointed. Best foreclosure: remove the Desktop entry from the app's getplaying directory picker so neither can bind there.

### 6. Delete the husk (only after checks 1–3 pass)
```bash
rm -rf /Users/bradywhitteker/Desktop/getplaying
rm -rf /Users/bradywhitteker/.claude/projects/-Users-bradywhitteker-Desktop-getplaying   # after step 4 reconcile
```
- Removing the husk means a future wrong-cwd fails loudly instead of silently working in an empty folder. Safe: it's not a git repo, no source (`.DS_Store` + one stray npm pkg + the harness-written permission file).

---

## Mark done

When 1–3 pass and 4–5 are handled:
1. Flip the status line at the top to `✅ DONE — YYYY-MM-DD`.
2. One line on what was reconciled (esp. any memory entries ported).
3. Commit (`docs: env path migration verified done`). This doc can stay as a record or be deleted — the git commit is the durable signal.
