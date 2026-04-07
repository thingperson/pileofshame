---
name: cross-browser
description: Generate a manual cross-browser testing checklist based on recent changes. Flags CSS features with known Safari/Firefox compatibility issues.
---

# Cross-Browser Testing Checklist Generator

Generate a manual testing checklist based on recent code changes. Since we can't run browsers from CLI, this produces a structured checklist for manual testing across Safari iOS, Safari macOS, Chrome, and Firefox.

## Procedure

### 1. Identify Recent Changes

Run:
```bash
git log --oneline -5
```

For each commit, get the changed files:
```bash
git diff HEAD~5 --name-only
```

Read the changed files to understand what was modified.

### 2. Scan for Known Cross-Browser Problem Patterns

Search the changed files for these CSS features and flag any found:

#### CSS Features with Known Issues

| Feature | Problem | Browsers Affected | Severity |
|---------|---------|-------------------|----------|
| `dvh` / `svh` / `lvh` units | Safari iOS handles dynamic viewport differently. `100vh` includes the URL bar; `100dvh` adjusts but may cause layout jumps. | Safari iOS | HIGH |
| `backdrop-filter` | Needs `-webkit-backdrop-filter` prefix in Safari. Without it, blur effects won't render. | Safari (all) | HIGH |
| `color-mix()` | Not supported in Safari < 16.2, Firefox < 113. Falls back to nothing (transparent). | Older Safari, older Firefox | MEDIUM |
| `max-height` transitions | Safari sometimes doesn't animate `max-height` from `0` to a computed value. Use explicit pixel values. | Safari (all) | MEDIUM |
| `opacity` + `transform` transitions | Combining these in a single transition can cause flicker in Safari. Use `will-change` or separate transitions. | Safari (all) | LOW |
| `overflow: hidden` + `border-radius` | Safari has a known clip bug where `overflow: hidden` doesn't clip children to `border-radius`. Add `-webkit-mask-image: -webkit-radial-gradient(white, black)` as fix. | Safari (all) | MEDIUM |
| `gap` in flexbox | Not supported in Safari < 14.1. Use margins as fallback or check min browser target. | Safari < 14.1 | LOW (mostly resolved) |
| `aspect-ratio` | Not supported in Safari < 15. Use padding-bottom hack as fallback if needed. | Safari < 15 | LOW |
| `@container` queries | Not supported in Safari < 16, Firefox < 110. | Older browsers | MEDIUM |
| `has()` selector | Not supported in Firefox < 121. | Older Firefox | MEDIUM |
| `scrollbar-width` | Not supported in Safari (any version). Use `::-webkit-scrollbar` for WebKit. | Safari (all) | LOW |
| `localStorage` quota | Safari private browsing limits localStorage to ~5MB and may throw on writes. Our app relies on localStorage for game library. | Safari private browsing | HIGH |
| `position: sticky` | Works but has quirks with `overflow` ancestors in Safari. | Safari (all) | LOW |
| `text-wrap: balance` | Not supported in Safari < 17.4, Firefox < 121. | Older browsers | LOW |
| `animation` with `prefers-reduced-motion` | Check that motion-heavy themes (80s, Weird) respect this media query. | All browsers | MEDIUM |

#### JavaScript Features to Check

| Feature | Problem | Browsers Affected |
|---------|---------|-------------------|
| `structuredClone()` | Not in Safari < 15.4 | Older Safari |
| `Array.at()` | Not in Safari < 15.4 | Older Safari |
| `crypto.randomUUID()` | Not in Safari < 15.4, Firefox < 95 | Older browsers |
| `sessionStorage` | Same quota issues as localStorage in Safari private | Safari private |
| `ResizeObserver` | Supported everywhere modern, but callback timing differs | All |

### 3. Check Component-Specific Patterns

For each changed component file, also check:

- **Modals**: Do they use `dvh` for max-height? Safari iOS needs this but desktop Safari may not.
- **Animations**: Are `@keyframes` using `transform` properties that might conflict?
- **Images**: Are they using `loading="lazy"`? Safari < 15.4 doesn't support it natively.
- **Scroll containers**: Do they use `scrollbar-hide` class? Check both `-webkit-scrollbar` and `scrollbar-width`.
- **Touch events**: Any `onClick` on non-interactive elements? iOS Safari requires `cursor: pointer` for click events on `div`/`span`.

### 4. Generate Checklist

Output a structured checklist organized by browser:

```
# Cross-Browser Testing Checklist
Generated: [date]
Based on commits: [list of recent commit hashes]

## Changes to Test

1. [Brief description of change 1]
2. [Brief description of change 2]
...

## Flagged CSS/JS Features in Changed Files

- [file.tsx:XX] `backdrop-filter` used without `-webkit-` prefix
- [file.tsx:XX] `dvh` unit used - test on Safari iOS
- ...

## Safari iOS (iPhone)

- [ ] [Change 1]: [Specific thing to verify]
- [ ] [Change 1]: Viewport height doesn't jump when URL bar shows/hides
- [ ] [Change 2]: [Specific thing to verify]
- [ ] Import flow: localStorage writes succeed in private browsing
- [ ] Modal max-height doesn't overflow the viewport
- [ ] Touch targets are at least 44x44px

## Safari macOS

- [ ] [Change 1]: [Specific thing to verify]
- [ ] backdrop-filter blur renders on modal overlays
- [ ] Scrollbar styling matches expected appearance
- [ ] [Change 2]: [Specific thing to verify]

## Chrome (Desktop + Mobile)

- [ ] [Change 1]: [Specific thing to verify]
- [ ] No console errors on page load
- [ ] [Change 2]: [Specific thing to verify]

## Firefox

- [ ] [Change 1]: [Specific thing to verify]
- [ ] color-mix() renders correctly (if used)
- [ ] Scrollbar uses scrollbar-width (not just -webkit-)
- [ ] [Change 2]: [Specific thing to verify]

## All Browsers

- [ ] prefers-reduced-motion: animations disabled/reduced
- [ ] prefers-color-scheme: no unexpected behavior with themed app
- [ ] Keyboard navigation: Tab order makes sense, focus visible
- [ ] Text doesn't overflow containers at 200% zoom
```

### 5. Theme-Specific Browser Checks

If any theme CSS was changed, add:

```
## Theme-Specific Checks

### [Theme Name]
- [ ] Safari: `-webkit-background-clip: text` renders correctly (gradient text)
- [ ] Safari: `filter: drop-shadow()` works on headings
- [ ] Firefox: `animation` compositing doesn't cause jank
- [ ] All: `background-attachment: fixed` works (known mobile Safari issue)
- [ ] iOS: `background-attachment: fixed` fallback (mobile Safari ignores this)
```

### 6. Standing Checks (Always Include)

These apply to every cross-browser check regardless of changes:

```
## Standing Checks (Every Release)

- [ ] Import a game via Steam on Safari iOS
- [ ] Open the Reroll modal on Safari iOS (viewport + touch targets)
- [ ] Switch themes on Firefox (CSS variable cascade works)
- [ ] localStorage: Open app in Safari private browsing, verify it works or fails gracefully
- [ ] Game card interactions: long-press on iOS doesn't trigger context menu unexpectedly
- [ ] Comfortable text size toggle: renders correctly across all browsers
```
