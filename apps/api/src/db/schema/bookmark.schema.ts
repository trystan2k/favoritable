import { relations } from 'drizzle-orm/relations';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { BOOKMARK_STATES } from '../../features/bookmarks/bookmark.constants.js';
import { bookmarkLabel } from './bookmark-label.schema.js';
import { trackingDates } from './common.schema.js';
import { user } from './user.schema.js';

type BookmarkStateKey = keyof typeof BOOKMARK_STATES;

export const bookmark = sqliteTable(
  'bookmarks',
  {
    id: text('id').primaryKey(),
    url: text('url').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    author: text('author'),
    thumbnail: text('thumbnail'),
    state: text('state')
      .$type<BookmarkStateKey>()
      .notNull()
      .default(BOOKMARK_STATES.active),
    publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...trackingDates,
  },
  (table) => [
    index('bookmark_id_index').on(table.id),
    index('bookmark_user_id_index').on(table.userId),
  ]
);

export const bookmarksRelation = relations(bookmark, ({ many, one }) => ({
  bookmarkLabel: many(bookmarkLabel),
  user: one(user, {
    fields: [bookmark.userId],
    references: [user.id],
  }),
}));

export type BookmarkDTO = typeof bookmark.$inferSelect;
export type InsertBookmarkDTO = typeof bookmark.$inferInsert;
