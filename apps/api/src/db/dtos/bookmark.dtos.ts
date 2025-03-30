import { bookmark } from "../schema/bookmark.schema.js";
import { LabelDTO } from "./label.dtos.js";

export type BookmarkDTO = typeof bookmark.$inferSelect;
export type InsertBookmarkDTO = typeof bookmark.$inferInsert;

export type BookmarkWithLabelsDTO = BookmarkDTO & {
  bookmarkLabel?: {
    label: LabelDTO;
  }[];
};