import { expect, test } from '@playwright/test';

test('production demo applies filters, changes pages and opens RTL drawer', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('');
  const english = page.locator('.demo-section').first();
  await english.getByRole('searchbox').fill('Jane');
  await expect(
    english.getByRole('cell', { name: 'Jane Cooper', exact: true }).first(),
  ).toBeVisible();
  await english.getByRole('searchbox').fill('');
  await expect(english.getByText('Page 1 of 9', { exact: true })).toBeVisible();
  await expect(
    english.getByRole('button', { name: 'Next', exact: true }),
  ).toBeEnabled();
  await english.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(english.getByText('Page 2 of 9', { exact: true })).toBeVisible();
  await english.getByRole('button', { name: 'Filters', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: 'Status', exact: true }).click();
  await page.getByRole('option', { name: 'Draft', exact: true }).click();
  await dialog
    .getByRole('button', { name: 'Apply filters', exact: true })
    .click();
  await expect(
    english.getByRole('button', { name: 'Status: Draft' }),
  ).toBeVisible();
  await expect(english.getByText('Page 1 of 3', { exact: true })).toBeVisible();
  const persian = page.locator('.demo-section').nth(1);
  await persian
    .getByRole('button', { name: 'فیلترهای بیشتر', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveAttribute('dir', 'rtl');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'بستن', exact: true })
    .last()
    .click();
  expect(errors).toEqual([]);
});

test('documentation works without JavaScript and exposes metadata', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/rc-table-advanced/docs/url-state/');
  await expect(
    page.getByRole('heading', {
      name: 'Shareable URL state and multiple tables',
    }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://mobinarastinmanesh.github.io/rc-table-advanced/docs/url-state/',
  );
  await page
    .getByRole('link', { name: 'Calendars, localization and RTL', exact: true })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'Calendars, localization and RTL',
      exact: true,
    }),
  ).toBeVisible();
  await context.close();
});

test('Next.js hydrates and filters server-rendered rows without client errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:4174');
  await expect(
    page.getByRole('cell', { name: 'Jane SSR', exact: true }),
  ).toBeVisible();
  await page.getByRole('searchbox').fill('Sara');
  await expect(
    page.getByRole('cell', { name: 'Jane SSR', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('cell', { name: 'Sara SSR', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile demo and documentation remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('');
  await expect(
    page.getByRole('heading', { name: 'rc-table-advanced', exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('.demo-section').first().getByRole('searchbox'),
  ).toBeVisible();
  await page.goto('docs/getting-started/');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('changing visible calendar keeps the stored day and dialog focus stays contained', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:4174');
  const opener = page.getByRole('button', { name: /^Filters/ });
  await opener.focus();
  await opener.press('Enter');
  const dialog = page.getByRole('dialog');
  const close = dialog.getByRole('button', { name: 'Close', exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    dialog.getByRole('combobox', { name: 'Created calendar' }),
  ).toBeFocused();
  await expect(dialog.locator('input')).toHaveValue('2026/11/11');
  await dialog.getByRole('combobox', { name: 'Created calendar' }).click();
  await page
    .getByRole('option', { name: 'Jalali (Persian)', exact: true })
    .click();
  await expect(dialog.locator('input')).not.toHaveValue('2026/11/11');
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press('Tab');
    await expect
      .poll(() =>
        page.evaluate(
          () => !!document.activeElement?.closest('[role="dialog"]'),
        ),
      )
      .toBe(true);
  }
  await dialog
    .getByRole('button', { name: 'Apply filters', exact: true })
    .click();
  await expect(page.getByLabel('Stored date')).toHaveText('2026-11-11');
  await expect(opener).toBeFocused();
  await opener.click();
  await expect(dialog.locator('input')).toHaveValue('2026/11/11');
});

test('coverage documentation links to a complete report and matching public JSON', async ({
  page,
}) => {
  await page.goto('docs/testing/');
  await expect(
    page.getByRole('heading', {
      name: 'Testing strategy and measured coverage',
    }),
  ).toBeVisible();
  const report = page.getByRole('link', { name: 'interactive HTML report' });
  await expect(report).toHaveAttribute('href', '/rc-table-advanced/coverage/');
  const response = await page.request.get(
    '/rc-table-advanced/coverage/summary.json',
  );
  expect(response.ok()).toBe(true);
  const summary = await response.json();
  expect(summary.total.lines.pct).toBeGreaterThanOrEqual(
    summary.thresholds.lines,
  );
  expect(summary.total.branches.pct).toBeGreaterThanOrEqual(
    summary.thresholds.branches,
  );
  expect(summary.tests).toBeGreaterThan(0);
  await report.click();
  await expect(
    page.getByRole('heading', { name: 'All files', exact: true }),
  ).toBeVisible();
  const badge = await page.request.get('/rc-table-advanced/coverage/badge.svg');
  expect(badge.ok()).toBe(true);
  expect(await badge.text()).toContain(String(summary.total.lines.pct));
});
