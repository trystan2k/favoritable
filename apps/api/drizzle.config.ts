import { defineConfig } from 'drizzle-kit';
import { env } from './src/env';
export default defineConfig({
  out: './src/db/migrations',
  schema: './dist/db/schema/index.js',
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
