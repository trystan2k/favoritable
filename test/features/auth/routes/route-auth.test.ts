import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  getRouteAuthSession,
  redirectIfLoggedIn,
  redirectIfLoggedOut,
  resolveBrowserRouteAuthSession
} from '@/features/auth/routes/route-auth';

const { getRequestMock, getServerAuthSessionMock } = vi.hoisted(() => ({
  getRequestMock: vi.fn<() => Request>(),
  getServerAuthSessionMock: vi.fn<() => Promise<unknown>>()
}));

vi.mock('@tanstack/react-start/server', () => ({
  getRequest: getRequestMock
}));

vi.mock('@/features/auth/server/auth.server', () => ({
  getServerAuthSession: getServerAuthSessionMock
}));

describe('route auth helpers', () => {
  beforeEach(() => {
    getRequestMock.mockReset();
    getServerAuthSessionMock.mockReset();
  });

  test('returns route session data when request includes auth cookie', async () => {
    const request = new Request('https://favoritable.test', {
      headers: { cookie: 'better-auth.session_token=token' }
    });
    const session = { user: { id: 'user-1' } };

    getRequestMock.mockReturnValue(request);
    getServerAuthSessionMock.mockResolvedValue(session);

    await expect(getRouteAuthSession()).resolves.toBe(session);
    expect(getServerAuthSessionMock).toHaveBeenCalledWith(request);
  });

  test('returns null without calling server auth when request has no cookie header', async () => {
    getRequestMock.mockReturnValue(new Request('https://favoritable.test'));

    await expect(getRouteAuthSession()).resolves.toBeNull();
    expect(getServerAuthSessionMock).not.toHaveBeenCalled();
  });

  test('throws when Better Auth returns a client session error payload', () => {
    expect(() =>
      resolveBrowserRouteAuthSession({
        data: null,
        error: {
          message: 'Session request failed.'
        }
      })
    ).toThrow('Session request failed.');
  });

  test('redirects logged-out users to login target', async () => {
    getRequestMock.mockReturnValue(new Request('https://favoritable.test'));

    await expect(redirectIfLoggedOut()).rejects.toMatchObject({
      options: {
        statusCode: 307,
        to: '/login'
      }
    });
  });

  test('returns session for logged-in users', async () => {
    const request = new Request('https://favoritable.test', {
      headers: { cookie: 'better-auth.session_token=token' }
    });
    const session = { user: { id: 'user-2' } };

    getRequestMock.mockReturnValue(request);
    getServerAuthSessionMock.mockResolvedValue(session);

    await expect(redirectIfLoggedOut()).resolves.toBe(session);
  });

  test('redirects logged-in users back to home target', async () => {
    await expect(
      redirectIfLoggedIn(Promise.resolve({ user: { id: 'user-3' } }))
    ).rejects.toMatchObject({
      options: {
        statusCode: 307,
        to: '/'
      }
    });
  });

  test('allows anonymous users to stay on login', async () => {
    await expect(redirectIfLoggedIn(Promise.resolve(null))).resolves.toBeNull();
  });
});
