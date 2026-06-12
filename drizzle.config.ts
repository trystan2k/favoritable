import { defineConfig } from 'drizzle-kit';

import { resolveDatabaseCredentials } from './src/db/database-url';

const databaseCredentials = resolveDatabaseCredentials();

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/auth.ts',
  dialect: 'sqlite',
  dbCredentials: databaseCredentials
});
