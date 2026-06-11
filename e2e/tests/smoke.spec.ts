import { expect, test } from '../fixtures/test';
import { appRoutes } from '../utils/routes';

test('@smoke home route renders app shell contract', async ({ page }) => {
  await page.goto(appRoutes.home);

  await expect(page).toHaveTitle(/favoritable/i);
  await expect(page.getByRole('heading', { level: 1, name: /favoritable/i })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});
