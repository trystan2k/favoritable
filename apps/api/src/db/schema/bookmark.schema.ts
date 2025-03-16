import { relations } from "drizzle-orm/relations";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { bookmarkLabel } from "./bookmark-label.schema.js";
import { trackingDates } from "./common.schema.js";

export type BookmarkDTO = typeof bookmark.$inferSelect;
export type CreateBookmarkDTO = typeof bookmark.$inferInsert;
export type UpdateBookmarkDTO = Partial<BookmarkDTO> & Pick<BookmarkDTO, 'id'>;
export type DeleteMultipleBookmarksDTO = { ids: string[] };
export type UpdateStateBookmarkDTO = Pick<BookmarkDTO, 'state'>
export type BookmarkFromURL = { url: string };

export const bookmark = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  url: text('url').notNull().unique(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  author: text('author'),
  thumbnail: text('thumbnail'),
  state: text('state').$type<'archived' | 'pending'>().notNull().default('pending'),
  publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
  ...trackingDates,
}, (table) => [
  index('bookamrk_id_index').on(table.id)
]);

export const bookmarksRelation = relations(bookmark, ({ many }) => ({
  bookmarkLabel: many(bookmarkLabel),
}));
