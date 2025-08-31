import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { trackingDates } from './common.schema';

export const verification = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ...trackingDates,
});

export type VerificationDTO = typeof verification.$inferSelect;
export type InsertVerificationDTO = typeof verification.$inferInsert;
