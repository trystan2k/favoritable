import { db } from "../../db/index.js";
import { LabelDTO, InsertLabelDTO, UpdateLabelDTO } from "../../db/dtos/label.dtos.js";
import { Tx } from "../bookmarks/bookmark-unit-of-work.js";

export interface LabelRepository {
  findAll(searchQuery?: string): Promise<LabelDTO[]>;
  findByName(name: string): Promise<LabelDTO | undefined>;
  findById(id: string): Promise<LabelDTO | undefined>;
  create(data: InsertLabelDTO, tx?: db | Tx): Promise<LabelDTO>;
  update(data: UpdateLabelDTO): Promise<LabelDTO>;
  delete(ids: string[]): Promise<string[]>;
}
