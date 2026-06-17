import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  authenticatedMiddleware,
  createAuthenticatedServerFn,
  requireAuthenticatedServerSession
} from '@/features/auth/server/authenticated-middleware';
import { unauthorizedServerFunctionError } from '@/features/auth/lib/unauthorized-error';

async function expectUnauthorizedResponse(error: unknown) {
  expect(error).toBeInstanceOf(Response);

  const response = error as Response;

  expect(response.status).toBe(unauthorizedServerFunctionError.statusCode);
  expect(response.statusText).toBe('Unauthorized');
  await expect(response.json()).resolves.toEqual(unauthorizedServerFunctionError);
}

type GetServerAuthSessionMock = (request: Request) => Promise<unknown>;

const { getServerAuthSessionMock } = vi.hoisted(() => ({
  getServerAuthSessionMock: vi.fn<GetServerAuthSessionMock>()
}));

vi.mock('@/features/auth/server/auth.server', () => ({
  getServerAuthSession: getServerAuthSessionMock
}));

describe('authenticated server middleware', () => {
  beforeEach(() => {
    getServerAuthSessionMock.mockReset();
  });

  test('requires an authenticated session from the request', async () => {
    getServerAuthSessionMock.mockResolvedValue(null);

    const error = await requireAuthenticatedServerSession(
      new Request('https://favoritable.test/protected')
    ).catch((caughtError) => caughtError);

    expect(error).toBeInstanceOf(Response);
    await expectUnauthorizedResponse(error);
  });

  test('rejects anonymous server-function calls before handler logic runs', async () => {
    getServerAuthSessionMock.mockResolvedValue(null);

    const runServerMiddleware = authenticatedMiddleware.options.server;

    expect(runServerMiddleware).toBeTypeOf('function');

    if (!runServerMiddleware) {
      throw new Error('Expected authenticated middleware server function to exist.');
    }

    let error: unknown;

    try {
      await runServerMiddleware({
        context: undefined,
        handlerType: 'serverFn',
        next: (() => {
          throw new Error('Expected anonymous middleware call to short-circuit before next().');
        }) as never,
        pathname: '/_server-fns/protected',
        request: new Request('https://favoritable.test/_server-fns/protected', {
          headers: {
            cookie: 'better-auth.session_token=missing'
          }
        })
      });
    } catch (caughtError) {
      error = caughtError;
    }

    expect(error).toBeInstanceOf(Response);
    await expectUnauthorizedResponse(error);
  });

  test('injects trusted session context into protected server functions', async () => {
    getServerAuthSessionMock.mockResolvedValue({
      session: { id: 'session-1' },
      user: {
        id: 'user-1',
        locale: 'en',
        name: 'User One'
      }
    });

    const runServerMiddleware = authenticatedMiddleware.options.server;

    expect(runServerMiddleware).toBeTypeOf('function');

    if (!runServerMiddleware) {
      throw new Error('Expected authenticated middleware server function to exist.');
    }

    let resolvedContext: unknown;

    await expect(
      runServerMiddleware({
        context: undefined,
        handlerType: 'serverFn',
        next: (async (options?: { context?: unknown }) => {
          resolvedContext = options?.context;

          return resolvedContext;
        }) as never,
        pathname: '/_server-fns/protected',
        request: new Request('https://favoritable.test/_server-fns/protected', {
          headers: {
            cookie: 'better-auth.session_token=valid'
          }
        })
      })
    ).resolves.toEqual({
      session: {
        session: { id: 'session-1' },
        user: {
          id: 'user-1',
          locale: 'en',
          name: 'User One'
        }
      },
      userId: 'user-1'
    });

    expect(resolvedContext).toEqual({
      session: {
        session: { id: 'session-1' },
        user: {
          id: 'user-1',
          locale: 'en',
          name: 'User One'
        }
      },
      userId: 'user-1'
    });

    const request = getServerAuthSessionMock.mock.calls[0]?.[0];

    expect(request).toBeInstanceOf(Request);
    expect(request?.headers.get('cookie')).toBe('better-auth.session_token=valid');
  });

  test('offers reusable authenticated server-function composition for later slices', async () => {
    const authenticatedServerFn = createAuthenticatedServerFn({ method: 'GET' });

    expect(authenticatedServerFn.options.middleware).toEqual([authenticatedMiddleware]);
  });

  test('throws a real 401 response through a complete protected server-function path', async () => {
    getServerAuthSessionMock.mockResolvedValue(null);

    const protectedServerFn = createAuthenticatedServerFn({ method: 'POST' }).handler(async () => {
      throw new Error('Handler must not be reached when session is anonymous.');
    });
    const runServerMiddleware = authenticatedMiddleware.options.server;

    expect(runServerMiddleware).toBeTypeOf('function');

    if (!runServerMiddleware) {
      throw new Error('Expected authenticated middleware server function to exist.');
    }

    let caughtError: unknown;

    try {
      await runServerMiddleware({
        context: undefined,
        handlerType: 'serverFn',
        next: (async () => {
          return protectedServerFn;
        }) as never,
        pathname: '/_server-fns/protected-mutation',
        request: new Request('https://favoritable.test/_server-fns/protected-mutation', {
          headers: {
            cookie: 'better-auth.session_token=anonymous'
          }
        })
      });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(Response);
    await expectUnauthorizedResponse(caughtError);
  });
});
