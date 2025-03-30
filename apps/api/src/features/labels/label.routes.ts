import { Hono } from "hono";

import { db } from "../../db/index.js";
import { createLabelSchema, deleteLabelssSchema, getLabelsQueryParamsSchema, labelIdParamSchema, UpdateLabelModel, updateLabelSchema } from "./label.models.js";
import { SQLiteLabelRepository } from "./label.repository.js";
import { LabelService } from "./label.service.js";
import { SQLiteBookmarkLabelRepository } from "../bookmarkLabel/bookmarkLabel.repository.js";
import { zCustomValidator } from "../../core/validators.wrapper.js";

const labelRoutes = new Hono();

const labelRepository = new SQLiteLabelRepository(db);
const bookmarkLabelRepository = new SQLiteBookmarkLabelRepository(db);
const labelService = new LabelService(labelRepository, bookmarkLabelRepository);

// Labels - Get
labelRoutes.get('/', zCustomValidator('param', getLabelsQueryParamsSchema), async (c) => {
  const queryParams = c.req.valid('param');
  const labels = await labelService.getLabels(queryParams);
  return c.json(labels, 200);
});

// Labels - Create
labelRoutes.post('/', zCustomValidator('json', createLabelSchema), async (c) => {
  const data = c.req.valid('json');
  const label = await labelService.createLabel(data);
  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${c.req.url}/${label.id}`);
  return c.json(label, 201);
});

// Label - Get
labelRoutes.get('/:id', zCustomValidator('param', labelIdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const label = await labelService.getLabel(id);
  return c.json(label, 200);
});

// Bookmarks - Delete
labelRoutes.post('/batch-delete', zCustomValidator('json', deleteLabelssSchema), async (c) => {
  const data = c.req.valid('json');
  const deletedBookmarks = await labelService.deleteLabels(data.ids);
  return c.json(deletedBookmarks, 200);
});

// Label - Delete
labelRoutes.delete('/:id', zCustomValidator('param', labelIdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  await labelService.deleteLabels([id]);
  return c.body(null, 204);
});

// Label - Update
labelRoutes.put('/:id', zCustomValidator('param', labelIdParamSchema), zCustomValidator('json', updateLabelSchema.partial()), async (c) => {
  const data = c.req.valid('json');
  const { id } = c.req.valid('param');
  data.id = id;

  const updatedLabel = await labelService.updateLabel(data as UpdateLabelModel);
  return c.json(updatedLabel, 200);
});

export { labelRoutes };
