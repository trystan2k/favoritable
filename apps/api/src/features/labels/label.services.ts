import { Inject, Service } from "../../core/dependency-injection/di.decorators.js";
import { ClassErrorHandler } from "../../errors/errors.decorators.js";
import { NotFoundError } from "../../errors/errors.js";
import { mapServiceErrors } from "../../errors/errors.mappers.js";
import { type BookmarkLabelRepository } from "../bookmarkLabel/bookmarkLabel.repository.js";
import { mapCreateLabelModelToInsertLabelDTO, mapLabelDTOToLabelModel, mapUpdateLabelModelToLabelDTO } from "./label.mappers.js";
import { CreateLabelModel, GetLabelsQueryParamsModel, UpdateLabelModel } from "./label.models.js";
import { type LabelRepository } from "./label.repository.js";

@Service({ name: 'LabelService' })
@ClassErrorHandler(mapServiceErrors)
export class LabelService {

  constructor(
    @Inject('LabelRepository') private labelRepository: LabelRepository,
    @Inject('BookmarkLabelRepository') private bookmarkLabelRepository: BookmarkLabelRepository,
  ) { }

  async getLabels(queryParams: GetLabelsQueryParamsModel) {
    const { q: searchQuery } = queryParams;
    const labels = await this.labelRepository.findAll(searchQuery);
    return labels.map(mapLabelDTOToLabelModel);

  }

  async getLabel(id: string) {
    const label = await this.labelRepository.findById(id);
    if (!label) {
      throw new NotFoundError(`Label with id ${id} not found`);
    }
    return mapLabelDTOToLabelModel(label);
  }

  async findByName(name: string) {
    const label = await this.labelRepository.findByName(name);
    if (!label) {
      throw new NotFoundError(`Label with name ${name} not found`);
    }
    return mapLabelDTOToLabelModel(label);
  }

  async createLabel(data: CreateLabelModel) {
    const labelDto = mapCreateLabelModelToInsertLabelDTO(data);
    const newLabel = await this.labelRepository.create(labelDto);
    return mapLabelDTOToLabelModel(newLabel);
  }

  async deleteLabels(ids: string[]) {
    const deletedLabelsIds = await this.labelRepository.delete(ids);
    for (const deletedLabelId of deletedLabelsIds) {
      await this.bookmarkLabelRepository.deleteByLabelId(deletedLabelId);
    }

    return deletedLabelsIds;
  }

  async updateLabel(data: UpdateLabelModel) {
    const labelDto = mapUpdateLabelModelToLabelDTO(data);
    const label = await this.labelRepository.update(labelDto);
    if (!label) {
      throw new NotFoundError(`Label with id ${data.id} not found`);
    }
    return mapLabelDTOToLabelModel(label);
  }
}
