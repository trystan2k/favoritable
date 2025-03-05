import { CreateUpdateLabelDTO } from "../../db/schema.js";
import { LabelRepository } from "./label.types.js";

export class LabelService {
  constructor(private labelRepository: LabelRepository) { }

  getLabels() {
    return this.labelRepository.findAll();
  }

  getLabel(id: number) {
    return this.labelRepository.findById(id);
  }

  createLabel(data: CreateUpdateLabelDTO) {
    return this.labelRepository.create(data);
  }

  deleteLabel(id: number) {
    return this.labelRepository.delete(id);
  }
}
