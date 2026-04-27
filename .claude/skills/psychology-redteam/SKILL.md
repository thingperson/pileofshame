---
name: psychology-redteam
description: Audit every major user-facing surface against the user-psychology research baseline and the "Enjoy your games again" north star. Stress-tests whether the core product actually does its job for the locked user profile (decision paralysis, sunk cost, choice overload, commitment avoidance, reactance) — or whether it's drifted into being a new thing to manage. Produces a ranked intervention list. Trigger on "psychology red-team", "psych red-team", "user psych audit", "are we serving the user", "stress-test the product", "redteam the psychology".
---

# Psychology Red-Team

Hard, honest audit of whether Inventory Full is doing its job for the user it claims to serve. Not a copy review, not a polish pass. The question is: **does the core loop deliver the psychological outcome we promise, or are we accidentally building the thing we said we'd never build?**

## When to run

- Before a launch — verifies assumptions before exposure.
- After a sprint that touched core flow surfaces (landing, onboarding, pick, reroll, completion, share).
- When a copy or feature debate keeps re-opening — the answer probably lives in the research, not in taste.
- When something *feels* off about the product but no one can name it.

## When NOT to run

- Pure visual / theming work.
- Copy debates that are clearly stylistic, not psychological.
- Mid-implementation of a feature — wait until it's live.

## Operating principle

Be adversarial. The default failure mode here is sycophancy: looking at our own surfaces and concluding they're fine because we wrote them. Treat every surface as guilty until the research says otherwise. If a finding is uncomfortable, that's a signal to lean in, not soften.

---

## Step 1 — Load the research baseline

Read in this order:

1. `.claude/rules/user-psychology.md` — the canonical user profile + six research foundations (Iyengar, Schwartz, Sweller, Brehm, Kahneman, Amabile). This is the rubric.
2. `.claude/rules/voice-charter.md` — the locked five principles + intentional exceptions (help-language marketing/fulfillment split, Moving On canon).
3. `.claude/rules/legal-compliance.md` — for the "did the user ask to see this" test, which overlaps with reactance.
4. The most recent `docs/session-resume-*.md` — for context on what shipped recently.
5. `docs/LAUNCH_BIBLE.md` if it exists — the public claims we're about to make.
6. Anything in `notes/research/` that looks load-bearing (skim, don't drown).

Then state in one paragraph: **the user profile, the north star, and the sub-60s axiom.** This is the rubric every surface gets measured against. Do not proceed until it's stated explicitly — it's the contract for the rest of the audit.

---

## Step 2 — Inventory the surfaces

The audit covers every surface a real user touches in a real session. Build the list before going deep.

Default surface map (verify against current code):

- **Pre-product:** landing (`components/LandingPage.tsx`), about page, share-card unfurls (root + clear + pile OG)
- **Onboarding / acquisition:** `OnboardingWelcome.tsx`, `GetStartedModal.tsx`, `SampleImportNudge.tsx`, the import hub + each provider modal
- **Pick flow (the load-bearing core):** mood/time picker, the pick reveal, reroll
- **In-product loop:** game card, GameDetailModal, status transitions (Backlog → Up Next → Playing Now → Completed / Moved On), `JustFiveMinutes`, `FinishCheckNudge`
- **Celebration / exit:** `CompletionCelebration`, share card composer, stats page
- **Friction:** auth, cloud sync, settings, error states, empty states

For each, note: what's its *job* in the loop, and what's the user's psychological state when they hit it?

---

## Step 3 — Audit each surface against the rubric

Delegate this to a subagent (Explore, very thorough). The agent reads each surface and rates it on:

1. **Choice load** — How many decisions does the user make here? Which can be removed or merged?
2. **Confidence vs hedge** — Does the surface deliver with conviction or hedge? Where does hedging undercut the decision the user came for?
3. **Reactance / autonomy** — Does the surface preserve felt agency? Or does it lecture, push, or override?
4. **Loss aversion / commitment** — Does this surface make starting / finishing / moving on feel low-stakes? Or does it amplify the fear of waste?
5. **Cognitive load** — How many UI elements, copy chunks, and inputs are competing for working memory? What's the floor?
6. **Action terminus** — Does this surface push the user toward playing, or toward staying in the app? Less time in app = success.
7. **North-star fit** — *"Enjoy your games again."* Does this surface return the user to a game they own and love, or does it make Inventory Full a new thing to manage?

For each surface, the agent returns: a one-line verdict (✅ Serves / ⚠️ Mixed / ❌ Fights) plus the specific finding + file:line evidence.

**Sycophancy check:** if the agent comes back with mostly ✅, the bar was too low. Push back: "audit harder against the *user*, not against our own intent." The research is the rubric, not our PR.

---

## Step 4 — Time-cost the paths

For each entry path, estimate seconds from "I want to play" → game running.

- New user, sample import: ___ seconds
- New user, real Steam import: ___ seconds
- Returning user, mood pick → reroll → play: ___ seconds
- Returning user, browsing pile manually: ___ seconds (this should be slow; if it's fast we've built a catalogue tool)

Compare against the 60-second axiom. Flag every path that exceeds it and identify the time tax — whether it's UI friction, decision count, copy density, or a missing default.

---

## Step 5 — Distribution channel review

The web app might be psychologically perfect and still fail because users aren't on it at the moment of paralysis. Ask:

- Where does paralysis actually happen? (At a launcher. On a couch. On a phone in bed. On a Steam Deck.)
- Where does Inventory Full live? (Web, desktop browser primarily.)
- What's the friction tax to get from "I want to play" → opening Inventory Full → getting a pick → opening the launcher → playing?

Identify the channel gaps. iOS / Android / Steam Deck / native Steam app integration are not "polish" — if they remove a friction layer, they are core to the mission. Surface this as a finding, not a parking-lot item.

---

## Step 6 — Research gap report

List claims the product makes (in copy, structure, or feature design) that *are not* yet backed by the research foundations in user-psychology.md. Examples of what to look for:

- Onboarding claims about how users feel
- Status-cycle assumptions (e.g., the order Backlog → Up Next → Playing Now)
- Reroll behavior assumptions
- Share-card / social claims
- Anything in marketing copy that asserts a user state we haven't sourced

For each gap, suggest what to ingest next (paper, book, study, qualitative source) and where it would slot into `.claude/rules/user-psychology.md`.

---

## Step 7 — Verdict + ranked interventions

End with three things:

1. **Verdict in one paragraph.** Is the core product doing its job? Where are we strongest, where are we lying to ourselves, and what's the one thing that, if changed, would most move the needle?

2. **Ranked interventions** — top 5–10, each with: what it is, the research it's grounded in, the surface it touches, the rough effort, and the expected impact. Order by impact-per-effort.

3. **Mission-fit call.** For each intervention, mark whether it serves "Enjoy your games again" or just makes the product nicer. The latter can wait.

Interventions can be: copy changes, feature additions, feature removals, channel additions, or research ingest tasks. Drop the bias toward shipping new things — sometimes the highest-impact intervention is removing something.

---

## Step 8 — Write the report

Output to `docs/psychology-redteam-YYYY-MM-DD.md` with this structure:

```
# Psychology Red-Team — YYYY-MM-DD

## Rubric
[user profile + north star + axiom, one paragraph each]

## Surfaces — verdict table
[markdown table: surface | verdict | one-line finding]

## Surface findings (detail)
[per-surface deeper notes, file:line evidence]

## Time-cost
[per-path estimate vs 60s axiom]

## Distribution channels
[gap analysis]

## Research gaps
[claims missing research backing + ingest suggestions]

## Verdict
[one paragraph]

## Ranked interventions
[numbered list, each: what / research / surface / effort / impact / mission-fit]
```

Then surface the report path + a 5-line summary (verdict + top 3 interventions) for Brady. **Do not** auto-implement findings. The point is the audit — Brady decides what ships next.

---

## Quality bar before delivering

- Every surface in Step 2 was actually audited (not skipped).
- Every ❌ and ⚠️ has file:line evidence.
- The verdict names *the one thing* — not five things tied for first.
- At least one intervention is uncomfortable (removes a feature, kills a darling, admits an assumption was wrong). If everything is additive, the audit was too soft.
- The research-gap section names actual sources to ingest, not "we should research more."

If any of these fail, iterate before handing back.
