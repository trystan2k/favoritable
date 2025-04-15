import { relations } from "drizzle-orm/relations";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { bookmark } from "./bookmark.schema.js";
import { trackingDates } from "./common.schema.js";
import { label } from "./label.schema.js";

export const bookmarkLabel = sqliteTable(
  'bookmarks_labels',
  {
    id: text('id').primaryKey(),
    bookmarkId: text('bookmark_id')
      .notNull()
      .references(() => bookmark.id, { onDelete: 'cascade'}),
    labelId: text('label_id')
      .notNull()
      .references(() => label.id, { onDelete: 'cascade'}),
      ...trackingDates
  }, (table) => [
    index('bookmarks_labels_id_index').on(table.id)
  ]);

export const bookmarkLabelsRelation = relations(bookmarkLabel, ({ one }) => ({
  label: one(label, {
    fields: [bookmarkLabel.labelId],
    references: [label.id],
  }),
  bookmark: one(bookmark, {
    fields: [bookmarkLabel.bookmarkId],
    references: [bookmark.id],
  }),
}));
