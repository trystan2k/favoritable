import { expect, test as base } from '@playwright/test';

const TEST_SESSION_SECRET_HEADER = 'x-favoritable-test-session-secret';

type TestSessionPayload = {
  cookies: Array<{
    name: string;
    value: string;
  }>;
  user: {
    email: string;
    id: string;
    name: string;
  };
};

function isTestSessionPayload(value: unknown): value is TestSessionPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('cookies' in value) || !Array.isArray(value.cookies)) {
    return false;
  }

  if (!('user' in value) || typeof value.user !== 'object' || value.user === null) {
    return false;
  }

  return value.cookies.every(
    (cookie) =>
      typeof cookie === 'object' &&
      cookie !== null &&
      'name' in cookie &&
      typeof cookie.name === 'string' &&
      'value' in cookie &&
      typeof cookie.value === 'string'
  );
}

export const test = base.extend<{
  authenticateSession: () => Promise<TestSessionPayload>;
}>({
  authenticateSession: async ({ baseURL, context, request }, use) => {
    await use(async () => {
      if (!baseURL) {
        throw new Error('Playwright baseURL is required for auth session bootstrap.');
      }

      const testSessionSecret = process.env.E2E_TEST_SESSION_SECRET?.trim();

      if (!testSessionSecret) {
        throw new Error('E2E_TEST_SESSION_SECRET is required for authenticated smoke bootstrap.');
      }

      const response = await request.post('/api/auth/test-session', {
        headers: {
          [TEST_SESSION_SECRET_HEADER]: testSessionSecret
        }
      });

      expect(response.ok()).toBe(true);

      const sessionPayload = await response.json();

      if (!isTestSessionPayload(sessionPayload)) {
        throw new Error('Auth session bootstrap returned an invalid payload.');
      }

      await context.addCookies(
        sessionPayload.cookies.map((cookie) => ({
          ...cookie,
          sameSite: 'Lax',
          url: baseURL
        }))
      );

      return sessionPayload;
    });
  }
});

export { expect };
