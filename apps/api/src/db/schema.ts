import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createSchemaFactory } from 'drizzle-zod';
import { z } from '@hono/zod-openapi';

const { createInsertSchema, createSelectSchema, createUpdateSchema } = createSchemaFactory({ zodInstance: z, coerce: { date: true } });

export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  author: text('author'),
  url: text('url').notNull(),
  thumbnail: text('thumbnail'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  savedAt: integer('saved_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date())
});

export const bookmarkSelectSchema = createSelectSchema(bookmarks);
export const bookmarkInsertSchema = createInsertSchema(bookmarks);
export const bookmarkUpdateSchema = createUpdateSchema(bookmarks);

export type BookmarkDTO = typeof bookmarks.$inferSelect;
export type CreateUpdateBookmarkDTO = typeof bookmarks.$inferInsert;

export const labels = sqliteTable('labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color')
});

export const labelSelectSchema = createSelectSchema(labels);
export const labelInsertSchema = createInsertSchema(labels);
export const labelUpdateSchema = createUpdateSchema(labels);

export type LabelDTO = typeof labels.$inferSelect;
export type CreateUpdateLabelDTO = typeof labels.$inferInsert;

export const bookmarksRelation = relations(bookmarks, ({ many }) => ({
  bookmarksLabel: many(bookmarksLabel),
}));

export const labelsRelations = relations(labels, ({ many }) => ({
  bookmarksLabel: many(bookmarksLabel),
}));

export const bookmarksLabel = sqliteTable(
  'bookmarks_labels',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    bookmarkId: integer('bookmark_id')
      .notNull()
      .references(() => bookmarks.id),
    labelId: integer('label_id')
      .notNull()
      .references(() => labels.id),
  }
);

export const bookmarkLabelsRelations = relations(bookmarksLabel, ({ one }) => ({
  label: one(labels, {
    fields: [bookmarksLabel.labelId],
    references: [labels.id],
  }),
  bookmark: one(bookmarks, {
    fields: [bookmarksLabel.bookmarkId],
    references: [bookmarks.id],
  }),
}));
