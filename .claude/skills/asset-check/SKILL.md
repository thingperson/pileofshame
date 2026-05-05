---
name: asset-check
description: Verify visual assets before shipping any visual change. Catches the recurring slips — wordmark font substitutes (Bungee), missing archetype PNGs, hallucinated comp descriptions, contrast misses on theme/palette changes. Trigger on "asset check", "verify assets", before pushing UI/brand/archetype work, or as part of /pre-push-review when visual changes are in scope.
---

# Asset Check

Pre-flight verification for visual changes. Designed to catch the patterns that have repeatedly slipped through review:

- Font fallbacks (Bungee, system) substituted for the brand wordmark
- Hallucinated comp descriptions (e.g. "dino mascot" was a hand-and-controller)
- Trigger logic shipped without the asset PNG copied in
- Contrast failures defaulted as "designer's call" when they're blockers

This skill is the named-bug version of those failures. It does not replace `/pre-push-review` — it's invoked when visual changes are in the diff, often *as part of* `/pre-push-review`.

---

## When to run

- Before pushing any change that touches `components/Wordmark.tsx`, `components/LandingPage.tsx`, `app/opengraph-image.tsx`, `app/pile/[id]/opengraph-image.tsx`, `app/clear/[id]/opengraph-image.tsx`, `app/archetype/`, theme tokens in `app/globals.css`, or any file under `public/`.
- Before declaring an archetype/character wiring task complete.
- After any palette or theme change, before declaring done.
- When asked to describe or critique a visual comp / design file.

## When NOT to run

- Pure logic / data / API changes. No visual surface touched.
- Doc-only changes.

---

## Step 1 — Wordmark integrity (any change touching brand surfaces)

The brand wordmark lives at `public/if-logos/`:
- `wordmark-full.svg` — full lockup with tagline
- `wordmark-alone.svg` — wordmark only, no tagline
- `wordmark-alone-white-teal.svg` — alt color
- `IF.svg`, `IF-white-I.svg` — monogram variants
- `get-playing.svg` — tagline alone

The component is `components/Wordmark.tsx` — variants render against tight viewBoxes derived from the SVGs above.

Checks:
1. **No font substitutes.** Grep changed files (and OG route components specifically) for `font-family.*Bungee`, `font-family.*Inter` used as a wordmark stand-in, or any `<text>` element rendering "Inventory Full" / "get playing." text directly. The wordmark must be the SVG, not a font rendering the brand string.
2. **No webp in OG `<img>` tags.** satori crashes on webp. Grep `app/**/opengraph-image.tsx` for `\.webp"`.
3. **No redundant wordmark.** If two wordmarks render in the same hero region, that's a regression (DefaultBanner + LandingPage hero both rendering = bug). Region-scope check via `preview_eval` if uncertain.

Hard fail if any check fails. Brand integrity is non-negotiable.

## Step 2 — Archetype / character asset wiring (when adding or wiring archetypes)

When trigger logic is added in `lib/archetypes.ts`, sprite assets must exist before the work is done:

1. List every archetype slug touched in the changeset.
2. For each, confirm the PNG exists at `public/sprites/h2/<slug>.png` (camelCase or kebab-case per the existing pattern — check siblings for the convention).
3. If a sprite is missing, the archetype will render a 404 image when triggered. Hard fail.
4. The `scripts/copy-h2-sprites.sh` script exists for batch copy from bundles — note the rotting-gotcha that it doesn't handle the `bundle-archetype-h2/<slug>/archetype-<slug>@4x.png` filename pattern (per session-resume-2026-05-05.md). If using the script, manually verify each copy.

## Step 3 — Comp / design file description (when describing a visual asset)

Before describing any image, SVG, comp, or design file:

1. List the file path.
2. Open and read it (`Read` for SVG/source, vision for PNG/JPG).
3. Quote the actual contents in the description.
4. Never infer subject from filename, surrounding copy, or session context.

Past slip: "dino mascot" comp was a hand holding a controller. The filename hinted a creature; reading the asset would have caught it instantly.

## Step 4 — Contrast pass (when palette or theme tokens change)

When theme tokens in `app/globals.css` change, or any color in `components/` changes:

1. For each touched color combination (text on background), compute contrast ratio.
2. WCAG AA minimum: **4.5:1 for body text, 3:1 for large text (18pt+ or 14pt bold)**.
3. Failures are **blockers, not designer's calls**. Either fix the color or escalate explicitly with a rationale.
4. For theme-wide audits, hand off to `/theme-check`. This skill catches drift on individual changes.

Past slip: borderline contrast on a checkbox label was caught by `/pre-push-review`, not initially. Don't rely on Brady's eye for what should be a measured check.

## Step 5 — Run preview verification (when feasible)

If a `preview_*` MCP server is up:

1. Navigate to the touched surface (`preview_eval` to set `window.location`).
2. `preview_screenshot` for the surface.
3. `preview_inspect` on any element where computed style was claimed.
4. If `inspect` says pass and `screenshot` says fail, trust computed style — known artifact per `regress-watch` `process-trust-computed-style-on-mismatch`.

## Step 6 — Final report

Format:

```
Asset Check — <date> · <scope>
✅ Wordmark: <pass/skipped>
✅ Archetype assets: <N/N present, or fail with missing>
✅ Comp descriptions: <pass/skipped>
✅ Contrast: <pass/skipped, with failed combos if any>
✅ Preview verification: <pass/skipped>
```

If any step fails, **do not declare done**. Surface for fix or explicit escalation.

---

## Boundaries

- This skill catches named patterns. It is not a comprehensive a11y or theme audit — for that, hand off to `/accessibility-review` or `/theme-check`.
- This skill does NOT auto-commit or auto-fix. It surfaces; Brady decides.
- Don't expand the named-pattern list speculatively. New entries here are earned by a real production slip.
