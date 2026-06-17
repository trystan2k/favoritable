import { expect, test } from '@e2e/fixtures/test';
import { appRoutes } from '@e2e/utils/routes';

test('@smoke unknown public route renders standalone localized 404 with CTA to login', async ({
  page
}) => {
  await page.goto(appRoutes.unknownPublic);

  // Standalone 404 — no protected shell chrome
  await expect(
    page.getByRole('heading', { level: 2, name: 'Protected bookmark library' })
  ).toHaveCount(0);

  // Localized 404 content
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(
    page.getByText("The page you're looking for doesn't exist or has been moved.")
  ).toBeVisible();

  // CTA points to /login
  const ctaLink = page.getByRole('link', { name: /go to login/i });
  await expect(ctaLink).toBeVisible();
  await expect(ctaLink).toHaveAttribute('href', '/login');

  // Follow CTA — reaches login
  await ctaLink.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /favoritable login shell/i })
  ).toBeVisible();
});
