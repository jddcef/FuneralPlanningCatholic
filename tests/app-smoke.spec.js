const { test, expect } = require('@playwright/test');

test('page loads with core sections visible', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Catholic Funeral Planner' })).toBeVisible();
  await expect(page.locator('#planning')).toContainText('Planning Tools');
  await expect(page.locator('#downloads')).toContainText('Downloads');
  await expect(page.locator('#faq')).toContainText('Frequently Asked Questions');
});

test('selecting a hymn and reading persists to localStorage', async ({ page }) => {
  await page.goto('/');

  const hymnCheckbox = page.locator('input[name="hymn"]').first();
  await hymnCheckbox.check();

  const readingRadio = page.locator('input[name^="reading-"]').first();
  await readingRadio.check();

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('funeral-planner-v1')));
  expect(stored).toBeTruthy();
  expect(stored.schemaVersion).toBe(2);
  expect(stored.data.hymns.length).toBeGreaterThan(0);
  expect(Object.keys(stored.data.readings).length).toBeGreaterThan(0);
});

test('theme filter narrows visible readings', async ({ page }) => {
  await page.goto('/');

  const themeFilter = page.locator('#theme-filter');
  await themeFilter.selectOption({ label: 'Hope' });

  const visibleReadings = page.locator('.reading-group .font-medium');
  await expect(visibleReadings.first()).toBeVisible();

  const texts = await visibleReadings.allTextContents();
  expect(texts.some(text => text.toLowerCase().includes('hope') || text.toLowerCase().includes('wisdom') || text.toLowerCase().includes('job'))).toBeTruthy();
});
