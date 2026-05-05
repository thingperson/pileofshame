# Testing Agents — Spec & Handoff

**Status:** MOSTLY SHIPPED 2026-05-05 PDT. Agent A (pre-push hook + pre-push-review skill) and Agent B (regress-watch decisions-audit mode + weekly schedule) both live. See "What shipped" below for commit refs. Open question: whether to auto-pre-approve Agent B's tool permissions via a manual "Run now" first.
**Trigger to build (originally):** Brady has 30–60 min for the recon + small-build pass described under "Recommended next-session plan."
**Why this exists:** Brady asked late on 2026-05-05 about standing up testing agents that run with regularity to (a) catch shipped code that "sucks" and (b) detect when good features get stripped while shipping new ones. Two postures, two agents. This spec preserves the design conversation so the next session doesn't start cold.

## What shipped (2026-05-05 PDT)

- **Agent A trigger:** non-blocking git pre-push hook at `.git/hooks/pre-push` (canonical: `scripts/hooks/pre-push`). Nags when diff touches user-facing code. Commit `0a16130`.
- **Agent A skill:** `/pre-push-review` terminology table fixed (was inverted — telling Claude to use retired terms). Now points at `voice-charter.md` as canonical gate. Frontmatter description updated to advertise auto-invoke triggers. Commit `cdc6563`.
- **Agent B mode:** `regress-watch` extended with `decisions-audit` mode. Six `decision-*` assertions encoding LOCKED entries (status cycle, picker CTA, Moving On canon, 2-input pick flow, Playing Now cap, tagline canon). New `docs/audits/` dir for weekly outputs. Commit `59cfc48`.
- **Agent B cadence:** scheduled task `inventory-full-decisions-audit-weekly` fires every Monday ~08:09 AM PDT. Writes `docs/audits/audit-YYYY-MM-DD.md`. Brady reads with coffee. Surfaces only — never auto-fixes.
- **/deploy refactored** as scope-aware orchestrator that delegates to `/pre-push-review` instead of duplicating voice-sweep logic. Commit `fe20dab`.

## Still TBD (small)

- Manually invoke the weekly Agent B task once via "Run now" in the Scheduled sidebar to pre-approve any tool permissions it needs (mostly Read + Write + Bash). Otherwise the first real run may pause on permission prompts.
- After the first real audit fires, validate output quality. If false-positive rate is high, refine assertions in `.claude/skills/regress-watch/assertions.md`.
- Scope expansion: when new LOCKED entries land in DECISIONS.md, add a corresponding `decision-*` assertion. The pattern is documented in `assertions.md` ("How to add a new decision-* assertion").

The rest of this doc is preserved as the historical brief that drove the build.

---

---

## The two postures (don't merge them)

These look similar but have opposite directions of travel. Building one and calling it "good enough" loses half the value.

### Agent A — "Won't suck" (forward-looking, runs on changes)

- **Posture:** smell-test the diff before it ships.
- **Cadence:** every push (or every PR if we ever adopt PRs).
- **Inputs:** `git diff origin/main..HEAD`, the `.claude/rules/*.md` files (voice-charter, voice-and-tone, user-psychology, legal-compliance, deploy-gates), `docs/ROADMAP.md` core-loop axiom.
- **Output:** ship-or-fix-these verdict. Specific lines to fix, not a generic essay.
- **Failure mode it prevents:** the 2026-04-02 voice-sweep skip (documented in `deploy-gates.md`). Brady ships, voice drift slips through, user catches it post-deploy.
- **Existing skill that's ~80% this:** `.claude/skills/pre-push-review/`. Read it first; likely needs copy-edits, not rebuild.

### Agent B — "Didn't strip something good" (backward-looking, runs on cadence)

- **Posture:** canon keeper. Audit current code against what was previously locked.
- **Cadence:** weekly is plenty. Sunday night → Monday-morning summary file Brady reads with coffee.
- **Inputs:** `docs/DECISIONS.md` (this is the lever — see "Key insight" below), current codebase state, optionally `git log` for the past week to scope which decisions to re-audit.
- **Output:** a one-screen drift report. "Decision X (locked YYYY-MM-DD, reason Z) said the implementation does Y. Current code: still does Y ✓ / drifted to W ❌ / can't tell, needs human ⚠️."
- **Failure mode it prevents:** silently regressing locked decisions. Example near-misses Brady has lived through: status cycle re-naming, "Moving on is deciding too" framing dilution, pick-flow growing past 2 inputs, hedging language reappearing in CTAs.
- **Existing skill in the neighborhood:** `.claude/skills/feature-creep-audit/` (different angle — it's "are we drifting toward a tracker?"). Worth reading; probably complementary, not a replacement.

---

## Key insight — DECISIONS.md is the secret weapon

Hand-curated "list of features that must keep working" lists rot. They're maintenance debt, they go stale, they get out of sync with reality, the agent yells about things that were intentionally changed.

**Brady already maintains the right artifact: `docs/DECISIONS.md`.** Each entry has a *why*, *what was rejected*, and (often) a *file/line pointer*. That's the spec for what the implementation should still do. Agent B's job is reading entries marked LOCKED, finding the implementation, confirming it still matches.

The format is already agent-readable. No new doc to maintain. Brady writing DECISIONS.md naturally also feeds the test infra. This is the lever.

Agent B should:
1. Read DECISIONS.md, filter to entries from the last N weeks OR entries that touch files changed in the last week (cheaper, more relevant).
2. For each, locate the implementation site (often cited; if not, semantic search).
3. Verify the decision's "what was chosen" claim is still true in code.
4. Report.

Treat the report as a memory-prosthetic, never a CI gate. Drift may be intentional; the agent should never block, only surface.

---

## What Brady already has (don't rebuild)

From the available-skills list at session start (2026-05-05). Read these BEFORE designing anything new. Most are 80% there:

| Skill | Posture (A/B/other) | Read priority |
|---|---|---|
| `pre-push-review` | A | ⭐⭐⭐ start here |
| `regress-watch` | B-ish | ⭐⭐⭐ start here |
| `feature-creep-audit` | B-ish (axiom-focused) | ⭐⭐ |
| `psychology-redteam` | A (voice/psych) | ⭐⭐ |
| `import-regression` | B (scoped to import) | ⭐ |
| `accessibility-review`, `theme-check`, `mobile-best-practices`, `cross-browser` | A (surface-specific) | ⭐ if relevant |
| `deploy` | orchestration | reference |
| `session-close` | orchestration | reference |

**The honest question is whether any of these have actually run since they were written.** The gap is cadence and invocation, not capability.

---

## Cadence options (the real design question)

Once A and B are designed, how do they actually fire?

### For Agent A — pre-push (fires on demand or push)

Ranked by realism for Brady's workflow:

1. **Git pre-push hook that prompts Brady to run the skill.** Five lines of bash. Doesn't autorun (these need Claude judgment); just nags. Caught-the-2026-04-02-skip insurance.
2. **Manual habit reinforced by `deploy-gates.md`.** Already in the rules; depends on Claude actually invoking it. Lossy.
3. **CI / GitHub Actions.** Brady doesn't use GH Actions today; new infra to maintain. Skip unless A becomes load-bearing enough to justify it.

Recommendation: **(1).** Tiny investment, big behavior change.

### For Agent B — scheduled (fires weekly without Brady asking)

1. **`scheduled-tasks` MCP weekly cron.** Fires Sunday 10pm PDT, generates `docs/audit-YYYY-MM-DD.md`, Brady reads Monday morning. Closest tooling fit.
2. **A `/loop` invocation Brady kicks off Friday before bed.** Manual but predictable.
3. **Reactive only — invoke when Brady asks "what might've drifted?"** Loses the "with regularity" property he asked for.

Recommendation: **(1).** Matches the "with regularity" ask. The audit doc is the artifact; if Brady doesn't read it, the whole thing is theater, but at least the artifact existing is the trigger for him to look.

---

## Open questions for the dedicated session

These should be answered before code is written:

1. **Does `regress-watch` already do most of Agent B?** Read its impl first. If yes, the work is rewiring its inputs to read DECISIONS.md, not building from scratch.
2. **DECISIONS.md entries that don't cite implementation sites — how does Agent B find them?** Some entries reference files; some don't. Options: (a) backfill citations on the LOCKED entries Brady cares most about, (b) let the agent semantic-search, (c) skip entries without citations and report the gap.
3. **Where does the weekly audit doc live?** `docs/audit-YYYY-MM-DD.md` is the pattern that fits, but it'll grow to N files/year. Maybe `docs/audits/` subdir, or a single rolling `docs/AUDIT_LOG.md` with newest-first append.
4. **What's the threshold for Agent A nagging?** Every push? Every push that touches user-facing files? Every push during certain hours? The voice-sweep failure mode is specifically about user-facing copy changes, so gating on `git diff --name-only` matching components/app patterns is probably the right scope.
5. **Should the agents share infrastructure or stay independent?** They have totally different cadences and inputs, so probably independent. But both ultimately invoke an Explore-like subagent against the codebase, so a small shared helper for "read these rules + this scope of code, return findings as JSON" might make sense.

---

## Recommended next-session plan

A focused 30–60 min session, sequenced:

### Phase 1 — Recon (15–20 min)
Read these four skills, take notes, no code changes:
- `.claude/skills/pre-push-review/`
- `.claude/skills/regress-watch/`
- `.claude/skills/feature-creep-audit/`
- `.claude/skills/psychology-redteam/`

For each: what does it do today? What's its actual scope vs. what we'd want from Agent A or B? What's the smallest edit that gets it to where we want?

### Phase 2 — Decision point with Brady (5 min)
Bring back the recon as a one-screen summary. Brady picks: build A first, B first, both, or rebuild from scratch.

### Phase 3 — Build (15–30 min depending on Phase 2)
- If pre-push hook + `pre-push-review` rewire: small. New file `.husky/pre-push` (or just `.git/hooks/pre-push`, which is the only one in this repo's setup), one-line nag, plus any copy-edits to the skill.
- If scheduled `regress-watch` rewire: read `scheduled-tasks` MCP docs first to know how schedule + output works. Then update the skill to consume DECISIONS.md. Then schedule it.

### Phase 4 — First-run validation (5 min)
- Manually invoke Agent A on the most recent commit; confirm it produces useful output.
- Manually invoke Agent B against the past 30 days of DECISIONS.md; confirm it doesn't false-positive on intentional drift.

If either fails Phase 4, don't deploy the cadence — fix or shelve.

---

## Things this spec deliberately does NOT decide

- Specific output format (markdown vs. JSON vs. inline). That's a Phase 2 question, depends on what existing skills emit.
- Whether to build "blocking" gates that prevent pushes. Default is **never block** — always report. Brady is solo, blocking infra fights him. If a skill turns out to be load-bearing enough to gate, that's a separate decision.
- Whether to integrate with Sentry, GA4, or Vercel deploys for runtime regression signal. Different problem (production drift detection, not code drift detection); could be an Agent C in the future, but out of scope here.

---

## What "done" looks like

1. Agent A invoked reliably on every push that touches user-facing code (via pre-push hook nag).
2. Agent B fires weekly without Brady asking, drops a readable summary to `docs/`.
3. Both have run at least once and produced output Brady trusts.
4. Both are documented in `.claude/rules/deploy-gates.md` (Agent A) and a new short section of `docs/INDEX.md` (Agent B's audit-doc convention).
5. Existing skills that overlapped have been either consolidated, deprecated with a `// SUPERSEDED` note, or updated to feed into A/B.

---

## Conversation context (so future-Claude isn't cold)

This session (2026-05-05 early AM PDT) shipped two commits before this spec was written:
- `39f8797` — modal quick wins (Why we picked, humble HLTB, Discord affordance)
- `ec4a9cd` — picker rename + keyboard shortcuts

While discussing what to ship next, Brady raised the testing-agents idea. Specifically: *"let's consider writing testing agents we can run with regularity for verifying shipped code won't suck or that we aren't stripping out good features while adding new ones. those are different agents i guess."*

Then: *"how about you pass these forward to a new session to get on. don't lose detail, send forward a detailed handoff note around this subject and we'll focus on it."*

This file is that handoff. The next session should treat this as the brief, not Brady's memory of the conversation.
