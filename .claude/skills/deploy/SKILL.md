---
name: deploy
description: Build, verify, push, and confirm production deploy to Vercel. Orchestrator that detects what changed, runs the right gates (build + voice + a11y + legal as applicable), handles surprises by asking before deciding, pushes to main, and verifies the live deploy. Two modes — full (review-heavy) and quick (build + voice if copy changed). Trigger on "deploy", "ship it", "let's push", "deploy to prod".
---

# Deploy to Production

`/deploy` is the orchestrator for getting work to production. It does not duplicate other skills — it invokes them with the right scope. End-of-session housekeeping (handoffs, decision logs, doc tidy) belongs to `/session-close`, not here.

## Project info

- **Local codebase:** `/Users/bradywhitteker/Desktop/getplaying`
- **Live URL:** https://inventoryfull.gg (Vercel auto-deploys from `main`)
- **Git remote:** `origin` → `github.com:thingperson/pileofshame.git`
- **Push command:** `GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git -c credential.helper= push origin main`
- **Node:** `$HOME/.fnm/node-versions/v22.22.2/installation/bin` (via fnm)
- **Pre-push hook:** `.git/hooks/pre-push` nags non-blockingly when user-facing code is in scope. Canonical source: `scripts/hooks/pre-push`. Re-install via `bash scripts/hooks/install.sh`.

## Step 1 — Scope detection

Read `git diff --name-only origin/main..HEAD` (or staged changes if not yet committed). Bucket files:

- **User-facing code** — `components/**`, `app/**` (excluding `app/api/**`)
- **Server/data** — `app/api/**`, `lib/**` (handlers, store, enrichment)
- **Schema** — `supabase/migrations/**`, `lib/types.ts` if Game shape changed
- **Rules / skills / docs** — `.claude/**`, `docs/**`, `*.md`
- **Config / build** — `next.config.*`, `package.json`, `tsconfig.json`, `tailwind.config.*`
- **Scripts** — `scripts/**`

Scope determines what gates run. Don't run a voice sweep on a server-only change.

## Step 2 — Pick mode

### Full mode — multiple features, end of sprint, or anything risky

Use when:
- Multiple feature areas changed
- User-facing code AND server/data changed in the same push
- Schema changed
- Legal-sensitive surfaces touched (privacy, deals, profiling, notifications)
- Brady asks for "full review"

Run, in order:
1. **Build verification** — `npm run build` from repo root. If it fails, stop and report.
2. **`/pre-push-review`** — bundle: build (already passed), voice/copy, a11y, terminology, code efficiency. Voice review uses `.claude/rules/voice-charter.md` as the gate.
3. **Legal compliance** — if data/deals/profiling/notifications changed, walk through `.claude/rules/legal-compliance.md` triggers explicitly.
4. **Product axiom** — if features were added/modified, ask: "does this serve `Import → Mood → Pick → Play → Celebrate` in <60s?" If it adds friction without serving the loop, surface for go/no-go.
5. **Surface contradictions** — if the diff and `.claude/rules/` or `docs/DECISIONS.md` LOCKED entries disagree, **ask before pushing**. Drift may be intentional, but never silent.

### Quick mode — single small change

Use when:
- One feature area, small diff
- Hotfix
- Copy tweak
- Docs only (skip voice; rules/skills count as "user-facing" if they govern shipped copy)

Run:
1. **Build check** — `npm run build`. If it fails, stop.
2. **Voice sweep** — only if user-facing copy changed. Use `voice-charter.md` (not the long voice-and-tone.md).
3. Skip a11y, code efficiency, plan update unless the change touches those areas.

## Step 3 — Stage, commit, push

- Read `git status` first. Never stage `.env`, credentials, or unrelated files.
- Commit messages: heredoc format, descriptive, with the standard `Co-Authored-By: Claude Opus 4.6` trailer.
- Atomic commits when shipping multiple distinct things — easier to revert one piece.
- Push with the SSH command above. HTTPS auth doesn't work in this environment.

## Step 4 — Post-push verify

After the push completes, in parallel:

1. **`curl -sI https://inventoryfull.gg/ | grep x-vercel-id`** — confirm Vercel served a deploy. The ID won't match the new commit immediately (build takes ~30–90s) but proves the site is up.
2. **Wait ~60s, re-curl** — confirm the deploy ID changed (means Vercel finished building the new commit). If it hasn't changed after 3 min, check Vercel build logs.
3. **Smoke-check the live site** for any user-visible change Brady mentioned (hero CTA copy, new modal section, etc.) via `mcp__Claude_in_Chrome__navigate` + screenshot.
4. **Sentry** — glance for new error spike post-deploy. Skip if the change is server-only or trivial.

If anything looks wrong, surface it. Don't auto-revert; ask Brady.

## Step 5 — Update session-resume (light)

If a `docs/session-resume-YYYY-MM-DD.md` exists for today, append a one-line note: what was deployed + commit SHA. Full session-close housekeeping is `/session-close`'s job.

## Common pitfalls

- HTTPS auth doesn't work — use the SSH push command
- Don't use `vercel deploy --prod` — we deploy via git push
- Node path must be on PATH for build: `export PATH="$HOME/.fnm/node-versions/v22.22.2/installation/bin:$PATH"`
- Heredoc commit messages avoid shell escaping issues with apostrophes
- Never `--no-verify` to bypass the pre-push hook — the hook is non-blocking; if it nagged, address the nag

## Hard guardrails (never override)

- **No-sell rule** — never recommend games the user doesn't already own/wishlist. Hard line. See `.claude/rules/legal-compliance.md`.
- **Affiliate disclosures** — every deal link gets FTC disclosure adjacent, not just in privacy policy.
- **Data collection changes** — Privacy Policy update ships WITH or BEFORE the feature, never after.
- **Force-pushing main** — never. Don't even offer it.
- **Skipping the pre-push hook** — never with `--no-verify`. The hook is informational; if it fires, address it.

## Boundaries

- This skill orchestrates `/pre-push-review` — it does not duplicate the bundle.
- This skill does NOT do session-close work (handoffs, decision logging, ROADMAP scan, AGENTS.md drift). That's `/session-close`. Running both back-to-back is the correct end-of-day pattern.
- This skill does NOT run weekly drift audits (`/regress-watch decisions-audit`). That fires on its own cadence via the schedule, not on push.
