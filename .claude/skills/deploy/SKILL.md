---
name: deploy
description: Build, verify, and deploy to Vercel production. Supports two modes — full (with review) and quick (feature push). Use when changes are ready to go live.
---

# Deploy to Production

## Project Info
- **Local codebase:** `/Users/bradywhitteker/Desktop/getplaying`
- **Live URL:** https://inventoryfull.gg (Vercel) — also accessible at pileofsha.me (legacy redirect)
- **Git remote:** `origin` → `github.com:thingperson/pileofshame.git` (main branch)
- **Deploy method:** Push to `main` triggers Vercel auto-deploy. No manual `vercel deploy` needed.
- **Git push command:** `GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git -c credential.helper= push origin main`
- **Node path:** `$HOME/.fnm/node-versions/v22.22.2/installation/bin` (fnm-managed)
- **Plan doc:** `/Users/bradywhitteker/.claude/plans/partitioned-fluttering-flurry.md`
- **Voice guide:** `.claude/rules/voice-and-tone.md`
- **User personas:** `.claude/rules/user-persona.md`

## Deploy Modes

### Full Deploy (end of sprint, big push, multiple features)
Use this when shipping multiple features, after a sprint, or when explicitly asked for a full review.

1. **Pre-push review** — Run the `pre-push-review` skill (build, voice/copy, accessibility, code efficiency, plan update)
2. **Fix any issues** found by the review. Do NOT deploy if build fails or secrets are exposed.
3. **Stage and commit** — Use descriptive commit message with `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`. Use heredoc format for multi-line messages.
4. **Push to main** — Use the SSH git push command above. This triggers Vercel auto-deploy.
5. **Verify** — Confirm push succeeded. Vercel deploys automatically on push to main.
6. **Update plan doc** — Mark completed items, add new TODOs if discovered during review.

### Quick Deploy (single feature, hotfix, minor change)
Use this for small, focused changes where a full review would be overkill.

1. **Build check only** — Run `npm run build` in the project directory. If it fails, stop.
2. **Quick voice scan** — Scan ONLY the changed files for banned voice patterns (see voice guide). Skip full component scan.
3. **Stage, commit, push** — Same git workflow as full deploy.
4. **Skip** accessibility audit, code efficiency check, and plan update unless the change touches those areas.

## Common Pitfalls
- Always use the SSH push command — HTTPS auth doesn't work in this environment
- Never use `vercel deploy --prod` directly — we deploy via git push to trigger Vercel's GitHub integration
- Node path must be added to PATH for build: `export PATH="$HOME/.fnm/node-versions/v22.22.2/installation/bin:$PATH"`
- Commit messages: use heredoc to avoid shell escaping issues with apostrophes
- Don't push `.env` or credential files — check `git status` before staging

## Review Skills Reference
- **`pre-push-review`** — Full review bundle (build + voice + a11y + code efficiency + plan update). Run before full deploys.
- **Voice guide** at `.claude/rules/voice-and-tone.md` — Banned patterns, terminology table, personality examples.
- **User personas** at `.claude/rules/user-persona.md` — Who we're building for. Check new copy against these.

## After Deploy
- Vercel build logs visible at https://vercel.com (if needed)
- Live site at https://inventoryfull.gg
- If deploy fails on Vercel side, check build logs — most common issue is TypeScript errors that `next build` would catch locally
