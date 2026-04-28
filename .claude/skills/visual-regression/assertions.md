# Visual Regression — Assertion Library

The assertions are grouped by surface, then by verification primitive. Each has an `id` (for the report), a `check` (what's being verified), and a `method` (which preview-MCP tool runs it).

Assertions named `regress-*` are encoded prior bugs that reached production and Brady caught on review. Don't delete those without a DECISIONS entry — they're load-bearing.

---

## Pages of record

| Page | Path | Notes |
|---|---|---|
| Landing (no games) | `/` with empty store | NinetiesMode hero + landing CTA path |
| App (with games) | `/` with games | TabNav + game cards path |
| About | `/about` | Canonical product narrative |
| Stats | `/stats` | Value calc + archetype + Pick CTA |
| Privacy | `/privacy` | Legal page |
| Terms | `/terms` | Legal page |
| Pile OG | `/pile/<id>` | Archetype-reveal share card (edge runtime) |
| Clear OG | `/clear/<id>` | Game-cleared share card (Node runtime) |

## In-app states

| State | How to reach |
|---|---|
| Picker pre-roll | Click "What Should I Play?" |
| Picker post-pick | After Roll fires |
| Post-accept overlay | After "Let's go" |
| Share composer | Inside CompletionCelebration |
| Game Detail Modal | Click any game card |

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
**Check:** there is exactly one wordmark in the rendered hero region (above-the-fold or first-section). Header wordmark counts; hero wordmark counts; both rendering = fail.
**Method:** `eval` — query `[aria-label*="Inventory Full"]` and visible `<svg>` wordmarks in the hero region, count must be 1.
**Why this exists:** DefaultBanner renders a wordmark; LandingPage was rendering its own hero wordmark; both fired during the empty state.

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

### `header-no-shifted-banner`
**Surface:** all pages.
**Check:** no orphan banner row above or below the integrated header (e.g., "not synced" should sit inside the app frame, not as a top-of-page banner on landing).
**Method:** `vision`.

---

## Hero / illustration

### `hero-image-loaded`
**Surface:** landing, `/about`.
**Check:** the hero illustration `<img>` has `naturalWidth > 0` (rendered, not broken).
**Method:** `eval`.

### `regress-hero-not-dino`
**Surface:** any place using the platform-aware celebration imagery (when implemented).
**Check:** described comp imagery matches what's in `public/og-assets/` — *don't infer the subject from filename or vibe*. If asked to evaluate a comp, list the file path, read the actual asset, then describe what's in it.
**Method:** `vision` + asset-read.
**Why this exists:** Claude described a "dino mascot" in a comp that was actually a hand holding a controller. This is a *process* assertion, not a renderable check — it lives here so the skill author re-reads it and remembers to verify before describing.

---

## Tab nav (in-app)

### `tabnav-sprites-render`
**Surface:** `/` with games, all four tabs visible.
**Check:** each tab button contains a non-empty `<svg>` (sprite rendered, not just emoji fallback).
**Method:** `eval` — count `[role="tab"] svg path` per tab, must be > 5 (sprites have many path nodes).

### `regress-tabnav-muted-teal-v2.1`
**Surface:** `/` with games.
**Check:** Up Next + Completed tab sprites use `#1a9e86`, not `#2ee8c4` or `#34d399`.
**Method:** `eval` — collect all tab `path` `d` attributes' rendered fills via `getComputedStyle`, expected color present in at least Up Next + Completed.
**Why this exists:** wave-2 → wave-2.1 sprite swap changed these specific colors. Regression detector for any future wave that accidentally reverts.

### `tabnav-active-tab-contrast`
**Surface:** `/` with games.
**Check:** active tab text passes WCAG AA (≥ 4.5:1) against its background tint.
**Method:** `inspect` — get `color` + computed background of `[role="tab"][aria-selected="true"]`, compute contrast ratio.

---

## Theme contrast (all themes)

### `theme-text-primary-contrast`
**Surface:** `/` with games (default theme + each theme via store toggle).
**Check:** body text computed color vs page background ≥ 4.5:1.
**Method:** `inspect` on `<p>` and `[data-text="primary"]` elements, sample 3.

### `theme-cta-button-contrast`
**Surface:** all primary CTAs (`What Should I Play?`, `Pick something to play`, `Let's go`, `Open in Steam`).
**Check:** button text vs button background ≥ 4.5:1.
**Method:** `inspect`.

### `regress-void-theme-aa`
**Surface:** `/` with games, theme = void.
**Check:** `text-dim` ≥ 4.5:1 against `#000`; `accent-pink` ≥ 4.5:1 against `#000`.
**Method:** `inspect` + ratio compute.
**Why this exists:** void theme tokens were failing AA (text-dim 1.95:1, accent-pink 1.32:1) until the 2026-04-25 contrast bump. Permanent regression check.

---

## Touch targets (mobile, 390×844)

### `touch-target-min-44`
**Surface:** all interactive elements on `/` and `/stats`.
**Check:** every `button`, `a`, `[role="tab"]` has bounding box ≥ 44×44px.
**Method:** `eval` + `resize` to 390×844 first.

### `mobile-tab-flex-wrap`
**Surface:** `/` with games at 390×844.
**Check:** TabNav doesn't wrap onto two rows; horizontal scroll OK, vertical wrap not OK.
**Method:** `vision` + `eval` for `flex-wrap` computed style.

---

## Voice / terminology

### `voice-locked-status-cycle`
**Surface:** every page.
**Check:** no rendered text contains "Buried", "Play Next", "On Deck", "Cleared", "Beaten", "Bailed", "Dropped", "Abandoned", "Pile of Shame".
**Method:** `text-scan` — `document.body.innerText` against banned list from `.claude/rules/voice-charter.md`.

### `voice-tagline-lowercase`
**Surface:** any page rendering the tagline.
**Check:** rendered text is `get playing.` — lowercase, with period. Sentence case (`Get playing.`) fails.
**Method:** `text-scan`.

### `voice-no-banned-vocab`
**Surface:** all rendered copy.
**Check:** banned-vocab list from voice-and-tone.md (delve, leverage, seamless, robust, etc.) absent from visible text.
**Method:** `text-scan` — match-case-insensitive, exclude `<code>` blocks.

---

## OG cards (smoke check, render only)

### `og-pile-renders`
**Surface:** `/pile/test-id/opengraph-image` (or any valid pile id).
**Check:** the response is an image, dimensions 1200×630, not an error page.
**Method:** `eval` — fetch the URL, check `Content-Type: image/*` + dimensions.

### `og-clear-renders`
**Surface:** `/clear/test-id/opengraph-image`.
**Check:** same as above. Clear card uses Node runtime + `fs.readFile`; this catches accidental edge-runtime drift.
**Method:** `eval`.

### `og-no-webp-img`
**Surface:** any OG route source file.
**Check:** no `<img src="*.webp">` in OG route components — satori crashes on webp.
**Method:** `grep` against `app/**/opengraph-image.tsx` files (skill runs this as a `Bash` grep before screenshots, since it's a build-time issue not a render-time one).

---

## Failure-mode assertions (process, not render)

These don't run as automated checks — they're reminders the skill author reads before describing visuals.

### `process-read-the-asset`
Before describing what's in any image / SVG / comp file, list the path and read it. Don't infer subject from filename, surrounding copy, or session context.

### `process-no-designers-call-on-contrast`
Contrast failures are blockers, not subjective. If a contrast assertion fails, surface it as a hard fail with a proposed color fix. Don't frame it as "designer's call."

### `process-describe-don't-summarize`
On screenshot vision-checks, name the elements and their positions. "Looks aligned" is not enough. "Wordmark sits at x=120, header midline at x=128 — within ±2px tolerance, pass" is enough.
