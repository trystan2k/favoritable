import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from 'hono/cors';
import { requestId } from "hono/request-id";


import { errorHandler } from "./errors/errors.handler.js";
import { bookmarkRoutes } from "./features/bookmarks/bookmark.routes.js";
import { labelRoutes } from "./features/labels/label.routes.js";

const routes = {
  basePath: '/api',
  bookmarks: '/bookmarks',
  labels: '/labels',
}

const app = new Hono();
app.use('*', requestId());
app.use('*', cors())
app.onError(errorHandler);

const api = app.basePath(routes.basePath);
api.route(routes.bookmarks, bookmarkRoutes);
api.route(routes.labels, labelRoutes);

// Start the server
serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
  console.log(`API documentation available at http://localhost:${info.port}/api/docs`);
});

export default app;
