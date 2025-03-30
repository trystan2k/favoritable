import { LabelDTO, InsertLabelDTO } from "../../db/dtos/label.dtos";

export interface LabelRepository {
  findAll(searchQuery?: string): Promise<LabelDTO[]>;
  findByName(name: string): Promise<LabelDTO | undefined>;
  findById(id: string): Promise<LabelDTO | undefined>;
  create(data: InsertLabelDTO): Promise<LabelDTO>;
  update(data: InsertLabelDTO): Promise<LabelDTO>;
  delete(ids: string[]): Promise<string[]>;
}
