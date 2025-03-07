import { CreateUpdateLabelDTO } from "../../db/schema/label.schema";
import { LabelRepository } from "./label.types";

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

  updateLabel(id: number, data: CreateUpdateLabelDTO) {
    return this.labelRepository.update(id, data);
  }
}
