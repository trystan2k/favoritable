import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
  // driver: 'turso',
  // dbCredentials: {
  //   url: process.env.TURSO_DATABASE_URL || '',
  //   authToken: process.env.TURSO_AUTH_TOKEN,
  // },
  verbose: true,
  strict: true,
});
