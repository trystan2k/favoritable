import { expect, test } from '../fixtures/test';
import { appRoutes } from '../utils/routes';

test('@smoke logged-out home route redirects to login shell', async ({ page }) => {
  await page.goto(appRoutes.home);

  await expect(page).toHaveTitle(/favoritable/i);
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /favoritable login shell/i })
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Favoritable' })).toBeVisible();
  await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
});
