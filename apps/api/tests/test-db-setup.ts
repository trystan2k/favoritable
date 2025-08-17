import { mkdir, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as bookmarkSchemas from '../src/db/schema/bookmark.schema.js';
import * as bookmarkLabelSchemas from '../src/db/schema/bookmark-label.schema.js';
import * as labelSchemas from '../src/db/schema/label.schema.js';
import * as userSchemas from '../src/db/schema/user.schema.js';

// Generate unique database path for each test file to avoid conflicts
function generateTestDbPath() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `tests/.db/test-${timestamp}-${random}.db`;
}

const schema = {
  ...bookmarkSchemas,
  ...bookmarkLabelSchemas,
  ...labelSchemas,
  ...userSchemas,
};

let testDbPath: string;
let testDb: ReturnType<typeof drizzle<typeof schema>>;

export async function setupTestDatabase() {
  testDbPath = generateTestDbPath();

  if (typeof testDbPath === 'string' && testDbPath.length > 0) {
    await mkdir(dirname(testDbPath), { recursive: true });
  }

  // Create isolated database client for this test suite
  const client = createClient({ url: `file:${testDbPath}` });

  testDb = drizzle(client, {
    schema,
    logger: false,
  });

  // Run migrations to set up schema
  await migrate(testDb, { migrationsFolder: 'src/db/migrations' });

  return testDb;
}

export async function teardownTestDatabase() {
  if (typeof testDbPath === 'string' && testDbPath.length > 0) {
    await rm(testDbPath, { force: true });
  }
}

export function getTestDb() {
  if (!testDb) {
    throw new Error(
      'Test database not initialized. Call setupTestDatabase first.'
    );
  }
  return testDb;
}
