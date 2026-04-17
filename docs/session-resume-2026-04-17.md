# Session Resume — Apr 17, 2026

**Purpose:** Start the next session oriented. Read this when the task isn't trivial.

---

## What shipped today (6 commits on main)

1. **`3574659` infra** — lean AGENTS.md, new `.claude/rules/token-efficiency.md`, SessionStart hook printing date + path to this doc.
2. **`8bb0c0f` tagline retire + fixes** — "Stop stalling. Get playing." → "Get playing." sweep; GameCard detail-view art `object-cover` → `object-contain` fix; Playnite "Cancel" → "Back" on select step; Steam Wishlist copy stripped of notification promise.
3. **`d999ec0` lowercase tagline + cap** — "Get playing." → "get playing." (second sweep); Up Next cap raised from 5 → 8 and centralized in `lib/constants.ts` as `MAX_UP_NEXT`; `MAX_PLAYING_NOW = 3` now enforced at every transition path (GameCard cycle, nudges, Reroll commit, Just 5 Mins triage, New Game+).
4. **`b609248` tier 1 mobile** — light mode CSS vars `!important`-ified (was rendering dark grey on mobile); cozy theme's invalid `.theme-cozy body` selector removed and `::before` ambient gradient disabled (restored beige); feedback pill auto-hides when any `aria-modal="true"` dialog is open; skip-feedback popup killed 8s auto-dismiss, capped at 2 shows per modal-open, added × dismiss; notes indicator now persistent ("Notes" label left, "auto-saves"/"saved ✓" right); list-view status badge hidden on mobile collapsed row (still shown when expanded); SettingsMenu "Restore Backup" emoji 📥 → 🔄.
5. **`6e879c9` copy + icons + descriptors** — "tonight" → "today" sweep across 11 sites; favicon rescaled (46% → 88%+ fill for 192/512, 67% → 76% for 256); score-tier descriptor pool 3→7 per tier (27→63 total); genre fallback pool 1→4 per genre (14→56 total, hash-selected per game name); `.claude/settings.json` allowlist added 12 read-only Claude Preview MCP tools.
6. **`4e92914` Smart Pick copy locked** — `lib/smartPickCopy.ts` with 24 approved headlines across 4 Smart Pick types, DECISIONS entry.
7. **`(pending)` Smart Pick reroll engine + pill + roll-count fix** — `lib/reroll.ts` gains `classifySmartPick` + `pickSmartResume` (priority: Almost There → Keep Flowing → Forgotten Gem → Unfinished Business); `continue` eligibility broadened to cover buried status. `components/Reroll.tsx` renders a purple-tinted Smart Pick pill + rotating headline when the pick is from Resume mode. Roll-count bug fixed: store `incrementReroll` now fires only on commit ("Let's go"); local `rollCount` state drives the forced-choice gate and "Roll N" label; mode/energy switches pass `countAsRoll=false` so browsing doesn't burn the 10-roll cap. Forgotten Gem falls back to Metacritic ≥85 pending Steam review enrichment on the `Game` type.

---

## What's in flight (aligned, not yet built)

### The reroll redesign + tab-follow fix — **in flight**

**Smart Pick engine / pill / roll-count** — **SHIPPED** (see commit #7 above).
- "Why this one" pill-#1 accent-purple left-border treatment still TODO (reason-list styling hasn't been differentiated yet).
- `continue` → user-facing "Resume" label rename still TODO (deferred with modal restructure; internal key remains `continue`).
- Deep Cut mode still present in UI (retirement deferred with modal restructure).

**Modal layout restructure** (holds for **after wordmark**):
- Modal opens with **2 visible CTAs**: `🎲 Anything` + `⚡ Just 5 mins`.
- Drop-down 1: **"More ways to play"** → `🌙 Quick Session` + `➡️ Resume`.
- Drop-down 2: **"Vibes"** → mood chips (cozy, narrative, atmospheric, challenge, mindless, philosophical, custom).
- Main page reroll mode buttons retire from the library view — only the hero "What Should I Play?" button remains. JustFiveMinutes flow launches from the modal's Just 5 mins CTA.

**Tab-follow UX fix** — `components/GameCard.tsx`, `components/TabNav.tsx`, `app/page.tsx`:
- Today: when a game's status changes via the cycle badge, it disappears from the current tab. Users lose where it went.
- Fix: (a) auto-switch the active tab to the destination on status change (verify `onStatusChange` callback wiring — it exists but may be inconsistently fired); (b) flash the destination tab's underline (~1s pulse); (c) pulse-outline the moved game's row in its new home for ~1.5s.

### Content / design work parked

- **Wordmark** — Brady is designing today. When locked: sweep every `<h1>Inventory Full</h1>` site, OG cards, email templates, favicon (if wordmark-aligned) to use the asset.
- **Completion share card v2** — new design from Brady (2026-04-17): hero illustration top, full-width green `[USERNAME] CLEARED` banner, game art + one stat line, wordmark + "get playing." footer. Feedback notes captured: drop the colon after CLEARED, resolve username-duplication in banner vs stat, add stat-fallback guard so slower-than-HLTB doesn't shame, and a name-opt-out treatment ("GAME CLEARED" when user hides name). Ships alongside wordmark.
- **Custom descriptor top-80 expansion** — `docs/descriptor-expansion-review-2026-04-17.md` has 80 candidates + 13 series templates in review form. Brady tweaks in place, I sync back on approval.
- **Score-tier + genre-fallback expansion** — already shipped live. Review doc at `docs/score-tier-genre-expansion-review-2026-04-17.md` for if Brady wants to tweak any.
- **Favicon** — shipped at improved fill ratio. One known edge case flagged by Brady's background: Tuesday-night line in 50-59 tier still says "Tuesday night." He swept "tonight" but didn't sweep other evening references. Decide if he cares.
- **Jump Back In cheat sheets** — audit later phase. 20+ verified re-entry packs in `lib/reentryPacks.ts`. Not blocking.

### MCPs to install (Brady's turn)

Runbook at `docs/mcp-install-2026-04-17.md`. All three remote HTTP with OAuth — no secrets flow through assistants. Commands use `claude mcp add --scope user --transport http <name> <url>`:
- Supabase → `https://mcp.supabase.com/mcp?read_only=true&project_ref=<ref>` with Bearer PAT header
- Sentry → `https://mcp.sentry.dev/mcp` (OAuth browser flow on first use)
- Vercel → `https://mcp.vercel.com` (OAuth browser flow on first use)

Brady will install when he has the appetite.

### Tier 2 / Tier 3 mobile work (Brady's larger design list)

- Header declutter on mobile (import + stats icons + search + sign-in into settings gear)
- Drop pill mode shortcuts under reroll on mobile (covered by modal restructure above)
- Tabs styled as proper tab chrome, not "floating text"
- Sample-library dismiss banner hidden on mobile
- Game detail view rework: title swap position with "Steam - 88" on mobile, story tap-to-reveal under "Storyline" label, elevate purple quote above description
- Ori-mobile screenshot in `notes/feedback-inbox/raw/` — detail-view typography spec reference

Parked until wordmark lands + reroll redesign settles.

---

## Open decisions for next session

1. Reroll engine build approach — one commit or staged (engine → pill UI → modal layout)?
2. Wordmark asset pipeline — when Brady exports, where does it live (`public/` for raster, or `components/Wordmark.tsx` if SVG)?
3. Completion share-card v2 — ship with wordmark or independently?
4. Stat-fallback copy for the share card when user ≥ HLTB hours — "X hours invested" or no stat?

---

## Known gotchas (active)

- **Mode/sub-mode clicks burn rolls.** Fixed in commit #7. Mode/energy switches now pass `countAsRoll=false`; only explicit Roll / Roll Again bumps the counter.
- **Smart Pick selection is status-driven, not recency-driven.** We don't have a reliable `lastPlayedAt` across Steam/Xbox/PSN. Status (`playing` vs `on-deck` vs `buried`) is the proxy. Good enough; flag if Brady wants true recency later.
- **Steam positive % + review count** is in RAWG/Steam enrichment but confirm the field names used in `Game` type before wiring Forgotten Gem gating. Fallback to Metacritic if Steam data missing.
- **Modal UI restructure touches landing + about mode cards** — landing currently shows 5 mode cards; new design collapses to ~3. Don't restructure the modal without updating landing in the same commit.

---

## Rotting gotchas (from prior sessions, still relevant)

- Edge runtime for OG images — no Node APIs, fonts fetched over HTTPS.
- `GameCard.tsx` is ~1000 lines — targeted Edits only.
- PSN tokens ephemeral — never log, never persist.
- Turbopack vs webpack dev-time differences.
- Supabase anon key is intentionally public; RLS gates everything.
