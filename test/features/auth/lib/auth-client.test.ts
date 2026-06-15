import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  getAuthClientBaseUrl,
  getBrowserAuthClient,
  updateBrowserUserLocale
} from '@/features/auth/lib/auth-client';

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

  test('posts locale updates through Better Auth endpoint', async () => {
    const fetchMock = vi
      .fn<(input: string, init?: RequestInit) => Promise<Pick<Response, 'json' | 'ok'>>>()
      .mockResolvedValue({
        json: async () => ({ status: true }),
        ok: true
      });

    vi.stubGlobal('window', {
      location: {
        origin: 'https://favoritable.app'
      }
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(updateBrowserUserLocale('es')).resolves.toEqual({
      error: null
    });
    expect(fetchMock).toHaveBeenCalledWith('https://favoritable.app/api/auth/update-user', {
      body: JSON.stringify({ locale: 'es' }),
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    });
  });

  test('surfaces Better Auth locale update errors', async () => {
    vi.stubGlobal('window', {
      location: {
        origin: 'https://favoritable.app'
      }
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          error: {
            message: 'Unsupported locale.'
          }
        }),
        ok: false
      })
    );

    await expect(updateBrowserUserLocale('es')).resolves.toEqual({
      error: {
        message: 'Unsupported locale.'
      }
    });
  });

  test('falls back to generic locale update error on invalid response payload', async () => {
    vi.stubGlobal('window', {
      location: {
        origin: 'https://favoritable.app'
      }
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => {
          throw new Error('bad json');
        },
        ok: false
      })
    );

    await expect(updateBrowserUserLocale('es')).resolves.toEqual({
      error: {
        message: 'Locale update failed.'
      }
    });
  });
});
