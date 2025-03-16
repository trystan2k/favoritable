import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  author: text('author'),
  url: text('url').notNull(),
  thumbnail: text('thumbnail'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  savedAt: integer('saved_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow()
},
  (t) => [
    index('first_name_index').on(t.firstName).asc(),
    index('first_name_and_id_index').on(t.firstName, t.id).asc(),
  ]);

export const labels = sqliteTable('labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color')
});

export const bookmarkLabels = sqliteTable('bookmark_labels', {
  bookmarkId: integer('bookmark_id')
    .notNull()
    .references(() => bookmarks.id),
  labelId: integer('label_id')
    .notNull()
    .references(() => labels.id),
}, (table) => ({
  pk: [table.bookmarkId, table.labelId]
}));