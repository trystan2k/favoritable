import { expect, test } from '@e2e/fixtures/test';
import { appRoutes } from '@e2e/utils/routes';

test('@smoke signed-out locale switch persists across reload', async ({ page }) => {
  await page.goto(appRoutes.login);

  await expect(page).toHaveURL(/\/login$/);

  // Open language switcher and select Português (Brasil)
  await page.getByLabel('Language').click();
  await page.getByRole('option', { name: 'Português (Brasil)' }).click();

  // Verify Portuguese copy is visible after switch
  await expect(page.getByText('Boas-vindas')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

  // Reload — locale must persist from localStorage
  await page.reload();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Boas-vindas')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});

test('@smoke authenticated profile locale switch persists across reload', async ({
  authenticateSession,
  page
}) => {
  await authenticateSession();

  await page.goto(appRoutes.home);

  await expect(page.getByRole('heading', { level: 2, name: 'Your bookmarks' })).toBeVisible();

  await page.getByRole('button', { name: /open account menu/i }).click();
  await page.getByLabel('Language').click();
  await page.getByRole('option', { name: 'Português (Brasil)' }).click();

  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Seus favoritos'
    })
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

  await page.reload();

  await expect(page).toHaveURL(/\/($|\?)/);
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Seus favoritos'
    })
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});
