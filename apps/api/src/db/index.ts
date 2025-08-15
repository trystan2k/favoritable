import { type Client, createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { env } from '../env.js';
import * as bookmarkSchemas from './schema/bookmark.schema.js';
import * as bookmarkLabelSchemas from './schema/bookmark-label.schema.js';
import * as labelSchemas from './schema/label.schema.js';

const client: Client =
  env.DATABASE_TYPE === 'local'
    ? createClient({ url: env.LOCAL_DATABASE_URL })
    : createClient({
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_AUTH_TOKEN,
      });

export const db = drizzle(client, {
  schema: { ...bookmarkSchemas, ...bookmarkLabelSchemas, ...labelSchemas },
  logger: false,
});
