import { mkdir, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from '../src/db/index.js';
import { env } from '../src/env.js';

const TEST_DB_PATH = env.LOCAL_DATABASE_URL?.replace('file:', '') || 'test.db';

export async function setupTestDatabase() {
  // Ensure test database directory exists
  await mkdir(dirname(TEST_DB_PATH), { recursive: true });

  // Run migrations to set up schema
  await migrate(db, { migrationsFolder: 'src/db/migrations' });
}

export async function teardownTestDatabase() {
  // Remove test database file
  await rm(TEST_DB_PATH, { force: true });
}
