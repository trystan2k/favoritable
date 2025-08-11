import { relations } from 'drizzle-orm/relations';
import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bookmarkLabel } from './bookmark-label.schema.js';
import { trackingDates } from './common.schema.js';

export const label = sqliteTable(
  'labels',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull().unique(),
    color: text('color'),
    ...trackingDates,
  },
  (table) => [index('label_id_index').on(table.id)]
);

export const labelsRelation = relations(label, ({ many }) => ({
  bookmarkLabel: many(bookmarkLabel),
}));
