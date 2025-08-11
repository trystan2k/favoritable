import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { env } from '../env.js';
import * as bookmarkSchemas from './schema/bookmark.schema.js';
import * as bookmarkLabelSchemas from './schema/bookmark-label.schema.js';
import * as labelSchemas from './schema/label.schema.js';

const client = createClient({ url: env.DATABASE_URL });
export const db = drizzle(client, {
  schema: { ...bookmarkSchemas, ...bookmarkLabelSchemas, ...labelSchemas },
  logger: false,
});
