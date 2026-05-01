# Session Resume — 2026-04-28 (Tuesday, PDT)

**Type:** Two waves shipped today — earlier (energy→session-length rename, round-3 cold-start audit + interventions, regress-watch skill polish) and the closing wave (share-card composer rebuild, landing partial restoration).

⚡ **START HERE for prior context:** [docs/session-resume-2026-04-27.md](session-resume-2026-04-27.md) — yesterday's picker rebaseline, psychology red-team rounds 1+2, telemetry events, stats surgery, Energy→Session-Length pivot doc'd, /regress-watch skill spun up. Today executes most of yesterday's "next session" plan.

## Active sprint

Public soft-launch staggered Apr 28 → May 6 per `docs/LAUNCH_BIBLE.md`. **~10 days out**, telemetry now live in prod for several days, four diagnostic GA4 events firing.

## What shipped today

Six commits, all pushed to origin/main. Logical unit per commit.

- `2a76716` **landing partial restoration** — Reversed part of the Apr 25 full-trim. "It's really just three things" (Import → Match → Play) + "Not another backlog tracker" sections back on landing. Pull quote + "4 ways to pick" stay on /about. Brady noticed on prod that the trim went too far — hero + CTA alone read gutted. DECISIONS entry logged.
- `1d51760` **clear-card composer opt-in + Phase 1 recipient CTA** — Implements the DECISIONS 2026-04-27 share-card lockdown for the clear-card surface. Composer now mounts only after the user clicks "🔗 Share this clear" (was always-visible mid-celebration). Stripped per-share customization: dollar/HLTB toggles + flavor-reroll dice removed. OG card footer now carries the Berger STEPPS Phase 1 Practical Value CTA: *"find out what your pile is worth → inventoryfull.gg/stats"*. Slow-HLTB shame subtitle dropped (falls through to evergreen).
- `4a90fcf` **round-3 redteam cold-start interventions** — `ImportHub` Steam-first with "Most start here" tag + manual platforms behind disclosure (8 → 5 visible options). `GetStartedModal` drops "Free forever." marketing claim. `FinishCheckNudge` drops 130%+ population shame trigger + retires "Not yet" (which was hiding a status mutation behind a deferral label — reactance/autonomy violation; users now manage status from the game card). Behavior change worth flagging: FinishCheckNudge no longer auto-promotes to Playing Now via "Not yet."
- `d51c827` **picker rename energy → session length + voyage iconography** — Implements the 2026-04-27 PM pivot. `EnergyLevel` → `SessionLength` in `lib/reroll.ts`, picker UI labels in `components/Reroll.tsx` updated (Low/Med/High → Small/Med/Large with locked copy "2+ hrs · I'm in"). Voyage iconography swap landed alongside.
- `683bd03` **regress-watch skill rename + trim** — Renamed from `/visual-regression` to `/regress-watch`. Trimmed assertions that duplicated `/theme-check`, `/mobile-best-practices`, `/pre-push-review`. Now 14 named-bug + render-validation assertions instead of 25.
- `519cc76` **regress-watch scroll-animation artifact rule** — Encoded the scroll-animation screenshot artifact pattern in the assertion library.

## Verify on next session start

- **Vercel deploy of `2a76716` + `1d51760`** — pushed at session close, confirm clean once live (~1-3 min after push).
- **Live landing on prod** — both mobile + desktop should now show "It's really just three things" + "Not another backlog tracker" between hero and footer CTA. The trim-too-aggressive complaint that triggered the restoration should be resolved.
- **Clear-card share flow on prod** — beat a game in your library, the celebration should show "🔗 Share this clear" button (not the composer mid-celebration). Click → composer reveals → flavor preview + "Create share link" only. The generated `/clear/[id]` OG should have the recipient CTA on the bottom-left.
- **OG mock URL** — `/clear/mock-dollar/opengraph-image` should render the Phase 1 footer CTA next to the wordmark. Verified in preview at session close.
- **FinishCheckNudge behavior change** — the "Not yet" auto-promote-to-Playing-Now path is gone. Worth a Sentry sweep over the next few days for any errors from the dropped path; no analytics events were attached.
- **Round-3 cold-start interventions in production** — eyeball ImportHub (Steam-first + manual platforms hidden behind disclosure), GetStartedModal subhead (no "Free forever."), FinishCheckNudge (no 130%+ comparison line, no third "Not yet" button).

## Rotting gotchas accumulated

- **/about and landing duplicate the two restored sections byte-for-byte.** Edits to one need to mirror to the other. `StepCard` exists in both `components/LandingPage.tsx` and `app/about/page.tsx`. Candidate for shared component if a third use appears — premature now.
- **`lib/store.ts:70` seeds `SEED_GAMES` in `NODE_ENV === 'development'`.** Means LandingPage never renders on `localhost:3000` once you clear localStorage — the store re-hydrates with sample data. Discovered while trying to verify the landing restoration in preview. Verification path was DOM-eval against `/about` (parity check, byte-identical JSX) + build sanity. Not a bug; a dev-convenience seed. Worth knowing before next time someone tries to test landing locally.
- **moodTags v3 migration** still rolling out across user browsers from yesterday's wave. Sentry sweep for migration errors continues.
- **Picker still has `⚙ Change roll settings` affordance unused-by-default** — telemetry will tell us whether the strip-and-collapse design failed (carry-over from 2026-04-27).
- **Items #6–8 from round-3 deferred** to post-launch sprint per `docs/psychology-redteam-round3-2026-04-28.md`: updates-checkbox relocation, sample-library tertiary, SignInModal rename.

## Open design questions

- **Practical Value Phase 2 timing** — auto-generated "worth it if X" recommendations on cleared cards. Conditional on game-metadata signal reliability. Worth a scoping pass after a few days of GA4 share data.
- **Native-channel implementation** (Xbox Cloud → Epic → Battle.net → GOG → Ubisoft). Research complete in `docs/native-channel-research-2026-04-27.md`. ~1-day implementation sprint, pre-launch fit decision.
- **Steam Deck channel re-positioning** — strategic call carry-over from 2026-04-27.
- **Celebration overlay imagery** — Brady to source from Stitch / Claude Design.

## Health snapshot

- **Build:** clean. Last `npm run build` after `2a76716`, no errors.
- **Tip of main (local + origin):** `2a76716`.
- **Branches:** `main`. Stale branches still parked (`feat/pixel-icon-system`, `claude/serene-curran-2486f3`, `icon-preview`).
- **Known bugs:** none new this session.
- **Vercel:** deploy of the two closing-wave commits in flight at session close — confirm READY at next session start.
- **Sentry:** clean per yesterday's check.

## Closing status

End-of-day 2026-04-28 PM PDT. Six commits pushed across two effective waves. Three of yesterday's planned tracks closed: rename (Track 1), share composer rebuild (Track 2), round-3 audit (Track 3 stretch goal). Plus an unplanned but necessary partial reversal of the Apr 25 landing trim after Brady caught the over-strip on prod. ~10 days to soft launch — picker, telemetry, share-flow lockdown, and cold-start surfaces all now in their launch shape. Next session can focus on native-channel implementation or Practical Value Phase 2 scoping.
