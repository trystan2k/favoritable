import { bookmarkSchema } from './../features/bookmarks/bookmark.models';
import { env } from '../env.js';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import * as bookmarkSchemas from './schema/bookmark.schema.js';
import * as bookmarkLabelSchemas from './schema/bookmark-label.schema.js';
import * as labelSchemas from './schema/label.schema.js';

const client = createClient({ url: env.DATABASE_URL });
export const db = drizzle(client, { schema: { ...bookmarkSchemas, ...bookmarkLabelSchemas, ...labelSchemas }, logger: false });
