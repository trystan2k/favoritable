import { relations, sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { bookmarkStates, defaultBookmarkState } from './bookmark-state';
import { user } from './auth';

const bookmarkStateCheckValues = bookmarkStates.map((state) => `'${state}'`).join(', ');

export const bookmark = sqliteTable(
  'bookmark',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    author: text('author'),
    thumbnail: text('thumbnail'),
    publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
    state: text('state', { enum: bookmarkStates }).default(defaultBookmarkState).notNull(),
    favorite: integer('favorite', { mode: 'boolean' }).default(false).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  (table) => [
    index('bookmark_userId_idx').on(table.userId),
    check('bookmark_state_check', sql`${table.state} in (${sql.raw(bookmarkStateCheckValues)})`)
  ]
);

export const label = sqliteTable(
  'label',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  (table) => [
    index('label_userId_idx').on(table.userId),
    uniqueIndex('label_userId_name_unique').on(table.userId, table.name)
  ]
);

export const bookmarkLabel = sqliteTable(
  'bookmark_label',
  {
    id: text('id')
      .primaryKey()
      .default(sql`(lower(hex(randomblob(16))))`),
    bookmarkId: text('bookmark_id')
      .notNull()
      .references(() => bookmark.id, { onDelete: 'cascade' }),
    labelId: text('label_id')
      .notNull()
      .references(() => label.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  (table) => [
    uniqueIndex('bookmarkLabel_bookmarkId_labelId_unique').on(table.bookmarkId, table.labelId),
    index('bookmarkLabel_labelId_idx').on(table.labelId)
  ]
);

export const bookmarkRelations = relations(bookmark, ({ many, one }) => ({
  labels: many(bookmarkLabel),
  user: one(user, {
    fields: [bookmark.userId],
    references: [user.id]
  })
}));

export const labelRelations = relations(label, ({ many, one }) => ({
  bookmarks: many(bookmarkLabel),
  user: one(user, {
    fields: [label.userId],
    references: [user.id]
  })
}));

export const bookmarkLabelRelations = relations(bookmarkLabel, ({ one }) => ({
  bookmark: one(bookmark, {
    fields: [bookmarkLabel.bookmarkId],
    references: [bookmark.id]
  }),
  label: one(label, {
    fields: [bookmarkLabel.labelId],
    references: [label.id]
  })
}));
