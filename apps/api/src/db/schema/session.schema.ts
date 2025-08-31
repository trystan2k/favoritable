import { relations } from 'drizzle-orm/relations';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { trackingDates } from './common.schema.js';
import { user } from './user.schema.js';

export const session = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  ...trackingDates,
});

export const sessionsRelation = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export type SessionDTO = typeof session.$inferSelect;
export type InsertSessionDTO = typeof session.$inferInsert;
