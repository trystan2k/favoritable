import { LabelDTO, CreateUpdateLabelDTO } from "../../db/schema/label.schema";

export interface LabelRepository {
  findAll(): Promise<LabelDTO[]>;
  findById(id: number): Promise<LabelDTO | null | undefined>;
  create(data: CreateUpdateLabelDTO): Promise<LabelDTO>;
  update(id: number, data: CreateUpdateLabelDTO): Promise<LabelDTO>;
  delete(id: number): Promise<LabelDTO | undefined>;
}
