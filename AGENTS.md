<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Inventory Full — agent onboarding

Brady is a solo builder. Sessions start cold. This doc is the **evergreen** context only.

**Current-state lives elsewhere:** a SessionStart hook prints the path to the latest `docs/session-resume-*.md`. Read it when the task needs recent-shipped / in-progress / rotting-gotcha context. Don't re-add that content here — it goes stale and taxes every turn.

**Token efficiency:** see `.claude/rules/token-efficiency.md`. Delegate research reads to Explore/Agent subagents, don't re-read files already in this session's context, suggest fresh sessions when topics shift.

## What this app is

Inventory Full (inventoryfull.gg) solves game-library decision paralysis: the user owns more games than they can play, can't decide what to start, and closes the launcher without playing anything. Our success metric is inverted — **less time in our app = better outcome**; we win when they close the tab and go play.

If a feature adds catalogue management, organization tools, or "engagement" that doesn't terminate in the user playing a game, it's fighting the thesis.

---

## Stack

- Next.js **16.2.1** + Turbopack. React **19.2.4** (`'use client'` required).
- Tailwind **4** via `@tailwindcss/postcss`. Theme tokens in `app/globals.css` (no config file).
- State: Zustand single store (`lib/store.ts`), action-based.
- Persistence: **localStorage is authoritative.** Supabase is opt-in cloud sync (`lib/cloudSync.ts`).
- Auth: Supabase via `@supabase/ssr`. Guest mode is first-class.
- Integrations: `psn-api`, Steam public API, Xbox (OpenXBL), RAWG, HLTB.
- Observability: Sentry (`@sentry/nextjs`), live in prod.
- OG images: `next/og` ImageResponse. Clear card on Node runtime + `fs.readFile`; root + pile still on edge with gstatic fonts.
- Tests: Playwright e2e (`npm run test:e2e`). No unit tests.
- Deploy: `git push` to `main` → Vercel. No `gh` / `vercel` CLI. Node via `fnm`.

---

## Folders (most-edited)

- `app/` — App Router routes. `page.tsx` is landing/shell; `api/` is route handlers; `pile/[id]/` + `clear/[id]/` are share cards with OG images.
- `components/` — React, client by default. `LandingPage.tsx` and `GameCard.tsx` are the big ones. Keep landing aligned with `app/about/page.tsx`.
- `lib/` — Pure logic + integrations. Prefer adding here over inflating components. Key files: `store.ts`, `types.ts`, `reroll.ts`, `enrichment.ts`, `archetypes.ts`.
- `.claude/rules/` — Loaded every session. Voice, legal, psychology, deploy gates, token efficiency.
- `docs/` — Roadmap, session notes, decisions. `docs/session-resume-*.md` = current state. `docs/LAUNCH_BIBLE.md` = single source of truth for launch planning (Apr 21–May 11 sprint).
- `supabase/` — Schema + migrations.

`ls` the repo for anything else.

---

## Architectural decisions that are locked

Don't re-open without a specific reason:

1. **Client-side data is authoritative.** localStorage holds truth. Supabase is opt-in sync. Don't flip polarity without a migration plan + Privacy Policy update.
2. **Guest mode is first-class.** Works without an account, forever. New features need a guest path. "Sign in to use this" is a red flag.
3. **Status cycle is ordered:** `Backlog → Up Next → Playing Now → Completed` (or `Moved On` as sibling exit). Internal keys: `buried`, `on-deck`, `playing`, `played`, `bailed`. Don't rename, reorder, or add intermediate states.
4. **Pick flow stays at 2 inputs** (mood + time). Any new filter must displace one, not add. See `.claude/rules/user-psychology.md`.
5. **No ads, no third-party data sharing, no cross-site tracking.** Hard lines in `.claude/rules/legal-compliance.md`.
6. **Less time in app = success.** Changes that increase session length without terminating in play are usually wrong.

---

## Evergreen gotchas

- **OG image runtime split:** clear card uses Node runtime so it can `fs.readFile` local assets from `public/og-assets/`. Root + pile stay on edge + gstatic because they only need external fonts. Don't use webp for `<img>` in any OG route — satori crashes on it. See `docs/DECISIONS.md` 2026-04-21 for the full context.
- **`GameCard.tsx` is ~1000 lines.** Edit with targeted `Edit` calls, don't rewrite.
- **PSN tokens are ephemeral.** Never log, never persist server-side. Pass through and discard.
- **Turbopack vs webpack:** some dev-time behaviors differ (HMR, plugin APIs). Prod uses Turbopack too.
- **Supabase anon key is intentionally public.** RLS gates everything. Don't try to "hide" it server-side.

Recent/rotting gotchas live in the latest session-resume doc.

---

## Deploy

Before any `git push` to main, follow `.claude/rules/deploy-gates.md` (build, voice sweep, legal check, product axiom).

### Pre-Push Gates

Before pushing, run the full pre-push sweep (lint, typecheck, build, docs update) and verify fixes. Commit in logical units and update handoff docs before the final push.

---

## Accessibility & Contrast

Legibility is non-negotiable. All text/background combinations must meet WCAG AA contrast minimums (4.5:1 for body text, 3:1 for large text). Never defer contrast failures as a "designer's call" — fix them.

---

## How Brady works

- Solo builder, fast iterations, little patience for ceremony.
- Surgical edits over large rewrites.
- Wants research-grounded psychology reasoning for copy calls — cite rules/studies.
- Mobile and desktop notes come in separate batches. If one is outstanding, don't assume the other is ready to ship — ask.
- "Ship it" = commit + push. "Plan it" = don't touch code.
- No `gh`, no `vercel` CLI. Use git + Sentry + the live site.

---

## When unsure

1. `.claude/rules/` first — the answer might already be codified.
2. `docs/` for session notes and decisions.
3. `node_modules/next/dist/docs/` for Next.js 16 specifics.
4. Ask Brady. Don't invent conventions.

---

## Session Handoffs

At the end of substantial sessions, update the session-resume handoff doc (`docs/session-resume-*.md`) with: current state, what shipped, what's pending, and date/time with timezone. This enables clean starts in fresh sessions.

Canonical mechanism: the `session-close` skill (`.claude/skills/session-close/`). It owns the session-resume doc AND writes a Brady OS handoff to the shared Handoffs bus so the hub stays in sync. Trigger with "close session" / "wrap session" / "close us out."
