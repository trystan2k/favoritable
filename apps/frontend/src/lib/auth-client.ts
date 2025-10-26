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

// Create Better Auth client instance
const client = createAuthClient({
  baseURL: getApiBaseUrl(),
});

// Export client with proper typing
// biome-ignore lint/suspicious/noExplicitAny: Better Auth client types not fully compatible
export const authClient: any = client;
