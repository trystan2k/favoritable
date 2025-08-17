import { relations } from 'drizzle-orm/relations';
import { index, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { bookmarkLabel } from './bookmark-label.schema.js';
import { trackingDates } from './common.schema.js';
import { user } from './user.schema.js';

export const label = sqliteTable(
  'labels',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    color: text('color'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...trackingDates,
  },
  (table) => [
    index('label_id_index').on(table.id),
    index('label_user_id_index').on(table.userId),
    unique('label_name_user_unique').on(table.name, table.userId),
  ]
);

export const labelsRelation = relations(label, ({ many, one }) => ({
  bookmarkLabel: many(bookmarkLabel),
  user: one(user, {
    fields: [label.userId],
    references: [user.id],
  }),
}));

export type LabelDTO = typeof label.$inferSelect;
export type InsertLabelDTO = typeof label.$inferInsert;
