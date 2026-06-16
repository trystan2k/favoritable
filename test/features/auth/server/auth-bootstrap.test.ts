import { describe, expect, test } from 'vitest';
import { testUtils } from 'better-auth/plugins';

import { createAuth, getServerAuthSession } from '@/features/auth/server/auth.server';
import type { AuthEnvironment } from '@/features/auth/server/env.server';
import {
  createBootstrappedTempDatabase,
  disposeBootstrappedTempDatabase
} from '@test/lib/bootstrapped-temp-db';

type AuthTestHelpers = {
  createUser(overrides?: Record<string, unknown>): {
    email: string;
    id: string;
    name: string;
  };
  login(opts: { userId: string }): Promise<{ headers: Headers }>;
  saveUser(user: { email: string; id: string; name: string }): Promise<{
    email: string;
    id: string;
    name: string;
  }>;
};

describe('auth database bootstrap', () => {
  test('migrates a fresh database and preserves auth sessions across auth instances', async () => {
    const database = await createBootstrappedTempDatabase(
      'favoritable-auth-bootstrap-',
      'fresh-auth.db'
    );
    const { databaseUrl } = database;

    try {
      const authEnvironment: AuthEnvironment = {
        baseUrl: 'http://127.0.0.1:4174',
        databaseAuthToken: undefined,
        databaseUrl,
        googleProvider: {},
        secret: 'favoritable-test-auth-secret-1234567890',
        trustedOrigins: ['http://127.0.0.1:4174'],
        useSecureCookies: false
      };
      const previousDatabaseUrl = process.env.DATABASE_URL;
      const previousBetterAuthUrl = process.env.BETTER_AUTH_URL;
      const previousBetterAuthSecret = process.env.BETTER_AUTH_SECRET;
      const auth = createAuth({
        additionalPlugins: [testUtils()],
        environment: authEnvironment
      });
      const authContext = (await auth.$context) as Awaited<typeof auth.$context> & {
        test: AuthTestHelpers;
      };
      const createdUser = authContext.test.createUser({
        email: 'fresh-db@favoritable.app',
        name: 'Fresh DB User'
      });
      const savedUser = await authContext.test.saveUser(createdUser);
      const login = await authContext.test.login({ userId: savedUser.id });
      const sessionFromInitialAuth = await auth.api.getSession({
        headers: login.headers
      });
      const sessionFromFreshAuth = await createAuth({
        environment: authEnvironment
      }).api.getSession({
        headers: login.headers
      });
      const databaseClient = database.client;

      try {
        const [userCountResult, sessionCountResult, userLocaleResult] = await Promise.all([
          databaseClient.execute('select count(*) as count from user'),
          databaseClient.execute('select count(*) as count from session'),
          databaseClient.execute("select locale from user where email = 'fresh-db@favoritable.app'")
        ]);

        expect(Number(userCountResult.rows[0]?.count ?? 0)).toBe(1);
        expect(Number(sessionCountResult.rows[0]?.count ?? 0)).toBe(1);
        expect(userLocaleResult.rows[0]?.locale).toBe('en');

        await auth.api.updateUser({
          body: {
            locale: 'es'
          },
          headers: login.headers
        });

        const updatedLocaleResult = await databaseClient.execute(
          "select locale from user where email = 'fresh-db@favoritable.app'"
        );

        expect(updatedLocaleResult.rows[0]?.locale).toBe('es');
        await expect(
          auth.api.updateUser({
            body: {
              locale: 'fr-FR'
            },
            headers: login.headers
          })
        ).rejects.toBeTruthy();

        await databaseClient.execute(
          "update user set locale = 'fr-FR' where email = 'fresh-db@favoritable.app'"
        );

        process.env.DATABASE_URL = databaseUrl;
        process.env.BETTER_AUTH_URL = authEnvironment.baseUrl;
        process.env.BETTER_AUTH_SECRET = authEnvironment.secret;

        const repairedSession = await getServerAuthSession(
          new Request(authEnvironment.baseUrl, {
            headers: login.headers
          })
        );
        const repairedLocaleResult = await databaseClient.execute(
          "select locale from user where email = 'fresh-db@favoritable.app'"
        );

        expect(repairedSession?.user.locale).toBe('en');
        expect(repairedLocaleResult.rows[0]?.locale).toBe('en');
      } finally {
        if (previousDatabaseUrl === undefined) {
          delete process.env.DATABASE_URL;
        } else {
          process.env.DATABASE_URL = previousDatabaseUrl;
        }

        if (previousBetterAuthUrl === undefined) {
          delete process.env.BETTER_AUTH_URL;
        } else {
          process.env.BETTER_AUTH_URL = previousBetterAuthUrl;
        }

        if (previousBetterAuthSecret === undefined) {
          delete process.env.BETTER_AUTH_SECRET;
        } else {
          process.env.BETTER_AUTH_SECRET = previousBetterAuthSecret;
        }
      }

      expect(sessionFromInitialAuth?.user.id).toBe(savedUser.id);
      expect(sessionFromInitialAuth?.user.locale).toBe('en');
      expect(sessionFromFreshAuth?.user.id).toBe(savedUser.id);
      expect(sessionFromFreshAuth?.user.locale).toBe('en');
    } finally {
      await disposeBootstrappedTempDatabase(database);
    }
  });
});
