---
name: accessibility-review
description: Run a WCAG 2.1 AA accessibility audit across the app. Covers contrast, keyboard nav, screen reader support, focus management, semantic HTML, touch targets, motion preferences, and text resize. Three modes — full audit, changed-files audit, or focused category deep-dive. Use before deploys that touch UI, when Brady asks for an a11y pass, or as part of `/pre-push-review` sweeps.
---

# Accessibility Review — Inventory Full

WCAG 2.1 AA pass on the app's live surfaces. Not just contrast — full keyboard, screen-reader, focus, and motion coverage.

## Modes

### 1. Full audit (~60 min)
Every category below, every surface. Use at end of sprints, before major deploys, or quarterly.

### 2. Changed-files audit (~15 min)
Only the surfaces touched by current diff. Run via `git diff --name-only HEAD~1 components/ app/` to scope. Use in pre-push sweeps.

### 3. Focused audit (specify category or surface)
Deep-dive on one category (e.g. "focus management") or one surface (e.g. "Reroll modal only"). Use when a category is flagged or a specific component is being reworked.

## Scope — what to check

### A. Color contrast
- `text-faint`, `text-dim`, `text-muted`, `text-secondary` against all card backgrounds across all **13 themes**
- Button text against button bg in normal / hover / focus / disabled states
- Status badge text against badge bg (buried, on-deck, playing, played, bailed)
- Accent colors (purple, pink) against page bg and card bg
- Large text ≥18pt bold or ≥24pt regular: 3:1 minimum
- Small text <18pt: 4.5:1 minimum
- UI components (borders, icons-without-labels): 3:1 minimum

**Known history:** 90s theme contrast pass shipped 2026-04-20. Other themes passed `text-faint` raise on 2026-04-18. Re-verify when new themes ship or tokens change.

### B. Keyboard navigation
- Every interactive element reachable via Tab
- Focus indicator visible on every focusable element (not outline:none without replacement)
- Tab order matches visual reading order
- No keyboard traps (can tab OUT of every container)
- Esc closes modals
- Arrow keys work in listbox-style controls (sort dropdown, status selector)
- Enter/Space activate buttons
- Skip-to-content link on long pages (landing, stats)

**Priority surfaces:** Reroll modal, SettingsMenu (collapsible accordions — ensure keyboard-expandable), all Import modals, AddGameModal, ArchetypeCard with reroll button, GameCard actions menu.

### C. Screen reader labeling
- aria-label on every icon-only button (close X, reroll 🎲, status dots)
- aria-describedby for complex controls (pick modal mode buttons with subtext)
- aria-live="polite" on toast notifications, nudge reveals, stat changes
- aria-live="assertive" only for errors that interrupt flow
- aria-current="page" on active nav
- role="dialog" + aria-modal="true" + aria-labelledby on every modal
- Heading hierarchy: one h1 per page, no skipped levels
- `<main>`, `<nav>`, `<footer>` landmarks present

**Priority surfaces:** status badges ("playing" / "buried" / etc — announced?), reroll accept button subtext, GameCard cover image alt text, archetype tone (roast vs respect — announced?).

### D. Focus management
- Modal opens → focus moves to modal (first interactive element or close button)
- Modal closes → focus returns to trigger
- Tab-switch → focus moves to new tab panel first focusable
- Delete confirmations → focus on Cancel, not Confirm (safer default)
- Toast/nudge reveal → does NOT steal focus

**Priority surfaces:** Reroll modal return-to-trigger, Settings accordion expand, Tab nav focus handling, Import modal step transitions.

### E. Semantic HTML
- `<button>` for clickable actions, never `<div onClick>`
- `<a href>` for navigation, not buttons with window.location
- `<form>` wrapping related inputs with `<label>`
- `<nav>` for primary navigation
- `<main>` wrapping main content
- Heading levels match visual hierarchy

### F. Form accessibility
- Every input has `<label>` (explicit or aria-label)
- Required fields indicated both visually and via `required` / aria-required
- Error messages linked via aria-describedby
- Fieldset/legend for radio/checkbox groups (status cycle, sort options)

### G. Motion / animation
- `prefers-reduced-motion` respected: confetti on completion, nudge slide-ins, theme transitions, reroll spin
- No auto-advancing content
- No flashing >3 times/second (seizure risk)

**Known hot spot:** confetti celebration on completion. Verify reduced-motion path exists.

### H. Touch targets (mobile)
- Minimum 44x44px per WCAG 2.5.5
- Status badges (tap to advance) — are they 44px?
- GameCard tap area vs. sub-button tap areas — do they overlap/steal?
- Close X buttons on modals — 44px?
- Reroll action buttons (Let's Go, Not for me) — 44px + proper spacing?

### I. Text resize
- User can zoom to 200% without horizontal scroll on mobile
- Text-size setting (small/medium/large, live in SettingsMenu) doesn't break layouts
- Line-height remains readable at largest size

### J. Language
- `<html lang="en">` on root (verify in `app/layout.tsx`)
- lang attribute on foreign-language content (none currently)

### K. Status messaging
- aria-live region for nudges (finish check, stalled game, sync status)
- aria-live for import progress
- aria-live for reroll pick reveal ("Here's your pick: [game name]")

## Process

1. **Read scope.** Full audit → all surfaces. Changed-files → `git diff --name-only HEAD~1`. Focused → just the named category or surface.
2. **Read the rules.** Load `.claude/rules/user-psychology.md` and `.claude/rules/voice-and-tone.md` so recommendations respect brand voice (no robotic aria-labels).
3. **Automated checks first.** Verify class names, inline styles, role/aria attributes via grep. Fast signal on missing landmarks, raw divs-as-buttons, hardcoded colors.
4. **Dynamic checks.** Use preview MCP to render each theme, inspect contrast on real elements, tab through modals.
5. **Report.** Structured per-category findings with:
   - Severity: Critical / Serious / Moderate / Minor
   - File:line for every finding
   - Suggested fix (one-line or diff)
   - Pass/fail verdict on each category

## Severity rubric

- **Critical:** blocks assistive tech users entirely (no keyboard path, no labeled control, trap). Must fix before deploy.
- **Serious:** degrades experience significantly (missing focus return, unlabeled icon button with important action). Fix this sprint.
- **Moderate:** noticeable friction (suboptimal tab order, verbose label). Next sprint.
- **Minor:** polish (missing skip-link on short page). Backlog.

## Known state (as of 2026-04-20)

- **Shipped:** aria-tabs on status tabs (roadmap §"UI/UX"), aria-label on cover ✕ (Apr 18), theme contrast pass for text-faint on 10 themes (Apr 18), 90s accent/status pass (Apr 20).
- **Confirmed weak:** 90s systemic nav button contrast, Sample Library pill ~2.8:1, focus return on tab-switch unverified, reduced-motion on confetti unverified.
- **Not yet audited:** SettingsMenu accordion keyboard-expand, all import modal step transitions, ArchetypeCard reroll button label, live regions on nudges.

Run this skill, then update the "Known state" section of this SKILL.md with fresh findings so the next run starts from an accurate baseline.

## Report format

```
# Accessibility Audit — YYYY-MM-DD

## Summary
- X critical, Y serious, Z moderate, W minor
- Pass rate: N/11 categories

## Critical
### [file:line] Finding
Detail. Fix.

## Serious
...

## Moderate
...

## Minor
...

## Pass (no findings)
- Category names
```

## Example invocations

- "Run the accessibility review" → full audit
- "a11y on changed files" → `git diff` scope
- "a11y focus mgmt only" → focused on category D
- "audit the Reroll modal for a11y" → focused on one surface
- "run accessibility-review before the deploy" → changed-files mode, deploy-gate integration

## Integration

- Call from `/pre-push-review` skill as its Section 3 expansion (currently a one-paragraph check)
- Call from `/deploy` skill before any `git push` that modifies `components/` or `app/`
- Call on demand when refactoring an accessibility-sensitive surface
