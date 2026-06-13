import { expect, test } from '../../fixtures/test';
import { appRoutes } from '../../utils/routes';

const googleOAuthE2EEnvironment = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  email: process.env.E2E_GOOGLE_TEST_EMAIL,
  password: process.env.E2E_GOOGLE_TEST_PASSWORD
};

const isGoogleOAuthE2EConfigured = Object.values(googleOAuthE2EEnvironment).every(Boolean);

test.describe('Google OAuth sign-in flow', () => {
  test.skip(!isGoogleOAuthE2EConfigured, 'Google OAuth E2E env missing. Skipping optional spec.');

  test('signs in with Google, keeps session after reload, reaches protected shell, and signs out', async ({
    browserName,
    page
  }) => {
    test.skip(browserName !== 'chromium', 'Google OAuth validation only runs on chromium.');
    test.slow();

    await page.goto(appRoutes.login);

    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();

    await page.getByRole('button', { name: 'Continue with Google' }).click();
    await page.waitForURL(/accounts\.google\.com/);

    await page.locator('input[type="email"]').fill(googleOAuthE2EEnvironment.email!);
    await page.getByRole('button', { name: /^next$/i }).click();

    await page.locator('input[type="password"]').fill(googleOAuthE2EEnvironment.password!);
    await page.getByRole('button', { name: /^next$/i }).click();

    await page.waitForURL(/\/($|\?)/, { timeout: 120000 });
    await expect(
      page.getByRole('heading', { level: 2, name: 'Protected library shell ready' })
    ).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL(/\/($|\?)/);
    await expect(
      page.getByRole('heading', { level: 2, name: 'Protected library shell ready' })
    ).toBeVisible();

    await page.goto(appRoutes.home);
    await expect(page).toHaveURL(/\/($|\?)/);

    await page.getByRole('button', { name: /open account menu/i }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole('heading', { level: 1, name: /favoritable login shell/i })
    ).toBeVisible();
  });
});
