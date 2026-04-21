---
name: session-close
description: End-of-session ritual. Pre-flight sweep, tidy docs, log decisions, update session-resume doc, scan ROADMAP/AGENTS.md for drift, suggest relevant reviews, optionally push/deploy, write a Brady OS handoff to the shared Handoffs bus, and print a next-session kickoff block. Trigger on "close session", "wrap session", "close us out", "close down", "we're done here", "session close".
---

# Session Close

End-of-session ritual for Inventory Full. Owns two artifacts:

1. **`docs/session-resume-YYYY-MM-DD.md`** — code-level state for the next Claude Code session in this repo.
2. **Brady OS handoff** at `/Users/bradywhitteker/Library/Mobile Documents/iCloud~md~obsidian/Documents/Handoffs/inbox/YYYY-MM-DD-inventory-full-[slug].md` — operator-level signal for the cross-project hub.

These are **different** artifacts with different readers. Do not duplicate content between them.

**Operating principle:** auto-apply low-stakes work (session-resume). Surface high-stakes changes (DECISIONS, ROADMAP, AGENTS.md edits, pushes) for Brady's explicit go/no-go. Never invent decisions.

---

## When NOT to run

- **Trivial session** — one-line tweak, typo, single copy fix. Brady updates the handoff by hand faster.
- **Mid-session** — this is END-of-session. Running mid-session produces a handoff that goes stale immediately.
- **Uncommitted in-progress work without intent** — unless Brady confirms the pause is deliberate, the handoff will claim "shipped" for files still in the working tree.

If any of these apply, say so and stop.

---

## Step 1 — Pre-flight sweep (report, wait for go)

Run in parallel, read-only:

- `git status` — uncommitted changes
- `git log --oneline origin/main..HEAD` — commits ahead of main
- `git log --oneline --since="yesterday" main` — work pushed straight to main this session
- `git diff --stat` (staged + unstaged) — rough shape of uncommitted work
- Scan recently touched files for stale `TODO`/`FIXME` worth surfacing
- Quick build sanity (skip full `npm run build` unless deploy is imminent)
- Read the most recent `docs/session-resume-*.md`
- Modified-but-not-finalized items in `docs/` (half-written DECISIONS entries, in-progress plans in `.claude/plans/`)

**Skip trivial commits** (typos, whitespace, reverts of this-session mistakes) when building the mental model of what shipped.

Report the sweep in one tight block. If anything reads like "shouldn't close with this hanging" (uncommitted work on hot files, broken build, half-written decision draft, plan doc out of sync, secrets in staged files), call it out and **wait for Brady's go/no-go**. Do not proceed until he answers.

---

## Step 2 — Tidy docs

For each WIP artifact the session produced or touched:

- Half-written `docs/DECISIONS.md` entries → offer to finalize or revert
- In-progress `.claude/plans/*.md` → offer to mark done, update status/todos, or leave
- Scattered session notes in `docs/` → offer to consolidate or defer
- Anything tagged "resolve at session close" → resolve now

Ask before moving files or rewriting content. Routine edits (mark a completed checkbox, bump a "Last updated" date) can proceed without asking.

---

## Step 3 — Decisions

Ask: **"Any decisions from this session worth logging?"**

Serves two destinations:
- `docs/DECISIONS.md` here — code/product decisions (architectural calls, feature locks, reversals, launch commits). Append-only, reverse-chronological, deliberately curated.
- The `decisions:` frontmatter field on the Brady OS handoff — operator-level commitments.

Decision-shaped moments to look for:
- Architectural pivots (runtime changes, schema changes, dependency swaps, asset-loading pattern changes)
- Rejected alternatives — option A considered, option B chosen for reasons that'd be non-obvious six months out
- Voice/UX calls that override or extend a rule
- Trade-offs accepted ("keeping X broken because Y")

For each real candidate, draft an entry in the existing DECISIONS.md format and present inline:

```
## YYYY-MM-DD — [short title]

**Decision.** [one paragraph, active voice]

**Why.**
- [bullet]
- [bullet]

**Implementation.** [file + line refs]

**Rejected.** [what was considered and dropped, and why]

**Drift risk.** [only if there's a maintenance trap]
```

Brady approves, edits, or rejects. Only then apply. **If nothing session-worthy surfaced, say so explicitly.** Narrative recaps ("we explored X") are not decisions — don't manufacture entries.

---

## Step 4 — Update `docs/session-resume-YYYY-MM-DD.md`

**Code-level state for the next Claude Code session in this repo.** Do NOT duplicate Brady OS handoff content here.

### Which file?

- Today's date vs. the most-recent `session-resume-*.md` filename.
- **Same day** → append a new wave to the existing file (e.g., "third wave" after "second wave"). Keep sprint-item numbering continuous.
- **New day** → create `docs/session-resume-YYYY-MM-DD.md`. Seed with a `⚡ START HERE` pointer to the prior file for deeper context, then only today's material. Do NOT copy yesterday's content forward.

### What goes in

- **Active sprint / current focus**
- **What shipped this session** — bulleted, with commit SHAs. One line per item unless context is needed. Order by importance, not chronology.
- **In-progress / uncommitted** — and why (paused, blocked, mid-task)
- **Verify on next session start** — anything that could silently regress (Vercel deploys, OG endpoints, Supabase migrations, third-party auth flows)
- **Rotting gotchas** that accumulated this session
- **Open design questions** for next session
- **Health snapshot** — build state, current `main` tip, known bugs
- **Timestamp** — end-of-day + timezone

### What stays out

- Blow-by-blow narrative. One line per ship. If a debug story is valuable, its own short section and only if the gotcha is likely to bite again.
- Rejected-alternatives reasoning — that's DECISIONS.md.
- Code snippets — link to commits.
- Emojis except the existing ✅ / ⚡ markers that match voice.

---

## Step 5 — Doc-health scans (surface, don't auto-write)

### ROADMAP adjustments

Cross-reference shipped work against `docs/ROADMAP.md` (and `docs/ROADMAP_PHASES.md` if present):
- Items that shipped → propose UP NEXT / IN PROGRESS → SHIPPED
- Items now irrelevant → surface
- Priority shifts (new blocker, new dependency) → flag for re-sort
- New items the session generated (bugs found, follow-ups) → propose adding

Short list of proposed edits. Brady approves, then apply.

### AGENTS.md drift

AGENTS.md reloads every turn — must stay lean (see `.claude/rules/token-efficiency.md`). Scan for session-specific content that crept in:
- "Right now we're building X" references
- This-week gotchas ("watch out for Y until we fix it")
- Specific commit references
- TODO/WIP mentions

Anything that reads like "current state, not evergreen" → propose moving to session-resume and removing.

### Stale session-resume files

If `docs/session-resume-*.md` has more than ~3 files, flag the oldest for archival. Don't auto-archive — Brady may still reference them.

### BUILD_HISTORY.md

Only update if the session shipped a named feature or milestone. Small fixes don't belong — that's what git log is for. If unsure, skip. Better to miss an entry than bloat the file.

---

## Step 6 — Suggest (don't auto-run) relevant reviews

Surface only what applies to this session, with a one-line "why":

- **`/pre-push-review`** — copy / user-facing / legal / policy changes staged or recently committed
- **`/accessibility-review`** or **`/theme-check`** — UI changed meaningfully (new components, layout shifts, theme token edits, color changes)
- **`/free-tier-audit`** — new external service touched, or free-tier-bound integration got heavier traffic
- **`/cross-browser`** — CSS features with known Safari/Firefox quirks used this session
- **`/mobile-best-practices`** — mobile-affecting change (viewport, safe area, touch targets, form UX)

Don't pitch the full menu. One or two targeted suggestions. Brady runs them; this skill doesn't.

---

## Step 7 — Push / deploy (opt-in only)

If there are commits ahead of main and deploy gates look clean, **ask** whether to push. Only push on explicit yes. For anything beyond a trivial push, defer to the existing `/deploy` skill — this skill never replaces or swallows it.

Never force-push. Never push with the pre-flight sweep unresolved.

---

## Step 8 — Write the Brady OS handoff

**Location:** `/Users/bradywhitteker/Library/Mobile Documents/iCloud~md~obsidian/Documents/Handoffs/inbox/YYYY-MM-DD-inventory-full-[slug].md`

**Slug:** 2–5 kebab-case words describing the session's through-line. Good: `launch-prep-email-templates`, `status-cycle-rename-and-og-v2`, `competitive-landscape-synthesis`. Bad: `tuesday-session`, `misc-fixes`, `updates`.

### Frontmatter

```
---
from: inventory-full
to: [brady-os]
date: YYYY-MM-DD
title: [short descriptive title — what Brady OS would call this note from the outside]
decisions:
  - [one line per real commitment — becomes a dated decision-log entry with a Mode tag on the Brady OS side. Omit field entirely if nothing.]
---
```

### Body sections

Only include sections with real content. Skip empty ones — don't write "N/A."

- **## Context** — one paragraph. What session this was, what the through-line was.
- **## For Brady OS**
  - **### Session shape** — 2–4 short bullets. Operator-level, not code-level.
  - **### State changes** — what's different about Inventory Full from the hub's perspective (status shifts, phase transitions, timeline updates, new infra connected, metrics moved). Drives pulse.md updates on the hub side.
  - **### Patterns noticed** — working style, cognitive pattern, friction signal. Only when there's real signal. Skip if routine.
  - **### Cross-project signal** — if something matters for Slant, Luma, Speakeasier, or Holograms Razor, say so with a pointer. Skip if nothing.
  - **### What Brady OS pages need touching (if any)** — describe the *area* or *theme* that should be refreshed on the hub side, not a filename. The Brady OS ingester owns its own wiki schema; this repo shouldn't track or guess page names (they rot). Phrase it like: *"On Brady OS's side, the area covering [theme] should be refreshed — exact page is the ingester's call."* Drives ingest without cross-repo coupling.

### Do NOT include

- Code diffs, file paths, function names, implementation details
- Feature specs (those stay in `docs/` here)
- Day-to-day work artifacts (drafts, iterations, in-progress notes)
- Routine bug fixes unless they change the project's story
- Padding, hedge-phrases, narrative filler
- Anything that only matters inside this repo
- **Self-referential notes about the handoff mechanism itself** — don't explain what the `decisions:` frontmatter does or doesn't do, don't narrate what Brady OS will do with this note. Brady OS knows its own ingest flow. Prose like "no decision-log entry needed beyond the frontmatter" is pure noise.
- **Guessed Brady OS page names.** This repo does not track the hub's wiki schema. Describe themes/areas, not filenames.

### Sanity checks before writing

- Would a reader who last saw Brady OS's inventory-full pages get a meaningfully updated picture?
- Is each `decisions:` line a real commitment, or narrative in disguise?
- Any claims that'd contradict Brady OS's current pages? Phrase them so the ingester flags rather than silently overwrites.
- Is the note dense? Padding = should be shorter or skipped.

### When to skip entirely

No Brady-OS-relevant signal (pure refactor day, nothing shipped, no decisions, no state change, no cross-project signal) → **skip**. Say: *"No handoff written — no operator-level signal from this session."* Clean skip beats noise handoff.

### Edge cases

- **Decisions but no narrative change** → thin handoff: `decisions:` populated, body may be only `## Context` + brief `### State changes`.
- **Session ended mid-task** → note in session-resume (next session here), NOT in the handoff (not hub-relevant until it lands).

---

## Step 9 — Next-session kickoff block

Print this as the last thing before the final report. ~5 lines. What Brady scans when he opens cold:

```
## Next session kickoff

**You are at:** main @ <sha>, branch <name> (<n> commits ahead of main / merged)
**Deploy status:** <in flight / live / last deployed YYYY-MM-DD HH:MM TZ>
**First thing to check:** <specific — curl this URL, look at this file, run this command>
**Next action (from sprint):** <the one thing to start with>
**Parked / blocked:** <anything waiting on Brady's input>
```

---

## Step 10 — Final report

One tight summary:

```
Session close complete.
✅ session-resume: <path> (appended wave N / new file)
✅ Handoff: <path> (or "skipped — no operator-level signal")
🟡 Surfaced for review: <N> DECISIONS drafts, <N> ROADMAP moves, <N> AGENTS.md drift items
📦 Deploy: <pushed / not pushed / n/a>
💡 Reviews suggested: <list or "none">
```

Then stop.

---

## Boundaries

- Don't touch Brady's Workspace or the Handoffs bus beyond writing the single handoff file in `inbox/`. Moving to `processed/`, updating `pulse.md`, editing wiki pages — those are Brady OS's job.
- Don't change the SessionStart hook or `settings.json` unless Brady asks.
- Don't bundle into `/deploy` or `/pre-push-review`. This skill can offer to run them; it does not replace or swallow them.
- Don't invent decisions to populate the `decisions:` field.
- Don't silently append to DECISIONS.md, ROADMAP.md, or BUILD_HISTORY.md — always surface for approval.
