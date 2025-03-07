import { env } from './src/env';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  out: "./src/db/migrations",
  schema: './src/db/schema/index.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  // driver: 'turso',
  // dbCredentials: {
  //   url: process.env.TURSO_DATABASE_URL || '',
  //   authToken: process.env.TURSO_AUTH_TOKEN,
  // },
  verbose: true,
  strict: true,
});
