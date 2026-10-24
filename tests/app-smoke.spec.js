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

test('contact view shows translated defaults instead of blank labels', async ({ page }) => {
  await page.goto('/');

  for (const id of ['#contact-phone', '#contact-email', '#contact-address', '#contact-hours']) {
    await expect(page.locator(id)).not.toBeEmpty();
  }
  await expect(page.locator('#contact-phone')).toContainText('Phone');

  // Xhosa has no contact_view_* translations, so English must be used
  await page.locator('#language-selector').selectOption('xh');
  await expect(page.locator('#contact-phone')).toContainText('Phone');

  await page.locator('#language-selector').selectOption('af');
  await expect(page.locator('#contact-phone')).toContainText('Telefoon');
});

test('missing translations fall back to English, then existing content, then a placeholder', async ({ page }) => {
  await page.goto('/');

  const result = await page.evaluate(() => {
    window.translations.en.test_only_key = 'English value';
    window.translations.xh.test_only_key = '   ';
    $('body').append('<span id="t-fallback" data-translate="test_only_key"></span>');
    $('body').append('<span id="t-keep" data-translate="test_missing_key">Existing text</span>');
    $('body').append('<span id="t-empty" data-translate="test_missing_key"></span>');
    changeLanguage('xh');
    return {
      fallback: $('#t-fallback').text(),
      keep: $('#t-keep').text(),
      empty: $('#t-empty').text(),
    };
  });

  expect(result).toEqual({ fallback: 'English value', keep: 'Existing text', empty: '—' });
});

test('saved contact details are not overwritten when switching language', async ({ page }) => {
  await page.goto('/?contact_phone=0123456789');

  await expect(page.locator('#contact-phone')).toContainText('0123456789');
  await page.locator('#language-selector').selectOption('af');
  await expect(page.locator('#contact-phone')).toContainText('0123456789');
});
