# H2 Archetype Sprite Integration Spec

**Status:** READY · not yet wired into live app
**Source bundle:** `notes/Inventory Full-claude code resume package from design/bundle-archetype-h2/`
**Created:** 2026-05-01

## What's ready

41 painted-pixel H2 archetype sprites at 128×128, fully bundled (SVG + PNG@1x/2x/4x + sprite-string + CSS) in the bundle directory above. Style is locked: 24-color palette, no outlines, hue-shifted shadows, brand-accented, atmospheric.

## What this replaces

The current low-fi pixel sprites used at runtime via `pixel-lib.js` and the keys in `lib/archetypes.ts:SPRITE_KEY_BY_TITLE`. Today the app renders 32×32 6-color sprites; H2 are 128×128 24-color (4× the resolution, same aesthetic family).

## Key mapping (HF_BUILDERS → app titles)

The app uses **37 unique sprite keys** in `SPRITE_KEY_BY_TITLE`. The bundle has **41 builders**. Mapping:

### Direct matches (35)
`pureCollector, hoarder, dabbler, quitter, juggler, archaeologist, windowShopper, backlogZero, completionist, sniper, redeemer, critic, enthusiast, deepdiver, balanced, omniGamer, steamLoyalist, psPurist, enduranceRunner, optimizer, wishfulThinker, eclectic, infinite, momentumBuilder, bargainHunter, nightOwl, webmaster, synthwave, ultraDevotee, hologram, unsettling, lighthouse, minimalist, gamer` plus `genreAddict` (fallback for "X Addict" titles).

### Aliases (3) — bundle key differs from app key
| App key | Bundle key | Resolution |
|---|---|---|
| `quickDraw` | `speedrunner` | Add `quickDraw` alias to `HF_BUILDERS` OR rename bundle folder `speedrunner/` → `quickDraw/` |
| `cozy` | `cozyCraver` | Add `cozy` alias OR rename folder |
| `dino` | `dinoRider` | Add `dino` alias OR rename folder |

### Bundle extras (4) — no app archetype maps to these
`retroKids, grindGhost, lateBloomer, genreAddict` (the last is used as fallback). `retroKids/grindGhost/lateBloomer` are unused unless new archetypes are added to `lib/archetypes.ts`.

## Recommended integration path

### Option A — drop-in PNG (simplest, ~30 min)
1. Copy bundle PNGs to `public/sprites/h2/{slug}@1x.png` etc. Don't ship the SVGs unless you need scaling beyond 4×.
2. Resolve the 3 alias keys (rename folders to match `quickDraw/cozy/dino`, OR add a runtime alias map).
3. Update sprite renderer to load `/sprites/h2/{key}@2x.png` for high-DPI displays.
4. Sprite display sites: `GameCard.tsx` archetype badge, share-card OG images, archetype detail surfaces. Audit usages of `getArchetypeSpriteKey()` to find them.
5. Keep low-fi sprites as fallback during rollout; flag for switching.

### Option B — sprite-string runtime (preserves current architecture)
1. Copy each `sprite-string.txt` into a JSON map keyed by app sprite key. Place at `lib/pixel/data/personas-h2.json`.
2. Extend the existing `pixel-lib.js` palette to include the 24 H2 colors (today's palette is 6).
3. `renderSprite()` already handles arbitrary palette chars — just point at the H2 data + extended palette.
4. Resolve alias keys in the JSON file.

### Option C — hybrid (recommended)
- OG share cards (Node runtime, file reads): use PNG @4x for crisp big renders.
- In-app card thumbnails (client): use sprite-string + extended pixel-lib for animation/effects + smaller bundle.

## Aliases — which approach?

**Renaming bundle folders is cleaner long-term** but cosmetic. Adding aliases at runtime is faster and reversible:

```ts
// In lib/archetypes.ts or wherever sprites are resolved
const H2_ALIASES: Record<string, string> = {
  quickDraw: 'speedrunner',
  cozy: 'cozyCraver',
  dino: 'dinoRider',
};
function resolveH2Key(appKey: string) { return H2_ALIASES[appKey] ?? appKey; }
```

Apply at the sprite-load boundary, not throughout the app.

## OG image considerations

- Pile and clear share cards (`app/pile/[id]/`, `app/clear/[id]/`) currently use the low-fi sprites.
- The clear card runs on Node runtime + `fs.readFile`, so it can pull bundle PNGs directly. Pile + root share cards run on edge — they'd need either inline sprite-strings or external PNG fetches (gstatic-style).
- **Don't use webp from the H2 bundle** — bundle is PNG only. Same constraint as before with satori.

## Pre-flight checklist before wiring

- [ ] Decide Option A / B / C
- [ ] Resolve 3 alias keys
- [ ] Audit all callsites of `getArchetypeSpriteKey()` and the existing low-fi renderer
- [ ] Plan rollout: feature flag? Quiet swap? Side-by-side?
- [ ] Confirm OG card runtimes still work with new asset format
- [ ] Sentry watch after deploy — sprite render failures are easy regressions

## Reference

- Bundle: `notes/Inventory Full-claude code resume package from design/bundle-archetype-h2/`
- Builders: `notes/Inventory Full-claude code resume package from design/archetypes-hifi.js`
- Methodology: `notes/Inventory Full-claude code resume package from design/Upsample Methodology.md`
- Current app sprite layer: `lib/archetypes.ts` (SPRITE_KEY_BY_TITLE), `lib/pixel/`, `pixel-lib.js`
