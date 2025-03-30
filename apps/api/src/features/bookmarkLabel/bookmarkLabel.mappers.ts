import { tsidGenerator } from "../../utils/tsids-generator.js"

export const createBookmarkLabelRelation = (bookmarkId: string, labelId: string) => {
  return {
    id: tsidGenerator.generate(),
    bookmarkId,
    labelId,
  }
}