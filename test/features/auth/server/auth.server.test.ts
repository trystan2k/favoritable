import { describe, expect, test } from 'vitest';

import { getAuth, getServerAuthSession } from '@/features/auth/server/auth.server';

describe('auth server', () => {
  test('creates a Better Auth instance on demand', () => {
    const auth = getAuth();

    expect(auth.handler).toBeTypeOf('function');
    expect(auth.api.getSession).toBeTypeOf('function');
  });

  test('returns null without a session cookie', async () => {
    const request = new Request('http://localhost:4000/login');

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
});
