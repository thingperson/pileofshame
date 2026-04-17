# MCP Install Guide — Supabase, Sentry, Vercel

All three install at **user scope** so they're global across projects. Run from any directory.

## 1. Supabase

**Grab first:**
- Personal Access Token: https://supabase.com/dashboard/account/tokens (create a new one, label it "Claude Code MCP")
- Project ref: from any project URL `https://supabase.com/dashboard/project/<PROJECT_REF>` (or Project Settings → General)

**Install (one-liner — swap in your values):**
```bash
claude mcp add --scope user --transport http supabase \
  "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF&read_only=true" \
  --header "Authorization: Bearer YOUR_PAT"
```

`read_only=true` is load-bearing — it prevents the MCP from running writes/DDL. Drop it only if you explicitly want Claude able to mutate the DB.

Docs: https://supabase.com/docs/guides/getting-started/mcp

## 2. Sentry

OAuth — no token to pre-generate. First use opens a browser.

```bash
claude mcp add --scope user --transport http sentry https://mcp.sentry.dev/mcp
```

Then start Claude Code and run `/mcp` — it'll walk you through the OAuth flow in your browser. Sign in with the same Sentry account tied to inventoryfull.

Docs: https://docs.sentry.io/product/sentry-mcp/

## 3. Vercel

Also OAuth, remote-only.

```bash
claude mcp add --scope user --transport http vercel https://mcp.vercel.com
```

Start Claude Code, run `/mcp`, authenticate in browser. Grants the same access as your Vercel user (so it can read deploys, logs, project settings — which is what you want).

Docs: https://vercel.com/docs/agent-resources/vercel-mcp

## Verifying

Start a fresh Claude Code session and try:
- "What tables are in my Supabase db?"
- "What's the latest Sentry issue on inventoryfull?"
- "What was my last Vercel deploy?"

If any fails, run `/mcp` in-session to see connection state and re-auth.

## Gotchas

- **Supabase PAT scope:** the token grants the same access as your account. `read_only=true` in the URL is your guardrail, not the token itself. If you want hard isolation, create a separate Supabase account with limited project access — otherwise trust the URL flag.
- **Supabase project ref is per-project.** If you add more Supabase projects later, either swap the ref or add a second MCP entry with a different name (e.g. `supabase-staging`).
- **Sentry + Vercel OAuth tokens can expire.** If calls start failing silently, re-run `/mcp` to re-auth.
- **Remove/reset:** `claude mcp remove <name> --scope user` if you need to reconfigure.
- **Config location:** user-scoped MCPs land in `~/.claude.json`. Safe to inspect; don't hand-edit unless you know what you're doing.
