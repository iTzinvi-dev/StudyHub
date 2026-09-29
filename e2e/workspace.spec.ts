import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function openDesk(page: Page) {
  await page.goto('/');
  await expect(page.locator('.connection')).toHaveText('Browser online');
}

test('requires a topic and restores input focus after finishing', async ({ page }) => {
  await openDesk(page);
  await page.getByRole('button', { name: 'Start focusing' }).click();
  await expect(page.getByRole('alert')).toHaveText('Add a topic before you start.');
  await expect(page.getByLabel('What are you studying?')).toBeFocused();

  await page.getByLabel('What are you studying?').fill('Physics · chapter four');
  await page.getByRole('button', { name: 'Start focusing' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByLabel('What are you studying?')).toBeDisabled();
  await page.getByRole('button', { name: 'Finish session' }).click();
  await expect(page.locator('.session-list')).toContainText('Physics · chapter four');
  await expect(page.getByLabel('What are you studying?')).toBeFocused();
  await expect(page.getByRole('timer')).toHaveText('00:00:00');
});

test('counts elapsed time, excludes pauses, and updates daily progress', async ({ page }) => {
  await openDesk(page);
  await page.clock.install({ time: new Date('2026-09-28T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-09-28T12:01:00Z'));
  await page.getByLabel('What are you studying?').fill('Calculus');
  await page.getByRole('button', { name: 'Start focusing' }).click();
  await page.clock.fastForward(61000);
  await expect(page.getByRole('timer')).toHaveText('00:01:01');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.clock.fastForward(60000);
  await expect(page.getByRole('timer')).toHaveText('00:01:01');
  await page.getByRole('button', { name: 'Keep going' }).click();
  await page.clock.fastForward(59000);
  await expect(page.getByRole('timer')).toHaveText('00:02:00');
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '120000');
  await page.getByRole('button', { name: 'Finish session' }).click();
  await expect(page.locator('.session-list')).toContainText('0h 2m');
});

test('supports cancelling and confirming a reset', async ({ page }) => {
  await openDesk(page);
  await page.getByLabel('What are you studying?').fill('Biology');
  await page.getByRole('button', { name: 'Start focusing' }).click();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Reset timer' }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reset timer' }).click();
  await expect(page.getByRole('timer')).toHaveText('00:00:00');
  await expect(page.getByLabel('What are you studying?')).toHaveValue('Biology');
  await expect(page.getByLabel('What are you studying?')).toBeEnabled();
});

test('leaves zen mode with Escape and restores keyboard focus', async ({ page }) => {
  await openDesk(page);
  await page.getByRole('button', { name: 'Go zen' }).click();
  await expect(page.getByRole('button', { name: 'Leave zen' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden();
  await expect(page.getByRole('timer')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Go zen' })).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
});

test('provides page titles, a description, and the custom favicon', async ({ page, request }) => {
  await openDesk(page);
  await expect(page).toHaveTitle('StudyHub — a little room for focus');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /quiet place to study/i);
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute('href', /icon\.svg/);
  const icon = await request.get('/icon.svg');
  expect(icon.ok()).toBeTruthy();
  expect(icon.headers()['content-type']).toContain('image/svg+xml');
});

for (const route of [
  { path: '/about', heading: 'Less app. More studying.' },
  { path: '/terms', heading: 'Terms & conditions' },
  { path: '/privacy', heading: 'Privacy notice' },
]) {
  test(`${route.path} has readable content and no detected WCAG A/AA violations`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(route.heading);
    await expect(page.getByRole('navigation', { name: 'Information' })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('supports narrow screens, reduced motion, and accessible controls', async ({ page }, testInfo) => {
  await openDesk(page);
  await page.evaluate(() => document.fonts.ready);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, `Horizontal overflow at ${width}px`).toBe(false);
  }

  const animation = await page.locator('.tea-steam').evaluate((element) =>
    getComputedStyle(element).animationName,
  );
  expect(animation).toBe('none');
  await testInfo.attach('desk-preview', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});

test('serves a useful missing-page response', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page isn’t here.');
  await expect(page.getByRole('link', { name: 'Back to my desk' })).toHaveAttribute('href', '/');
});
