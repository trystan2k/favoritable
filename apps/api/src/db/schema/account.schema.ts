import { relations } from 'drizzle-orm/relations';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { trackingDates } from './common.schema.js';
import { user } from './user.schema.js';

export const account = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp',
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp',
  }),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  ...trackingDates,
});

export const accountsRelation = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export type AccountDTO = typeof account.$inferSelect;
export type InsertAccountDTO = typeof account.$inferInsert;
