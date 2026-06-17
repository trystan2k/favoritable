import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

import { getDatabaseFilePath, resolveDatabaseCredentials } from '../src/db/database-url.ts';
import {
  BookmarkUrlCanonicalizationError,
  canonicalizeBookmarkUrls,
  shouldCanonicalizeBookmarkUrlsBeforeMigrate
} from './lib/bookmark-url-canonicalization.ts';

const databaseCredentials = resolveDatabaseCredentials();
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function ensureLocalDatabaseDirectory(url) {
  const databasePath = getDatabaseFilePath(url);

  if (!databasePath) {
    return;
  }

  await mkdir(path.dirname(databasePath), { recursive: true });
}

async function bootstrapDatabase() {
  await ensureLocalDatabaseDirectory(databaseCredentials.url);

  const client = createClient(databaseCredentials);

  try {
    if (await shouldCanonicalizeBookmarkUrlsBeforeMigrate(client)) {
      try {
        await canonicalizeBookmarkUrls(client, {
          applyChanges: true,
          failOnDuplicates: true
        });
      } catch (error) {
        if (error instanceof BookmarkUrlCanonicalizationError) {
          throw new Error(`Bookmark URL upgrade failed before migrations.\n${error.message}`, {
            cause: error
          });
        }

        throw error;
      }
    }

    const db = drizzle(client);

    await migrate(db, {
      migrationsFolder: path.join(repoRoot, 'drizzle')
    });
  } finally {
    client.close();
  }
}

await bootstrapDatabase();
