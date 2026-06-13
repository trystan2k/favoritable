import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

import { getDatabaseFilePath, resolveDatabaseCredentials } from '../src/db/database-url.ts';

const databaseCredentials = resolveDatabaseCredentials();
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function ensureLocalDatabaseDirectory(url) {
  const databasePath = getDatabaseFilePath(url);

  if (!databasePath) {
    return;
  }

  await mkdir(path.dirname(databasePath), { recursive: true });
}

async function bootstrapAuthDatabase() {
  await ensureLocalDatabaseDirectory(databaseCredentials.url);

  const client = createClient(databaseCredentials);

  try {
    const db = drizzle(client);

    await migrate(db, {
      migrationsFolder: path.join(repoRoot, 'drizzle')
    });
  } finally {
    client.close();
  }
}

await bootstrapAuthDatabase();
