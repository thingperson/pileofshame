---
name: theme-check
description: Audit all themes for WCAG contrast ratios, text legibility, and color distinguishability. Run after theme changes or before major deploys.
---

# Theme Contrast & Legibility Audit

Audit all 13 themes defined in `app/globals.css` for WCAG contrast compliance and color distinguishability.

## Setup

1. Read `app/globals.css` and extract CSS variable definitions from each theme block:
   - Default (`:root` / `@theme` block)
   - `.theme-90s`
   - `.theme-80s`
   - `.theme-future`
   - `.theme-light`
   - `.theme-dino`
   - `.theme-weird`
   - `.theme-ultra`
   - `.theme-void`
   - `.theme-cozy`
   - `.theme-minimal`
   - `.theme-tropical`
   - `.theme-campfire`

2. For each theme, extract these CSS variable hex values:
   - `--color-bg-primary`
   - `--color-bg-card`
   - `--color-bg-elevated`
   - `--color-border-subtle`
   - `--color-text-primary`
   - `--color-text-secondary`
   - `--color-text-muted`
   - `--color-text-dim`
   - `--color-text-faint`
   - `--color-accent-purple`
   - `--color-accent-pink`
   - `--color-status-buried`
   - `--color-status-on-deck`
   - `--color-status-playing`
   - `--color-status-played`
   - `--color-status-bailed`

## Contrast Ratio Checks

Calculate approximate WCAG contrast ratios from hex values using the relative luminance formula:

```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B
(where R/G/B are linearized: value <= 0.03928 ? value/12.92 : ((value+0.055)/1.055)^2.4)
Ratio = (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter
```

### Check 1: Text Contrast (WCAG AA = 4.5:1 minimum for normal text)

For each theme, check these pairs:
| Foreground | Background | Required Ratio |
|------------|------------|----------------|
| `--color-text-primary` | `--color-bg-primary` | 4.5:1 |
| `--color-text-primary` | `--color-bg-card` | 4.5:1 |
| `--color-text-secondary` | `--color-bg-primary` | 4.5:1 |
| `--color-text-secondary` | `--color-bg-card` | 4.5:1 |
| `--color-text-muted` | `--color-bg-primary` | 4.5:1 |
| `--color-text-muted` | `--color-bg-card` | 4.5:1 |
| `--color-text-dim` | `--color-bg-primary` | 3:1 (large text / secondary info) |
| `--color-text-dim` | `--color-bg-card` | 3:1 |
| `--color-text-faint` | `--color-bg-primary` | 3:1 |
| `--color-text-faint` | `--color-bg-card` | 3:1 |

### Check 2: Accent Visibility (WCAG AA = 3:1 for interactive elements / large text)

| Foreground | Background | Required Ratio |
|------------|------------|----------------|
| `--color-accent-purple` | `--color-bg-primary` | 3:1 |
| `--color-accent-purple` | `--color-bg-card` | 3:1 |
| `--color-accent-pink` | `--color-bg-primary` | 3:1 |
| `--color-accent-pink` | `--color-bg-card` | 3:1 |

### Check 3: Status Color Distinguishability

For each theme, check that all 5 status colors (`buried`, `on-deck`, `playing`, `played`, `bailed`) against `--color-bg-card`:
- Each must have at least 3:1 contrast ratio
- All 5 must be visually distinguishable from each other (no two should be identical or near-identical)

### Check 4: Border Visibility

| Foreground | Background | Note |
|------------|------------|------|
| `--color-border-subtle` | `--color-bg-card` | Should have perceptible difference (ratio > 1.1:1) |
| `--color-border-subtle` | `--color-bg-primary` | Should have perceptible difference (ratio > 1.1:1) |

## Output Format

For each theme, output:

```
## [Theme Name]

PASS / FAIL (X issues)

Failures:
- [foreground] on [background]: X.X:1 (required Y.Y:1) - FAIL
- ...

Warnings:
- text-faint on bg-card: 2.8:1 (required 3:1) - borderline
- ...
```

### Summary Table

After all themes, output a summary:

```
| Theme | Text | Accents | Status | Borders | Overall |
|-------|------|---------|--------|---------|---------|
| Default | PASS | PASS | PASS | PASS | PASS |
| 90s | PASS | FAIL | PASS | PASS | FAIL |
| ... |
```

## Common Failure Patterns

Flag specifically:
- `--color-text-faint` below 3:1 against any background (most common failure across themes)
- `--color-text-dim` below 3:1 against card backgrounds
- Void theme: intentionally low contrast is a design choice, but note it
- Light theme: check dark text on white/light backgrounds (usually passes but accent colors may struggle)
- Weird theme: unconventional status colors may not be distinguishable

## Notes

- Some themes (Void, Weird) are intentionally unusual. Still flag issues, but note if the low contrast is clearly a design choice.
- `!important` declarations on CSS variables don't change the hex value. Strip them when extracting.
- For `rgba()` values on borders, convert to approximate hex against the background color for contrast calculation.
- If a theme uses the same color for both card and primary background (e.g., Void: both #000000), skip the duplicate check.
