import { LabelDTO, InsertLabelDTO } from "../../db/dtos/label.dtos";

export interface LabelRepository {
  findAll(searchQuery?: string): Promise<LabelDTO[] | undefined>;
  findByName(name: string): Promise<LabelDTO | null | undefined>;
  findById(id: string): Promise<LabelDTO | null | undefined>;
  create(data: InsertLabelDTO): Promise<LabelDTO>;
  update(data: InsertLabelDTO): Promise<LabelDTO>;
  delete(id: string): Promise<LabelDTO | undefined>;
}
