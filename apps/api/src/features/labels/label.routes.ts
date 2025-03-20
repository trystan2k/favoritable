import { Hono } from "hono";
import { db } from "../../db";
import { CreateUpdateLabelDTO } from "../../db/schema/label.schema";
import { SQLiteLabelRepository } from "./label.repository";
import { LabelService } from "./label.service";

const labelRoutes = new Hono();

const labelRepository = new SQLiteLabelRepository(db);
const labelService = new LabelService(labelRepository);

// Labels - Get
labelRoutes.get('/', async (c) => {
  const searchQuery = c.req.query('q');
  const labels = await labelService.getLabels(searchQuery);
  return c.json(labels, 200);
});

// Labels - Create
labelRoutes.post('/', async (c) => {
  const data = await c.req.json<CreateUpdateLabelDTO>();
  const label = await labelService.createLabel(data);
  // Add location header in response, with the url of the newly created bookmark
  c.header('Location', `${c.req.url}/${label.id}`);
  return c.json(label, 201);
});

// Label - Get
labelRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const label = await labelService.getLabel(id);
  return c.json(label, 200);
});

// Label - Delete
labelRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await labelService.deleteLabel(id);
  return c.body(null, 204);
});

// Label - Update
labelRoutes.put('/:id', async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json<CreateUpdateLabelDTO>();
  const updatedLabel = await labelService.updateLabel(id, data);
  return c.json(updatedLabel, 200);
});

export { labelRoutes };
