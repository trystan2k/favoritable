import { defineConfig } from 'drizzle-kit';
import { env } from './src/env';

export default defineConfig({
  out: './src/db/migrations',
  schema: './dist/db/schema/*.js',
  dialect: env.DATABASE_TYPE === 'local' ? 'sqlite' : 'turso',
  dbCredentials:
    env.DATABASE_TYPE === 'local'
      ? { url: env.LOCAL_DATABASE_URL }
      : {
          url: env.TURSO_DATABASE_URL,
          authToken: env.TURSO_AUTH_TOKEN,
        },
  verbose: true,
  strict: true,
});
