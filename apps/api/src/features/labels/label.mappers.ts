import { generateRandomColor } from '../../utils/colors.js';
import { tsidGenerator } from '../../utils/tsids-generator.js';
import type {
  CreateLabelModel,
  LabelModel,
  UpdateLabelModel,
} from './label.models.js';
import type {
  InsertLabelDTO,
  LabelDTO,
  UpdateLabelDTO,
} from './label.repository.js';

export const mapCreateLabelModelToInsertLabelDTO = (
  label: CreateLabelModel
): InsertLabelDTO => {
  return {
    id: tsidGenerator.generate(),
    name: label.name,
    color: label.color || generateRandomColor(),
    userId: label.userId,
  };
};

export const mapLabelDTOToLabelModel = (label: LabelDTO): LabelModel => {
  return {
    id: label.id,
    name: label.name,
    color: label.color,
    userId: label.userId,
    createdAt: label.createdAt,
    updatedAt: label.updatedAt,
  };
};

export const mapUpdateLabelModelToLabelDTO = (
  label: UpdateLabelModel
): UpdateLabelDTO => {
  return {
    id: label.id,
    name: label.name,
    color: label.color,
    userId: label.userId,
    createdAt: label.createdAt,
    updatedAt: label.updatedAt,
  };
};
