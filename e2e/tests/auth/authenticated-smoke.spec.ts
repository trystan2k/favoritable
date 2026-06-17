import { expect, test } from '@e2e/fixtures/test';
import { appRoutes } from '@e2e/utils/routes';

test('@smoke seeded authenticated session reaches protected shell, survives reload, and signs out', async ({
  authenticateSession,
  page
}) => {
  await authenticateSession();

  await page.goto(appRoutes.home);

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Your bookmarks' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Add bookmark' })).toBeVisible();
  await expect(page.getByRole('button', { name: /open account menu/i })).toBeVisible();

  await page.reload();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Your bookmarks' })).toBeVisible();

  await page.getByRole('button', { name: /open account menu/i }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /favoritable login shell/i })
  ).toBeVisible();
});
