import { eq, inArray } from "drizzle-orm";
import { Inject, Service } from "../../core/dependency-injection/di.decorators.js";
import { label } from "../../db/schema/label.schema.js";
import { type DBTransaction } from "../../db/types.js";
import { InsertLabelDTO, LabelDTO, LabelRepository, UpdateLabelDTO } from "./label.repository.js";

@Service({ name: 'LabelRepository', singleton: true })
export class SQLiteLabelRepository implements LabelRepository {
  constructor(@Inject('db') private db: DBTransaction) { }

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

  create(data: InsertLabelDTO, tx: DBTransaction = this.db): Promise<LabelDTO> {
    return tx.insert(label).values(data).returning().get();
  }

  update(data: UpdateLabelDTO, tx: DBTransaction = this.db): Promise<LabelDTO> {
    return tx.update(label).set({ ...data, updatedAt: new Date() }).where(eq(label.id, data.id)).returning().get();
  }

  async delete(ids: string[], tx: DBTransaction = this.db): Promise<string[]> {
    const deletedLabels = await tx.delete(label).where(inArray(label.id, ids)).returning().all();
    return deletedLabels.map(deletedLabel => deletedLabel.id);
  }
}
