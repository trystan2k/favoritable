import { createIsomorphicFn } from '@tanstack/react-start';

import { authApiBasePath, unavailableAuthProviderAvailability } from '../lib/auth-defaults';
import { type AuthProviderAvailability } from '../lib/auth-providers';

function isAuthProviderAvailability(value: unknown): value is AuthProviderAvailability {
  return (
    typeof value === 'object' &&
    value !== null &&
    'google' in value &&
    typeof value.google === 'boolean'
  );
}

export async function getClientAuthProviderAvailability(fetchImplementation: typeof fetch = fetch) {
  try {
    const response = await fetchImplementation(`${authApiBasePath}/providers`);

    if (!response.ok) {
      return unavailableAuthProviderAvailability;
    }

    const providerAvailability = await response.json();

    return isAuthProviderAvailability(providerAvailability)
      ? providerAvailability
      : unavailableAuthProviderAvailability;
  } catch {
    return unavailableAuthProviderAvailability;
  }
}

export const getRouteAuthProviderAvailability = createIsomorphicFn()
  .client(() => getClientAuthProviderAvailability())
  .server(async () => {
    try {
      const { getAuthProviderAvailability } = await import('../server/env.server');

      return getAuthProviderAvailability();
    } catch {
      return unavailableAuthProviderAvailability;
    }
  });
