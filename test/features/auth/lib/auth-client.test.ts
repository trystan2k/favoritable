import { afterEach, describe, expect, test, vi } from 'vitest';

import { getAuthClientBaseUrl, getBrowserAuthClient } from '@/features/auth/lib/auth-client';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('auth client helpers', () => {
  test('keeps the server fallback relative when browser origin is unavailable', () => {
    expect(getAuthClientBaseUrl()).toBe('/api/auth');
  });

  test('uses browser origin when window exists', () => {
    vi.stubGlobal('window', {
      location: {
        origin: 'https://favoritable.app'
      }
    });

    expect(getAuthClientBaseUrl()).toBe('https://favoritable.app/api/auth');
  });

  test('rejects browser client creation during SSR', () => {
    expect(() => getBrowserAuthClient()).toThrow(
      'Better Auth client is browser-only. Use server auth helpers during SSR.'
    );
  });
});
