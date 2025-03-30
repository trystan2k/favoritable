import { handleServiceErrors } from "../../errors/errors.decorator.js";
import { NotFoundError } from "../../errors/errors.js";
import { BookmarkLabelRepository } from "../bookmarkLabel/bookmarkLabel.repository.js";
import { mapCreateLabelModelToInsertLabelDTO, mapLabelDTOToLabelModel, mapUpdateLabelModelToLabelDTO } from "./label.mappers.js";
import { CreateLabelModel, GetLabelsQueryParamsModel, UpdateLabelModel } from "./label.models.js";
import { LabelRepository } from "./label.repository.js";

export class LabelService {

  private entityName = 'Label';

  constructor(private labelRepository: LabelRepository, private bookmarkLabelRepository: BookmarkLabelRepository) { }

  @handleServiceErrors('entityName')
  async getLabels(queryParams: GetLabelsQueryParamsModel) {
    const { q: searchQuery } = queryParams;
    const labels = await this.labelRepository.findAll(searchQuery);
    return labels.map(mapLabelDTOToLabelModel);

  }

  @handleServiceErrors('entityName')
  async getLabel(id: string) {
    const label = await this.labelRepository.findById(id);
    if (!label) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }
    return mapLabelDTOToLabelModel(label);
  }

  @handleServiceErrors('entityName')
  async findByName(name: string) {
    const label = await this.labelRepository.findByName(name);
    if (!label) {
      throw new NotFoundError(`${this.entityName} with name ${name} not found`);
    }
    return mapLabelDTOToLabelModel(label);
  }

  @handleServiceErrors('entityName')
  async createLabel(data: CreateLabelModel) {
    const labelDto = mapCreateLabelModelToInsertLabelDTO(data);
    const newLabel = await this.labelRepository.create(labelDto);
    return mapLabelDTOToLabelModel(newLabel);
  }

  @handleServiceErrors('entityName')
  async deleteLabels(ids: string[]) {
    const deletedLabelsIds = await this.labelRepository.delete(ids);
    for (const deletedLabelId of deletedLabelsIds) {
      await this.bookmarkLabelRepository.deleteByLabelId(deletedLabelId);
    }

    return deletedLabelsIds;
  }

  @handleServiceErrors('entityName')
  async updateLabel(data: UpdateLabelModel) {
    const labelDto = mapUpdateLabelModelToLabelDTO(data);
    const label = await this.labelRepository.update(labelDto);
    if (!label) {
      throw new NotFoundError(`${this.entityName} with id ${data.id} not found`);
    }
    return mapLabelDTOToLabelModel(label);
  }
}
