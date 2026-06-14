import { redirect } from '@tanstack/react-router';
import { createIsomorphicFn, createServerOnlyFn } from '@tanstack/react-start';

import { getBrowserAuthClient } from '../lib/auth-client';

export const routeAuthErrorMessage = 'Failed to load Better Auth session.';

type BrowserRouteAuthSessionResult = Awaited<
  ReturnType<ReturnType<typeof getBrowserAuthClient>['getSession']>
>;
type RouteAuthSession = Awaited<ReturnType<typeof getRouteAuthSession>>;
type RouteAuthContext = {
  session?: RouteAuthSession;
};

const getServerRouteAuthSession = createServerOnlyFn(async () => {
  const { getRequest } = await import('@tanstack/react-start/server');
  const request = getRequest();

  if (!request.headers.get('cookie')) {
    return null;
  }

  const { getServerAuthSession } = await import('../server/auth.server');

  return getServerAuthSession(request);
});

export function resolveBrowserRouteAuthSession(result: BrowserRouteAuthSessionResult) {
  if (result.error) {
    throw new Error(result.error.message || routeAuthErrorMessage);
  }

  return result.data ?? null;
}

export const getRouteAuthSession = createIsomorphicFn()
  .server(() => getServerRouteAuthSession())
  .client(async () => resolveBrowserRouteAuthSession(await getBrowserAuthClient().getSession()));

export function getRouteContextAuthSession(context: unknown) {
  if (!context || typeof context !== 'object' || !('session' in context)) {
    return undefined;
  }

  return (context as RouteAuthContext).session;
}

export async function redirectIfLoggedOut(routeAuthSession?: RouteAuthSession) {
  const session = routeAuthSession ?? (await getRouteAuthSession());

  if (!session) {
    throw redirect({ to: '/login' });
  }

  return session;
}

export async function redirectIfLoggedIn(
  routeAuthSessionPromise: Promise<
    Awaited<ReturnType<typeof getRouteAuthSession>>
  > = getRouteAuthSession()
) {
  const session = await routeAuthSessionPromise;

  if (session) {
    throw redirect({ to: '/' });
  }

  return session;
}
