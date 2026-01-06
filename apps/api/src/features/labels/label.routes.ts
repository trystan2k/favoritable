import { Hono } from 'hono';
import { Inject, Service } from '../../core/dependency-injection/di.decorators.js';
import { zCustomValidator } from '../../core/validators.wrapper.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import {
  createLabelSchema,
  deleteLabelssSchema,
  getLabelsQueryParamsSchema,
  labelIdParamSchema,
  type UpdateLabelModel,
  updateLabelSchema,
} from './label.models.js';
import type { LabelService } from './label.services.js';

@Service({ name: 'LabelRoutes' })
export class LabelRoutes {
  private labelRoutes: Hono;

  constructor(@Inject('LabelService') private labelService: LabelService) {
    this.labelRoutes = new Hono();
    this.setupRoutes();
  }

  get routes() {
    return this.labelRoutes;
  }

  private setupRoutes() {
    // Apply authentication middleware to all label routes
    this.labelRoutes.use('*', authMiddleware());

    // Labels - Get
    this.labelRoutes.get('/', zCustomValidator('param', getLabelsQueryParamsSchema), async (c) => {
      const queryParams = c.req.valid('param');
      const labels = await this.labelService.getLabels(queryParams);
      return c.json(labels, 200);
    });

    // Labels - Create
    this.labelRoutes.post('/', zCustomValidator('json', createLabelSchema), async (c) => {
      const data = c.req.valid('json');
      const label = await this.labelService.createLabel(data);
      // Add location header in response, with the url of the newly created bookmark
      c.header('Location', `${c.req.url}/${label.id}`);
      return c.json(label, 201);
    });

    // Label - Get
    this.labelRoutes.get('/:id', zCustomValidator('param', labelIdParamSchema), async (c) => {
      const { id } = c.req.valid('param');
      const label = await this.labelService.getLabel(id);
      return c.json(label, 200);
    });

    // Bookmarks - Delete
    this.labelRoutes.post(
      '/batch-delete',
      zCustomValidator('json', deleteLabelssSchema),
      async (c) => {
        const data = c.req.valid('json');
        const deletedBookmarks = await this.labelService.deleteLabels(data.ids);
        return c.json(deletedBookmarks, 200);
      }
    );

    // Label - Delete
    this.labelRoutes.delete('/:id', zCustomValidator('param', labelIdParamSchema), async (c) => {
      const { id } = c.req.valid('param');
      await this.labelService.deleteLabels([id]);
      return c.body(null, 204);
    });

    // Label - Update
    this.labelRoutes.put(
      '/:id',
      zCustomValidator('param', labelIdParamSchema),
      zCustomValidator('json', updateLabelSchema.partial()),
      async (c) => {
        const data = c.req.valid('json');
        const { id } = c.req.valid('param');
        data.id = id;

        const updatedLabel = await this.labelService.updateLabel(data as UpdateLabelModel);
        return c.json(updatedLabel, 200);
      }
    );
  }
}
