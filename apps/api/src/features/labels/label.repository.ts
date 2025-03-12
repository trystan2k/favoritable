import { eq } from "drizzle-orm";
import type { db } from "../../db/index.js";
import { CreateUpdateLabelDTO, label } from "../../db/schema/label.schema.js";
import { LabelRepository } from "./label.types.js";

export class SQLiteLabelRepository implements LabelRepository {
  constructor(private db: db) { }

  findAll() {
    return this.db.query.label.findMany();
  }

  findById(id: number) {
    return this.db.query.label.findFirst({
      where: (label, { eq }) => eq(label.id, id),
    });
  }

  create(data: CreateUpdateLabelDTO) {
    return this.db.insert(label).values(data).returning().get();
  }

  async update(id: number, data: CreateUpdateLabelDTO) {
    const newData = this.db.update(label).set({ ...data, updatedAt: new Date() }).where(eq(label.id, id)).returning();
    return await newData.get();
  }

  delete(id: number) {
    return this.db.delete(label).where(eq(label.id, id)).returning().get();
  }
}
