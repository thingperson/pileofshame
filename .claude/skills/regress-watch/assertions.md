# Regress Watch — Assertion Library

Trimmed catalog. Each assertion is here because either (a) it encodes a specific prior production bug as a `regress-*` check, (b) it covers a surface no other skill touches (OG runtime split, pixel-sprite render), or (c) it's a process pattern.

**Categories handled by other skills, not duplicated here:**
- General WCAG contrast → `/theme-check`
- Touch targets / mobile-only checks → `/mobile-best-practices`
- Voice charter / banned vocab → `/pre-push-review`
- Full a11y (focus, semantics, alt text, screen reader) → `/accessibility-review`

If a finding belongs in one of those, hand off rather than encode here.

Don't delete a `regress-*` without a DECISIONS entry — they're load-bearing institutional memory.

---

## Pages of record

| Page | Path | Notes |
|---|---|---|
| Landing (no games) | `/` with empty store | NinetiesMode hero + landing CTA path |
| App (with games) | `/` with games | TabNav + game cards path |
| About | `/about` | Canonical product narrative |
| Stats | `/stats` | Value calc + archetype + Pick CTA |
| Pile OG | `/pile/<id>/opengraph-image` | Archetype-reveal share card (edge runtime) |
| Clear OG | `/clear/<id>/opengraph-image` | Game-cleared share card (Node runtime, fs.readFile) |

## In-app states

| State | How to reach |
|---|---|
| Picker pre-roll | Click "Pick My Game" (or press R) |
| Picker post-pick | After Roll fires |
| Post-accept overlay | After "Let's go" |
| Share composer | Inside CompletionCelebration |

---

## Wordmark integrity

Brady has caught 3 wordmark regressions in production. These exist because wordmark variants share an SVG with multiple labeled paths and different `viewBox` crops select which paths show.

### `regress-wordmark-no-orphan-punctuation`
**Surface:** any page rendering `<Wordmark variant="tagline">`.
**Check:** the visible glyphs are "get playing." — no stray ".gg" floating above, no clipped letters.
**Method:** `vision` (screenshot, describe what's visible).
**Why this exists:** the `tagline` variant's authored viewBox once cropped to show only the ".gg" of "get playing.gg" — root cause: viewBox was authored from master canvas coords without bbox math. Any future variant added to `Wordmark.tsx` must pass this check.

### `regress-wordmark-not-bungee-fallback`
**Surface:** OG cards (`/pile/<id>`, `/clear/<id>`).
**Check:** the visible "Inventory Full" mark is the brand SVG path, not Bungee or any system font fallback.
**Method:** `inspect` on the wordmark element — if it's `<img>` or `<svg>`, pass; if it's a `<text>` element with `font-family: Bungee` or system fallback, fail.
**Why this exists:** an early OG card was generated with Bungee inline as a placeholder and shipped that way. Hard fail — brand asset must be the SVG.

### `regress-no-redundant-wordmark`
**Surface:** landing (`/` with empty store), `/about`.
**Check:** there is exactly one wordmark *within the hero region* (not page-wide; header wordmark + hero wordmark on different surfaces is acceptable).
**Method:** `eval` — query for visible wordmark SVGs/imgs whose bounding box overlaps the first hero/section block, count must be ≤ 1.
**Why this exists:** DefaultBanner renders a wordmark; LandingPage was rendering its own hero wordmark; both fired during the empty state. *(First-run learning: the prior version of this assertion counted page-wide and false-positived on /about because header wordmark + hero tagline live in different regions. Region-scoped now.)*

---

## Header / layout

### `regress-header-no-double-stack`
**Surface:** landing (`/` with empty store).
**Check:** the page top is one integrated header row, not two stacked rows separated by a black bar.
**Method:** `vision` (screenshot describe).
**Why this exists:** DefaultBanner + LandingPage nav both rendered, producing a stacked header with a black separator strip between them.

### `header-single-row-on-desktop`
**Surface:** all pages, viewport ≥ 1024px.
**Check:** the wordmark + "Open app" + "Sign in" sit in a single horizontal row. No wrap.
**Method:** `eval` — get bounding boxes of header children, all top values within ±4px.
**Why this is here:** companion to `regress-header-no-double-stack` — that assertion catches the rendering symptom, this one catches the structural cause.

---

## Hero / illustration

### `regress-hero-not-dino`
**Surface:** any place using platform-aware celebration imagery (when implemented).
**Check:** described comp imagery matches what's in `public/og-assets/` — *don't infer the subject from filename or vibe*. If asked to evaluate a comp, list the file path, read the actual asset, then describe what's in it.
**Method:** `vision` + asset-read.
**Why this exists:** Claude described a "dino mascot" in a comp that was actually a hand holding a controller. This is a *process* assertion, not a renderable check — it lives here so the skill author re-reads it and remembers to verify before describing.

---

## Tab nav (in-app)

### `tabnav-sprites-render`
**Surface:** `/` with games, all four tabs visible.
**Check:** each tab button contains a non-empty `<svg>` (sprite rendered, not just emoji fallback).
**Method:** `eval` — count `[role="tab"] svg path` per tab, must be > 5 (sprites have many path nodes).
**Why this is here:** the pixel-sprite system is unique to us; no other skill validates that the named sprite system actually rendered vs falling back to emoji.

### `regress-tabnav-muted-teal-v2.1`
**Surface:** `/` with games.
**Check:** Up Next + Completed tab sprites use `#1a9e86`, not `#2ee8c4` or `#34d399`.
**Method:** `eval` — collect rendered fills via `getComputedStyle`, expected color present in at least Up Next + Completed.
**Why this exists:** wave-2 → wave-2.1 sprite swap changed these specific colors. Regression detector for any future wave that accidentally reverts.

### `regress-void-theme-aa`
**Surface:** `/` with games, theme = void.
**Check:** `text-dim` ≥ 4.5:1 against `#000`; `accent-pink` ≥ 4.5:1 against `#000`.
**Method:** `inspect` + ratio compute.
**Why this exists:** void theme tokens were failing AA (text-dim 1.95:1, accent-pink 1.32:1) until the 2026-04-25 contrast bump. This is a *named-bug* check, not a general theme audit — `/theme-check` does the full sweep across all themes. Permanent regression check on this specific past failure.

---

## OG cards (runtime split smoke)

The OG runtime split is unique to this codebase: clear card uses Node runtime + `fs.readFile`, root + pile use edge with gstatic fonts. Drift between the two breaks rendering. No other skill checks this.

### `og-pile-renders`
**Surface:** `/pile/test-id/opengraph-image` (or any valid pile id).
**Check:** response is an image, dimensions 1200×630, not an error page.
**Method:** `eval` — fetch the URL, check `Content-Type: image/*` + dimensions.

### `og-clear-renders`
**Surface:** `/clear/test-id/opengraph-image`.
**Check:** same as above. Clear card uses Node runtime + `fs.readFile`; this catches accidental edge-runtime drift.
**Method:** `eval`.

### `og-no-webp-img`
**Surface:** any OG route source file.
**Check:** no `<img src="*.webp">` in OG route components — satori crashes on webp.
**Method:** `Bash` grep against `app/**/opengraph-image.tsx` files.
**Why this is here:** specific satori crash documented in `docs/DECISIONS.md` 2026-04-21.

---

## Process assertions

These don't run as automated checks — they're reminders the skill author reads before describing visuals.

### `process-read-the-asset`
Before describing what's in any image / SVG / comp file, list the path and read it. Don't infer subject from filename, surrounding copy, or session context.

### `process-no-designers-call-on-contrast`
Contrast failures are blockers, not subjective. If a contrast assertion fails (here or in `/theme-check`), surface it as a hard fail with a proposed color fix. Don't frame it as "designer's call."

### `process-describe-don't-summarize`
On screenshot vision-checks, name the elements and their positions. "Looks aligned" is not enough. "Wordmark sits at x=120, header midline at x=128 — within ±2px tolerance, pass" is enough.

### `process-trust-computed-style-on-mismatch`
**Known artifact:** scroll-driven CSS animations (`animation-timeline: view()`, IntersectionObserver fade-ins, parent fade reveals) can render below-fold sections as washed-out / dimmed in `preview_screenshot` even when `getComputedStyle` reports `opacity: 1` and no filter/mix-blend-mode. The screenshot tool captures the JPEG mid-animation or before reveal triggers fire. Confirmed on `/about` 2026-04-27 — text read clean on real device, dim in screenshot.

**Rule for future runs:** when `inspect`-based contrast on a section says pass and `vision` on the same section says fail, **trust the computed style and report as a screenshot artifact**, not a hard fail. Verify on real device only if both primitives flag the same issue, or if the section is above the fold and unlikely to be scroll-animated.
