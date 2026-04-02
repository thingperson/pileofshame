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
2. **Voice/lingo sweep** — MANDATORY if any user-facing copy was written or modified. See "Voice/Lingo Sweep" section below.
3. **Stage, commit, push** — Same git workflow as full deploy.
4. **Skip** accessibility audit, code efficiency check, and plan update unless the change touches those areas.

## Policy Guardrails
The pre-push-review skill checks these, but know the hard rules:
- **No-sell rule**: We NEVER recommend games users don't already own or have wishlisted. If a new feature breaks this, it requires coordinated updates to privacy policy, HelpModal FAQ, DealBadge disclosures, and voice guide. See pre-push-review Section 5 for the full file list.
- **Affiliate disclosures**: Every deal link needs FTC disclosure near it, not just in privacy policy.
- **Data collection**: New data collection = privacy policy update before deploy.

## Voice/Lingo Sweep (Mandatory for Copy Changes)

Run this on EVERY deploy where user-facing copy was written or modified. This is non-negotiable.

### What to check
Grep all changed files with user-facing strings for these banned patterns (from `.claude/rules/voice-and-tone.md`):

1. **"You don't X, you Y"** / **"That's not X, that's Y"** / **"You're not X, you're Y"** — the most common AI tell. Grep for: `You don't |You're not |That's not `
2. **Em dashes (—) for dramatic pauses** — use periods, colons, or commas instead. OK as UI placeholder for empty values.
3. **"Dive into" / "Elevate your" / "Unlock the power of"** — generic marketing slop
4. **"Whether you're X or Y"** — hedge-y AI construction
5. **Banned words in copy**: "delve", "tapestry", "landscape", "journey" (unless about the game Journey)
6. **Starting with "Ah," or "Well,"** — filler AI openers
7. **Triple adjective lists** ("sleek, powerful, and intuitive")
8. **Overly parallel structures** — "You X. You Y. You Z." in sequence

### How to run it
```bash
# Check changed files for the most common violations
git diff --name-only HEAD~1 | xargs grep -n "You don't \|You're not \|That's not \|— \|dive into\|delve\|tapestry\|landscape\|journey\|Whether you're\|Ah,\|Well," 2>/dev/null
```

Or use `Grep` tool on each changed file. Focus on string literals and JSX text, not code comments.

### Judgment calls
Not everything flagged is a violation. The voice guide encourages personality, roasts, and wit. "The backlog fears you now" is personality, not AI slop. Use judgment: the test is "would a human gaming buddy say this, or does it sound like ChatGPT wrote a marketing page?"

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
