import { eq } from "drizzle-orm";
import { DB } from "../../db/connection.js";
import { LabelDTO, CreateUpdateLabelDTO, labels } from "../../db/schema.js";
import { LabelRepository } from "./label.types.js";

export class SQLiteLabelRepository implements LabelRepository {
  constructor(private db: DB) { }

  findAll(): Promise<LabelDTO[]> {
    return this.db.query.labels.findMany();
  }

  findById(id: number): Promise<LabelDTO | null | undefined> {
    return this.db.query.labels.findFirst({
      where: (labels, { eq }) => eq(labels.id, id),
    });
  }

  async create(data: CreateUpdateLabelDTO): Promise<number> {
    const result = await this.db.insert(labels).values(data);

    return Number(result.lastInsertRowid);
  }

  update(id: number, data: CreateUpdateLabelDTO): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  delete(id: number): Promise<Pick<CreateUpdateLabelDTO, "id">[]> {
    return this.db.delete(labels).where(eq(labels.id, id)).returning({ id: labels.id });
  }
}
