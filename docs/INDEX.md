# Docs index

*Pointer file. Updated when planning docs are added/locked. Future-Brady reads this to know what's already been thought through and shouldn't be re-built from scratch.*

---

## Active locked specs (built or buildable)

| Doc | Subject | Status | Read when |
|---|---|---|---|
| [voice-charter.md](../.claude/rules/voice-charter.md) | Brand voice, ship-or-don't-ship gate | LOCKED | Always loaded |
| [voice-and-tone.md](../.claude/rules/voice-and-tone.md) | Deep voice reference | LOCKED | Voice charter flagged something |
| [brand-messaging.md](../.claude/rules/brand-messaging.md) | Messaging hierarchy, taglines, terminology | LOCKED | Marketing/positioning work |
| [user-psychology.md](../.claude/rules/user-psychology.md) | Research foundations | LOCKED | Copy or UX decisions |
| [legal-compliance.md](../.claude/rules/legal-compliance.md) | Privacy/data hard lines | LOCKED | Any feature touching user data |
| [deploy-gates.md](../.claude/rules/deploy-gates.md) | Pre-push checks | LOCKED | Before any push |
| [token-efficiency.md](../.claude/rules/token-efficiency.md) | Token-saving session defaults | LOCKED | Always |

## Roadmap + planning

| Doc | Subject | Status | Trigger to act |
|---|---|---|---|
| [ROADMAP.md](ROADMAP.md) | Top-level roadmap | LIVE | Planning |
| [LAUNCH_BIBLE.md](LAUNCH_BIBLE.md) | Launch single-source — merged 2026-05-12 (positioning, distribution sequencing, Reddit/PH/HN/creator/Bluesky copy, demo workflow, landing audit, infra, monetization, scale-up) | LIVE | Any launch work |
| [launch-plays/linkedin-activatable.md](launch-plays/linkedin-activatable.md) | LinkedIn launch drafts — off the canonical gaming-audience path, activatable when targeting brand/founder audience | DORMANT | When Brady wants to reach his pro network |
| [DECISIONS.md](DECISIONS.md) | Key locked decisions log | LIVE | When choosing something with prior history |

## Planning specs from May-4 session (NEW — bank these, don't re-do)

| Doc | Subject | Status | Trigger to build |
|---|---|---|---|
| [merch-plan.md](merch-plan.md) | Archetype merch via Printful + Shopify | LOCKED | ~50 actives OR first organic external mention |
| [discord-bot-spec.md](discord-bot-spec.md) | Discord bot (`/pick`, `/archetype`, webhook) | SHIPPED Phase 1 (2026-05-13), pool expanded to 344 (2026-05-14) | Phase 2: `/whatshouldweplay` group voting |
| [b2b-studios-spec.md](b2b-studios-spec.md) | Anonymized analytics for indie studios | LOCKED | ≥5k MAU |
| [marketing-recipients-spec.md](marketing-recipients-spec.md) | SQL view to dedupe email send list | LOCKED | When Resend/equivalent is on the near roadmap |
| [monetization-plan.md](monetization-plan.md) | Tip jar, supporter tiers, mascot eval | LOCKED | Multiple per-stream triggers (see doc) |
| [bot-character-spec.md](bot-character-spec.md) | Pip — bot character bible, GPT prompt library, placement plan | LOCKED | When generating new Pip art or wiring Pip into app/Discord/merch |
| [testing-agents-spec.md](testing-agents-spec.md) | "Won't suck" + "Didn't strip a feature" testing agents — design, cadence, recon plan | PARTIAL — phases 1+3 shipped 2026-05-05 | Phase 4 (scheduling Agent B weekly) when ready |
| [modal-redesign-spec.md](modal-redesign-spec.md) | Game-detail modal: destructive collapse, adaptive CTA, more like this | Items 1+3 SHIPPED 2026-06-29; Item 2 label-only shipped, full platform matrix pending | Full platform launch matrix when ready |
| [smaller-surgeries.md](smaller-surgeries.md) | Queue of self-contained ~30–60 min surgeries (roll modal, stats, undo toast, retroKids, etc.) | PLANNING | Pick any when window opens |
| [on-the-horizon.md](on-the-horizon.md) | Bigger workflow builds — visual regression loop, parallel sprint agents, self-healing site integrity | PLANNING | Per-build trigger; modal/surgery queues clear first |

## In-flight specs

| Doc | Subject | Status | Trigger to act |
|---|---|---|---|
| [app-theme-spec.md](app-theme-spec.md) | Cream light theme migration spec — token map, component audit, phased rollout | SHIPPED (phase 1–2) | Phase 3 polish when window opens |
| [specs/dynamic-enrichment.md](specs/dynamic-enrichment.md) | Claude API game data on first card open — tips, mood validation, share card copy | SPECCED | When building Jump Back In improvements or share card Phase 2 |
| [specs/share-card-overhaul.md](specs/share-card-overhaul.md) | Share card UX — preview-first flow, fewer clicks, discoverability. Also covers game card status-change pill position | SHIPPED 2026-06-29 (D+A+B+C); open questions: mobile preview sizing, flavor text consistency | If those open questions become friction |
| [specs/sort-and-progress-rethink.md](specs/sort-and-progress-rethink.md) | "Quick to clear" sort assumes user progress from hours — rename + rethink | SPECCED | Quick rename is 10 min; Option B needs design |
| [specs/rawg-pre-seed.md](specs/rawg-pre-seed.md) | Pre-seed Supabase game_metadata with top 500 popular PC games from RAWG to reduce API pressure | SPECCED | Run before traffic spikes or monthly maintenance |
| [specs/ios-app-build-brief.md](specs/ios-app-build-brief.md) | iOS app — native SwiftUI rewrite, Phase 0 TestFlight, Phase 1 App Store free tier, $9.99 premium, native OAuth + widget | SPECCED | When ready to start iOS build |
| [specs/lint-hook-errors.md](specs/lint-hook-errors.md) | 22 react-hooks lint errors blocking CI — triage buckets, per-file table, risk notes. CI red on every push since 2026-07-06; smoke test never runs | SPECCED | Next time CI noise is worth a session. Blocks the e2e smoke test from running at all |
| [specs/web-ios-interop.md](specs/web-ios-interop.md) | Web↔iOS shared-backend interop — server-authoritative `merge_library` RPC (D1, BLOCKS iOS prod), identity linking (D3), Apple auth, tombstones, connection-persistence bugs, naming alignment. Mostly web+Supabase work | SPECCED — green-lit, not started | Before iOS points at prod; D1+D3 are blocking |
| [specs/status-events-supabase-mirror.md](specs/status-events-supabase-mirror.md) | Supabase `status_events` mirror for the append-only status log (local log shipped 2026-06-30) — Year-in-Pile Phase 1 fast-follow | SPECCED — needs Privacy Policy update | When wiring Year-in-Pile sync or right away to stop multi-device event loss |

## Session resumes

`docs/session-resume-YYYY-MM-DD.md` — current-state pointer, written at session close. Always read the latest at session start.

Latest: computed at session start by the SessionStart hook (`ls -t docs/session-resume-*.md`) — this line intentionally no longer tracks it.

## Audits

`docs/audits/audit-YYYY-MM-DD.md` — weekly drift audits from `regress-watch decisions-audit` (Agent B). Brady reads Monday morning. The audit dir is for ephemeral review artifacts — old audits can be pruned freely; the input (DECISIONS.md) is the source of truth.

## Notes folder (raw materials, not planning)

`notes/feedback-inbox/` — design feedback drops in here.
`notes/new archetype images apr24/` — full-character art, used as merch hero art per `merch-plan.md`.
`notes/pip/` — Pip character art, transparent PNGs, WebP tinified copies, pixel sprites.
`notes/bundle-wave2/` and `bundle-wave2 extra/` — H2 sprite bundles, processed.

---

## Rules for keeping this file useful

- Only list LOCKED specs (committed direction, not in-progress brainstorm).
- One line per doc — title + subject + trigger.
- When a doc gets archived/superseded, remove it from this index (don't keep stale pointers).
- When a new spec lands, add it here in the same commit.
