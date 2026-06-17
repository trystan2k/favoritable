import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import { resolveDatabaseCredentials } from '@/db/database-url';
import * as schema from '@/db/schema/schema';

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

const defaultDatabaseUrl = 'file:./data/favoritable.db';

function readEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}

export function createDb(databaseUrl?: string, databaseAuthToken?: string) {
  const resolvedDatabaseUrl =
    databaseUrl ?? readEnvironmentVariable('DATABASE_URL') ?? defaultDatabaseUrl;
  const resolvedDatabaseAuthToken =
    databaseAuthToken ?? readEnvironmentVariable('DATABASE_AUTH_TOKEN');
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
