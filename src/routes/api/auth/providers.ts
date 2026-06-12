import { createFileRoute } from '@tanstack/react-router';

import { getAuthProviderAvailability } from '@/features/auth/server/env.server';

export const Route = createFileRoute('/api/auth/providers')({
  server: {
    handlers: {
      GET: () => Response.json(getAuthProviderAvailability())
    }
  }
});
