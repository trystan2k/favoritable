import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { trackingDates } from './common.schema.js';

const providerEnum = ['github', 'google', 'discord'] as const;

export const user = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    avatarUrl: text('avatar_url'),
    provider: text('provider', { enum: providerEnum }).notNull(),
    ...trackingDates,
  },
  (table) => [
    index('user_id_index').on(table.id),
    index('user_email_index').on(table.email),
  ]
);

export type UserDTO = typeof user.$inferSelect;
export type InsertUserDTO = typeof user.$inferInsert;
