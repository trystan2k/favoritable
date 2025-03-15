import { relations } from "drizzle-orm/relations";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { bookmarkLabel } from "./bookmark-label.schema.js";
import { trackingDates } from "./common.schema.js";


export type BookmarkDTO = typeof bookmark.$inferSelect;
export type CreateBookmarkDTO = typeof bookmark.$inferInsert;
export type UpdateBookmarkDTO = Partial<BookmarkDTO> & Pick<BookmarkDTO, 'id'>;
export type DeleteMultipleBookmarksDTO = { ids: number[] };
export type UpdateStateBookmarkDTO = Pick<BookmarkDTO, 'state'>
export type BookmarkFromURL = { url: string };

export const bookmark = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull().unique(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  author: text('author'),
  thumbnail: text('thumbnail'),
  state: text('state').$type<'archived' | 'pending'>().notNull().default('pending'),
  publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
  ...trackingDates,
});

export const bookmarksRelation = relations(bookmark, ({ many }) => ({
  bookmarkLabel: many(bookmarkLabel),
}));
