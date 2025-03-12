import { relations } from "drizzle-orm/relations";
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { bookmark } from "./bookmark.schema.js";
import { trackingDates } from "./common.schema.js";
import { label } from "./label.schema.js";

export const bookmarkLabel = sqliteTable(
  'bookmarks_labels',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    bookmarkId: integer('bookmark_id')
      .notNull()
      .references(() => bookmark.id, { onDelete: 'cascade'}),
    labelId: integer('label_id')
      .notNull()
      .references(() => label.id, { onDelete: 'cascade'}),
      ...trackingDates
  }
);

export const bookmarkLabelsRelations = relations(bookmarkLabel, ({ one }) => ({
  label: one(label, {
    fields: [bookmarkLabel.labelId],
    references: [label.id],
  }),
  bookmark: one(bookmark, {
    fields: [bookmarkLabel.bookmarkId],
    references: [bookmark.id],
  }),
}));
