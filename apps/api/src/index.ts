import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();
const api = app.basePath('/api');

// GET all bookmarks
api.get('/bookmarks', (c) => {
  return c.json({
    message: 'Hello World!',
  });
});

// Start the server
serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
