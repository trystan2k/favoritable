import { eq } from "drizzle-orm";
import type { db } from "../../db/index.js";
import { label } from "../../db/schema/label.schema.js";
import { LabelRepository } from "./label.types.js";
import { tsidGenerator } from "../../utils/tsids-generator.js";
import { InsertLabelDTO, LabelDTO } from "../../db/dtos/label.dtos.js";
import { Tx } from "../bookmarks/bookmark-unit-of-work.js";
export class SQLiteLabelRepository implements LabelRepository {
  constructor(private db: db) { }
  findAll(searchQuery?: string): Promise<LabelDTO[] | undefined> {
    return this.db.query.label.findMany({
      where: searchQuery ? (label, { like }) => like(label.name, `%${searchQuery}%`) : undefined
    })
  }

  findByName(name: string) {
    return this.db.query.label.findFirst({
      where: (label, { eq }) => eq(label.name, name),
    });
  }

  findById(id: string) {
    return this.db.query.label.findFirst({
      where: (label, { eq }) => eq(label.id, id),
    });
  }

  create(data: InsertLabelDTO, tx: db | Tx = this.db) {
    const id = tsidGenerator.generate();
    return tx.insert(label).values({ ...data, id }).returning().get();
  }

  update(data: InsertLabelDTO, tx: db | Tx = this.db) {
    return tx.update(label).set({ ...data, updatedAt: new Date() }).where(eq(label.id, data.id)).returning().get();
  }

  delete(id: string, tx: db | Tx = this.db) {
    return tx.delete(label).where(eq(label.id, id)).returning().get();
  }
}
