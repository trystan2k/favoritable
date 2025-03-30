import { InsertLabelDTO, LabelDTO, UpdateLabelDTO } from "../../db/dtos/label.dtos.js";
import { generateRandomColor } from "../../utils/colors.js";
import { tsidGenerator } from "../../utils/tsids-generator.js";
import { CreateLabelModel, LabelModel, UpdateLabelModel } from "./label.models.js";

export const mapCreateLabelModelToInsertLabelDTO = (label: CreateLabelModel): InsertLabelDTO => {
  return {
    id: tsidGenerator.generate(),
    name: label.name,
    color: label.color || generateRandomColor(),

  }
}

export const mapLabelDTOToLabelModel = (label: LabelDTO): LabelModel => {
  return {
    id: label.id,
    name: label.name,
    color: label.color,
    createdAt: label.createdAt,
    updatedAt: label.updatedAt,
  }
}

export const mapUpdateLabelModelToLabelDTO = (label: UpdateLabelModel): UpdateLabelDTO => {
  return {
    id: label.id,
    name: label.name,
    color: label.color,
    createdAt: label.createdAt,
    updatedAt: label.updatedAt,
  }
}