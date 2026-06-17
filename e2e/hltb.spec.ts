import { test, expect } from '@playwright/test';

// HLTB scheme smoke test.
// HLTB rotates/obfuscates its search API path to break scrapers
// (/api/find -> /api/bleed -> ...). This test hits our own /api/hltb route,
// which talks to HLTB live, and asserts we still get real completion times
// back for a known title. When it goes red, HLTB has changed its scheme —
// re-extract the path and update HLTB_SEARCH_PATH in app/api/hltb/route.ts.
//
// Lives in the e2e suite because it depends on a live external service; treat
// a failure as "HLTB moved," not "our build is broken."
test('hltb route returns completion data for a known title', async ({ request }) => {
  const res = await request.get('/api/hltb', {
    params: { action: 'single', title: 'Stardew Valley' },
  });

  expect(res.ok()).toBeTruthy();

  const body = await res.json();
  expect(body.found).toBe(true);
  // Main-story hours should be a positive number.
  expect(typeof body.main).toBe('number');
  expect(body.main).toBeGreaterThan(0);
});
