import { relations } from "drizzle-orm/relations";
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { bookmark } from "./bookmark.schema";
import { label } from "./label.schema";
import { trackingDates } from "./common.schema";
import { sql } from "drizzle-orm/sql";

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
