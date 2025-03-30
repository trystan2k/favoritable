import { InsertLabelDTO } from "../../db/dtos/label.dtos.js";
import { handleServiceErrors } from "../../errors/errors.decorator.js";
import { NotFoundError } from "../../errors/errors.js";
import { generateRandomColor } from "../../utils/colors.js";
import { BookmarkUnitOfWork } from "../bookmarks/bookmark-unit-of-work.js";

export class LabelService {

  private entityName = 'Label';

  constructor(private bookmarkUnitOfWork: BookmarkUnitOfWork) { }

  @handleServiceErrors('entityName')
  getLabels(searchQuery?: string) {
    return this.bookmarkUnitOfWork.labelRepository.findAll(searchQuery);
  }

  @handleServiceErrors('entityName')
  async getLabel(id: string) {
    const label = await this.bookmarkUnitOfWork.labelRepository.findById(id);
    if (!label) {
      throw new NotFoundError(`${this.entityName} with id ${id} not found`);
    }
    return label;
  }

  @handleServiceErrors('entityName')
  async findByName(name: string) {
    const label = await this.bookmarkUnitOfWork.labelRepository.findByName(name);
    return label;
  }

  @handleServiceErrors('entityName')
  createLabel(data: InsertLabelDTO) {
    data.color = data.color || generateRandomColor();
    return this.bookmarkUnitOfWork.labelRepository.create(data);
  }

  @handleServiceErrors('entityName')
  async deleteLabels(ids: string[]) {
    const deletdLabels = await this.bookmarkUnitOfWork.labelRepository.delete(ids);
    return deletdLabels;
  }

  @handleServiceErrors('entityName')
  async updateLabel(data: InsertLabelDTO) {
    data.color = data.color || generateRandomColor();
    const label = await this.bookmarkUnitOfWork.labelRepository.update(data);
    if (!label) {
      throw new NotFoundError(`${this.entityName} with id ${data.id} not found`);
    }
    return label;
  }
}
