import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  getAuthEnvironment,
  getAuthProviderAvailability,
  hasProviderCredentials
} from '@/features/auth/server/env.server';

const originalEnvironment = { ...process.env };

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnvironment)) {
      delete process.env[key];
    }
  }
  for (const [key, value] of Object.entries(originalEnvironment)) {
    process.env[key] = value;
  }
  vi.restoreAllMocks();
});

describe('getAuthEnvironment', () => {
  test('returns project-safe defaults when env vars are missing in local or test runs', () => {
    delete process.env.BETTER_AUTH_URL;
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_AUTH_TOKEN;
    delete process.env.BETTER_AUTH_SECRET;
    delete process.env.BETTER_AUTH_TRUSTED_ORIGINS;
    delete process.env.E2E_PREVIEW;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const environment = getAuthEnvironment();

    expect(environment.baseUrl).toBe('http://localhost:4000');
    expect(environment.databaseAuthToken).toBeUndefined();
    expect(environment.databaseUrl).toBe('file:./data/favoritable.db');
    expect(environment.secret).toContain('favoritable-local-auth-secret');
    expect(environment.trustedOrigins).toEqual(
      expect.arrayContaining([
        'http://localhost:4000',
        'http://127.0.0.1:4000',
        'http://127.0.0.1:4173'
      ])
    );
    expect(environment.useSecureCookies).toBe(false);
    expect(environment.googleProvider.clientId).toBeUndefined();
  });

  test('uses preview origin defaults when e2e preview mode is active', () => {
    delete process.env.BETTER_AUTH_URL;
    delete process.env.BETTER_AUTH_TRUSTED_ORIGINS;
    process.env.E2E_PREVIEW = 'true';

    const environment = getAuthEnvironment();

    expect(environment.baseUrl).toBe('http://127.0.0.1:4173');
    expect(environment.trustedOrigins).toEqual(
      expect.arrayContaining(['http://127.0.0.1:4173', 'http://localhost:4000'])
    );
  });

  test('rejects production-like runs without an explicit auth url', () => {
    process.env.NODE_ENV = 'production';
    process.env.VITEST = 'false';
    delete process.env.BETTER_AUTH_URL;
    process.env.BETTER_AUTH_SECRET = 'super-secret-value';
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = 'https://preview.favoritable.app';

    expect(() => getAuthEnvironment()).toThrow(
      'BETTER_AUTH_URL is required outside local and test environments.'
    );
  });

  test('uses configured values and excludes localhost defaults outside local and test runs', () => {
    process.env.NODE_ENV = 'production';
    process.env.VITEST = 'false';
    process.env.BETTER_AUTH_URL = 'https://favoritable.app';
    process.env.DATABASE_URL = 'libsql://favoritable.turso.io';
    process.env.DATABASE_AUTH_TOKEN = 'turso-auth-token';
    process.env.BETTER_AUTH_SECRET = 'super-secret-value';
    process.env.BETTER_AUTH_TRUSTED_ORIGINS =
      'https://preview.favoritable.app, https://login.favoritable.app';
    process.env.GOOGLE_CLIENT_ID = 'google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';

    const environment = getAuthEnvironment();

    expect(environment.baseUrl).toBe('https://favoritable.app');
    expect(environment.databaseAuthToken).toBe('turso-auth-token');
    expect(environment.databaseUrl).toBe('libsql://favoritable.turso.io');
    expect(environment.secret).toBe('super-secret-value');
    expect(environment.trustedOrigins).toEqual([
      'https://favoritable.app',
      'https://preview.favoritable.app',
      'https://login.favoritable.app'
    ]);
    expect(environment.trustedOrigins).not.toContain('http://127.0.0.1:4173');
    expect(environment.useSecureCookies).toBe(true);
    expect(environment.googleProvider.clientId).toBe('google-client-id');
    expect(environment.googleProvider.clientSecret).toBe('google-client-secret');
  });

  test('prefers request origin for base url in production-like runs', () => {
    process.env.NODE_ENV = 'production';
    process.env.VITEST = 'false';
    process.env.BETTER_AUTH_URL = 'https://favoritable.trystan2k.workers.dev';
    process.env.BETTER_AUTH_SECRET = 'super-secret-value';
    process.env.BETTER_AUTH_TRUSTED_ORIGINS =
      'https://favoritable.trystan2k.workers.dev, https://*-favoritable.trystan2k.workers.dev';

    const environment = getAuthEnvironment(
      new Request('https://release-pr-42-favoritable.trystan2k.workers.dev/login', {
        headers: {
          host: 'release-pr-42-favoritable.trystan2k.workers.dev',
          'x-forwarded-proto': 'https'
        }
      })
    );

    expect(environment.baseUrl).toBe('https://release-pr-42-favoritable.trystan2k.workers.dev');
    expect(environment.trustedOrigins).toEqual(
      expect.arrayContaining([
        'https://release-pr-42-favoritable.trystan2k.workers.dev',
        'https://favoritable.trystan2k.workers.dev',
        'https://*-favoritable.trystan2k.workers.dev'
      ])
    );
    expect(environment.useSecureCookies).toBe(true);
  });

  test('rejects non-local deployments without an explicit secret', () => {
    process.env.NODE_ENV = 'production';
    process.env.VITEST = 'false';
    process.env.BETTER_AUTH_URL = 'https://favoritable.app';
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = 'https://preview.favoritable.app';
    delete process.env.BETTER_AUTH_SECRET;

    expect(() => getAuthEnvironment()).toThrow(
      'BETTER_AUTH_SECRET is required for non-local Better Auth deployments.'
    );
  });

  test('rejects placeholder secrets outside local and test environments', () => {
    process.env.NODE_ENV = 'production';
    process.env.VITEST = 'false';
    process.env.BETTER_AUTH_URL = 'https://favoritable.app';
    process.env.BETTER_AUTH_SECRET = 'favoritable-local-auth-secret-must-change-for-production';
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = 'https://preview.favoritable.app';

    expect(() => getAuthEnvironment()).toThrow(
      'BETTER_AUTH_SECRET must be replaced outside local and test environments.'
    );
  });

  test('rejects non-local deployments without explicit trusted origins', () => {
    process.env.NODE_ENV = 'production';
    process.env.VITEST = 'false';
    process.env.BETTER_AUTH_URL = 'https://favoritable.app';
    process.env.BETTER_AUTH_SECRET = 'super-secret-value';
    delete process.env.BETTER_AUTH_TRUSTED_ORIGINS;

    expect(() => getAuthEnvironment()).toThrow(
      'BETTER_AUTH_TRUSTED_ORIGINS is required for non-local Better Auth deployments.'
    );
  });
});

describe('local Google OAuth warnings', () => {
  test('warns in local development when Google OAuth credentials are partial', () => {
    delete process.env.VITEST;
    process.env.NODE_ENV = 'development';
    process.env.GOOGLE_CLIENT_ID = 'google-client-id';
    delete process.env.GOOGLE_CLIENT_SECRET;

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    getAuthEnvironment();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Google OAuth is partially configured. Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET or leave both unset.'
      )
    );
  });

  test('warns in local development when Google OAuth uses a non-default BETTER_AUTH_URL', () => {
    delete process.env.VITEST;
    process.env.NODE_ENV = 'development';
    process.env.BETTER_AUTH_URL = 'http://127.0.0.1:4000';
    process.env.GOOGLE_CLIENT_ID = 'google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    getAuthEnvironment();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Verify Google Cloud uses origin http://127.0.0.1:4000 and redirect URI http://127.0.0.1:4000/api/auth/callback/google'
      )
    );
  });

  test('warns in local development when BETTER_AUTH_URL includes a path', () => {
    delete process.env.VITEST;
    process.env.NODE_ENV = 'development';
    process.env.BETTER_AUTH_URL = 'http://localhost:4000/auth';
    process.env.GOOGLE_CLIENT_ID = 'google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    getAuthEnvironment();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'BETTER_AUTH_URL should be an origin without a path for Google OAuth. Current callback URI resolves to http://localhost:4000/api/auth/callback/google'
      )
    );
  });
});

describe('auth provider availability helpers', () => {
  test('returns true only when client id and secret exist', () => {
    expect(hasProviderCredentials({ clientId: 'id', clientSecret: 'secret' })).toBe(true);
    expect(hasProviderCredentials({ clientId: 'id' })).toBe(false);
    expect(hasProviderCredentials({ clientSecret: 'secret' })).toBe(false);
  });

  test('reports Google availability from configured server credentials', () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    expect(getAuthProviderAvailability()).toEqual({ google: false });

    process.env.GOOGLE_CLIENT_ID = 'google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';

    expect(getAuthProviderAvailability()).toEqual({ google: true });
  });
});
