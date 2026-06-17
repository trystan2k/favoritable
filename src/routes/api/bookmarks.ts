import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/bookmarks')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleCreateBookmarkRequest } =
          await import('@/features/bookmarks/server/create-bookmark.server');
        const input = await request.json().catch(() => null);

        return Response.json(await handleCreateBookmarkRequest(input));
      }
    }
  }
});
