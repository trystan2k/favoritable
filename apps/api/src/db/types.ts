import type { db } from './index.js';

type dbType = typeof db;
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type DBTransaction = dbType | Transaction;

export const DATABASE_TYPES = {
  LOCAL: 'local',
  TURSO: 'turso',
  SQLITE: 'sqlite',
} as const;
