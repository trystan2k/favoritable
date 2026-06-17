import { expect, test } from '@e2e/fixtures/test';
import { appRoutes } from '@e2e/utils/routes';

test('@smoke authenticated user can quick add bookmark and see it in library', async ({
  authenticateSession,
  page
}) => {
  await authenticateSession();

  await page.goto(appRoutes.quickAddBookmark);

  await expect(page).toHaveURL(/\/bookmarks\/new$/);

  await page.getByLabel('URL').fill('https://example.com/docs/fav-3');
  await page.getByLabel('Description').fill('Smoke bookmark description');
  await page.getByRole('button', { name: 'Save bookmark' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Your bookmarks' })).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 3, name: 'example.com/docs/fav-3' })
  ).toBeVisible();
  await expect(page.getByText('Smoke bookmark description')).toBeVisible();
});

test('@smoke quick add shows duplicate error when saving same url twice', async ({
  authenticateSession,
  page
}) => {
  await authenticateSession();

  await page.goto(appRoutes.quickAddBookmark);

  await page.getByLabel('URL').fill('https://example.com/docs/fav-3-duplicate');
  await page.getByRole('button', { name: 'Save bookmark' }).click();

  await expect(page).toHaveURL(/\/$/);

  await page.goto(appRoutes.quickAddBookmark);

  await page.getByLabel('URL').fill('https://example.com/docs/fav-3-duplicate');
  await page.getByRole('button', { name: 'Save bookmark' }).click();

  await expect(page.getByText('This URL is already saved in your library.')).toBeVisible();
  await expect(page).toHaveURL(/\/bookmarks\/new$/);
});

test('@smoke quick add shows validation error for invalid url', async ({
  authenticateSession,
  page
}) => {
  await authenticateSession();

  await page.goto(appRoutes.quickAddBookmark);

  await page.getByLabel('URL').fill('not-a-valid-url');
  await page.getByRole('button', { name: 'Save bookmark' }).click();

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/bookmarks\/new$/);
});
