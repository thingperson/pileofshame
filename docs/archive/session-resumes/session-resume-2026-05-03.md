# Session Resume — 2026-05-03 (Saturday → into Sunday, PDT)

⚡ **START HERE.** This session ran late evening 2026-05-02 into early afternoon 2026-05-03 PDT — one continuous chat across the date roll. For Friday's GA4-rescue + H2-bundle context, see [`session-resume-2026-05-01.md`](session-resume-2026-05-01.md).

**Type:** Distribution sprint. Three deploys, all on the social/distribution problem flagged at session start: *"we have no social vectors. anyone trying out the app today will have nowhere to land."*

## Active sprint / current focus

Soft launch May 6 (3 days out). This session's through-line: build the social vectors so a first-time visitor (or someone clicking a share) lands somewhere with a path forward.

## What shipped this session

Three commits, all live:

- **`4e3b676` — feat(community): Discord link + email capture for unauthenticated visitors.** New `email_subscribers` table (separate from `auth.users`/`profiles.wants_updates` so consent is source-attributable per `legal-compliance.md`); `/api/subscribe` route (rate-limited 3/10min/IP, lowercase + upsert); `StayInTouch.tsx` two-column card (email form + Discord link) wired into landing + about; Privacy Policy updated. Discord invite live: `https://discord.gg/gJdmmymGg3` (set in `lib/social.ts`).
- **`490157c` — feat(archetypes): standalone `/archetype/[slug]` share pages + OG cards.** New `lib/archetypeRegistry.ts` (38 entries, evergreen flavor lines de-personalized from in-app dynamic descriptions). 38 SSG pages via `generateStaticParams`. Per-archetype OG card with tone-tinted glow (pink/purple/teal). "↗ Share your type" button in `ArchetypeCard.tsx` — native share sheet on mobile, clipboard fallback on desktop. Dynamic "Genre Addict" archetypes route to a generic `/archetype/genre-addict` page. See DECISIONS 2026-05-02.
- **`5643774` — feat(archetypes): H2 painted-pixel sprites in OG cards.** 38 PNG@4x sprites copied from the H2 bundle (216K total) to `public/sprites/h2/{appKey}.png` with the 3 alias keys (`quickDraw`/`cozy`/`dino`) resolved at copy-time. OG card refactored from inline-SVG sprite render to `fs.readFile` + base64 data URL. In-app sprite renders unchanged (lo-fi 32×32 stays). See DECISIONS 2026-05-02.

## In-progress / uncommitted

None. Working tree clean, all commits pushed.

## Verify on next session start

- **Latest deploy** is `5643774`. Confirm with `curl -sI https://inventoryfull.gg/ | grep x-vercel-id`.
- **Archetype OG cards render with H2 sprites** in production. Visit `https://inventoryfull.gg/archetype/the-archaeologist/opengraph-image` — should serve a PNG showing the painted-pixel dig-site scene, not the lo-fi explorer. If you see the lo-fi version, the deploy hasn't propagated.
- **All 38 archetype pages reachable.** Spot-check 2–3 slugs from `lib/archetypeRegistry.ts`. Each should render with H1 = title, H2 sprite below, flavor line, and "Open Inventory Full" CTA.
- **Email subscribe round-trip works on prod.** Submit `your+test@email.com` from the landing form. Should return `{ ok: true }`. Verify the row landed in Supabase: `SELECT * FROM email_subscribers ORDER BY consented_at DESC LIMIT 5`. (Locally returns 503 because no Supabase env in dev — that's expected.)
- **Discord invite link** is non-expiring, unlimited uses. If it ever stops working, regenerate from the server (Server name dropdown → Invite People → Edit invite link → Never / No limit) and update `DISCORD_INVITE_URL` in `lib/social.ts`.
- **Sentry issue `JAVASCRIPT-NEXTJS-4`** (TypeError `undefined is not an object (evaluating 'a[H.D.Od]')`) on `/stats`. First seen 2026-05-01 (lines up with GA4 init move to `<head>`, commit `7eaa02f`). 16 events / **0 users** / 100% Safari 26.4 / 100% prod. Almost certainly bot/unfurler triggering gtag.js internals — not real user impact. Re-check on next session start: if `Users (30d)` climbs above 0 OR User-Agent on a sample event is a real (non-bot) Safari UA, dig in (likely fix: try/catch the gtag init since we can't patch Google's library). Until then, ignore.

## Rotting gotchas accumulated

- **Visual mismatch: in-app archetype thumbnail vs. OG card.** In-app stays on lo-fi sprite-strings (`lib/pixel/sprites.ts`); OG card uses H2 PNG@4x. Acceptable per "jank is a voice" and the hybrid integration spec. Worth knowing if you ever screenshot both side-by-side. To upgrade in-app sprites, see Option A or B in `docs/h2-archetype-integration-spec.md`.
- **Bundle keys ≠ app keys (3 aliases).** `quickDraw`/`cozy`/`dino` in app, `speedrunner`/`cozy-craver`/`dino-rider` in bundle. Resolved at copy-time by writing the destination filename in app keys. The mapping lives in the commit body of `5643774` — if H2 sprites get re-bundled or new ones added, the mapping must be re-applied. Worth saving as `scripts/copy-h2-sprites.sh` next time we touch this.
- **`email_subscribers` has no UI for unsubscribe yet.** When marketing emails are eventually wired (Resend, Week 2+), the unsubscribe link must POST to a route that sets `unsubscribed_at`. Today the column exists but no path writes to it.
- **Email dedupe across two tables required at send time.** `auth.users.email` (signed-in users with `profiles.wants_updates=true`) and `email_subscribers.email` (unauth opt-ins) can overlap. Ship a `marketing_recipients` view that UNIONs both and dedupes by email before any send job runs. Spec is in this session's chat.
- **3 H2 archetype concepts designed but no app-side definition.** `retroKids`, `grindGhost`, `lateBloomer` exist as PNG@4x in the bundle but aren't wired into `lib/archetypes.ts`, `SPRITE_KEY_BY_TITLE`, or `archetypeRegistry.ts`. Brady's call on what they mean (title, trigger, flavor, tone) before any of these can ship.

## Open design questions

- **In-app sprite upgrade timing.** Hybrid is fine for launch; post-launch traffic can validate whether the in-app lo-fi looks intentional or "unfinished" to actual users. Flag for review after first real user data.
- **Discord onboarding task #5 = "Share your archetype."** Currently set to "Drop a bug or wishlist item in #feedback-and-bugs" (default). Brady should swap once he sees the share flow work in Discord.
- **Social posting cadence.** Three new social vectors live (Discord, email signup, archetype share cards) + Brady's existing Bluesky/Twitter/Reddit drumbeat. No single doc tracks the posting schedule yet.
- **Carry-over from 05-01:** When to wire H2 sprites into the live in-app surface (now partially answered — OG done, in-app deferred); whether to retire the `design-studies` preview config in `.claude/launch.json`; first backlink strategy; /about differentiation; Practical Value Phase 2 timing; native-channel implementation order.

## Health snapshot

- Build state: green at `5643774`. Last `npm run build` ran clean during session.
- `main` tip: `5643774 feat(archetypes): use H2 painted-pixel sprites in archetype OG cards`.
- Known bugs: none introduced this session.
- Production deploy: live at `5643774` as of session close (~14:00 PDT 2026-05-03). Vercel auto-deploy from push.
- Supabase migration status: `008_email_subscribers.sql` applied to prod (verified by Brady "no rows returned").
- Free-tier proximity: not measured this session. Email-subscribers writes are negligible (1 row per signup). Archetype OG PNGs serve from CDN once warmed; no bandwidth concern at current traffic.

---

*Session ended 2026-05-03 ~14:00 PDT.*
