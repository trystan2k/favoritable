import { createMiddleware, createServerFn } from '@tanstack/react-start';

import { getServerAuthSession } from './auth.server';

export const unauthorizedServerFunctionError = {
  code: 'UNAUTHORIZED',
  message: 'Authentication required.',
  statusCode: 401
} as const;

type AuthenticatedServerSession = NonNullable<Awaited<ReturnType<typeof getServerAuthSession>>>;

export type AuthenticatedServerContext = {
  session: AuthenticatedServerSession;
  userId: AuthenticatedServerSession['user']['id'];
};

export async function requireAuthenticatedServerSession(
  request: Request
): Promise<AuthenticatedServerSession> {
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
