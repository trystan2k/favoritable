import type { ReactNode } from 'react';
import { redirect } from '@tanstack/react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Route as LoginRoute, getClientAuthProviderAvailability } from '@/routes/login';
import { Route as ProtectedRoute } from '@/routes/_protected';
import { Route as AuthApiRoute } from '@/routes/api/auth/$';
import { Route as AuthProvidersRoute } from '@/routes/api/auth/providers';
import { Route as AuthTestSessionRoute } from '@/routes/api/auth/test-session';

const {
  authContextMock,
  authHandlerMock,
  authTestCreateUserMock,
  authTestLoginMock,
  authTestSaveUserMock,
  loginRedirectMock,
  protectedRedirectMock
} = vi.hoisted(() => ({
  loginRedirectMock: vi.fn<() => Promise<unknown>>(),
  protectedRedirectMock: vi.fn<() => Promise<unknown>>(),
  authHandlerMock: vi.fn<(request: Request) => Promise<Response>>(
    async (request) => new Response(request.method)
  ),
  authContextMock: vi.fn<() => Promise<unknown>>(),
  authTestCreateUserMock:
    vi.fn<(overrides?: Record<string, unknown>) => { email: string; id: string; name: string }>(),
  authTestSaveUserMock: vi.fn<
    (user: { email: string; id: string; name: string }) => Promise<{
      email: string;
      id: string;
      name: string;
    }>
  >(),
  authTestLoginMock: vi.fn<
    (options: { userId: string }) => Promise<{
      headers: Headers;
    }>
  >()
}));

vi.mock('@/features/auth/components/LoginPage', () => ({
  LoginPage: () => <div>LoginPage</div>
}));

vi.mock('@/features/app-shell/views/ProtectedAppShell', () => ({
  ProtectedAppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

vi.mock('@/features/auth/routes/route-auth', () => ({
  getRouteContextAuthSession: (context: { session?: unknown } | undefined) => context?.session,
  getRouteAuthSession: vi.fn<() => Promise<unknown>>(async () => null),
  redirectIfLoggedIn: loginRedirectMock,
  redirectIfLoggedOut: protectedRedirectMock
}));

vi.mock('@/features/auth/server/auth.server', () => ({
  createAuth: () => ({
    $context: authContextMock()
  }),
  getAuth: () => ({
    handler: authHandlerMock
  })
}));

vi.mock('@/features/auth/server/env.server', () => ({
  getAuthEnvironment: () => ({
    baseUrl: 'http://127.0.0.1:4173',
    databaseAuthToken: undefined,
    databaseUrl: 'file:./data/favoritable.db',
    googleProvider: {},
    secret: 'favoritable-test-auth-secret-1234567890',
    trustedOrigins: ['http://127.0.0.1:4173'],
    useSecureCookies: false
  }),
  getAuthProviderAvailability: () => ({ google: true })
}));

describe('auth routes', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const testSessionSecret = 'favoritable-e2e-test-session-secret';

  function getAuthTestSessionHandlers() {
    return typeof AuthTestSessionRoute.options.server?.handlers === 'function'
      ? AuthTestSessionRoute.options.server.handlers({} as never)
      : AuthTestSessionRoute.options.server?.handlers;
  }

  function createLocalhostTestSessionRequest(headers?: HeadersInit) {
    return new Request('http://localhost:4173/api/auth/test-session', {
      headers,
      method: 'POST'
    });
  }

  beforeEach(() => {
    fetchMock.mockReset();
    loginRedirectMock.mockReset();
    protectedRedirectMock.mockReset();
    authContextMock.mockReset();
    authTestCreateUserMock.mockReset();
    authTestSaveUserMock.mockReset();
    authTestLoginMock.mockReset();
    authTestCreateUserMock.mockReturnValue({
      email: 'e2e-smoke@favoritable.test',
      id: 'test-user-id',
      name: 'E2E Smoke User'
    });
    authTestSaveUserMock.mockImplementation(async (user) => user);
    authTestLoginMock.mockResolvedValue({
      headers: new Headers({
        cookie: 'better-auth.session_token=session-token; better-auth.csrf=csrf-token'
      })
    });
    authContextMock.mockResolvedValue({
      test: {
        createUser: authTestCreateUserMock,
        login: authTestLoginMock,
        saveUser: authTestSaveUserMock
      }
    });
    vi.stubEnv('E2E_PREVIEW', 'false');
    vi.stubEnv('E2E_TEST_SESSION_SECRET', testSessionSecret);
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  test('login route returns provider availability context for anonymous users', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ google: true }), {
        headers: { 'content-type': 'application/json' },
        status: 200
      })
    );

    await expect(LoginRoute.options.beforeLoad?.({} as never)).resolves.toEqual({
      providerAvailability: {
        google: true
      }
    });

    expect(loginRedirectMock).toHaveBeenCalledTimes(1);
    expect(loginRedirectMock.mock.calls[0]).toEqual([]);
  });

  test('login route reuses root session context for redirect checks', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ google: true }), {
        headers: { 'content-type': 'application/json' },
        status: 200
      })
    );
    const session = {
      user: {
        email: 'hello@favoritable.app',
        name: 'Thiago'
      }
    };

    await LoginRoute.options.beforeLoad?.({
      context: { session }
    } as never);

    expect(loginRedirectMock).toHaveBeenCalledTimes(1);
    const [routeAuthSessionPromise] = loginRedirectMock.mock.calls[0] as unknown as [
      Promise<unknown>
    ];

    await expect(routeAuthSessionPromise).resolves.toBe(session);
  });

  test('login route preserves explicit signed-out root session context', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ google: true }), {
        headers: { 'content-type': 'application/json' },
        status: 200
      })
    );

    await LoginRoute.options.beforeLoad?.({
      context: { session: null }
    } as never);

    expect(loginRedirectMock).toHaveBeenCalledTimes(1);
    const [routeAuthSessionPromise] = loginRedirectMock.mock.calls[0] as unknown as [
      Promise<unknown>
    ];

    await expect(routeAuthSessionPromise).resolves.toBeNull();
  });

  test('login route rejects with a real redirect for authenticated users', async () => {
    const authenticatedRedirect = redirect({ to: '/' });

    loginRedirectMock.mockRejectedValueOnce(authenticatedRedirect);

    await expect(LoginRoute.options.beforeLoad?.({} as never)).rejects.toBe(authenticatedRedirect);
    expect(loginRedirectMock).toHaveBeenCalledTimes(1);
  });

  test('client provider availability falls back to false when the request fails', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

    await expect(getClientAuthProviderAvailability(fetchMock)).resolves.toEqual({
      google: false
    });
  });

  test('client provider availability falls back to false when the payload shape is invalid', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ provider: 'google' }), {
        headers: { 'content-type': 'application/json' },
        status: 200
      })
    );

    await expect(getClientAuthProviderAvailability(fetchMock)).resolves.toEqual({
      google: false
    });
  });

  test('client provider availability rejects non-boolean Google payloads', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ google: 'true' }), {
        headers: { 'content-type': 'application/json' },
        status: 200
      })
    );

    await expect(getClientAuthProviderAvailability(fetchMock)).resolves.toEqual({
      google: false
    });
  });

  test('protected route returns session context from guard', async () => {
    protectedRedirectMock.mockResolvedValueOnce({
      user: {
        email: 'hello@favoritable.app',
        name: 'Thiago'
      }
    });

    await expect(ProtectedRoute.options.beforeLoad?.({} as never)).resolves.toEqual({
      session: {
        user: {
          email: 'hello@favoritable.app',
          name: 'Thiago'
        }
      }
    });
  });

  test('protected route reuses root session context when available', async () => {
    const session = {
      user: {
        email: 'hello@favoritable.app',
        name: 'Thiago'
      }
    };

    protectedRedirectMock.mockResolvedValueOnce(session);

    await expect(
      ProtectedRoute.options.beforeLoad?.({
        context: { session }
      } as never)
    ).resolves.toEqual({ session });
    expect(protectedRedirectMock).toHaveBeenCalledTimes(1);
    expect(protectedRedirectMock).toHaveBeenCalledWith(session);
  });

  test('protected route reuses explicit signed-out root session context', async () => {
    const protectedRedirect = redirect({ to: '/login' });

    protectedRedirectMock.mockRejectedValueOnce(protectedRedirect);

    await expect(
      ProtectedRoute.options.beforeLoad?.({
        context: { session: null }
      } as never)
    ).rejects.toBe(protectedRedirect);
    expect(protectedRedirectMock).toHaveBeenCalledTimes(1);
    expect(protectedRedirectMock).toHaveBeenCalledWith(null);
  });

  test('auth api route forwards GET requests to Better Auth handler', async () => {
    const request = new Request('http://localhost:4000/api/auth/session', {
      method: 'GET'
    });
    const handlerRecord =
      typeof AuthApiRoute.options.server?.handlers === 'function'
        ? AuthApiRoute.options.server.handlers({} as never)
        : AuthApiRoute.options.server?.handlers;
    const response = await (handlerRecord?.GET as any)?.({ request } as never);

    expect(authHandlerMock).toHaveBeenCalledWith(request);
    await expect(response?.text()).resolves.toBe('GET');
  });

  test('auth api route forwards POST requests to Better Auth handler', async () => {
    const request = new Request('http://localhost:4000/api/auth/sign-out', {
      method: 'POST'
    });
    const handlerRecord =
      typeof AuthApiRoute.options.server?.handlers === 'function'
        ? AuthApiRoute.options.server.handlers({} as never)
        : AuthApiRoute.options.server?.handlers;
    const response = await (handlerRecord?.POST as any)?.({ request } as never);

    expect(authHandlerMock).toHaveBeenCalledWith(request);
    await expect(response?.text()).resolves.toBe('POST');
  });

  test('provider availability api exposes Google availability', async () => {
    const handlerRecord =
      typeof AuthProvidersRoute.options.server?.handlers === 'function'
        ? AuthProvidersRoute.options.server.handlers({} as never)
        : AuthProvidersRoute.options.server?.handlers;
    const response = await (handlerRecord?.GET as any)?.({} as never);

    await expect(response?.json()).resolves.toEqual({ google: true });
  });

  test('test-session api stays disabled outside E2E preview runs', async () => {
    const handlerRecord = getAuthTestSessionHandlers();
    const response = await (handlerRecord?.POST as any)?.({
      request: createLocalhostTestSessionRequest({
        'x-favoritable-test-session-secret': testSessionSecret
      })
    } as never);

    expect(response?.status).toBe(404);
  });

  test('test-session api rejects missing test session secrets during E2E preview runs', async () => {
    process.env.E2E_PREVIEW = 'true';
    const handlerRecord = getAuthTestSessionHandlers();
    const response = await (handlerRecord?.POST as any)?.({
      request: createLocalhostTestSessionRequest()
    } as never);

    expect(response?.status).toBe(404);
  });

  test('test-session api rejects invalid test session secrets during E2E preview runs', async () => {
    process.env.E2E_PREVIEW = 'true';
    const handlerRecord = getAuthTestSessionHandlers();
    const response = await (handlerRecord?.POST as any)?.({
      request: createLocalhostTestSessionRequest({
        'x-favoritable-test-session-secret': 'wrong-secret'
      })
    } as never);

    expect(response?.status).toBe(404);
  });

  test('test-session api returns seeded cookies and user details during E2E preview runs', async () => {
    process.env.E2E_PREVIEW = 'true';
    const handlerRecord = getAuthTestSessionHandlers();
    const response = await (handlerRecord?.POST as any)?.({
      request: createLocalhostTestSessionRequest({
        'x-favoritable-test-session-secret': testSessionSecret
      })
    } as never);

    await expect(response?.json()).resolves.toEqual({
      cookies: [
        {
          name: 'better-auth.session_token',
          value: 'session-token'
        },
        {
          name: 'better-auth.csrf',
          value: 'csrf-token'
        }
      ],
      user: {
        email: 'e2e-smoke@favoritable.test',
        id: 'test-user-id',
        name: 'E2E Smoke User'
      }
    });
    expect(authTestCreateUserMock).toHaveBeenCalledTimes(1);
    expect(authTestSaveUserMock).toHaveBeenCalledTimes(1);
    expect(authTestLoginMock).toHaveBeenCalledWith({ userId: 'test-user-id' });
  });

  test('test-session api rejects when Better Auth test helpers are unavailable', async () => {
    process.env.E2E_PREVIEW = 'true';
    authContextMock.mockResolvedValueOnce({});
    const handlerRecord = getAuthTestSessionHandlers();

    await expect(
      (handlerRecord?.POST as any)?.({
        request: createLocalhostTestSessionRequest({
          'x-favoritable-test-session-secret': testSessionSecret
        })
      } as never)
    ).rejects.toThrow('Better Auth test helpers are unavailable for E2E session bootstrap.');
  });

  test('test-session api rejects when Better Auth login returns no cookie header', async () => {
    process.env.E2E_PREVIEW = 'true';
    authTestLoginMock.mockResolvedValueOnce({
      headers: new Headers()
    });
    const handlerRecord = getAuthTestSessionHandlers();

    await expect(
      (handlerRecord?.POST as any)?.({
        request: createLocalhostTestSessionRequest({
          'x-favoritable-test-session-secret': testSessionSecret
        })
      } as never)
    ).rejects.toThrow('Better Auth test login did not return a cookie header.');
  });
});
