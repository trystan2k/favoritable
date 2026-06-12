import { createAuthClient } from 'better-auth/react';

import { authApiBasePath } from './auth-defaults';

let browserAuthClient: ReturnType<typeof createAuthClient> | undefined;

export function getAuthClientBaseUrl(
  origin = typeof window !== 'undefined' ? window.location.origin : ''
) {
  return origin ? `${origin}${authApiBasePath}` : authApiBasePath;
}

export function getBrowserAuthClient() {
  if (typeof window === 'undefined') {
    throw new Error('Better Auth client is browser-only. Use server auth helpers during SSR.');
  }

  browserAuthClient ??= createAuthClient({
    baseURL: getAuthClientBaseUrl(window.location.origin),
    fetchOptions: {
      credentials: 'include'
    }
  });

  return browserAuthClient;
}
