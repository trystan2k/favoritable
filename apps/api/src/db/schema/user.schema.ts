import { relations } from 'drizzle-orm/relations';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { trackingDates } from './common.schema.js';
import { label } from './label.schema.js';

const providerEnum = ['github', 'google', 'facebook', 'twitter', 'apple', 'discord'] as const;

export const user = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' })
      .$defaultFn(() => false)
      .notNull(),
    image: text('image'),
    avatarUrl: text('avatar_url'),
    provider: text('provider', { enum: providerEnum }),
    ...trackingDates,
  },
  (table) => [index('user_id_index').on(table.id), index('user_email_index').on(table.email)]
);

export const usersRelation = relations(user, ({ many }) => ({
  labels: many(label),
}));

export type UserDTO = typeof user.$inferSelect;
export type InsertUserDTO = typeof user.$inferInsert;
