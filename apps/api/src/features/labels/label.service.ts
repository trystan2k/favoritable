import { CreateUpdateLabelDTO } from "../../db/schema/label.schema.js";
import { NotFoundError } from "../../errors/errors.js";
import { handleServiceErrors } from "../../errors/errors.decorator.js";
import { LabelRepository } from "./label.types.js";
import { generateRandomColor } from "../../utils/colors.js";

export class LabelService {

  private entityName = 'Label';

  constructor(private labelRepository: LabelRepository) { }

  @handleServiceErrors('entityName')
  getLabels(searchQuery?: string) {
    return this.labelRepository.findAll(searchQuery);
  }

  @handleServiceErrors('entityName')
  async getLabel(id: string) {
    const label = await this.labelRepository.findById(id);
    if (!label) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }
    return label;
  }

  @handleServiceErrors('entityName')
  async findByName(name: string) {
    const label = await this.labelRepository.findByName(name);
    return label;
  }

  @handleServiceErrors('entityName')
  createLabel(data: CreateUpdateLabelDTO) {
    data.color = data.color || generateRandomColor();
    return this.labelRepository.create(data);
  }

  @handleServiceErrors('entityName')
  async deleteLabel(id: string) {
    const label = await this.labelRepository.delete(id);
    if (!label) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }
  }

  @handleServiceErrors('entityName')
  async updateLabel(id: string, data: CreateUpdateLabelDTO) {
    data.color = data.color || generateRandomColor();
    const label = await this.labelRepository.update(id, data);
    if (!label) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }
    return label;
  }
}
