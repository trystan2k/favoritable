import { eq, inArray } from "drizzle-orm";
import type { db } from "../../db/index.js";
import { label } from "../../db/schema/label.schema.js";
import { Tx } from "../bookmarks/bookmark-unit-of-work.js";
import { InsertLabelDTO, LabelDTO, LabelRepository, UpdateLabelDTO } from "./label.repository.js";
import { ClassErrorHandler } from "../../errors/errors.decorator.js";
import { mapRepositoryErrors } from "../../errors/errors.mapper.js";

@ClassErrorHandler(mapRepositoryErrors)
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
    return tx.insert(label).values(data).returning().get();
  }

  update(data: UpdateLabelDTO, tx: db | Tx = this.db): Promise<LabelDTO> {
    return tx.update(label).set({ ...data, updatedAt: new Date() }).where(eq(label.id, data.id)).returning().get();
  }

  async delete(ids: string[], tx: db | Tx = this.db): Promise<string[]> {
    const deletedLabels = await tx.delete(label).where(inArray(label.id, ids)).returning().all();
    return deletedLabels.map(deletedLabel => deletedLabel.id);
  }
}
