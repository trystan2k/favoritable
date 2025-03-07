import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { createRoute } from '@hono/zod-openapi';
import { addLabelsSchema, createBookmarkSchema, labelSchema, updateBookmarkSchema } from '../domain/schemas/bookmark.schema';
import { z } from 'zod';

export const registry = new OpenAPIRegistry();

const bookmarkResponse = registry.register('Bookmark', createBookmarkSchema.extend({
  id: z.number(),
  savedAt: z.date(),
  updatedAt: z.date(),
  labels: z.array(labelSchema).optional()
}));

const bookmarksResponse = z.array(bookmarkResponse);

// GET /bookmarks
registry.registerPath({
  method: 'get',
  path: '/bookmarks',
  description: 'Get all bookmarks',
  responses: {
    200: {
      description: 'List of bookmarks',
      content: {
        'application/json': {
          schema: bookmarksResponse
        }
      }
    }
  }
});

// GET /bookmarks/:id
registry.registerPath({
  method: 'get',
  path: '/bookmarks/{id}',
  description: 'Get a bookmark by ID',
  request: {
    params: z.object({
      id: z.string()
    })
  },
  responses: {
    200: {
      description: 'Bookmark details',
      content: {
        'application/json': {
          schema: bookmarkResponse
        }
      }
    },
    404: {
      description: 'Bookmark not found'
    }
  }
});

// POST /bookmarks
registry.registerPath({
  method: 'post',
  path: '/bookmarks',
  description: 'Create a new bookmark',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createBookmarkSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Bookmark created successfully',
      content: {
        'application/json': {
          schema: z.object({
            id: z.number()
          })
        }
      }
    },
    400: {
      description: 'Invalid request body'
    }
  }
});

// PUT /bookmarks/:id
registry.registerPath({
  method: 'put',
  path: '/bookmarks/{id}',
  description: 'Update a bookmark',
  request: {
    params: z.object({
      id: z.string()
    }),
    body: {
      content: {
        'application/json': {
          schema: updateBookmarkSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Bookmark updated successfully'
    },
    404: {
      description: 'Bookmark not found'
    }
  }
});

// DELETE /bookmarks/:id
registry.registerPath({
  method: 'delete',
  path: '/bookmarks/{id}',
  description: 'Delete a bookmark',
  request: {
    params: z.object({
      id: z.string()
    })
  },
  responses: {
    200: {
      description: 'Bookmark deleted successfully'
    },
    404: {
      description: 'Bookmark not found'
    }
  }
});

// PUT /bookmarks/:id/labels
registry.registerPath({
  method: 'put',
  path: '/bookmarks/{id}/labels',
  description: 'Update bookmark labels',
  request: {
    params: z.object({
      id: z.string()
    }),
    body: {
      content: {
        'application/json': {
          schema: addLabelsSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Bookmark labels updated successfully'
    },
    404: {
      description: 'Bookmark not found'
    }
  }
});

export const routes = registry.build();
