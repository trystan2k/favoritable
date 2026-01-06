import { defineConfig } from 'drizzle-kit';
import { DATABASE_TYPES } from './src/db/types';
import { env } from './src/env';

export default defineConfig({
  out: './src/db/migrations',
  schema: './dist/db/schema/*.js',
  dialect:
    env.DATABASE_TYPE === DATABASE_TYPES.LOCAL ? DATABASE_TYPES.SQLITE : DATABASE_TYPES.TURSO,
  dbCredentials:
    env.DATABASE_TYPE === DATABASE_TYPES.LOCAL
      ? { url: env.LOCAL_DATABASE_URL }
      : {
          url: env.TURSO_DATABASE_URL,
          authToken: env.TURSO_AUTH_TOKEN,
        },
  verbose: true,
  strict: true,
});
