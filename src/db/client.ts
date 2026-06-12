import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import { resolveDatabaseCredentials } from '@/db/database-url';
import * as schema from '@/db/schema/auth';
import { getAuthEnvironment } from '@/features/auth/server/env.server';

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function createDb(databaseUrl?: string, databaseAuthToken?: string) {
  const environment = databaseUrl === undefined ? getAuthEnvironment() : null;
  const resolvedDatabaseUrl = databaseUrl ?? environment!.databaseUrl;
  const resolvedDatabaseAuthToken = databaseAuthToken ?? environment?.databaseAuthToken;
  const databaseClient = createClient(
    resolveDatabaseCredentials(resolvedDatabaseUrl, resolvedDatabaseAuthToken)
  );

  return drizzle(databaseClient, {
    schema
  });
}

export function getDb() {
  if (database) {
    return database;
  }

  database = createDb();

  return database;
}
