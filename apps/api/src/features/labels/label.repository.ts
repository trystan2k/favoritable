import { eq } from "drizzle-orm";
import type { db } from "../../db";
import { LabelRepository } from "./label.types";
import { LabelDTO, CreateUpdateLabelDTO, label } from "../../db/schema/label.schema";

export class SQLiteLabelRepository implements LabelRepository {
  constructor(private db: db) { }

  findAll(): Promise<LabelDTO[]> {
    return this.db.query.label.findMany();
  }

  findById(id: number): Promise<LabelDTO | null | undefined> {
    return this.db.query.label.findFirst({
      where: (label, { eq }) => eq(label.id, id),
    });
  }

  async create(data: CreateUpdateLabelDTO): Promise<number> {
    const result = await this.db.insert(label).values(data);

    return Number(result.lastInsertRowid);
  }

  async update(id: number, data: CreateUpdateLabelDTO): Promise<LabelDTO> {
    const newData = this.db.update(label).set({ ...data, updatedAt: new Date() }).where(eq(label.id, id)).returning();
    return newData.get();
  }

  delete(id: number): Promise<Pick<CreateUpdateLabelDTO, "id">[]> {
    return this.db.delete(label).where(eq(label.id, id)).returning({ id: label.id });
  }
}
