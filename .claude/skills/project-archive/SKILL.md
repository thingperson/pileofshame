---
name: project-archive
description: Index to Inventory Full's historical build archive. Points to three split docs (build history, roadmap phases 3-5, blue sky + philosophy + brand naming). Use /project-archive when you need historical context about what was built and why.
disable-model-invocation: true
---

# Inventory Full — Project Archive (Index)

This skill used to be a 1200-line monolith. It's now an index that points at three purpose-built docs in `/docs`. Read only the one you need — do not load all three unless the task genuinely spans every topic.

## Context

Inventory Full (live at `inventoryfull.gg`) is a gaming backlog matchmaker. Core loop: **Import → Tell us your mood → We find your game → Play → Celebrate.** Built on Next.js 16 + React 19 + Tailwind v4 + Zustand + Supabase. See `AGENTS.md` for evergreen stack/architecture facts — don't duplicate them here.

## The three docs

### `docs/BUILD_HISTORY.md`
Every shipped feature from Phase 1 (MVP) and Phase 2 (Post-MVP), numbered items 1-93. Use when you need to check whether something was already built, when it shipped, or recover the implementation summary of a past feature. Feature-archaeology reference, not planning.

### `docs/ROADMAP_PHASES.md`
Forward-looking planning: queued priorities (HIGH/MEDIUM/LOW), the Phase 3 paradigm shift rationale, Phase 3 (Smart Library + Mood-First UX), Phase 4 (Future), Phase 5 (Multi-Vertical Expansion). Also contains the locked product thesis, competitive audit + matrix, and moat-work build order. Use when deciding what to build next or weighing a feature request against strategy.

### `docs/BLUE_SKY.md`
Philosophy + psychology foundation, speculative feature wishlist (gaming + analog verticals), brand/naming decision history, and the key design tokens. Use when thinking about positioning, brand voice, speculative features, or when someone asks "why did we pick the name Inventory Full?"

## How to use this skill

1. Identify which doc matches the question (past / future / why).
2. Read ONLY that doc. They're large — don't load all three.
3. For truly cross-cutting questions, start with `ROADMAP_PHASES.md` (most strategic density) and branch from there.

Current-state context (what shipped this week, in-progress items) lives in `docs/session-resume-*.md`, not here. This archive is evergreen history + plans.
