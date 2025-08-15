import { defineConfig } from 'drizzle-kit';
import { env } from './src/env';

const isLocalDatabase = env.DATABASE_TYPE === 'local';

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema/*.ts',
  dialect: isLocalDatabase ? 'sqlite' : 'turso',
  dbCredentials: isLocalDatabase
    ? { url: env.LOCAL_DATABASE_URL }
    : {
        url: env.TURSO_DATABASE_URL as string,
        authToken: env.TURSO_AUTH_TOKEN as string,
      },
  verbose: true,
  strict: true,
});
