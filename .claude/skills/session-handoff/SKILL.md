---
name: session-handoff
description: End-of-session housekeeping. Updates the session-resume handoff with what shipped/pending/to-verify, scans for DECISIONS.md entries to write, checks whether ROADMAP needs adjusting, flags drift in AGENTS.md, and prints a tight next-session kickoff note. Run this when Brady says he's wrapping, spinning a new session, or "tidy the docs."
---

# Session Handoff

End-of-session docs maintenance. Every substantive session on this repo leaves behind the same kinds of residue — work that shipped, decisions that got made in conversation but never got written down, roadmap items that are now done or re-sorted, and rotting state that drifted into AGENTS.md. This skill catches all of that.

**Design principle:** auto-apply the low-stakes stuff (session-resume). Surface the high-stakes stuff (DECISIONS, ROADMAP, AGENTS.md drift) for Brady's review, don't silently rewrite it. If he confirms, apply.

---

## 1. Survey the session

Run in parallel, read-only:

- `git log --oneline origin/main..HEAD` — commits on the current branch not yet in main
- `git log --oneline --since="yesterday" main` — commits that landed on main during this session (in case work was pushed straight to main)
- `git status` — uncommitted work that needs a decision (commit? stash? discard?)
- `git diff origin/main..HEAD --stat` — rough shape of what changed
- Read `docs/session-resume-*.md` (the most recent file)

Build a mental model of:
- What shipped this session (by commit message + diffstat)
- What's in-progress / uncommitted
- Whether the session touched code, docs, config, or all three
- Which files changed repeatedly (hot spots are more likely to need a DECISIONS entry)

**Skip trivial commits** — typo fixes, whitespace-only, reverts of this-session mistakes. They don't belong in the handoff.

---

## 2. Session-resume update (AUTO-APPLY)

This is the main output. Always happens.

### Which file?

- Today's UTC date vs. the most-recent `session-resume-*.md` filename.
- **Same day:** append a new wave to the existing file (e.g., "third wave" after "second wave"). Keep the sprint-item numbering continuous.
- **New UTC day:** create `docs/session-resume-YYYY-MM-DD.md`. Seed it with a `⚡ START HERE` pointer to the prior file for deeper context, then only today's material. Do NOT copy yesterday's content forward.

### What goes in

- **What shipped this session** — bulleted, with commit SHAs. One line per item unless the change needs context. Order by importance, not chronology.
- **What's pending** — uncommitted work, half-finished threads, things Brady explicitly parked.
- **Verify on next session start** — anything that could silently regress and needs a sanity check before trusting it. (Vercel deploys, OG endpoints, Supabase migrations, third-party auth flows.)
- **Health snapshot** — build state, current `main` tip, any known bugs (carried forward or new).
- **Timestamp** — end-of-day + UTC.

### What stays out

- Blow-by-blow narrative. One line per ship. If a debug story is valuable, put it in its own section ("§Y fix — what it cost us") and only if the gotcha is likely to bite again.
- Rejected-alternatives reasoning. That's a DECISIONS.md job.
- Code snippets. Link to commits.
- Emojis except the ✅ / ⚡ markers that match the existing voice.

---

## 3. DECISIONS.md scan (SURFACE, DON'T AUTO-WRITE)

DECISIONS.md captures the **why** behind load-bearing choices. It's append-only, reverse-chronological, and deliberately curated. Never silently append.

Scan the session for decision-shaped moments:

- **Architectural pivots** (runtime changes, schema changes, dependency swaps, asset-loading pattern changes).
- **Rejected-alternative moments** — any time Brady or the agent considered option A and picked option B for a reason that would be non-obvious six months from now.
- **Voice/UX calls** that override a rule or extend it.
- **Trade-offs accepted** — "we're keeping X broken because Y."

For each candidate, draft an entry in the existing DECISIONS.md format:
```
## YYYY-MM-DD — [short title]

**Decision.** [one paragraph, active voice]

**Why.**
- [bullet]
- [bullet]

**Implementation.** [file + line refs]

**Rejected.** [what was considered and dropped, and why]

**Drift risk.** [only if there's a maintenance trap, e.g., duplicated constants]
```

Present drafts to Brady inline. He approves, edits, or rejects. Only then apply.

**If nothing session-worthy surfaced, say so explicitly.** "No DECISIONS-worthy items this session" is a valid outcome — avoid padding the file.

---

## 4. ROADMAP adjustments (SURFACE)

Cross-reference shipped work against `docs/ROADMAP.md` (and `docs/ROADMAP_PHASES.md` if present).

- **Items that shipped** — propose moving them from "UP NEXT" / "IN PROGRESS" to "SHIPPED".
- **Items that became irrelevant** — session work may have invalidated a planned task. Surface it.
- **Items that changed priority** — if the session revealed a blocker or a dependency, flag it for re-sort.
- **New items the session generated** — bugs found, follow-ups noted. Propose adding.

Present as a short list of proposed edits. Brady approves, then apply.

---

## 5. Other doc health checks

### AGENTS.md drift check

Per `.claude/rules/token-efficiency.md`, AGENTS.md reloads every turn and must stay lean. Scan for session-specific content that crept in:

- References to current-sprint work ("Right now we're building X")
- This-week gotchas ("Watch out for the Y flow until we fix it")
- Specific commit references
- "TODO" or "WIP" mentions

Anything that reads like "current state, not evergreen" → propose moving to session-resume and removing from AGENTS.md.

### Stale session-resume files

If there are more than 3 `session-resume-*.md` files, flag the oldest for archival. (Don't auto-archive — Brady may still reference them.)

### BUILD_HISTORY.md

Only update if the session shipped a named feature or milestone. Small fixes don't belong here — that's what git log is for. If unsure, skip it. Better to miss an entry than to bloat the file.

### Plan docs (decision-engine-plan-*, email-infra-spec-*, etc.)

If the session worked on something covered by a plan doc, check if the plan's status/todos need updating. If yes, surface for Brady to review.

---

## 6. Next-session kickoff note

Last output. A tight block Brady can read when he opens the next session:

```
## Next session kickoff

**You are at:** main @ <sha>, branch <name> (<n> commits ahead of main / merged)
**Deploy status:** <in flight / live / last deployed YYYY-MM-DD HH:MM UTC>
**First thing to check:** <specific action — curl this URL, look at this file, run this command>
**Next action (from sprint):** <the one thing to start with>
**Parked / blocked:** <anything waiting on Brady's input>
```

Keep it to ~5 lines. This is what Brady scans when he comes back cold.

---

## 7. Final report

Print a summary:

```
Session handoff complete.
✅ Applied: session-resume updated (appended wave N / new file for YYYY-MM-DD)
🟡 Proposed for review: <N> DECISIONS entries, <N> ROADMAP moves, <N> AGENTS.md drift items
📌 Next session: <one-line kickoff>
```

If everything auto-applied and nothing needs review, say so cleanly. Don't manufacture work.

---

## When NOT to run this skill

- **Trivial sessions** — one-line config tweak, copy fix, typo. Brady can update the handoff by hand faster.
- **Mid-session** — this is an END-of-session skill. Running it in the middle produces a premature handoff that goes stale immediately.
- **When there's uncommitted in-progress work** — unless Brady confirms the state is a deliberate pause. Otherwise the handoff will claim "shipped" for things still sitting in the working tree.

If any of the above, say so and don't run.
