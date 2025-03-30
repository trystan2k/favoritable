import { eq, inArray } from "drizzle-orm";
import type { db } from "../../db/index.js";
import { label } from "../../db/schema/label.schema.js";
import { LabelRepository } from "./label.types.js";
import { tsidGenerator } from "../../utils/tsids-generator.js";
import { InsertLabelDTO, LabelDTO } from "../../db/dtos/label.dtos.js";
import { Tx } from "../bookmarks/bookmark-unit-of-work.js";
export class SQLiteLabelRepository implements LabelRepository {
  constructor(private db: db) { }
  findAll(searchQuery?: string): Promise<LabelDTO[]> {
    return this.db.query.label.findMany({
      where: searchQuery ? (label, { like }) => like(label.name, `%${searchQuery}%`) : undefined
    })
  }

  findByName(name: string): Promise<LabelDTO | undefined> {
    return this.db.query.label.findFirst({
      where: (label, { eq }) => eq(label.name, name),
    });
  }

  findById(id: string): Promise<LabelDTO | undefined> {
    return this.db.query.label.findFirst({
      where: (label, { eq }) => eq(label.id, id),
    });
  }

  create(data: InsertLabelDTO, tx: db | Tx = this.db): Promise<LabelDTO> {
    const id = tsidGenerator.generate();
    return tx.insert(label).values({ ...data, id }).returning().get();
  }

  update(data: InsertLabelDTO, tx: db | Tx = this.db): Promise<LabelDTO> {
    return tx.update(label).set({ ...data, updatedAt: new Date() }).where(eq(label.id, data.id)).returning().get();
  }

  async delete(ids: string[], tx: db | Tx = this.db): Promise<string[]> {
    const deletedLabels = await tx.delete(label).where(inArray(label.id, ids)).returning().all();
    return deletedLabels.map(deletedLabel => deletedLabel.id);
  }
}
