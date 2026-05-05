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

## Session resumes

`docs/session-resume-YYYY-MM-DD.md` — current-state pointer, written at session close. Always read the latest at session start.

Latest: [`session-resume-2026-05-04.md`](session-resume-2026-05-04.md) (when written).

## Notes folder (raw materials, not planning)

`notes/feedback-inbox/` — design feedback drops in here.
`notes/new archetype images apr24/` — full-character art, used as merch hero art per `merch-plan.md`.
`notes/bundle-wave2/` and `bundle-wave2 extra/` — H2 sprite bundles, processed.

---

## Rules for keeping this file useful

- Only list LOCKED specs (committed direction, not in-progress brainstorm).
- One line per doc — title + subject + trigger.
- When a doc gets archived/superseded, remove it from this index (don't keep stale pointers).
- When a new spec lands, add it here in the same commit.
