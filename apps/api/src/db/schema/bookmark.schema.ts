import { relations } from "drizzle-orm/relations";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { bookmarkLabel } from "./bookmark-label.schema.js";
import { trackingDates } from "./common.schema.js";

export const bookmark = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull().unique(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  author: text('author'),
  thumbnail: text('thumbnail'),
  publishedAt: integer('published_at'),
  ...trackingDates,
});

export type BookmarkDTO = typeof bookmark.$inferSelect;
export type CreateUpdateBookmarkDTO = typeof bookmark.$inferInsert;

export const bookmarksRelation = relations(bookmark, ({ many }) => ({
  bookmarkLabel: many(bookmarkLabel),
}));
