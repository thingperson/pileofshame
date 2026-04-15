# MVP Sprint — Inventory Full

**Started:** Tue Apr 14, 2026 — 7:47pm
**Target ceiling:** 5k–10k MAU
**Definition of "shippable":** Trust gates green, monitoring live, conversion funnel tracked, no known hard blockers, public launch surface picked.

This doc is the single source of truth while the sprint is in flight. Updated as items land.

---

## Status legend
- ⏳ in progress
- ✅ shipped
- 🔜 next
- 💤 deferred (logged but not this sprint)

---

## Sprint items

### 1. Monitoring + phone alerts (ntfy.sh) — ⏳
**Outcome:** Daily cron checks user count + share-card volume. Pushes to ntfy when a milestone is crossed (100, 300, 1k, 3k, 5k, 10k users; 1k / 5k / 10k share cards). Brady's iPhone gets the push, no dashboard needed.

**Wiring:**
- Migration `005_app_meta.sql` — single-row table tracking last-notified milestones
- `app/api/cron/milestone-check/route.ts` — gated by `CRON_SECRET` header
- `vercel.json` — daily cron schedule
- Env: `NTFY_TOPIC_URL`, `CRON_SECRET`

### 2. Smoke test in CI — 🔜
**Outcome:** One Playwright file covering sample → roll → reroll. Runs on push via GitHub Actions. If it fails, you don't ship.

### 3. Cookie banner (privacy-first, fast reject) — ✅
**Outcome:** Banner appears on first load, two equal buttons (Accept / Decline). Decline blocks GA4 via `window['ga-disable-...']`. Choice persisted in localStorage. Auth cookies excluded (strictly necessary). EU/UK compliance covered.

### 4. GA4 conversion events — Brady's side in dashboard
**Outcome:** Code fires the funnel events (sample_started, sample_completed, import_completed, first_roll, first_commit, first_completion, share_card_created, signup_completed). Brady marks them as Key Events in GA4 UI.

### 5. Branded magic-link HTML email prototype — ✅ (awaiting Brady review)
**Outcome:** `docs/email-templates/magic-link.html` — hero logomark, brand voice, single CTA button, plain-text fallback. Brady reviews → wires into Supabase + Resend SMTP.

### 6. Feedback mechanism — 🔜
**Outcome:** Floating "Feedback" button → modal with textarea + optional email + checkbox "Hear from us about updates" → POST `/api/feedback` → `feedback` table. Migration `006_feedback.sql`. Footer "Found a bug?" link wires to same modal.

### 7. Mood-filter friction — DEFER (shelve, not delete) — 💤
**Decision:** Filter combos returning zero games is a kill-switch for first-timers. Shelving the multi-filter UI for MVP. Single mood pick allowed; "Advanced filters" hidden behind a settings flag. Logged in IDEAS.md and ROADMAP.md as "needs UX rethink — likely needs a 'closest match' fallback before re-enabling."

### 8. Email capture strategy + scale-up doc — 🔜
**Outcome:** New `docs/email-strategy.md`. Covers: capture moments (post-sample archetype save, share-card "make yours" CTA, future Year-in-Review), required marketing-consent checkbox now even if no flows exist yet, service progression (no service → ConvertKit/Resend Audiences free → Customer.io when >10k), starter flows for when we're ready, and a "do not start until X" gate to avoid premature email work.

### 9. Audit + reconcile scale-up-plan.md — 🔜
**Outcome:** Read it line-by-line, mark stale claims, add the new pieces (Sentry coverage, ntfy alerts, in-memory rate-limit gap, ITAD cache gap, NPSSO scrubbing). Sync with this sprint doc.

### 10. Brady TODOs — captured in TickTick ✅

### 11. Engineering hard blockers (was Day-1 of original plan) — 🔜
Five items still pending:
- Fetch timeouts (`withTimeout` helper, wrap all external API calls)
- Sentry.captureException in every API route catch block
- Cap PSN trophy pagination at 5 pages
- NPSSO scrubbing in `instrumentation.ts` `beforeSend`
- `/api/health` actually probes Supabase + returns 503 on failure
- Cap library import at 5000 games (friendly error)

### 12. Trust + legal (was Day-2) — 🔜
- Cookie banner (item 3 covers)
- Inline FTC affiliate disclosure on every deal card
- Branded magic link (item 5 covers)
- Privacy policy refresh covering: cookie banner, marketing-consent flag, feedback table

---

## Monetization stance (locked for this sprint)

- **Now:** Tips only ("Buy me a slice"). Affiliate clicks pay infra. No upsell.
- **Trigger to ship Pro tier:** sustained 2k+ MAU OR infra crosses $40/mo OR clear demand signal in feedback.
- **Theme paywall is on the table.** If we ship Pro, themes are the obvious first paywalled feature (90s mode, Dino mode, etc. — high emotional pull, zero infra cost). Build the toggle so themes can be marked premium without a refactor.
- **Sponsorship play:** Insights.gg shoutout possible via Brady's prior CMO connection. Not load-bearing.
- **Out-of-pocket cap:** $200–$300/month max while pre-revenue. Past that, monetize or shed traffic.

---

## Cost ladder (locked)

| MAU | Stack | Monthly | Action |
|---|---|---|---|
| 0–5k | Vercel Hobby + Supabase Free | $0 | Ship |
| 5k–10k | Same + ntfy + Resend free | $0 | Watch closely |
| 10k–25k | Vercel Pro + Resend paid | $40 | Brady-funded; monetization in flight |
| 25k–50k | + Supabase Pro + Sentry Team | $91 | Pro tier should be live by now |
| 50k–100k | + Upstash Redis + bandwidth | $126 | Revenue must cover this |
| 100k+ | Re-evaluate fully | $226+ | Sponsorship and/or Pro tier carrying it |

---

## Progress log

- **Apr 14 7:47pm** — Sprint kicked off. Items defined. Item 1 in flight.
- **Apr 14 8:15pm** — Item 1 shipped (cron + ntfy + sprint doc, commit `c76c912`, pushed to main). Awaiting Brady's Vercel env vars + Supabase migration.
- **Apr 14 8:30pm** — Item 5 drafted (`docs/email-templates/magic-link.html`). Item 3 shipped (CookieBanner — GA only loads after consent, footer "Cookies" link reopens banner).
