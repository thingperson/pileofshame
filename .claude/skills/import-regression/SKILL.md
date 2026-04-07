---
name: import-regression
description: Audit all import modal components for visual regressions, broken imports, accessibility, and text sizing. Run after typography or layout changes.
---

# Import Flow Regression Test

Audit all import modal components for regressions in structure, accessibility, text sizing, and broken imports. This is a static code analysis, not a browser test.

## Components to Audit

Read each file and perform the checks below:

1. **`components/SteamImportModal.tsx`** - Steam library import
2. **`components/PSNImportModal.tsx`** - PlayStation Network import
3. **`components/XboxImportModal.tsx`** - Xbox/Game Pass import (gamertag input, profile confirm step, game select step)
4. **`components/PlayniteImportModal.tsx`** - Playnite CSV file upload
5. **`components/SteamWishlistModal.tsx`** - Steam wishlist import
6. **`components/GameSearch.tsx`** - Manual game search
7. **`components/AddGameModal.tsx`** - Add game manually modal
8. **`components/ImportHub.tsx`** - Import hub orchestrator

## Check 1: Broken Imports

For each component, verify:
- All `import` statements resolve to existing files
- No circular imports between import components
- All imported components/hooks/utils exist in the codebase
- No imports from deleted or renamed modules

```bash
# For each component, extract imports and verify targets exist
grep "^import" components/SteamImportModal.tsx
# Check each imported path
```

## Check 2: Text Sizing Floor

Our minimum text size is `text-xs` (12px). No user-facing text should be smaller.

For each component, flag:
- Any `text-[9px]`, `text-[10px]`, `text-[11px]` or similar arbitrary small sizes
- Any `text-xxs` or custom tiny text classes
- `font-size` inline styles below 12px

**Exception:** Decorative/non-essential text (e.g., version numbers, debug info) can be smaller.

## Check 3: Form Input Labels

Every form input (`<input>`, `<textarea>`, `<select>`) must have one of:
- An associated `<label>` element with `htmlFor` matching the input's `id`
- An `aria-label` attribute on the input
- An `aria-labelledby` attribute pointing to a visible label
- A wrapping `<label>` element

Flag any inputs missing all of these.

## Check 4: Button Accessibility

Every `<button>` must have:
- Visible text content, OR
- An `aria-label` attribute
- Icon-only buttons (emoji, SVG) MUST have `aria-label`

Flag any buttons with only an icon/emoji and no accessible label.

## Check 5: Loading & Error States

Each import modal should have:
- A loading state (spinner, skeleton, or text indicator) during API calls
- An error state that displays a user-readable message on failure
- The error message should NOT expose raw API errors or stack traces

For each component, check:
- Does it have a `loading` or `isLoading` state variable?
- Does it render something different when loading is true?
- Does it have an `error` state variable?
- Does it render the error to the user?
- Does it have a retry or dismiss mechanism for errors?

## Check 6: Modal Structure

Each modal should follow this pattern (matching the Reroll modal):
- `role="dialog"` and `aria-modal="true"` on the modal container
- Backdrop click handler to close/dismiss
- Escape key handler to close/dismiss (check for `onKeyDown` or `useEffect` with keydown listener)
- Close/X button visible and accessible
- `aria-label` or `aria-labelledby` on the dialog

Flag any modals missing these attributes.

## Check 7: Button Legibility

All buttons should use `text-sm` (14px) or larger for primary actions. Secondary/tertiary actions can use `text-xs` (12px) but not smaller.

Check for:
- Primary action buttons (submit, import, confirm) using `text-xs` or smaller — flag as warning
- Any button using arbitrary small sizes (`text-[10px]`, etc.) — flag as error

## Check 8: Step Flow Integrity (Xbox Import)

The Xbox import has a multi-step flow. Verify:
- Step 1: Gamertag input
- Step 2: Profile confirmation (shows profile data, user confirms it's them)
- Step 3: Game selection (shows games, user picks which to import)
- Each step has a back/cancel option
- Progress is indicated (step numbers, progress bar, or similar)

## Check 9: File Upload (Playnite Import)

The Playnite import uses file upload. Verify:
- File input accepts `.csv` files
- There's user feedback after file selection (filename displayed, parsing status)
- Error handling for invalid/malformed CSV
- The drop zone or file input has accessible labeling

## Output Format

For each component:

```
## [Component Name]

Status: PASS / FAIL / WARN (X issues)

### Issues Found:
- [CHECK_NAME] [SEVERITY: ERROR/WARN] Description of the issue
  Location: line XX
  Fix: Suggested remediation

### Passing Checks:
- [CHECK_NAME] PASS
- ...
```

### Summary

```
| Component | Imports | Text Size | Labels | Buttons | Loading | Error | Modal | Overall |
|-----------|---------|-----------|--------|---------|---------|-------|-------|---------|
| SteamImport | PASS | PASS | WARN | PASS | PASS | PASS | PASS | WARN |
| PSNImport | PASS | FAIL | PASS | PASS | PASS | PASS | PASS | FAIL |
| ... |
```

**Overall verdict:** PASS (all green) / FAIL (any errors) / WARN (warnings only, no blockers)
