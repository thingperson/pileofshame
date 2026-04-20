# Session Resume — Apr 20, 2026

**Purpose:** Start the next session oriented. Read this when the task isn't trivial.

Morning/afternoon was a **docs / planning / infrastructure** session (commits `55bdf1a` + `3a0e7c8`). Late-afternoon added a second feature commit `ffcbb48` integrating Claude Design's pixel sprite drop + a roast opt-in toggle.

---

## What shipped today

### Morning/afternoon — `55bdf1a` + `3a0e7c8` on main (deploy READY)

1. **90s theme contrast pass** — accent + status pills on silver card now hit WCAG UI thresholds. `app/globals.css` lines ~264–290. See screenshot verification done this session.
2. **SEO per-page metadata** — [app/about/layout.tsx](../app/about/layout.tsx), [app/stats/layout.tsx](../app/stats/layout.tsx) (`/stats` is **noindex**). [app/sitemap.ts](../app/sitemap.ts) adjusted (removed /stats, bumped /about priority 0.7→0.8).
3. **Two new skills registered:** [accessibility-review](../.claude/skills/accessibility-review/SKILL.md), [mobile-best-practices](../.claude/skills/mobile-best-practices/SKILL.md). Both runnable via Skill tool.
4. **.gitignore** now excludes `.claude/worktrees/`.

### Late-afternoon — `ffcbb48` on main (deploy READY)

5. **Pixel sprite infrastructure** — Claude Design delivered 31 persona sprites + 13 mood chips + badges + ambient. Integrated as:
   - [lib/pixel/palette.ts](../lib/pixel/palette.ts) — shared 28-color palette (`IF_PALETTE`).
   - [lib/pixel/sprites.ts](../lib/pixel/sprites.ts) + [lib/pixel/data/](../lib/pixel/data/) — typed sprite maps (`PERSONA_SPRITES`, `MOOD_SPRITES`, `BADGE_SPRITES`, `SLOT_SPRITES`, `AMBIENT_SPRITES`, `ALL_SPRITES`).
   - [components/PixelSprite.tsx](../components/PixelSprite.tsx) — React SVG renderer with optional drop shadow + aria support.
6. **ArchetypeCard** now renders a 48px pixel sprite when one maps to the archetype title; falls back to emoji otherwise. Title→sprite mapping lives in [lib/archetypes.ts](../lib/archetypes.ts) as `SPRITE_KEY_BY_TITLE` + `getArchetypeSpriteKey()`.
7. **Roast opt-in toggle** — `LibrarySettings.showRoasts` (default `false`). When off, `getAllMatchingArchetypes()` filters out `tone: 'roast'` archetypes. Toggle lives in SettingsMenu under Display. Enforces `user-psychology.md` rule that shame/critique framing must be opt-in.

### Known gaps from this drop (intentional — awaiting Design)

- **9 archetypes have no pixel sprite yet:** Juggler, Archaeologist, Sniper, Redeemer, Deep Diver, Eclectic, Infinite Player, Webmaster Supreme, Minimalist. These still render emoji. Ask list: `notes/apr20-improvements-claude-design/design-feedback.md` (notes/ is gitignored — local file only).
- **Line icons** referenced in Claude Design's Icon System page were NOT included in the drop — only pixel art. Line-icon sweep (next-sprint candidate #3 below) is still open. Nothing changed there this session.
- **Current pixel sprites render small/janky** per Brady's visual check. Acceptable for now; revisit with Design once gaps filled. Sprites are fixed-color across all themes (won't adapt to ULTRA/Synthwave/etc.) — palette-strategy decision also pending Design.
- **Mood sprites, slot sprites, badge sprites, ambient sprites** are in the codebase but **not yet rendered anywhere.** Only personas are wired through ArchetypeCard. Future work needs to decide where these surface (share cards? theme backgrounds? empty states?).

Also included with commit `3a0e7c8`: `notes/apr20-improvements-claude-design/` with raw design files, a feedback doc for Design, and the App Review voice/legal/psychology sweep (notes/ is gitignored, so read these locally only).

---

## The big strategic outputs (read these before next planning session)

| Doc | What it says | When to pick up |
|---|---|---|
| [doc-audit-2026-04-20.md](doc-audit-2026-04-20.md) | Full audit of /docs. Stale decisions, holes, pushbacks, next moves. | This is the meta-doc — if you're lost, start here. |
| [DECISIONS.md](DECISIONS.md) (2026-04-20 entries) | Two entries today: **RAWG commercial-plan is a monetization blocker** + overrides/upgrades from the audit (archetypes reversed, three pick modes distinct, email re-engagement moves to Tier 1). | Read before starting any monetization or pick-mode refactor work. |
| [monetization-spec-2026-04-20.md](monetization-spec-2026-04-20.md) | Cover-costs-first, $3/mo Supporter tier with theme gating + Focus Mode, affiliate on owned/wishlisted games. **RAWG blocker at bottom.** | Before implementing any revenue feature. |
| [scale-up-costs-2026-04-20.md](scale-up-costs-2026-04-20.md) | Per-service cost projections 100/1k/5k/10k/50k MAU. **10k MAU = ~$241/mo cliff, RAWG-driven.** RAWG free tier is non-commercial only. | When MAU rises, when monetization triggers. |
| [email-infra-spec-2026-04-20.md](email-infra-spec-2026-04-20.md) | Resend-first stack. Domain split `auth.` + `updates.`. Voice-compliant consent checkbox drafts. | When share-card v2 ships or first paid tier lands. |
| [metrics-radar-2026-04-20.md](metrics-radar-2026-04-20.md) | What GA4 fires vs. blindspots. Trigger thresholds (500 / 2k / 5k / 15k MAU). | When MAU hits 500, flip on cohort retention. |
| [pwa-explainer-2026-04-20.md](pwa-explainer-2026-04-20.md) | Three tiers (homescreen / offline / push). Tier 1 live. Others deferred. | Next mobile-polish sprint. |
| [competitive-landscape-2026-04-20.md](competitive-landscape-2026-04-20.md) | 10 direct + 11 adjacent competitors. Backlog Roulette is highest direct threat. Backloggd the sleeping giant. | When positioning or landing copy gets touched. |
| [competitive-refresh-prompt.md](competitive-refresh-prompt.md) | Re-runnable prompt to refresh the landscape doc monthly. | In ~30 days or when a competitor move is spotted. |
| [archetypes-catalogue.md](archetypes-catalogue.md) | All 36 archetypes, all live. | When archetype art or share card work resumes. |
| [ai-lingo-reference.md](ai-lingo-reference.md) | Consolidated voice-sweep reference (verbatim from voice-and-tone + deploy gates). | Before any copy-heavy deploy. |

---

## Next up

### Start here if coming in cold
No active in-flight feature work. A handful of parked items + several clean next-sprint candidates surfaced by the audit. If Brady opens a fresh session without context, ask what he wants — options below.

### Parked — wordmark gates these
- **Wordmark land-and-sweep** — Brady designing. When asset ships: sweep every `<h1>Inventory Full</h1>`, OG cards, email templates, favicon (if aligned).
- **Completion share card v2** — design captured in earlier resumes; ships with wordmark.
- **Archetype share card** — parked pending per-archetype art (Brady working on it).

### Next-sprint candidates (from Apr 20 audit, ordered by leverage)

**Biggest leverage → lowest effort, roughly:**

1. **Sort menu voice rewrite** (XS, pure voice win). Rename "Best for You" etc. in Inventory Full's voice instead of generic library-app language.
2. **Sample Library pill contrast** + 90s nav button contrast (S, closes remaining Apr 18 a11y threads).
3. **Emoji → line-icon sweep** (M, biggest visual upgrade per hour — design review flagged it as the single highest-impact visual change). **Blocked on Claude Design delivering actual line-icon assets** — the Apr 20 drop only included pixel art, not line icons. Ask in `notes/apr20-improvements-claude-design/design-feedback.md`.
4. **Unify pick modals** (L, architectural — do before surfacing more personality on top of them). Game Pass + Just 5 Mins + Anything into one shell.
5. **Taste Reflection feature** (M, spec in [IDEAS.md](IDEAS.md) — "you love games that are X, Y, Z" after completion, surfacing 2–3 from user's own library).
6. **Three pick-mode entry-point audit** — verify `lib/reroll.ts` makes the three modes functionally distinct as DECISIONS.md now claims (Just 5 Mins = psychological not HLTB, Quick Session = HLTB short, Almost Done = HLTB time-remaining sort).

### Implementation-pending from other specs
- **Voice-compliant consent checkbox** (spec'd in email-infra doc) — wire only when auth flow needs it or marketing email launches.
- **Resend account setup** — gated on first actual email send. Domain splits `auth.inventoryfull.gg` + `updates.inventoryfull.gg` need DNS before first send.
- **GA4 cohort dashboards** — spec'd, deferred to 500 MAU trigger.

### Feature-creep items still alive
- Backlog sort modes 6→3 (minor trim)
- Mood chips 10→7 (needs usage data first)
- Sync nudge — keep / A/B / cut?
- Share composer consolidation (3 → 1)

**NOT feature creep** (do NOT flag in future audits):
- Archetypes (36 live — intentional personality)
- Archetype reroll (user-value feature)
- Themes (13 live — tested, part of the moat)
- Three pick modes (psychologically distinct)

---

## Open decisions for next session

1. Wordmark asset pipeline — when Brady exports, where does it live (`public/` for raster, or `components/Wordmark.tsx` if SVG)?
2. Completion share-card v2 — ship with wordmark or independently?
3. Sync nudge — keep / A/B / cut?
4. Sort mode trim — execute the 6→3 cut, or leave?
5. Which next-sprint candidate to tackle first (see leverage list above)?

---

## Tooling state (important!)

### MCPs live this session (first time!)
- **Supabase** — query user data directly. Use for cohort/retention queries once MAU data matters.
- **Sentry** — pull errors, profiles, replays. Use for "what broke today?" checks.
- **Vercel** — deployment status, build logs, runtime logs. Used successfully this session to confirm deploy READY.
- **Preview + Chrome + Computer Use** — already had these. Unchanged.

### MCPs discussed but NOT installed
- **GA4 MCP** — would plug the retention blind spot. Requires Google Cloud project + Analytics API auth (OAuth or service account). Tabled by Brady at end of session.

### Shell gotcha (for Brady's reference)
- `claude` CLI is NOT installed globally. Brady is on Claude Code **desktop** (`claude.app`). MCP management done through app Settings UI, not CLI.
- If a future session needs `npm` / `claude` CLI: fnm-managed node lives at `$HOME/.fnm/node-versions/v22.22.2/installation/bin/` and is not on PATH in non-zsh shells.

---

## Known gotchas (active)

- **RAWG free tier is non-commercial only.** Before ANY revenue feature ships: sign up for RAWG Business (~$149/mo). Flagged in three places.
- **Sentry warning:** `[@sentry/nextjs] ACTION REQUIRED: export onRouterTransitionStart hook from instrumentation-client.(js|ts)`. Pre-existing, not introduced today. One-line fix when convenient.
- **Smart Pick selection is status-driven, not recency-driven.** We don't have reliable `lastPlayedAt` across Steam/Xbox/PSN. Status (`playing` vs `on-deck` vs `buried`) is the proxy.
- **Steam positive % + review count** not yet on the `Game` type — Forgotten Gem classification falls back to Metacritic ≥85.
- **SSR guards in Nudge components** — StalledGameNudge + FinishCheckNudge previously had unguarded `sessionStorage` / `localStorage`. Pattern worth checking for in any new `Nudge`-style component.
- **Spawned-task worktrees at `.claude/worktrees/*`** — now in .gitignore. If you see git tracking them, the ignore got lost.

---

## Rotting gotchas (from prior sessions, still relevant)

- Edge runtime for OG images — no Node APIs, fonts fetched over HTTPS.
- `GameCard.tsx` is ~1000 lines — targeted Edits only.
- PSN tokens ephemeral — never log, never persist.
- Turbopack vs webpack dev-time differences.
- Supabase anon key is intentionally public; RLS gates everything.

---

## Quick health snapshot

- Build: ✅ passes (verified after `ffcbb48`)
- Deploy: ✅ READY (`ffcbb48` pushed)
- Sentry: ✅ wired (pre-existing warning noted above)
- UptimeRobot: ✅ pinging `/api/health` every 5 min
- MCPs: ✅ Supabase + Sentry + Vercel live
- Preview: ✅ ArchetypeCard sprite render verified on `/stats` (Cozy Craver → pink pixel sprite)
- No known regressions from today's deploys.
