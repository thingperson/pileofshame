# Token Efficiency — Default Behaviors

This rule is loaded every session. Follow these defaults to keep Brady's context window (and bill) small. He is a solo builder paying out of pocket; every re-read and re-loaded conversation compounds.

## The cost model (so I judge edge cases correctly)

- **Every turn re-sends the full prior conversation.** A 2-hour session across 3 topics costs far more than three 30-min focused sessions.
- **Files I read stay in my context the whole session.** A subagent reading the same file returns only a summary. Prefer subagents for reads I don't need line-by-line.
- **AGENTS.md + rule files load every turn.** Keep them lean; put rotting state in `docs/` instead.
- Input prompt length is trivial compared to tool results and file reads. Brady writes naturally — don't penalize that.

## Defaults

### 1. Delegate research reads to Explore / Agent subagents

Spawn a subagent (default: `Explore`) when the task is:
- "How does X work?" / "Where is Y used?" / "What does Z do?"
- Multi-file investigation (2+ files I'd have to read)
- "Summarize this large file"
- Open-ended search across the codebase
- Audit-style questions ("are there any places that…", "find all instances of…")

Do NOT delegate when:
- I already know the exact file + line to edit
- The edit is a targeted 1–3 line change and I know where
- Brady references a file already in my context (see §3)

When unsure, delegating is cheaper than not. Subagent summaries cost ~hundreds of tokens; me reading the file costs thousands.

### 2. One session = one topic, roughly

If Brady says "ok now let's do [unrelated thing Z]," suggest starting a fresh session before diving in. Don't be precious about it — say one line: *"Fresh session would be cheaper here — this is unrelated to what we just loaded."* He decides.

Signals for "start fresh":
- Topic shift away from what's already in context
- He's describing a new feature/bug with no overlap to prior work
- We just finished something and he's opening a new thread

Signals for "keep going":
- Continuation of the current thread (even hours later)
- Debugging something we were just looking at
- Iterating on code we just touched

### 3. Phrasing interpretation — do not re-read what I already have

Brady's natural phrasing often sounds like a fresh request but is actually a reference to something already in my context. Interpret charitably:

| He says | Interpretation |
|---|---|
| "look at GameCard again, I see something" | File is already loaded. Reference it, don't Read again. |
| "wait, go back to that file" | Already in context. Don't Read. |
| "the reroll logic we just looked at" | Already in context. |
| "check line 40 of that" | Already in context — cite it. |
| "look at GameCard" (first mention this session) | Fresh Read is correct. |
| "I changed GameCard, take another look" | File may have changed on disk — Read is correct. |
| "can you check X in the codebase" (no prior ref) | Fresh search/Read is correct. |

Default: **if I've already Read a file this session and Brady hasn't said he changed it, treat my prior view as current.** Just reference the line, don't re-load.

### 4. No speculative "while I'm here" reads

- Don't pre-load files "in case." If the task doesn't need them, leave them.
- Don't chain "let me also check Y" unless Y is genuinely required to answer the current question.
- For small targeted edits where I know the location, just make the edit.

### 5. Keep AGENTS.md / rules lean

AGENTS.md reloads every turn. Rotting state (what shipped this week, current in-progress items, recent gotchas) belongs in `docs/session-resume-*.md` or similar, loaded on demand at session start — not in AGENTS.md.

If I notice AGENTS.md drifting toward session-log content, flag it for trimming.

### 6. Session opener pattern

At the start of a session, if Brady wants current state, point him at `docs/session-resume-*.md` (most recent) rather than expecting it from my memory files. My memory files are snapshots, and they drift.

## Quick self-check before any Read / Grep

Before I reach for Read, Grep, or Glob, ask:
1. Is this already in my context? → just reference it
2. Would a subagent summary suffice? → spawn Explore
3. Do I actually need the full file for this edit? → if yes, Read; if no, Grep for the specific line

Default toward Explore for anything exploratory. Default toward direct Read only for known-location edits.
