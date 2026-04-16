<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Inventory Full — agent onboarding

This is what you read before writing any code in this repo. Brady is a solo builder. Sessions start cold. This document exists so you don't re-derive the same context every time.

## What this app is (two sentences)

Inventory Full (inventoryfull.gg) solves game-library decision paralysis: the user owns more games than they can play, can't decide what to start, and closes the launcher without playing anything. Our success metric is inverted — **less time in our app = better outcome**; we win when they close the tab and go play.

If a feature adds catalogue management, organization tools, or "engagement" that doesn't terminate in the user playing a game, it's fighting the thesis.

---

## Stack snapshot

- **Framework:** Next.js **16.2.1** with Turbopack. Not the Next.js you remember — APIs, conventions, and file structure differ from older majors. When in doubt, read the relevant guide in `node_modules/next/dist/docs/` before writing. Heed deprecation notices.
- **React:** 19.2.4 (client components must be explicitly marked `'use client'`).
- **Styling:** Tailwind **4** via `@tailwindcss/postcss`. No `tailwind.config.js` — theme tokens live in `app/globals.css` as CSS custom properties.
- **State:** Zustand (`lib/store.ts`) — single store, action-based.
- **Persistence:** localStorage is the source of truth. Supabase (`lib/supabase.ts`, `lib/cloudSync.ts`) is opt-in cloud sync, not authoritative.
- **Auth:** Supabase auth via `@supabase/ssr`. Guest mode is first-class — the app works fully without an account.
- **Integrations:** `psn-api` for PlayStation, Steam (public API), Xbox (OpenXBL), RAWG (metadata), HLTB (playtime estimates).
- **Observability:** Sentry (`@sentry/nextjs`) — live in production.
- **OG images:** `next/og` `ImageResponse` on the edge runtime (`app/pile/[id]/opengraph-image.tsx`, `app/clear/[id]/opengraph-image.tsx`).
- **Testing:** Playwright e2e (`e2e/`, `npm run test:e2e`). No unit test framework wired up.
- **Deploy:** `git push` to `main` → Vercel. Brady has no `gh` or `vercel` CLI installed. Node via `fnm`.

---

## Folder conventions

```
app/                  Next.js App Router routes
  page.tsx            Landing + app shell (guest-mode aware)
  about/              Public about page (mirrors landing copy)
  pile/[id]/          Pile share card route + OG image
  clear/[id]/         Completion share card route + OG image
  api/                Route handlers (imports, enrichment)
  auth/               Supabase auth callbacks
components/           React components. Client by default.
  LandingPage.tsx     The marketing shell. Keep aligned with app/about/page.tsx.
  GameCard.tsx        The central game UI. Large file — edit surgically.
lib/                  Pure logic + integrations. Prefer adding here over inflating components.
  store.ts            Zustand store — all state mutations route through here
  types.ts            Game, GameStatus, and friends — update here first
  reroll.ts           Pick-mode filter logic (see Track C audit for known issues)
  enrichment.ts       Genre/mood tagging
  archetypes.ts       User archetype computation (client-side only)
.claude/rules/        Loaded every session. Read these.
  user-psychology.md     Research-grounded decisions for copy and UX
  legal-compliance.md    Hard lines + grey-area triggers for feature review
  voice-and-tone.md      How we sound
  brand-messaging.md     What we say
  deploy-gates.md        Pre-push checks that are not optional
docs/                 Product/roadmap/session notes
supabase/             Schema + migrations
```

---

## Architectural decisions that are locked

Don't re-open these without a specific reason. They've been debated:

1. **Client-side data is authoritative.** localStorage holds truth. Supabase is opt-in cloud sync. Do not flip the polarity without a migration plan and a Privacy Policy update.
2. **Guest mode is first-class.** The app works without an account, forever. New features must have a guest-mode path. "Sign in to use this" is a red flag.
3. **Status cycle is ordered and named.** `Backlog → Up Next → Playing Now → Completed` (or `Moved On` as a sibling exit). This is the mental model — don't rename, reorder, or add intermediate states without Brady. Internal keys: `buried`, `on-deck`, `playing`, `played`, `bailed`.
4. **Pick flow stays at 2 inputs.** Mood + time. Any new filter must displace one, not add. This is enforced by `.claude/rules/user-psychology.md` — see the cognitive-load section.
5. **No ads, no third-party data sharing, no cross-site tracking.** Hard lines in `.claude/rules/legal-compliance.md`. A violating feature doesn't ship, full stop.
6. **Less time in app = success.** If a change increases session length without terminating in play, it's probably the wrong direction.

---

## In-progress vs stable (rough status as of Apr 2026)

**Stable:**
- Core pick flow (mood + time → one picked game)
- Status cycle + celebration confetti
- Import from Steam, PSN, Xbox, CSV
- Pile OG share card + completion OG share card (redesigned Apr 16)
- Skip tracking, genre cooldown, finish nudge
- Reroll modes (but see known issues below)
- Sentry error reporting
- HLTB + RAWG enrichment pipeline

**In-progress / recently shipped:**
- Completion OG card redesign — shipped Apr 16
- "I beat it" quick-complete button on Playing Now cards — shipped Apr 16
- Landing desktop polish (copy, typography, Reveal animations) — Apr 16
- Reroll mode audit — Track C findings in `docs/track-c-reroll-audit-2026-04-15.md`; fixes pending
- Mobile landing refinement — awaiting Brady's feedback batch
- 2× hero asset generation — side-task spawned, not yet merged

**Known gotchas / debt:**
- **Reroll modes don't always match landing copy.** "Keep Playing" filters on `status === 'playing'`, which most users won't have because they don't manually promote games. "Deep Cut" is actually "long games" — has nothing to do with being forgotten. See the Track C audit doc.
- **Edge runtime for OG images:** no Node APIs, no filesystem. Fonts are fetched from Google Fonts over https at cold start.
- **`GameCard.tsx` is ~1000 lines.** Big single component. Edit with targeted `Edit` calls, don't rewrite.
- **PSN tokens are ephemeral.** Never log, never persist server-side. Pass through and discard.
- **Turbopack vs webpack:** some dev-time behaviors differ (HMR, certain plugin APIs). Prod build uses Turbopack too.
- **`Image` optimization:** `next/image` serves from `/public`. The hero webp is currently 384×256 native; a 2× version is being prepared. Don't bump display sizes past native without checking the asset.
- **Supabase anon key in public env:** it's intentional (RLS gates everything). Don't try to "hide" it by moving it server-side.

---

## Deploy + review gates

Before any `git push` to main, run through `.claude/rules/deploy-gates.md`. The sharp edges:

1. **Build must pass:** `fnm exec npm run build` (Brady uses fnm). If it fails, stop.
2. **Voice sweep** on any changed user-facing copy (patterns listed in `deploy-gates.md`).
3. **Legal compliance** on any feature touching user data, deals, profiling, or notifications.
4. **Product axiom check:** does this help get from "I want to play" to playing in under 60 seconds?
5. **Privacy Policy / Terms** must ship with or before any material data change, never after.

---

## How Brady works with you

- Solo builder, fast iterations, little patience for ceremony.
- Prefers surgical edits over large rewrites.
- Wants research-grounded psychology reasoning when you make copy calls — cite the relevant rule or study, don't guess.
- Mobile notes and desktop notes often come in separate batches. If one is outstanding, don't assume you can ship the other cleanly — ask.
- "Ship it" means commit + push. "Plan it" means don't touch code yet.
- No `gh`, no `vercel` CLI. If you need a PR or deploy status, use git + Sentry + the live site.

---

## When you're unsure

1. Check `.claude/rules/` first — the answer might already be codified.
2. Check `docs/` for session notes and decisions.
3. Check `node_modules/next/dist/docs/` for Next.js 16 specifics if framework behavior is in question.
4. Ask Brady. Don't invent a convention — he has opinions and they're usually already written down somewhere.
