import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { env } from '../env.js';
import * as bookmarkSchemas from './schema/bookmark.schema.js';
import * as bookmarkLabelSchemas from './schema/bookmark-label.schema.js';
import * as labelSchemas from './schema/label.schema.js';

// Create client configuration based on DATABASE_TYPE
const isLocalDatabase = env.DATABASE_TYPE === 'local';

const client = createClient(
  isLocalDatabase
    ? { url: env.LOCAL_DATABASE_URL }
    : {
        // biome-ignore lint/style/noNonNullAssertion: The value should be there when not in local
        url: env.TURSO_DATABASE_URL!,
        // biome-ignore lint/style/noNonNullAssertion: The value should be there when not in local
        authToken: env.TURSO_AUTH_TOKEN!,
      }
);

export const db = drizzle(client, {
  schema: { ...bookmarkSchemas, ...bookmarkLabelSchemas, ...labelSchemas },
  logger: false,
});
