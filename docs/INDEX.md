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
| [LAUNCH_BIBLE.md](LAUNCH_BIBLE.md) | Launch sprint single-source | LIVE | Launch tasks |
| [DECISIONS.md](DECISIONS.md) | Key locked decisions log | LIVE | When choosing something with prior history |

## Planning specs from May-4 session (NEW — bank these, don't re-do)

| Doc | Subject | Status | Trigger to build |
|---|---|---|---|
| [merch-plan.md](merch-plan.md) | Archetype merch via Printful + Shopify | LOCKED | ~50 actives OR first organic external mention |
| [discord-bot-spec.md](discord-bot-spec.md) | Discord bot (`/pick`, `/archetype`, webhook) | LOCKED | Brady has a 3-day window of focused time |
| [b2b-studios-spec.md](b2b-studios-spec.md) | Anonymized analytics for indie studios | LOCKED | ≥5k MAU |
| [marketing-recipients-spec.md](marketing-recipients-spec.md) | SQL view to dedupe email send list | LOCKED | When Resend/equivalent is on the near roadmap |
| [monetization-plan.md](monetization-plan.md) | Tip jar, supporter tiers, mascot eval | LOCKED | Multiple per-stream triggers (see doc) |
| [distribution-plan.md](distribution-plan.md) | Reddit + Twitter + Bluesky strategy, channel readiness | LOCKED | Move 1 (Reddit) when subagent recommendation arrives; Move 2 (socials) anytime |
| [bot-character-spec.md](bot-character-spec.md) | Pip — bot character bible, GPT prompt library, placement plan | LOCKED | When generating new Pip art or wiring Pip into app/Discord/merch |
| [testing-agents-spec.md](testing-agents-spec.md) | "Won't suck" + "Didn't strip a feature" testing agents — design, cadence, recon plan | PARTIAL — phases 1+3 shipped 2026-05-05 | Phase 4 (scheduling Agent B weekly) when ready |
| [modal-redesign-spec.md](modal-redesign-spec.md) | Game-detail modal: destructive collapse, adaptive CTA, more like this | PLANNING — recon done 2026-05-05 | Pick any of 3 items per dedicated session |
| [smaller-surgeries.md](smaller-surgeries.md) | Queue of self-contained ~30–60 min surgeries (roll modal, stats, undo toast, retroKids, etc.) | PLANNING | Pick any when window opens |
| [on-the-horizon.md](on-the-horizon.md) | Bigger workflow builds — visual regression loop, parallel sprint agents, self-healing site integrity | PLANNING | Per-build trigger; modal/surgery queues clear first |

## In-flight specs

| Doc | Subject | Status | Trigger to act |
|---|---|---|---|
| [app-theme-spec.md](app-theme-spec.md) | Cream light theme migration spec — token map, component audit, phased rollout | SHIPPED (phase 1–2) | Phase 3 polish when window opens |

## Session resumes

`docs/session-resume-YYYY-MM-DD.md` — current-state pointer, written at session close. Always read the latest at session start.

Latest: [`session-resume-2026-05-13.md`](session-resume-2026-05-13.md)

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
