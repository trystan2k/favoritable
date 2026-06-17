import { createMiddleware, createServerFn } from '@tanstack/react-start';

import type { AuthenticatedServerSession } from '@/features/auth/lib/auth-session';
import { unauthorizedServerFunctionError } from '@/features/auth/lib/unauthorized-error';

export type AuthenticatedServerContext = {
  session: AuthenticatedServerSession;
  userId: AuthenticatedServerSession['user']['id'];
};

export async function requireAuthenticatedServerSession(
  request: Request
): Promise<AuthenticatedServerSession> {
  const { getServerAuthSession } = await import('./auth.server');
  const session = await getServerAuthSession(request);

  if (!session) {
    throw Response.json(unauthorizedServerFunctionError, {
      status: unauthorizedServerFunctionError.statusCode,
      statusText: 'Unauthorized'
    });
  }

  return session;
}

export const authenticatedMiddleware = createMiddleware().server(async ({ next, request }) => {
  const session = await requireAuthenticatedServerSession(request);

  return next({
    context: {
      session,
      userId: session.user.id
    } satisfies AuthenticatedServerContext
  });
});

export function createAuthenticatedServerFn(options?: Parameters<typeof createServerFn>[0]) {
  return createServerFn(options).middleware([authenticatedMiddleware]);
}
