import { relations } from "drizzle-orm/relations";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { bookmarkLabel } from "./bookmark-label.schema";
import { trackingDates } from "./common.schema";

export const label = sqliteTable('labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  color: text('color'),
  ...trackingDates,
});

export type LabelDTO = typeof label.$inferSelect;
export type CreateUpdateLabelDTO = typeof label.$inferInsert;

export const labelsRelations = relations(label, ({ many }) => ({
  bookmarkLabel: many(bookmarkLabel),
}));
