import { type Client, createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { env } from '../env.js';
import * as accountSchemas from './schema/account.schema.js';
import * as bookmarkSchemas from './schema/bookmark.schema.js';
import * as bookmarkLabelSchemas from './schema/bookmark-label.schema.js';
import * as labelSchemas from './schema/label.schema.js';
import * as sessionSchemas from './schema/session.schema.js';
import * as userSchemas from './schema/user.schema.js';
import * as verificationSchemas from './schema/verification.schema.js';
import { DATABASE_TYPES } from './types.js';

const client: Client =
  env.DATABASE_TYPE === DATABASE_TYPES.LOCAL
    ? createClient({ url: env.LOCAL_DATABASE_URL })
    : createClient({
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_AUTH_TOKEN,
      });

export const db = drizzle(client, {
  schema: {
    ...bookmarkSchemas,
    ...bookmarkLabelSchemas,
    ...labelSchemas,
    ...userSchemas,
    ...sessionSchemas,
    ...accountSchemas,
    ...verificationSchemas,
  },
  logger: false,
});
