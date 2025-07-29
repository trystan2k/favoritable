import { relations } from "drizzle-orm/relations";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { bookmarkLabel } from "./bookmark-label.schema.js";
import { trackingDates } from "./common.schema.js";
import { BOOKMARK_STATES } from "../../features/bookmarks/bookmark.constants.js";

type BookmarkStateKey = keyof typeof BOOKMARK_STATES;

export const bookmark = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  url: text('url').notNull().unique(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  author: text('author'),
  thumbnail: text('thumbnail'),
  state: text('state').$type<BookmarkStateKey>().notNull().default(BOOKMARK_STATES.active),
  publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
  ...trackingDates,
}, (table) => [
  index('bookmark_id_index').on(table.id)
]);

export const bookmarksRelation = relations(bookmark, ({ many }) => ({
  bookmarkLabel: many(bookmarkLabel),
}));
