import { expect, test } from '../../fixtures/test';
import { appRoutes } from '../../utils/routes';

test('@smoke unknown authenticated route renders shell-wrapped localized 404 with CTA to home', async ({
  authenticateSession,
  page
}) => {
  await authenticateSession();

  await page.goto(appRoutes.unknownPublic);

  // Protected shell chrome must be present (shell-wrapped 404)
  await expect(
    page.getByRole('heading', { level: 2, name: 'Protected library shell ready' })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /open account menu/i })).toBeVisible();

  // Localized 404 content inside shell (h2, not h1)
  await expect(page.getByRole('heading', { level: 2, name: 'Page not found' })).toBeVisible();
  await expect(
    page.getByText("The page you're looking for doesn't exist or has been moved.")
  ).toBeVisible();

  // CTA points to protected home /
  const ctaLink = page.getByRole('link', { name: /go home/i });
  await expect(ctaLink).toBeVisible();
  await expect(ctaLink).toHaveAttribute('href', '/');

  // Follow CTA — reaches protected home
  await ctaLink.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('heading', { level: 2, name: 'Protected library shell ready' })
  ).toBeVisible();
});
