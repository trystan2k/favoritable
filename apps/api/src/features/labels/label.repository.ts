import type { label } from '../../db/schema/label.schema.js';
import type { DBTransaction } from '../../db/types.js';

export type LabelDTO = typeof label.$inferSelect;

export type InsertLabelDTO = typeof label.$inferInsert;

export type UpdateLabelDTO = Partial<InsertLabelDTO> &
  Pick<InsertLabelDTO, 'id'>;

export interface LabelRepository {
  findAll(searchQuery?: string): Promise<LabelDTO[]>;
  findByName(name: string): Promise<LabelDTO | undefined>;
  findById(id: string): Promise<LabelDTO | undefined>;
  create(data: InsertLabelDTO, tx?: DBTransaction): Promise<LabelDTO>;
  update(data: UpdateLabelDTO): Promise<LabelDTO>;
  delete(ids: string[]): Promise<string[]>;
}
