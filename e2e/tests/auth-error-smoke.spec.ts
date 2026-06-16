import { expect, test } from '../fixtures/test';
import { appRoutes } from '../utils/routes';

test('@smoke auth error route renders standalone localized error page with CTA to login', async ({
  page
}) => {
  await page.goto(appRoutes.authError);

  await expect(
    page.getByRole('heading', { level: 2, name: 'Protected library shell ready' })
  ).toHaveCount(0);

  await expect(page.getByRole('heading', { level: 1, name: 'Authentication error' })).toBeVisible();
  await expect(
    page.getByText('Something went wrong during authentication. Please try again.')
  ).toBeVisible();

  const ctaLink = page.getByRole('link', { name: /go to login/i });
  await expect(ctaLink).toBeVisible();
  await expect(ctaLink).toHaveAttribute('href', '/login');

  await ctaLink.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /favoritable login shell/i })
  ).toBeVisible();
});
