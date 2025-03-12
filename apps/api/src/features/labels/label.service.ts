import { CreateUpdateLabelDTO } from "../../db/schema/label.schema.js";
import { NotFoundError } from "../../errors/errors.js";
import { handleServiceErrors } from "../../errors/errors.decorator.js";
import { LabelRepository } from "./label.types.js";

export class LabelService {

  private entityName = 'Label';

  constructor(private labelRepository: LabelRepository) { }

  @handleServiceErrors('entityName')
  getLabels() {
    return this.labelRepository.findAll();
  }

  @handleServiceErrors('entityName')
  async getLabel(id: number) {
    const label = await this.labelRepository.findById(id);
    if (!label) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }
    return label;
  }

  @handleServiceErrors('entityName')
  createLabel(data: CreateUpdateLabelDTO) {
    return this.labelRepository.create(data);
  }

  @handleServiceErrors('entityName')
  async deleteLabel(id: number) {
    const label = await this.labelRepository.delete(id);
    if (!label) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }
  }

  @handleServiceErrors('entityName')
  async updateLabel(id: number, data: CreateUpdateLabelDTO) {
    const label = await this.labelRepository.update(id, data);
    if (!label) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }
    return label;
  }
}
