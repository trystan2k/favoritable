import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getAuth, getServerAuthSession } from '@/features/auth/server/auth.server';

type GetSessionMock = (options: { headers: Headers }) => Promise<unknown>;
type UpdateUserMock = (options: { body: { locale: string }; headers: Headers }) => Promise<unknown>;
type BetterAuthMock = (options: unknown) => {
  $context: Promise<{ options: unknown }>;
  api: {
    getSession: GetSessionMock;
    updateUser: UpdateUserMock;
  };
  handler: () => void;
};

const { betterAuthMock, getSessionMock, updateUserMock, appLoggerWarnMock } = vi.hoisted(() => ({
  appLoggerWarnMock: vi.fn<(message: string, context?: Record<string, unknown>) => void>(),
  betterAuthMock: vi.fn<BetterAuthMock>(),
  getSessionMock: vi.fn<GetSessionMock>(),
  updateUserMock: vi.fn<UpdateUserMock>()
}));

vi.mock('better-auth', async () => {
  const actual = await vi.importActual<typeof import('better-auth')>('better-auth');

  return {
    ...actual,
    betterAuth: betterAuthMock.mockImplementation((options) => ({
      $context: Promise.resolve({ options }),
      api: {
        getSession: getSessionMock,
        updateUser: updateUserMock
      },
      handler: vi.fn<() => void>()
    }))
  };
});

vi.mock('@/shared/logging/logger', () => ({
  appLogger: {
    error: vi.fn<() => void>(),
    warn: appLoggerWarnMock
  }
}));

describe('auth server', () => {
  beforeEach(() => {
    betterAuthMock.mockClear();
    getSessionMock.mockReset();
    updateUserMock.mockReset();
    appLoggerWarnMock.mockReset();
  });

  test('creates a Better Auth instance on demand', () => {
    const auth = getAuth();

    expect(auth.handler).toBeTypeOf('function');
    expect(auth.api.getSession).toBeTypeOf('function');
  });

  test('returns null without a session cookie', async () => {
    const request = new Request('http://localhost:4000/login');

    getSessionMock.mockResolvedValue(null);

    await expect(getServerAuthSession(request)).resolves.toBeNull();
  });

  test('seeds a new user locale from the locale hint cookie during auth user creation', async () => {
    const authContext = await getAuth().$context;
    const beforeCreateUserHook = Reflect.get(
      Reflect.get(Reflect.get(authContext.options, 'databaseHooks') ?? {}, 'user') ?? {},
      'create'
    );
    const runBeforeCreateUserHook = Reflect.get(beforeCreateUserHook ?? {}, 'before') as
      | ((...args: Array<any>) => Promise<unknown>)
      | undefined;

    expect(typeof runBeforeCreateUserHook).toBe('function');

    if (!runBeforeCreateUserHook) {
      throw new Error('Expected Better Auth user create hook to exist.');
    }

    const result = await runBeforeCreateUserHook(
      {
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        email: 'locale-seed@favoritable.app',
        emailVerified: false,
        id: 'locale-seed-user',
        image: null,
        name: 'Locale Seed User',
        updatedAt: new Date('2026-01-01T00:00:00.000Z')
      },
      {
        request: new Request('http://localhost:4000/api/auth/callback/google', {
          headers: {
            cookie: 'favoritable-locale-hint=es'
          }
        })
      }
    );

    expect(result).toEqual({
      data: {
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        email: 'locale-seed@favoritable.app',
        emailVerified: false,
        id: 'locale-seed-user',
        image: null,
        locale: 'es',
        name: 'Locale Seed User',
        updatedAt: new Date('2026-01-01T00:00:00.000Z')
      }
    });
  });

  test('returns normalized session when locale repair write fails', async () => {
    const session = {
      session: {
        id: 'session-id'
      },
      user: {
        email: 'locale-repair@favoritable.app',
        id: 'locale-repair-user',
        name: 'Locale Repair User'
      }
    };
    const request = new Request('http://localhost:4000/', {
      headers: {
        cookie: 'favoritable-locale-hint=es'
      }
    });
    const repairError = new Error('write failed');

    getSessionMock.mockResolvedValue(session);
    updateUserMock.mockRejectedValue(repairError);

    await expect(getServerAuthSession(request)).resolves.toEqual({
      ...session,
      user: {
        ...session.user,
        locale: 'es'
      }
    });
    expect(updateUserMock).toHaveBeenCalledWith({
      body: { locale: 'es' },
      headers: request.headers
    });
    expect(appLoggerWarnMock).toHaveBeenCalledWith(
      '[auth] Failed to repair Better Auth session locale. Returning normalized session.',
      {
        error: repairError,
        locale: 'es'
      }
    );
  });
});
