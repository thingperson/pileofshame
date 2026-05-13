/**
 * Demo capture — scripted Playwright run that records the pick flow.
 *
 * Produces a 1280x800 webm under `demo-output/`. Convert to GIF/MP4 via ffmpeg
 * (see scripts/demo-capture-README.md).
 *
 * Default target is local prod build on :3100. Override with DEMO_URL.
 *
 * Why a script, not a test: tests assert; this just paces a recording.
 */
import { chromium, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = process.env.DEMO_URL || 'http://localhost:3100';
const OUT_DIR = resolve(process.cwd(), 'demo-output');
const VIEWPORT = { width: 1280, height: 800 };

mkdirSync(OUT_DIR, { recursive: true });

/** Pause helper that reads better than `page.waitForTimeout` at call sites. */
const hold = (page: Page, ms: number) => page.waitForTimeout(ms);

/**
 * Inject a fake cursor that tracks pointermove. Playwright's recordVideo does
 * not render the real OS cursor, so demos look mysteriously self-driving.
 */
async function installFakeCursor(page: Page) {
  await page.addStyleTag({
    content: `
      #__demo_cursor {
        position: fixed;
        top: 0; left: 0;
        width: 22px; height: 22px;
        pointer-events: none;
        z-index: 2147483647;
        background: radial-gradient(circle at 30% 30%, #fff 0%, #fff 35%, rgba(255,255,255,0) 70%);
        border: 2px solid #1a1a1a;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: transform 80ms ease-out;
        mix-blend-mode: normal;
      }
      #__demo_cursor.click {
        transform: translate(-50%, -50%) scale(0.7);
      }
      #__demo_cursor_ring {
        position: fixed;
        pointer-events: none;
        z-index: 2147483646;
        border: 2px solid rgba(124, 58, 237, 0.9);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
      }
      #__demo_cursor_ring.fire {
        animation: __demo_ring 520ms ease-out;
      }
      @keyframes __demo_ring {
        0%   { transform: translate(-50%, -50%) scale(0.2); opacity: 0.9; width: 22px; height: 22px; }
        100% { transform: translate(-50%, -50%) scale(1);   opacity: 0;   width: 64px; height: 64px; }
      }
    `,
  });
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.id = '__demo_cursor';
    document.body.appendChild(cursor);
    const ring = document.createElement('div');
    ring.id = '__demo_cursor_ring';
    document.body.appendChild(ring);
    window.addEventListener('pointermove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
    }, true);
  });
}

/** Glide the mouse to (x,y) so the fake cursor moves visibly. */
async function glide(page: Page, x: number, y: number, steps = 24) {
  await page.mouse.move(x, y, { steps });
}

/** Click with a ring pulse + 80ms hold so the action reads on camera. */
async function tap(page: Page, x: number, y: number) {
  await glide(page, x, y);
  await page.evaluate(() => {
    const c = document.getElementById('__demo_cursor');
    const r = document.getElementById('__demo_cursor_ring');
    if (c) c.classList.add('click');
    if (r) { r.classList.remove('fire'); void r.offsetWidth; r.classList.add('fire'); }
  });
  await page.mouse.down();
  await hold(page, 90);
  await page.mouse.up();
  await page.evaluate(() => {
    const c = document.getElementById('__demo_cursor');
    if (c) c.classList.remove('click');
  });
}

/** Get the screen-space center of a locator and tap it. */
async function tapLocator(page: Page, selector: string, nth = 0) {
  const loc = page.locator(selector).nth(nth);
  await loc.scrollIntoViewIfNeeded();
  const box = await loc.boundingBox();
  if (!box) throw new Error(`No bounding box for ${selector}`);
  await tap(page, box.x + box.width / 2, box.y + box.height / 2);
}

async function tapRole(page: Page, role: Parameters<Page['getByRole']>[0], name: RegExp, nth = 0) {
  const loc = page.getByRole(role, { name }).nth(nth);
  await loc.scrollIntoViewIfNeeded();
  const box = await loc.boundingBox();
  if (!box) throw new Error(`No bounding box for role=${role} name=${name}`);
  await tap(page, box.x + box.width / 2, box.y + box.height / 2);
}

/**
 * Force the picker to land on Slay the Spire by stripping 'strategic' from
 * every other game's moodTags. The grid stays rich (40+ games), but the
 * Strategic-vibe filter narrows the pool to one. Mutation lives in the
 * browser's localStorage only — prod data is untouched.
 */
async function forceSlayTheSpire(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const key = 'getplaying-library';
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const state = parsed?.state ?? parsed;
    if (!state?.games || !Array.isArray(state.games)) return false;
    let foundSTS = false;
    for (const g of state.games) {
      if (typeof g.name === 'string' && g.name === 'Slay the Spire') {
        foundSTS = true;
        if (!Array.isArray(g.moodTags) || !g.moodTags.includes('strategic')) {
          g.moodTags = ['strategic', 'chill'];
        }
        // Make sure STS isn't already-completed.
        g.status = 'buried';
      } else if (Array.isArray(g.moodTags)) {
        g.moodTags = g.moodTags.filter((m: string) => m !== 'strategic');
      }
    }
    localStorage.setItem(key, JSON.stringify(parsed));
    return foundSTS;
  });
}

async function main() {
  console.log(`[demo-capture] target: ${BASE_URL}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    recordVideo: { dir: OUT_DIR, size: VIEWPORT },
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  // 1. Landing
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await installFakeCursor(page);
  await glide(page, VIEWPORT.width / 2, VIEWPORT.height / 2, 1);

  // 1a. Dismiss cookie banner if present. Decline (no analytics cookies set)
  // is the cleaner choice for a recording — fewer artifacts in any future
  // re-run from a fresh context.
  try {
    const decline = page.getByRole('button', { name: /^decline$/i }).first();
    if (await decline.count() > 0 && await decline.isVisible({ timeout: 500 }).catch(() => false)) {
      const b = await decline.boundingBox();
      if (b) await tap(page, b.x + b.width / 2, b.y + b.height / 2);
      await hold(page, 250);
    }
  } catch { /* banner not present — fine */ }

  await hold(page, 2400);

  // 2. Load sample library
  await tapRole(page, 'button', /try a sample/i);
  await page.getByRole('button', { name: /pick my game/i }).first().waitFor({ state: 'visible', timeout: 15_000 });
  await hold(page, 1000);

  // 2a. Mutate localStorage so Slay the Spire is the only Strategic game.
  // Reload so Zustand re-hydrates with the filtered moodTags.
  const found = await forceSlayTheSpire(page);
  if (!found) {
    console.warn('[demo-capture] Slay the Spire not in sample library — picker will land on whatever Strategic game is left. Re-run if it picks wrong.');
  }
  await page.reload({ waitUntil: 'networkidle' });
  await installFakeCursor(page);
  await glide(page, VIEWPORT.width / 2, VIEWPORT.height / 2, 1);
  await page.getByRole('button', { name: /pick my game/i }).first().waitFor({ state: 'visible', timeout: 15_000 });
  await hold(page, 800);

  // 3. Open the picker
  await tapRole(page, 'button', /pick my game/i);
  const modal = page.getByRole('dialog', { name: /pick my game/i });
  await modal.waitFor({ state: 'visible' });
  await hold(page, 700);

  // 4. Expand Vibes → pick Strategic (only game with this mood is STS)
  const vibesToggle = modal.locator('button', { hasText: /Vibes/ }).first();
  const vibesBox = await vibesToggle.boundingBox();
  if (vibesBox) await tap(page, vibesBox.x + vibesBox.width / 2, vibesBox.y + vibesBox.height / 2);
  await hold(page, 500);
  const strategic = modal.locator('button').filter({ hasText: /^Strategic$/ }).first();
  const stBox = await strategic.boundingBox();
  if (!stBox) throw new Error('Strategic mood chip not found');
  await tap(page, stBox.x + stBox.width / 2, stBox.y + stBox.height / 2);
  await hold(page, 700);

  // 5. Click Anything → reveal Slay the Spire
  await tapRole(page, 'button', /anything/i);
  // Wait for the reveal — title text should appear in the modal.
  await modal.locator('text=/Slay the Spire/i').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {
    console.warn('[demo-capture] reveal title not detected — continuing anyway');
  });
  await hold(page, 2400);

  // 6a. "Let's go" — commits the pick, fires the post-accept celebration overlay
  await tapRole(page, 'button', /let'?s go/i);
  await hold(page, 1200);

  // 6b. "Going to play" — dismisses celebration, closes modal, navigates to Playing Now
  await tapRole(page, 'button', /going to play/i);
  await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  await hold(page, 1400);

  // 6c. Dismiss the SampleImportNudge if it fires (it does, after first
  // commit). The nudge ships "Keep exploring" / "Import My Library" — pick
  // "Keep exploring" so we stay on the sample library for the rest of the demo.
  const keepBtn = page.getByRole('button', { name: /keep exploring/i }).first();
  if (await keepBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
    const kb = await keepBtn.boundingBox();
    if (kb) await tap(page, kb.x + kb.width / 2, kb.y + kb.height / 2);
    await hold(page, 500);
  }

  // 7. Find STS card on the grid and expand it. Cards are collapsed by
  // default; the action row (including "I beat it" / "I'm done") only
  // renders when expanded === true. Clicking the card header toggles it.
  await hold(page, 900);
  const stsText = page.getByText(/^Slay the Spire$/i).first();
  await stsText.waitFor({ state: 'visible', timeout: 6000 });
  const cardBox = await stsText.boundingBox();
  if (!cardBox) throw new Error('STS card header not found');
  await tap(page, cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
  await hold(page, 700);

  // STS is flagged isNonFinishable=true in sample lib → button reads
  // "✅ I'm done" / "I'm done". Both fire showCelebration → confetti.
  const beatBtn = page.getByRole('button', { name: /i beat it|i'?m done/i }).first();
  await beatBtn.waitFor({ state: 'visible', timeout: 6000 });
  const beatBox = await beatBtn.boundingBox();
  if (!beatBox) throw new Error('"I beat it" button not found after expand');
  await tap(page, beatBox.x + beatBox.width / 2, beatBox.y + beatBox.height / 2);

  // 8. Confetti celebration — hold so the burst fully animates
  await hold(page, 5500);

  // 8b. Close the celebration modal — it has its own X button with aria-label="Close"
  const celebDialog = page.locator('[aria-label="Game completion celebration"]');
  const dialogVisible = await celebDialog.isVisible({ timeout: 500 }).catch(() => false);
  if (dialogVisible) {
    const xBtn = celebDialog.getByRole('button', { name: /^close$/i }).first();
    const xb = await xBtn.boundingBox();
    if (xb) await tap(page, xb.x + xb.width / 2, xb.y + xb.height / 2);
    await celebDialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await hold(page, 500);
  }

  // 9. Switch to Dino mode. Settings trigger has data-settings-trigger="true".
  const settingsBtn = page.locator('[data-settings-trigger="true"]').first();
  const setBox = await settingsBtn.boundingBox();
  if (!setBox) throw new Error('Settings trigger not found');
  await tap(page, setBox.x + setBox.width / 2, setBox.y + setBox.height / 2);
  await hold(page, 700);

  // Click Display expander — match by text content (button has no aria-label)
  const displayBtn = page.locator('button').filter({ hasText: /Display/ }).filter({ hasText: /🎨/ }).first();
  await displayBtn.waitFor({ state: 'visible', timeout: 4000 });
  const dBox = await displayBtn.boundingBox();
  if (!dBox) throw new Error('Display section toggle not found');
  await tap(page, dBox.x + dBox.width / 2, dBox.y + dBox.height / 2);
  await hold(page, 500);

  // Click Dino theme
  const dinoBtn = page.locator('button').filter({ hasText: /🦕 Dino/ }).first();
  await dinoBtn.waitFor({ state: 'visible', timeout: 4000 });
  const dinoBox = await dinoBtn.boundingBox();
  if (!dinoBox) throw new Error('Dino theme button not found');
  await tap(page, dinoBox.x + dinoBox.width / 2, dinoBox.y + dinoBox.height / 2);

  // 10. Hold on Dino mode — the banner, mascot, and theme do the work
  await glide(page, VIEWPORT.width / 2, VIEWPORT.height / 2 - 80);
  await hold(page, 4500);

  await context.close();
  await browser.close();

  console.log(`[demo-capture] done. webm written to ${OUT_DIR}/`);
  console.log(`[demo-capture] convert with:`);
  console.log(`  ffmpeg -i demo-output/*.webm -vf "scale=1080:-2:flags=lanczos" \\\n    -c:v libx264 -pix_fmt yuv420p -crf 22 -movflags +faststart demo-output/sideproject.mp4`);
}

main().catch((err) => {
  console.error('[demo-capture] failed:', err);
  process.exit(1);
});
