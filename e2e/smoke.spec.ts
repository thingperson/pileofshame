import { test, expect } from '@playwright/test';

// One smoke test. Covers the critical onboarding path:
// landing -> load sample -> open "Pick My Game" -> close.
// If this breaks, we do not ship.
test('landing -> sample -> roll modal opens', async ({ page }) => {
  await page.goto('/');

  // Landing page loads. The sample-library affordance is a text-link button in
  // the bottom CTA ("Or poke around the sample library first") since the
  // 2026-07-21 landing conversion — the hero's link runs Import, not the sample.
  const sampleBtn = page.getByRole('button', { name: /sample library/i }).first();
  await expect(sampleBtn).toBeVisible();

  // Load sample library
  await sampleBtn.click();

  // Main app is now showing — the hero CTA should be present
  const rollBtn = page.getByRole('button', { name: /pick my game/i }).first();
  await expect(rollBtn).toBeVisible({ timeout: 15_000 });

  // Open the roll modal
  await rollBtn.click();

  // Roll modal is open (role="dialog", aria-label="Pick My Game")
  const modal = page.getByRole('dialog', { name: /pick my game/i });
  await expect(modal).toBeVisible();

  // Modal has a close button we can reach
  const closeBtn = modal.getByRole('button', { name: /close/i });
  await expect(closeBtn).toBeVisible();

  // Close the modal — make sure that path works too
  await closeBtn.click();
  await expect(modal).toBeHidden();
});
