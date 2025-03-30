import { label } from "../schema/label.schema.js";

export type LabelDTO = typeof label.$inferSelect;
export type InsertLabelDTO = typeof label.$inferInsert;