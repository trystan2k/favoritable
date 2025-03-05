import { CreateUpdateLabelDTO, LabelDTO } from "../../db/schema.js";

export interface LabelRepository {
  findAll(): Promise<LabelDTO[]>;
  findById(id: number): Promise<LabelDTO | null | undefined>;
  create(data: CreateUpdateLabelDTO): Promise<number>;
  update(id: number, data: CreateUpdateLabelDTO): Promise<boolean>;
  delete(id: number): Promise<Pick<CreateUpdateLabelDTO, "id">[]>;
}
