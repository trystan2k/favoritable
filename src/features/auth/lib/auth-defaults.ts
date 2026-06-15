import type { AuthProviderAvailability } from './auth-providers';

export const authApiBasePath = '/api/auth';
export const googleOAuthCallbackPath = `${authApiBasePath}/callback/google`;
export const unavailableAuthProviderAvailability: AuthProviderAvailability = {
  google: false
};
