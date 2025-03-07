import { env } from '../env';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import * as schema from './schema';

const client = createClient({ url: env.DATABASE_URL });
export const db = drizzle(client, { schema, logger: false });

export type db = typeof db;
