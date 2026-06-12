import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/features/auth/server/auth.server';

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => getAuth().handler(request),
      POST: ({ request }) => getAuth().handler(request)
    }
  }
});
