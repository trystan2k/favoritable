import { label } from "../schema/label.schema";

export type LabelDTO = typeof label.$inferSelect;

export type InsertLabelDTO = typeof label.$inferInsert;

export type UpdateLabelDTO = Partial<InsertLabelDTO> & Pick<InsertLabelDTO, 'id'>;