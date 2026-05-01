# Session Resume — 2026-04-27 (Monday, PDT)

**Type:** Psychology red-team (round 1 + round 2) → picker rebaseline + AuthButton fix + descriptor overhaul + native-channel research.

⚡ **START HERE for prior context:** [docs/session-resume-2026-04-26.md](session-resume-2026-04-26.md) — yesterday's pixel-iconography sweep, GameDetailModal layout pass, wave-2 sprite landings. Today builds on top of all of that.

## Active sprint

Public soft-launch staggered Apr 28 → May 6 per `docs/LAUNCH_BIBLE.md`. ~11 days out from the first Reddit post.

## What shipped this session

Four commits to local main, ahead of origin. Logical units, push pending Brady's go.

- `7400456` **picker rebaseline + close the loop on Let's go** — the big one. Rebaselines pick flow against the locked 2-input rule. Pre-roll header drops subhead; energy collapsed to a drawer alongside More-ways and Vibes. Post-pick screen strips the mode/mood/energy pill rows behind a `⚙ Change roll settings` affordance. Stat row drops Metacritic; "Beatable in" deduped. Why-This-One collapsed by default. "Not now" retired. Plus the broken-promise fix: `Let's go` now atomically sets status, fires `steam://rungameid/<appid>` on Steam games, navigates to Playing Now via new `onCommit` prop. Plus the post-accept overlay redesign with stronger framing + platform-aware encouragement (Steam / PSN / Xbox / Switch / Epic / GOG / other) + explicit "Going to play" exit. Plus copy: empty-state plural-aware, `Just 5 mins` → `5-min tryout` everywhere.
- `b868c57` **descriptor mood-first priority** — `getGameDescriptor` reordered: curated → mood-based → genre → metacritic-scored → edition. New `MOOD_FLAVORS` pool (5 lines × 10 moods = 50 unique flavors). Lines describe the experience, not reception. Hash-deterministic per game. Call sites in Reroll / GameCard / GamePassBrowse pass `moodTags` through.
- `d6400d9` **AuthButton always-show "Continue without syncing"** — drops the `hasLocalGames` conditional that hid the opt-out for new users on a fresh device.
- `1bab4f1` **psychology red-team artifacts + skill** — new `.claude/skills/psychology-redteam/SKILL.md` (the audit skill itself), `docs/psychology-redteam-2026-04-27.md` (round-1 + round-2 findings, ranked interventions, time-cost analysis, distribution-channel review, research gaps), DECISIONS.md entry, ROADMAP follow-ups.

End-to-end loop verified live in preview: picker opens clean → roll fires → post-pick stripped → Let's go → celebration with platform-aware encouragement → Going to play → modal closes → game lands in Playing Now tab. Build clean, no console errors.

## Verify on next session start

- **Vercel deploy of all four commits** — confirm clean once pushed.
- **Steam launch in production** — `steam://rungameid/<appid>` button on the post-accept overlay should hand off to Steam directly on Win / Mac / Linux / Steam Deck Game Mode browser. Brady to test on Mac with Hades or similar from real browser (preview's headless Chromium can't fire `steam://`).
- **Mood-based descriptor variety** — eyeball a few non-curated games in the picker to confirm `MOOD_FLAVORS` pool fires. Games imported before mood-tag enrichment fall through to genre/score (logged as backfill candidate).
- **`⚙ Change roll settings` affordance behavior** — telemetry pending. If users tap it on every pick, the strip-and-collapse design failed and we put controls in the wrong place.
- **AuthButton on a brand-new device** — confirm "Continue without syncing" exit shows when there are no local games. Verified in preview with games loaded; a fresh-device reproduction would be cleaner.

## Rotting gotchas accumulated

- **No instrumentation yet for picker-vs-TabNav usage.** Round-1 intervention #3 (highest leverage on the audit) is unbuilt. Without it, every other intervention is a hunch and we cannot answer "do returning users actually use the picker, or do they default to browsing the Backlog tab?" The Apr 9 instrumentation plan is the spec; ship before launch if possible.
- **Round 2 audit didn't fully cover** OnboardingWelcome, GetStartedModal, ImportHub, FinishCheckNudge — flagged ⚪ Not Audited in the verdict table. Cold-start surfaces. Worth a round-3 pass if a session opens up before launch.
- **Backfill `moodTags` pass needed** for games imported before the mood-tag enrichment shipped. Without backfill, the new descriptor pool falls through for older games.
- **`hideButton` prop in JustFiveMinutes** is set when Reroll modal owns the CTA — standalone JustFiveMinutes button currently doesn't appear in default page state. Verified the rename landed inside the modal; not separately tested as standalone.
- **EA App native launch is dead.** Confirmed by EA's own forum threads — no URL scheme exists. Logged in ROADMAP follow-ups so we don't re-investigate.

## Open design questions

- **Per-platform launch buttons (Xbox Cloud, Epic, Battle.net, Ubisoft).** Native-channel research confirmed schemes work; ID acquisition is the friction. Xbox Cloud needs OpenXBL `titleId` → Microsoft Store `productId` resolver. Epic / BN / Ubisoft need community-maintained ID lookups. Subagent-led research scoped for next session.
- **Steam Deck channel positioning.** Round 1 finding flagged the Deck as a primary channel, not a follow-up Reddit sub, given audience overlap. LAUNCH_BIBLE has r/SteamDeck as Day-4 follow-up. Worth re-positioning, plus scoping a Decky Loader plugin post-launch if a meaningful Deck cohort emerges.
- **Stats page reframes** — value-calc opportunity language ("$X to reclaim" not "$X unplayed"), "go pick" CTA, archetype-reroll instrumentation. Brady's calls during round-2 review; logged in ROADMAP. Pre-launch or post-launch?
- **Share composer placement.** Round 2's most aggressive catalogue-creep finding — composer is opt-out, mid-flow inside CompletionCelebration. Logged for restructure to opt-in. Pre-launch or post-launch?

## Health snapshot

- **Build:** clean. Last `npm run build` after all four commits.
- **Tip of main (local):** `1bab4f1`. **origin/main:** `8978f4d` (yesterday). 4 commits ahead, push pending.
- **Branches:** `main`. Stale branches from prior sessions still parked (`feat/pixel-icon-system`, `claude/serene-curran-2486f3`, `icon-preview`); not touched today.
- **Known bugs:** none new this session.
- **Preview server:** running locally on :3000 for verification, will stop on session close.

## Closing status

End-of-day 2026-04-27 mid-day PDT. Picker rebaseline shipped; psychology red-team produced two artifacts (skill + first audit run, both rounds); native-channel research scoped Xbox / Epic / BN / Ubisoft for next session. Round-1 intervention #1 (picker rebaseline) ✅ shipped. Intervention #2 (empty-state copy) ✅ shipped. Intervention #5 (AuthButton) ✅ shipped. Interventions #3 (instrumentation), #4 (share/archetype audit-by-data), #6 (native channels), #7 (time→energy doc), #8 (Steam Deck spec), #9 (round-2 audit) all logged for follow-up sessions. Brady ratified Round 2 findings: keep Decision Engine + value-calc + archetype reroll, reframe value-calc as opportunity, add go-pick CTA, move share composer to opt-in.

---

## Next session — Inventory Full · launch sprint week 1

**Thesis (top of mind, every decision):** **Enjoy your games again.** Locked 2026-04-26. Picker rebaseline now embodies it at the system level (pick → game lands in Playing Now → user is released to play, not retained in the app).

**Where you are.** main @ `1bab4f1` after push, ~11 days to soft launch. Ko-fi live, Bluesky handle still pending, all M-blockers either closed or non-blocking.

**First thing to check.**
1. Live Vercel deploy of the 4 commits — confirm clean.
2. Steam launch on a real Mac browser — open https://inventoryfull.gg, hit a Steam game in the picker, click `🎮 Open in Steam` on the celebration overlay, verify Steam comes forward and launches the game. Try Hades or Disco Elysium.
3. Sentry sweep for any errors from the picker rebaseline (large surface change, multi-file refactor).

**Three tracks for the next session.**

1. **Instrumentation ship — round-1 intervention #3 (highest leverage).** Apr 9 plan + the events spec'd in `docs/psychology-redteam-2026-04-27.md` round-1 research-gap section: `session_start`, `picker_opened`, `tab_clicked` (with tab name), `pick_delivered`, `pick_accepted`, `pick_rerolled`, `game_launched_externally` (proxy via `steam://` click). Without this we cannot adjudicate any other audit finding from data.

2. **Native-channel launch buttons — phase 2.** Subagent-led research on Microsoft Store productId resolver (OpenXBL gives titleId, we need productId for `xbox.com/play/games/<slug>/<productId>`). Plus Epic / BN / Ubisoft community ID lookups. Goal: ship the Xbox Cloud button alongside Steam in the picker celebration overlay, plus best-effort PC-launcher buttons for the other three.

3. **Stats page surgery — round-2 follow-ups.** Reframe value-calc language to opportunity ("$X to reclaim" / "$X of fun ready to be won back"). Add a "Pick something" CTA at the bottom of the stats page so users have a clear path back to the picker. Instrument the rerollable archetype so we know if reroll volume reads like character novelty (1–3/session) or sticky engagement (10+).

**Parked / blocked.**
- Round-3 audit on the cold-start surfaces (Onboarding / GetStarted / ImportHub / FinishCheckNudge) — Round 2 didn't reach them. Pre-launch if a session opens up.
- Share composer move to opt-in (round-2 finding). Pre-launch or post-launch — Brady's call.
- Steam Deck channel re-positioning (round-1 / native-channel cross-cutting finding). Strategic decision, not engineering — Brady.
- Celebration overlay imagery (controllers / consoles powering on, hero-image style). Brady to source from Stitch or Claude Design.
- `time → energy` substitution doc — round-1 intervention #7. Trivial when picked up.
- Backfill `moodTags` for games imported before enrichment.

**Don't drift.** "Less time in app = success" + "Enjoy your games again" — the picker now *honors* both at the system level, not just the copy level. Future surfaces have to clear the same bar.

---

## Second wave — afternoon/evening (PDT)

**Type:** Round-1/round-2 redteam follow-ups shipped end-to-end + PDF research ingest contradicted the morning's energy substitution → pivot doc'd.

### What shipped this wave

Six commits, all pushed to origin/main.

- `c9ae919` **Round-1 diagnostic GA4 events.** Three new anonymous events answering the redteam's blocking question ("do returning users actually use the picker, or default to browsing tabs?"). `picker_opened` (entry mode) on Reroll modal open. `tab_clicked` (tab id) on TabNav click + arrow-key nav. `game_launched_externally` (platform) on Steam launch link click and on non-Steam dismiss (intent declaration). Implementation lives in `lib/analytics.ts` + `components/Reroll.tsx` + `components/TabNav.tsx`. Phase 1 of `docs/INSTRUMENTATION.md`.
- `53e3bc4` **Stats page surgery — round-2 follow-ups.** ValueCalculator label "Waiting to be reclaimed" → "Fun ready to be won back." StatsPanel adds bottom CTA "Pick something to play" → navigates to `/?openPicker=1`; `app/page.tsx` mount-effect extended (same self-cleaning URL pattern as `?auth=ok`) to open the Reroll modal and strip the param. New `archetype_rerolled` GA4 event from the "Read me again" button. End-to-end verified live in preview.
- `6b58bf1` **Energy substitution doc** — initial DECISIONS entry + AGENTS.md + user-psychology.md update locking energy as the second axis with research-debt caveat. (Superseded same day by `51c9c06`, see below.)
- `6b6418b` **moodTags backfill + sprite wave 2.1.** Persist v2 → v3 migration runs `inferMoodTags()` on games with empty moodTags + existing genres. Local-only inference, no network. Plus 2 sprite swaps in `lib/pixel/data/status.ts`: statusUpNext center T → t (#1a9e86), statusCompleted rosette G → t (yellow ray-burst preserved). Verified in preview that `#1a9e86` is now present and `#2ee8c4` / `#34d399` are gone from tab-nav SVGs.
- `2881b45` **Two research artifacts produced by background subagents.** `docs/native-channel-research-2026-04-27.md`: Xbox Cloud is the unlock (plain https URL, no protocol prompt), titleId → productId resolved via `displaycatalog.mp.microsoft.com` search-by-name, ship order Xbox Cloud → Epic store-page → Battle.net → GOG → Ubisoft, skip Xbox PC native, EA App confirmed dead. `docs/psychology-research-ingest-2026-04-27.md`: 6 sources extracted against redteam research-gap questions; **headline finding contradicts the morning's energy substitution** — Loewenstein 1996 on visceral-state introspection failure + Mischel & Shoda 1995 on dispositional self-categorization predicting behavior poorly (r ≈ .47 only for if-then signatures).
- `51c9c06` **Pivot doc'd: Energy → Session Length + share-card content lockdown.** New DECISIONS PM entry supersedes the morning energy entry. New tier system locked: Small ~20 min / Medium ~1–2 hrs / Large 2+ hrs · *I'm in*. The "(I've got time, don't ask why)" framing was rejected as voice-charter-shame-adjacent. New DECISIONS entry locks share-card content (archetype + reclaimed value framed positive + brand mark only — no pile $, no hours unplayed, no per-share customization) and Practical Value plan (Phase 1: generic recipient CTA on every card footer; Phase 2 later: auto-generated "worth it if X" recommendations). ROADMAP + user-psychology.md §3 note updated to reflect the pivot.

End-to-end picker → stats CTA → home with Reroll modal open → URL stripped to `/` verified in preview. Six Vercel deploys all READY in production.

### Verify on next session start

- **Vercel deploys** — confirm latest production is `51c9c06` and serving cleanly. Already verified READY at session close, but redeploy edge cases happen.
- **GA4 events live** — exercise the picker once on prod (`inventoryfull.gg`) and confirm in GA4 DebugView that `picker_opened`, `tab_clicked`, and ideally `game_launched_externally` (via Steam click) and `archetype_rerolled` (via stats page Read-me-again) all show up. Then mark them as Key Events in GA4 Admin so they appear on the Key Events tab.
- **moodTags v3 migration** — first hydrate on next session in any browser with prior persisted state will run the migration. Sentry sweep for any errors during the migration window over the next few days.
- **Stats `/?openPicker=1` flow** — verify on prod that clicking "Pick something to play" from `/stats` navigates home, opens the Reroll modal, and strips the param.
- **Sprite v2.1 in production** — eyeball tab nav for the calmer #1a9e86 teal on Up Next + Completed.

### Rotting gotchas accumulated

- **Energy → Session Length rename is not yet implemented in code** — only doc'd. Current shipped UI still says "energy" (Low / Medium / High pills in the picker drawer). Next session: rename `EnergyLevel` type → `SessionLength` in `lib/reroll.ts`, update picker UI labels in `components/Reroll.tsx`, update `.claude/rules/user-psychology.md` §3 note. ~60–90 min focused work. Spec is in `docs/DECISIONS.md` 2026-04-27 PM entry.
- **Share composer rebuild is doc'd but not implemented** — content lockdown + Phase 1 Practical Value footer CTA. ~60–90 min. Spec is in `docs/DECISIONS.md` 2026-04-27 PM share-card entry. Touches `components/CompletionCelebration.tsx` (the round-2 audit pointed at lines 223–491).
- **Picker still has ⚙ Change roll settings affordance unused-by-default** — telemetry will tell us whether the strip-and-collapse design failed (if users tap it on every pick) but only after a few days of GA4 data.
- **Round-3 audit on cold-start surfaces parked** — Onboarding / GetStarted / ImportHub / FinishCheckNudge weren't reached by the round-1/round-2 audit. ~11 days to launch (now ~10 with this close). Worth a fresh-session pass.
- **Inferred-features track logged in ROADMAP** as future differentiator (post-launch). Backed by Mischel & Shoda's if-then signature finding (r ≈ .47 stable). Not a launch blocker but the long-term thesis-defining differentiator.

### Open design questions for next session

- **Order: rename first or share composer first?** Rename is the higher-stakes one (touches the picker, telemetry naming, and a locked rule); composer is more contained. My read: rename first while context is hot from this session's research.
- **Practical Value Phase 2 timing** — auto-generated "worth it if X" needs reliable session-length + tone signal per game. Worth a scoping pass after the rename ships to see whether HLTB + RAWG genres get us close enough.
- **Pre-launch round-3 audit** — Brady's call whether to fit it in.

### Health snapshot

- **Build:** clean. Last `npm run build` after `6b6418b`, no errors.
- **Tip of main (local + origin):** `51c9c06`.
- **Branches:** `main`. Stale branches from prior sessions still parked (`feat/pixel-icon-system`, `claude/serene-curran-2486f3`, `icon-preview`).
- **Known bugs:** none new this wave.
- **Vercel:** all six wave-2 deploys READY. Latest production is `51c9c06`.
- **Sentry:** clean per Brady's check at start of wave (only one issue, 2 weeks old).

### Closing status

End-of-day 2026-04-27 PM PDT. Six commits this wave, all shipped to prod. Round-1 redteam interventions #3 (instrumentation), #4 (stats reframe + archetype telemetry), and #6 (native-channel research) all closed in code or in research artifacts. Mood-tag backfill rotting gotcha closed. Sprite wave 2.1 landed. Energy substitution flipped to Session Length pivot after research came back contradicting the dispositional self-report framing — DECISIONS, ROADMAP, and rules updated to match. Next session: implement the rename, then the share-composer rebuild.

---

## Next session — Inventory Full · launch sprint week 1 (cont.)

**Thesis (top of mind):** **Enjoy your games again.** The pivot away from "energy" toward "session length" is the same thesis applied to a research signal we couldn't ignore. Tangible commitment estimate over introspection-failure self-report.

**Where you are.** main @ `51c9c06`, ~10 days to soft launch. Telemetry shipped, stats surgery shipped, research artifacts in hand, two implementation tracks fully spec'd in DECISIONS.md.

**First thing to check.**
1. Vercel production = `51c9c06`, serving cleanly.
2. GA4 DebugView shows the four new events (`picker_opened`, `tab_clicked`, `game_launched_externally`, `archetype_rerolled`) firing when you exercise the flows on prod. Mark as Key Events in GA4 Admin.
3. Sentry sweep for any moodTags v3 migration errors.

**Three tracks for the next session.**

1. **Energy → Session Length rename (highest priority).** Spec is in `docs/DECISIONS.md` 2026-04-27 PM entry. Rename `EnergyLevel` → `SessionLength` in `lib/reroll.ts`. Update picker UI labels in `components/Reroll.tsx` (energy drawer → session-length drawer; Low/Medium/High → Small/Medium/Large with the locked copy "2+ hrs · I'm in"). Update `.claude/rules/user-psychology.md` §3 note (currently says pivoting; should say session-length is locked once shipped). ~60–90 min.

2. **Share composer rebuild.** Spec is in `docs/DECISIONS.md` 2026-04-27 PM share-card entry. Move composer in `components/CompletionCelebration.tsx` (lines 223–491 per round-2 audit) from opt-out → opt-in. Lock content: archetype + reclaimed value framed positive + brand mark. Strip per-share customization controls. Add Phase 1 Practical Value footer CTA: *"Find out what your pile is worth → inventoryfull.gg/stats"*. ~60–90 min.

3. **Round-3 audit (if time).** Cold-start surfaces — Onboarding / GetStarted / ImportHub / FinishCheckNudge. Round 2 didn't reach them and we're 10 days from launch.

**Parked / blocked.**
- Native-channel implementation (Xbox Cloud → Epic → Battle.net → GOG → Ubisoft). Research complete in `docs/native-channel-research-2026-04-27.md`. ~1-day implementation sprint.
- Practical Value Phase 2 (auto-generated "worth it if X" per cleared game). Conditional on game-metadata signal reliability.
- Inferred-features track (post-launch differentiator).
- Celebration overlay imagery (Brady to source from Stitch / Claude Design).
- Steam Deck channel re-positioning (Brady's strategic call).
- Backfill `moodTags` ✅ shipped this wave.
- `time → energy` substitution doc ✅ shipped this wave (then pivoted).

**Don't drift.** Every implementation track this session traces back to a research finding or audit intervention. Maintain that bar — the launch sprint is not "ship more features," it's "ship what the audit + research said matters."

---

## Late-evening addition — `/regress-watch` skill (renamed + trimmed)

Spun up after a `/insights` run as an experiment in autonomous visual regression. First version (`/visual-regression`) was over-scoped — 25 assertions, several duplicating `/theme-check`, `/mobile-best-practices`, `/pre-push-review`. Trimmed to 14 assertions covering only what those don't: named-bug regressions (`regress-*`), OG runtime split smoke checks, pixel-sprite render validation, and process patterns. Renamed to `/regress-watch` to clarify it's the bug-catalog skill, not a general visual checker.

**Validate-in-real-use follow-up (next session):** run `/regress-watch` on the energy-rename and share-composer rebuild changes before commit. If it catches a regression Brady would have caught on review, it's earning its keep. If it stays silent or false-positives, trim further or absorb into `/pre-push-review` and delete the standalone skill.

Commits: `497013f` (initial), `519cc76` (scroll-animation artifact rule), `*` (rename + trim).
