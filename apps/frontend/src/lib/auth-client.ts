import { createAuthClient } from 'better-auth/react';

// Configure API base URL based on environment
const getApiBaseUrl = (): string => {
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }

  // In production, use the current origin
  return window.location.origin;
};

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: getApiBaseUrl(),
});
