# On the Horizon — Bigger Builds, Banked

**Status:** PLANNING — surfaced 2026-05-05 from a Claude Insights report.
**Why this exists:** Three larger workflow builds came up in an external insights review. Each is real-spec-and-build territory — not a 30-min surgery. This doc preserves the framing so we don't re-derive each from scratch when the trigger arrives.

These are not next-up. They sit behind:
- The current modal redesign (`docs/modal-redesign-spec.md`)
- The smaller surgeries queue (`docs/smaller-surgeries.md`)
- Phase 4 of testing-agents (manual pre-approval of weekly Agent B)

Pick one only when those queues are clear AND the trigger below has been hit.

---

## 1. Autonomous Visual Regression Loop

**One-line:** Claude ships a UI change → captures preview screenshots across breakpoints/themes → diffs against approved baselines → self-corrects until the diff passes → only then surfaces.

**Why this matters:** Recurring visual bugs (wordmark off-centering, OG card overflow, sprite clipping, contrast misses) are usually caught by Brady, not Claude, because Claude doesn't routinely look at the rendered output. Closing this loop turns "two corrective iterations" into zero on visual changes.

**Skeleton:**
- New skill `visual-regression` that owns baselines under `tests/visual/baselines/`.
- Inputs: list of routes/components × breakpoints × themes (start with 5–10 high-traffic surfaces).
- Loop: capture via `Claude_Preview` MCP → vision diff → classify intentional vs regression → on regression, auto-iterate up to 3 fixes before escalating with annotated diffs.
- Wired into `/pre-push-review` so visual changes can't ship unverified.

**Trigger to build:** A visual bug ships AGAIN in production AND Brady has a 2–3 hour focused window. Until then, the cost of building > cost of catching manually.

**MCP needed:** `Claude_Preview` already wired. Optional: **Playwright MCP** would add native pixel-diff via `expect.toHaveScreenshot()` and headless cross-browser. Not blocking, but worth installing if this build moves forward.

**Risks:**
- Auto-iterating on a fix without human review is high-stakes; cap at 3 attempts and ALWAYS escalate, never silently auto-commit.
- Baseline drift is real — if baselines aren't refreshed when a *legitimate* visual change ships, every subsequent run false-positives. Build the "approve as new baseline" flow into the skill from day 1.

**Estimate:** ~4–6 hours initial build. Maintenance ongoing.

---

## 2. Parallel Sprint Agents With Test Gates

**One-line:** Multi-track sprints (analytics + CTA + research + sprites + close ritual) dispatched as parallel `Task` subagents per track, each gated by its own typecheck / preview screenshot diff / lint / brand-voice check, with a coordinator agent that serializes commits in dependency order.

**Why this matters:** Friday 6-hour sprints become 90-minute parallel bursts. The 2026-05-05 modal-recon run already demonstrated 3 parallel Explore subagents finishing in the time of one. Productionizing this with test gates and a merge coordinator is the next step.

**Skeleton:**
- Skill `sprint-coordinator` that takes a sprint plan (probably markdown), parses tracks (feature/polish/docs/deploy), dispatches `Task` subagents per track.
- Per-track gates: typecheck, lint, preview screenshot diff (depends on Visual Regression Loop above), brand-voice via `/pre-push-review`.
- Merge coordinator: serializes commits in dependency order (e.g. shared types changes land before consumers), handles conflicts.
- Auto-invokes `/session-close` when all tracks land green.

**Trigger to build:** Brady plans a sprint with ≥3 independent tracks AND has historical pattern data (the insights report suggested reading the last 5 multi-track sessions to identify track types). Until then, sequential sprints work fine.

**MCP needed:** None new. Uses `Task` tool already available.

**Risks:**
- Parallel commits to the same files create merge hell. The dependency analysis is the real engineering challenge — naïve serialization will be either too conservative (kills parallelism) or too aggressive (corrupts state).
- Test-gate flakiness propagates; a single flaky preview screenshot blocks an entire track.
- Solo-builder reality: Brady has to trust subagents to run unattended for 60–90 min. That's a step beyond the "I review every commit" pattern.

**Estimate:** ~6–10 hours initial build. Probably worth a real prototype-and-iterate cycle, not a one-shot.

---

## 3. Self-Healing Site Integrity Agent

**One-line:** Nightly agent that drives preview flows, asserts every GA4 event fires with correct payloads, scrapes user-facing strings against the voice charter, validates JSON-LD/OG metadata against current product claims — and opens a PR (with screenshots + justification) when drift is found.

**Why this matters:** GA4 instrumentation drift wasn't caught until production on the `landing_view` debug. The "Free forever" JSON-LD slip and Bungee-vs-wordmark mistakes share the pattern: shipped code disagrees with a spec that lives in a separate doc. A nightly scheduled agent that diffs spec vs. shipped catches these before users do.

**Skeleton:**
- Scheduled task (via `anthropic-skills:schedule`, like Agent B for decisions audit) — runs nightly.
- Drives flows via `Claude_Preview` MCP, asserting every GA4 event in our analytics spec fires with correct payloads.
- Scrapes every user-facing string, grades against `.claude/rules/voice-charter.md`.
- Validates JSON-LD / OG metadata against current product claims (no "Free forever" regressions).
- On drift: opens a PR with the fix, screenshots, written justification.

**Trigger to build:** Either (a) a real production drift incident that costs Brady time to diagnose, or (b) two of three (analytics, voice, metadata) get stable enough specs that asserting against them isn't a moving target. Until specs stabilize, the agent's false-positive rate would be high.

**MCP needed:** `Claude_Preview` already wired. **GitHub MCP** would help for the auto-PR step (vs. just printing the diff); optional.

**Risks:**
- Auto-PR for fixes is the highest-stakes pattern of the three. Unlike Agent B (audit only, never fix), this one writes code. Need very strong gates on what kinds of drift it's allowed to auto-fix vs. flag.
- Nightly cadence costs API budget. Probably weekly is more realistic at solo-budget scale; nightly only if a real drift problem exists.
- The "every user-facing string graded against the voice charter" is genuinely hard — the charter has "feel" rules (`Read it aloud`) that a grading agent can't fully execute. Likely catches obvious LinkedIn vocab but misses tone drift.

**Estimate:** ~8–12 hours initial build, plus ongoing tuning.

---

## MCP wishlist (if any of the above gets built)

Currently wired (per system tools): Sentry, Supabase, Claude Preview, scheduled-tasks, Vercel/v0 hybrid (`94ce7723…`), Canva, Google Drive, Cloudflare R2 (`52eafc82…`), Mermaid, Context7 (`3208bc0d…`), MCP registry, ccd_session.

**Worth adding for these builds:**

| MCP | What it adds | Trigger to install |
|---|---|---|
| **Playwright** | Native pixel-diff via `toHaveScreenshot()`, cross-browser headless, action recording | Build #1 (Visual Regression) — Playwright's diff is more reliable than vision-model diff for pixel-level UI |
| **GitHub** | Auto-PR creation, PR comment threading, label/assignee management | Build #3 (Self-Healing) — needed for the auto-fix-PR step. Skip if Brady prefers Claude printing patches for him to apply. |
| **Lighthouse** | Programmatic perf/SEO/a11y scoring | Optional. Only if `/free-tier-audit` or perf becomes a regular concern. |

Don't install speculatively. Each MCP adds load to every session.

---

## How to use this doc

When a trigger above hits, read the corresponding section's *full* skeleton + risks before starting. Don't restart the design conversation. If a build progresses past 50% completion, move it from this doc to its own spec file.

If a build is rejected after deeper exploration, leave a one-line note here ("Rejected YYYY-MM-DD: reason") so future-Claude doesn't re-pitch it.
