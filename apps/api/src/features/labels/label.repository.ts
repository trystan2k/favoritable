import { eq } from "drizzle-orm";
import type { db } from "../../db/index.js";
import { CreateUpdateLabelDTO, label } from "../../db/schema/label.schema.js";
import { LabelRepository } from "./label.types.js";
import { tsidGenerator } from "../../utils/tsids-generator.js";

export class SQLiteLabelRepository implements LabelRepository {
  constructor(private db: db) { }

  findAll(searchQuery?: string) {
    return this.db.query.label.findMany({
      where: searchQuery ? (label, { like }) => like(label.name, `%${searchQuery}%`) : undefined
    })
  }

  findById(id: string) {
    return this.db.query.label.findFirst({
      where: (label, { eq }) => eq(label.id, id),
    });
  }

  create(data: CreateUpdateLabelDTO) {
    const id = tsidGenerator.generate();
    return this.db.insert(label).values({ ...data, id }).returning().get();
  }

  async update(id: string, data: CreateUpdateLabelDTO) {
    const newData = this.db.update(label).set({ ...data, updatedAt: new Date() }).where(eq(label.id, id)).returning();
    return await newData.get();
  }

  delete(id: string) {
    return this.db.delete(label).where(eq(label.id, id)).returning().get();
  }
}
