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
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = process.env.DEMO_URL || 'http://localhost:3100';
const OUT_DIR = resolve(process.cwd(), 'demo-output');
const VIEWPORT = { width: 1280, height: 800 };

/**
 * Pip variant for the closing title card. Lives in the (untracked) notes
 * dir so the source files don't bloat the repo or public/. Override with
 * the PIP_FILE env var:
 *
 *   PIP_FILE="pip-29.png" npm run demo:capture
 *
 * Common variants in notes/pip/Transparent Pips/:
 *   pip-26.png                       (default — clean, wide-ish)
 *   pip-29.png                       (taller, narrower)
 *   pip-07-super-celebration.png     (named: celebration)
 *   pip-26-celebrating-crown.png     (named: crown)
 *
 * Falls back to /og-assets/pip-trophy.png on the live site if the local
 * file isn't found (e.g. fresh clone without the notes dir).
 */
const PIP_FILE = process.env.PIP_FILE || 'pip-26.png';
const PIP_LOCAL_BASE = '/Users/bradywhitteker/Desktop/getplaying/notes/pip/Transparent Pips';
function loadPipDataUri(): string | null {
  const p = resolve(PIP_LOCAL_BASE, PIP_FILE);
  if (!existsSync(p)) return null;
  const buf = readFileSync(p);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

mkdirSync(OUT_DIR, { recursive: true });

/** Pause helper that reads better than `page.waitForTimeout` at call sites. */
const hold = (page: Page, ms: number) => page.waitForTimeout(ms);

/**
 * Hide the in-app onboarding modals that don't belong in a product demo:
 *
 * - "Decision made / Going to play" overlay inside the picker (postAccept)
 * - "That felt good, right?" SampleImportNudge after first commit
 *
 * They serve real psychological purposes in onboarding but they're visual
 * noise in a launch reel. We hide them via CSS so the script can still
 * dispatch through their state transitions without the user seeing flash.
 */
async function installDemoOverrides(page: Page) {
  await page.addStyleTag({
    content: `
      /* postAccept overlay inside the picker — has classes bg-black/70 +
         backdrop-blur-sm, unique within the Pick My Game dialog.
         Opacity 0 (not display:none, not pointer-events:none) so the
         script's coord-based clicks on "Going to play" still land. */
      [role="dialog"][aria-label="Pick My Game"] .bg-black\\/70.backdrop-blur-sm {
        opacity: 0 !important;
      }
      /* SampleImportNudge — uses aria-labelledby="sample-nudge-title" */
      [aria-labelledby="sample-nudge-title"] {
        display: none !important;
      }
    `,
  });
}

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
 * Force the picker to land on Outer Wilds by stripping 'atmospheric' from
 * every other game's moodTags. Grid stays rich (40+ games), but the
 * Atmospheric-vibe filter narrows the pool to one. Also forces the user's
 * theme preference to 'light' to match the new prod default and the
 * landing page. Mutation lives in the browser's localStorage only — prod
 * data is untouched.
 *
 * Outer Wilds chosen because it's finishable (HLTB main ~15h) so the
 * "I beat it" button renders the standard confetti path. Slay the Spire
 * is isNonFinishable=true and reads "I'm done" — confetti still fires
 * but the visual cue is weaker.
 */
async function seedDemoState(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const key = 'getplaying-library';
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const state = parsed?.state ?? parsed;
    if (!state?.games || !Array.isArray(state.games)) return false;

    // Theme → light, so the demo flows from landing into app shell with
    // no jarring dark flash.
    if (state.settings) {
      state.settings.theme = 'light';
    }

    let foundOW = false;
    for (const g of state.games) {
      if (typeof g.name === 'string' && g.name === 'Outer Wilds') {
        foundOW = true;
        g.moodTags = ['atmospheric', 'story-rich'];
        // Picker only draws from 'buried' (Backlog). Sample lib defaults
        // Outer Wilds to 'on-deck'.
        g.status = 'buried';
        g.isNonFinishable = false;
      } else if (Array.isArray(g.moodTags)) {
        g.moodTags = g.moodTags.filter((m: string) => m !== 'atmospheric');
      }
    }
    localStorage.setItem(key, JSON.stringify(parsed));

    // Suppress the SampleImportNudge — it checks for if-sample-pending===1
    // on first commit; removing the flag means emitSampleCompleted never
    // fires and the modal never appears.
    localStorage.removeItem('if-sample-pending');

    return foundOW;
  });
}

/**
 * Inline wordmark SVG paths — same data as Wordmark component and the OG
 * share card (app/opengraph-image.tsx). Kept in sync manually; if you
 * change the wordmark in the codebase, update these too.
 */
const WORDMARK_IN_PATH =
  'M76.42 651.89h65.88v320.97H76.42zm91.22 51.1 64.62-51.1h91.22v320.97h-66.31V706.79h-23.23v266.07h-66.3zm181.17-51.1h64.62v266.07h23.23V651.89h65.88v271.98l-62.51 48.99h-91.22zm179.06 50.26 63.77-50.26h90.8v116.14h-65.88v-61.66h-23.23v102.2h67.99v55.33h-67.99v53.64h89.11v55.32H527.87zm179.91.84 64.62-51.1h91.22v320.97h-66.31V706.79h-23.23v266.07h-66.3zm216.23 3.81h-35.05v-54.9h137.26v54.9h-34.21v266.07h-67.99V706.8Zm127.54 0 66.3-54.9h88.69v266.49l-65.04 54.48h-89.95zm89.53 210.74V706.8h-23.23v210.74zm90.8-213.28 64.19-52.37h90.38v143.59l-36.74 40.54h36.74v136.84h-65.88V864.74h-22.81v108.12h-65.88zm88.69 100.51v-97.56h-22.81v97.56zm91.22 112.77h87.84v-54.9h-87.84V651.9h64.62v155.42h23.23V651.9h66.31v265.64l-64.19 55.32h-89.95v-55.32Z';
const WORDMARK_BODY_PATH =
  'm1592.68 702.2 107.69-50.26h157.95v116.14h-113.18v-61.66h-40.12v102.2H1822v55.33h-116.98v108.96h-112.34zm294.79-50.26h113.18v265.64h39.7V651.94h113.61v320.97h-266.49zm296.05 0h112.34v266.07h97.13v54.9h-209.48V651.94Zm238.61 0h112.34v266.07h97.13v54.9h-209.48V651.94Z';

/**
 * Closing title card — styled to match the OG share card
 * (app/opengraph-image.tsx). Cream background, pink accent bar, inline
 * wordmark (dark IN + pink body), Outfit font loaded from Google. Pip-trophy
 * on the right because we just finished a game in the demo — the pip-trophy
 * variant is the canonical celebration Pip used on /clear share cards.
 *
 * Held for ~4.5s at end of recording. Pure HTML so we can iterate without
 * any prod commits.
 */
async function injectTitleCard(page: Page) {
  // Load Outfit via Google Fonts link, then wait for the font to be ready
  // before showing the card so we don't flash a system fallback first.
  await page.evaluate(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
  });
  // Give the browser a beat to fetch + parse the font CSS.
  await page.evaluate(() => (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ?? Promise.resolve());
  await hold(page, 200);

  const pipDataUri = loadPipDataUri();
  const pipSrc = pipDataUri || '/og-assets/pip-trophy.png';
  if (!pipDataUri) {
    console.warn(`[demo-capture] ${PIP_FILE} not found at ${PIP_LOCAL_BASE} — falling back to /og-assets/pip-trophy.png`);
  }

  await page.evaluate(({ inPath, bodyPath, pipSrc }) => {
    const card = document.createElement('div');
    card.id = '__demo_title_card';
    card.style.cssText = `
      position: fixed; inset: 0; z-index: 2147483640;
      background: #F5F0EB;
      overflow: hidden;
      animation: __demo_card_in 700ms ease-out;
    `;
    card.innerHTML = `
      <style>
        @keyframes __demo_card_in {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes __demo_pip_in {
          0%   { opacity: 0; transform: translate(40px, 16px) scale(0.92); }
          70%  { opacity: 1; transform: translate(-4px, -4px) scale(1.02); }
          100% { opacity: 1; transform: translate(0, 0) scale(1); }
        }
        @keyframes __demo_text_in {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        #__demo_title_card * { box-sizing: border-box; }
      </style>

      <!-- Pink accent bar on top edge (matches OG card) -->
      <div style="position: absolute; top: 0; left: 0; width: 55%; height: 6px; background: #E91E63;"></div>

      <!-- Soft pink ambient glow top-right (matches OG card) -->
      <div style="position: absolute; top: -120px; right: -80px; width: 640px; height: 520px;
                  background: radial-gradient(ellipse, rgba(233, 30, 99, 0.10), transparent 70%);
                  pointer-events: none;"></div>

      <!-- Soft purple ambient glow bottom-left for balance -->
      <div style="position: absolute; bottom: -160px; left: -100px; width: 620px; height: 500px;
                  background: radial-gradient(ellipse, rgba(124, 58, 237, 0.08), transparent 70%);
                  pointer-events: none;"></div>

      <!-- Main two-column layout -->
      <div style="position: relative; display: flex; align-items: center; justify-content: center;
                  height: 100%; padding: 0 80px; gap: 56px;
                  font-family: 'Outfit', system-ui, -apple-system, sans-serif;
                  color: #1a1a1a;">

        <!-- Left column: copy -->
        <div style="flex: 1.1; max-width: 580px; animation: __demo_text_in 700ms ease-out 250ms both;">

          <!-- Wordmark (inline SVG, dark IN + pink body, same as OG card) -->
          <svg width="640" height="86" viewBox="70 645 2500 340" xmlns="http://www.w3.org/2000/svg"
               style="display: block; margin-bottom: 36px;">
            <path d="${inPath}" fill="#1a1a1a" />
            <path d="${bodyPath}" fill="#E91E63" />
          </svg>

          <!-- Tagline: get playing. -->
          <p style="font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 72px;
                    line-height: 1; letter-spacing: -0.025em; color: #1a1a1a;
                    margin: 0 0 12px;">get playing.</p>

          <!-- Subhead -->
          <p style="font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 22px;
                    color: #5a5560; margin: 0 0 36px; line-height: 1.4;">
            We pick. You play.
          </p>

          <!-- URL pill (purple, matches in-app primary CTA) -->
          <div style="display: inline-flex; align-items: center; gap: 10px;
                      padding: 16px 26px; border-radius: 14px;
                      background: #7c3aed; color: #fff;
                      font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 22px;
                      letter-spacing: -0.01em;
                      box-shadow: 0 10px 28px rgba(124, 58, 237, 0.28);">
            inventoryfull.gg
          </div>

          <!-- Discord CTA line in monospace -->
          <p style="margin: 30px 0 0; font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
                    font-weight: 500; font-size: 16px; color: #5a5560;">
            🤖&nbsp; Try Pip on Discord →
          </p>
        </div>

        <!-- Right column: Pip-trophy (celebration variant) -->
        <div style="flex: 0.9; display: flex; justify-content: center; align-items: center;">
          <img src="${pipSrc}" alt=""
               style="width: 460px; max-width: 100%; height: auto;
                      filter: drop-shadow(0 18px 32px rgba(0, 0, 0, 0.18));
                      animation: __demo_pip_in 800ms cubic-bezier(.2, .9, .3, 1.3) 350ms both;" />
        </div>
      </div>
    `;
    document.body.appendChild(card);
  }, { inPath: WORDMARK_IN_PATH, bodyPath: WORDMARK_BODY_PATH, pipSrc });
}

async function main() {
  console.log(`[demo-capture] target: ${BASE_URL}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    recordVideo: { dir: OUT_DIR, size: VIEWPORT },
    colorScheme: 'light',
  });
  const page = await context.newPage();

  // 1. Landing
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await installDemoOverrides(page);
  await installFakeCursor(page);
  await glide(page, VIEWPORT.width / 2, VIEWPORT.height / 2, 1);

  // 1a. Dismiss cookie banner if present.
  try {
    const decline = page.getByRole('button', { name: /^decline$/i }).first();
    if (await decline.count() > 0 && await decline.isVisible({ timeout: 500 }).catch(() => false)) {
      const b = await decline.boundingBox();
      if (b) await tap(page, b.x + b.width / 2, b.y + b.height / 2);
      await hold(page, 250);
    }
  } catch { /* banner not present — fine */ }

  await hold(page, 1400);

  // 2. Import beat — click Import, glimpse platform options, close. Tells the
  // SideProject viewer "yes it actually imports" without a real Steam load.
  const importBtn = page.getByRole('button', { name: /^import$|import my library/i }).first();
  if (await importBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    const ib = await importBtn.boundingBox();
    if (ib) await tap(page, ib.x + ib.width / 2, ib.y + ib.height / 2);
    await hold(page, 1100);
    const importClose = page.locator('[role="dialog"]').getByRole('button', { name: /^close$|^×$|cancel/i }).first();
    const icb = await importClose.boundingBox().catch(() => null);
    if (icb) {
      await tap(page, icb.x + icb.width / 2, icb.y + icb.height / 2);
    } else {
      await page.keyboard.press('Escape');
    }
    await hold(page, 300);
  }

  // 3. Load sample library
  await tapRole(page, 'button', /try a sample/i);
  await page.getByRole('button', { name: /pick my game/i }).first().waitFor({ state: 'visible', timeout: 15_000 });
  await hold(page, 600);

  // 3a. Seed demo state: force light theme + make Outer Wilds the only
  // Atmospheric game. Reload so the store re-hydrates.
  const found = await seedDemoState(page);
  if (!found) {
    console.warn('[demo-capture] Outer Wilds not in sample library — picker may land on a different Atmospheric game. Re-run if it picks wrong.');
  }
  await page.reload({ waitUntil: 'networkidle' });
  await installDemoOverrides(page);
  await installFakeCursor(page);
  await glide(page, VIEWPORT.width / 2, VIEWPORT.height / 2, 1);
  await page.getByRole('button', { name: /pick my game/i }).first().waitFor({ state: 'visible', timeout: 15_000 });
  await hold(page, 400);

  // 4. Open the picker
  await tapRole(page, 'button', /pick my game/i);
  const modal = page.getByRole('dialog', { name: /pick my game/i });
  await modal.waitFor({ state: 'visible' });
  await hold(page, 400);

  // 5. Vibes → Atmospheric (only Outer Wilds matches)
  const vibesToggle = modal.locator('button', { hasText: /Vibes/ }).first();
  const vibesBox = await vibesToggle.boundingBox();
  if (vibesBox) await tap(page, vibesBox.x + vibesBox.width / 2, vibesBox.y + vibesBox.height / 2);
  await hold(page, 300);
  const atmospheric = modal.locator('button').filter({ hasText: /^Atmospheric$/ }).first();
  const aBox = await atmospheric.boundingBox();
  if (!aBox) throw new Error('Atmospheric mood chip not found');
  await tap(page, aBox.x + aBox.width / 2, aBox.y + aBox.height / 2);
  await hold(page, 400);

  // 6. Click Anything → reveal Outer Wilds
  await tapRole(page, 'button', /anything/i);
  await modal.locator('text=/Outer Wilds/i').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {
    console.warn('[demo-capture] reveal title not detected — continuing anyway');
  });
  await hold(page, 1800);

  // 7. "Let's go" — commits the pick. PostAccept overlay renders but is
  // hidden by installDemoOverrides CSS (opacity: 0).
  await tapRole(page, 'button', /let'?s go/i);
  await hold(page, 700);

  // 7a. Click "Going to play" anyway — the button exists in the DOM under
  // the (invisible) overlay. Playwright's coord-based tap lands on it,
  // onCommit fires, navigates to Playing Now. No visible modal flash
  // because the overlay was always invisible.
  await tapRole(page, 'button', /going to play/i);
  await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  await hold(page, 500);
  // SampleImportNudge is already suppressed via localStorage flag (see
  // seedDemoState). Nothing to dismiss.

  // 8. Expand the Outer Wilds card. Cards collapse by default; action row
  // (including "I beat it") renders only when expanded.
  await hold(page, 400);
  const owText = page.getByText(/^Outer Wilds$/i).first();
  await owText.waitFor({ state: 'visible', timeout: 6000 });
  const cardBox = await owText.boundingBox();
  if (!cardBox) throw new Error('Outer Wilds card header not found');
  await tap(page, cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
  await hold(page, 400);

  // 9. "I beat it" — opens the confirmation modal. Critical: expanded
  // cards extend below the viewport, so scroll into view before clicking
  // or the tap misses (page.mouse coords are viewport-bound).
  const beatBtn = page.getByRole('button', { name: /i beat it/i }).first();
  await beatBtn.waitFor({ state: 'visible', timeout: 6000 });
  await beatBtn.scrollIntoViewIfNeeded();
  await hold(page, 200);
  const beatBox = await beatBtn.boundingBox();
  if (!beatBox) throw new Error('"I beat it" button not found after expand');
  await tap(page, beatBox.x + beatBox.width / 2, beatBox.y + beatBox.height / 2);

  // 9a. "I crushed it" — confirms the completion and fires the confetti.
  // The celebration component renders in confirm mode first ("For real?
  // Like, credits rolled and everything?"). Without clicking this, no
  // confetti — just the confirmation prompt.
  const crushedBtn = page.getByRole('button', { name: /i crushed it|i'?m done with it/i }).first();
  await crushedBtn.waitFor({ state: 'visible', timeout: 5000 });
  await hold(page, 500);
  const cBox = await crushedBtn.boundingBox();
  if (!cBox) throw new Error('"I crushed it" button not found');
  await tap(page, cBox.x + cBox.width / 2, cBox.y + cBox.height / 2);

  // 9b. Hold on confetti — let the burst fully animate
  await hold(page, 3800);

  // 9c. Skip closing the celebration — the title card overlay covers the
  // whole viewport at a higher z-index. Cleaner cut, one less beat.

  // 10. Title card — wordmark + Pip + tagline + URL + Discord CTA.
  // Hide the synthetic cursor first so it doesn't sit on top of the card.
  await page.evaluate(() => {
    const c = document.getElementById('__demo_cursor');
    const r = document.getElementById('__demo_cursor_ring');
    if (c) c.style.display = 'none';
    if (r) r.style.display = 'none';
  });
  await injectTitleCard(page);
  await hold(page, 3300);

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
