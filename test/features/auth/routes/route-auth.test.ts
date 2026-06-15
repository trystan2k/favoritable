import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  getRouteContextAuthSession,
  getRouteAuthSession,
  redirectIfLoggedIn,
  redirectIfLoggedOut,
  resolveBrowserRouteAuthSession,
  routeAuthErrorMessage
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

  test('falls back to route auth error message when client error payload has no message', () => {
    expect(() =>
      resolveBrowserRouteAuthSession({
        data: null,
        error: {
          message: ''
        }
      })
    ).toThrow(routeAuthErrorMessage);
  });

  test('returns null when client session payload has no data or error', () => {
    expect(
      resolveBrowserRouteAuthSession({
        data: null,
        error: null
      })
    ).toBeNull();
  });

  test.each([
    ['missing context', undefined],
    ['null context', null],
    ['non-object context', 'session']
  ])('returns undefined for %s', (_label, context) => {
    expect(getRouteContextAuthSession(context)).toBeUndefined();
  });

  test('returns undefined when route context has no session field', () => {
    expect(getRouteContextAuthSession({ user: { id: 'user-1' } })).toBeUndefined();
  });

  test('returns session from route context when present', () => {
    const session = { user: { id: 'user-1' } };

    expect(getRouteContextAuthSession({ session })).toBe(session);
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

  test('returns provided session for logged-in users without loading again', async () => {
    const session = { user: { id: 'user-4' } };

    await expect(redirectIfLoggedOut(session)).resolves.toBe(session);
    expect(getRequestMock).not.toHaveBeenCalled();
  });

  test('treats explicit undefined session as load-needed state', async () => {
    const request = new Request('https://favoritable.test', {
      headers: { cookie: 'better-auth.session_token=token' }
    });
    const session = { user: { id: 'user-5' } };

    getRequestMock.mockReturnValue(request);
    getServerAuthSessionMock.mockResolvedValue(session);

    await expect(redirectIfLoggedOut(undefined)).resolves.toBe(session);
    expect(getServerAuthSessionMock).toHaveBeenCalledWith(request);
  });

  test('treats explicit null session as signed-out state without loading again', async () => {
    await expect(redirectIfLoggedOut(null)).rejects.toMatchObject({
      options: {
        statusCode: 307,
        to: '/login'
      }
    });
    expect(getRequestMock).not.toHaveBeenCalled();
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

  test('allows anonymous users to stay on login when using default session loader', async () => {
    getRequestMock.mockReturnValue(new Request('https://favoritable.test'));

    await expect(redirectIfLoggedIn()).resolves.toBeNull();
  });
});
