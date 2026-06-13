import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { createClient } from '@libsql/client';
import { describe, expect, test } from 'vitest';
import { testUtils } from 'better-auth/plugins';

import { createAuth } from '@/features/auth/server/auth.server';
import type { AuthEnvironment } from '@/features/auth/server/env.server';

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

const execFileAsync = promisify(execFile);

describe('auth database bootstrap', () => {
  test('migrates a fresh database and preserves auth sessions across auth instances', async () => {
    const tempDirectory = await mkdtemp(path.join(tmpdir(), 'favoritable-auth-bootstrap-'));
    const databasePath = path.join(tempDirectory, 'fresh-auth.db');
    const databaseUrl = `file:${databasePath}`;

    try {
      await execFileAsync('node', ['./scripts/bootstrap-auth-db.mjs'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl
        }
      });

      const authEnvironment: AuthEnvironment = {
        baseUrl: 'http://127.0.0.1:4173',
        databaseAuthToken: undefined,
        databaseUrl,
        googleProvider: {},
        secret: 'favoritable-test-auth-secret-1234567890',
        trustedOrigins: ['http://127.0.0.1:4173'],
        useSecureCookies: false
      };
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
      const databaseClient = createClient({ url: databaseUrl });

      try {
        const [userCountResult, sessionCountResult] = await Promise.all([
          databaseClient.execute('select count(*) as count from user'),
          databaseClient.execute('select count(*) as count from session')
        ]);

        expect(Number(userCountResult.rows[0]?.count ?? 0)).toBe(1);
        expect(Number(sessionCountResult.rows[0]?.count ?? 0)).toBe(1);
      } finally {
        databaseClient.close();
      }

      expect(sessionFromInitialAuth?.user.id).toBe(savedUser.id);
      expect(sessionFromFreshAuth?.user.id).toBe(savedUser.id);
    } finally {
      await rm(tempDirectory, { force: true, recursive: true });
    }
  });
});
