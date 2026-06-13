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
});
