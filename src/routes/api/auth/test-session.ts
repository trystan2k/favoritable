import { randomUUID, timingSafeEqual } from 'node:crypto';

import { createFileRoute } from '@tanstack/react-router';
import { testUtils } from 'better-auth/plugins';

import { createAuth } from '@/features/auth/server/auth.server';
import { getAuthEnvironment } from '@/features/auth/server/env.server';

type AuthTestHelpers = {
  createUser(overrides?: Record<string, unknown>): {
    email: string;
    id: string;
    name: string;
  };
  login(options: { userId: string }): Promise<{ headers: Headers }>;
  saveUser(user: { email: string; id: string; name: string }): Promise<{
    email: string;
    id: string;
    name: string;
  }>;
};

type TestSessionCookie = {
  name: string;
  value: string;
};

function isAuthTestContext(
  value: Awaited<ReturnType<typeof createAuth>['$context']>
): value is Awaited<ReturnType<typeof createAuth>['$context']> & { test: AuthTestHelpers } {
  return typeof value === 'object' && value !== null && 'test' in value;
}

const TEST_SESSION_SECRET_HEADER = 'x-favoritable-test-session-secret';
const LOCAL_TEST_SESSION_HOSTNAMES = new Set(['127.0.0.1', '::1', 'localhost']);

function isE2EPreviewAuthEnabled() {
  return process.env.E2E_PREVIEW === 'true';
}

function isLocalTestSessionRequest(request: Request) {
  try {
    return LOCAL_TEST_SESSION_HOSTNAMES.has(new URL(request.url).hostname);
  } catch {
    return false;
  }
}

function hasValidTestSessionSecret(request: Request) {
  const configuredSecret = process.env.E2E_TEST_SESSION_SECRET?.trim();
  const providedSecret = request.headers.get(TEST_SESSION_SECRET_HEADER)?.trim();

  if (!configuredSecret || !providedSecret) {
    return false;
  }

  const configuredSecretBuffer = Buffer.from(configuredSecret);
  const providedSecretBuffer = Buffer.from(providedSecret);

  return (
    configuredSecretBuffer.length === providedSecretBuffer.length &&
    timingSafeEqual(configuredSecretBuffer, providedSecretBuffer)
  );
}

function canCreateTestSession(request: Request) {
  return (
    isE2EPreviewAuthEnabled() &&
    isLocalTestSessionRequest(request) &&
    hasValidTestSessionSecret(request)
  );
}

function parseRequestCookies(cookieHeader: string): TestSessionCookie[] {
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const [name, ...valueParts] = cookie.split('=');

      return {
        name,
        value: valueParts.join('=')
      };
    })
    .filter((cookie) => cookie.name && cookie.value);
}

async function createTestSession() {
  const auth = createAuth({
    additionalPlugins: [testUtils()],
    environment: getAuthEnvironment()
  });
  const authContext = await auth.$context;

  if (!isAuthTestContext(authContext)) {
    throw new Error('Better Auth test helpers are unavailable for E2E session bootstrap.');
  }

  const createdUser = authContext.test.createUser({
    email: `e2e-smoke+${randomUUID()}@favoritable.test`,
    name: 'E2E Smoke User'
  });
  const savedUser = await authContext.test.saveUser(createdUser);
  const login = await authContext.test.login({ userId: savedUser.id });
  const cookieHeader = login.headers.get('cookie');

  if (!cookieHeader) {
    throw new Error('Better Auth test login did not return a cookie header.');
  }

  return {
    cookies: parseRequestCookies(cookieHeader),
    user: {
      email: savedUser.email,
      id: savedUser.id,
      name: savedUser.name
    }
  };
}

export const Route = createFileRoute('/api/auth/test-session')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!canCreateTestSession(request)) {
          return new Response('Not found', { status: 404 });
        }

        return Response.json(await createTestSession());
      }
    }
  }
});
