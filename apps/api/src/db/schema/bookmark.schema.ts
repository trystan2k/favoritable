import { relations } from "drizzle-orm/relations";
import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";
import { bookmarkLabel } from "./bookmark-label.schema";
import { sql } from "drizzle-orm/sql";
import { trackingDates } from "./common.schema";

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
