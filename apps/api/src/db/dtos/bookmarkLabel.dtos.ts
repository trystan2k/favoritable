import { bookmarkLabel } from "../schema/bookmark-label.schema.js";

export type BookmarkLabelDTO = typeof bookmarkLabel.$inferSelect;

export type InsertBookmarkLabelDTO = typeof bookmarkLabel.$inferInsert;
