import { LabelDTO, CreateUpdateLabelDTO } from "../../db/schema/label.schema.js";

export interface LabelRepository {
  findAll(searchQuery?: string): Promise<LabelDTO[]>;
  findByName(name: string): Promise<LabelDTO | null | undefined>;
  findById(id: string): Promise<LabelDTO | null | undefined>;
  create(data: CreateUpdateLabelDTO): Promise<LabelDTO>;
  update(id: string, data: CreateUpdateLabelDTO): Promise<LabelDTO>;
  delete(id: string): Promise<LabelDTO | undefined>;
}
