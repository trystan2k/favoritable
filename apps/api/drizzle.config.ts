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
        // biome-ignore lint/style/noNonNullAssertion: The value should be there when not in local
        url: env.TURSO_DATABASE_URL!,
        // biome-ignore lint/style/noNonNullAssertion: The value should be there when not in local
        authToken: env.TURSO_AUTH_TOKEN!,
      },
  verbose: true,
  strict: true,
});
