import type { AuthProviderAvailability } from './auth-providers';

export const authApiBasePath = '/api/auth';
const googleOAuthCallbackPath = `${authApiBasePath}/callback/google`;
export const unavailableAuthProviderAvailability: AuthProviderAvailability = {
  google: false
};
export const googleOAuthSetupMessage = `Google OAuth is unavailable. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on the server and authorize ${googleOAuthCallbackPath} in Google Cloud.`;
export const signOutErrorMessage = 'Sign-out failed. Try again.';
