# Demo capture — scripted pick-flow recording

A standalone Playwright script that produces a ~30s clean recording of the pick flow for use as a r/SideProject GIF, Bluesky/Twitter clip, or B-roll for the PH/HN polished demo (Screen Studio still owns the 75s polished cut — see `docs/LAUNCH_BIBLE.md` §10).

## What it captures

Using the existing "Try a sample first" path so we never record over a real Steam library:

1. Landing hero (2.8s hold)
2. Click "Try a sample first" → library loads
3. Click "Pick My Game" → modal opens
4. Expand Vibes → pick "Cozy"
5. Expand Session length → pick "Medium"
6. Click "Anything" → pick reveal
7. Hold on the reveal (~7s)

Total wall-clock ≈ 30s. 1280×800 @ 2× DPR, dark theme.

## One-time setup

```sh
# ffmpeg for webm → gif conversion
brew install ffmpeg

# Playwright browsers (if not already)
npx playwright install chromium
```

## Run it

The script needs a running instance of the app. Easiest path is production:

```sh
DEMO_URL=https://inventoryfull.gg npm run demo:capture
```

Or against a local prod build:

```sh
npm run build
npm run start -- -p 3100   # in one terminal
DEMO_URL=http://localhost:3100 npm run demo:capture
```

Output lands in `demo-output/<uuid>.webm`.

## Convert to GIF for Reddit

Reddit accepts GIF or MP4. MP4 looks better; GIF auto-plays without controls. Recipes:

**GIF (target <20MB for safe Reddit upload):**
```sh
ffmpeg -i demo-output/*.webm \
  -vf "fps=18,scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=192[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5" \
  -loop 0 demo-output/sideproject.gif
```

**MP4 (preferred — smaller, smoother):**
```sh
ffmpeg -i demo-output/*.webm \
  -vf "scale=1080:-2:flags=lanczos" \
  -c:v libx264 -pix_fmt yuv420p -crf 22 -movflags +faststart \
  demo-output/sideproject.mp4
```

## Gotchas

- **Fake cursor.** Playwright doesn't render the OS cursor in `recordVideo`. The script injects a floating dot + click-pulse ring so actions read on camera. If a future UI change adds a `z-index` higher than `2147483647`, the cursor will hide behind it.
- **Sample library determinism.** We rely on the sample-library button producing a usable game set. If that path is removed or changes labels, update the selectors near the top of the script.
- **Selectors are loose on purpose.** `getByRole({ name: /pick my game/i })` survives copy tweaks. If you rename the CTA, update the regex.
- **Animation timing.** The script holds on each beat assuming current scaleIn (400ms) and chip transitions. If you tune those, re-watch and adjust `hold(...)` calls.
- **Headless vs headed.** Default is headless. Add `headless: false` to `chromium.launch` to watch it work.

## Reusing this for other surfaces

The script is one file; fork it per asset rather than parameterizing. For a Pip-on-completion clip, copy `demo-capture.ts` → `demo-capture-clear.ts`, swap the beat list, point at the same npm-script pattern. Cheap to maintain, easy to reason about.

## Why not Screen Studio for the SideProject GIF

Screen Studio is the right tool for the 75s PH/HN hero (auto-zoom, motion-design polish). For the SideProject GIF the bar is "honest, working, fast" — a scripted clean run reads more credible than a polished marketing cut to that audience, and we can re-record on every UI change in 30 seconds.
