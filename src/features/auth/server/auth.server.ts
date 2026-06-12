import { getRequest } from '@tanstack/react-start/server';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

import { createDb, getDb } from '@/db/client';
import * as schema from '@/db/schema/auth';
import { getAuthEnvironment, hasProviderCredentials } from './env.server';
import type { AuthEnvironment } from './env.server';

type AuthPlugin = NonNullable<Parameters<typeof betterAuth>[0]['plugins']>[number];

type CreateAuthOptions = {
  additionalPlugins?: AuthPlugin[];
  environment?: AuthEnvironment;
};

let authInstance: ReturnType<typeof createAuth> | undefined;

function getConfiguredSocialProviders(authEnvironment: AuthEnvironment) {
  const { googleProvider } = authEnvironment;

  return hasProviderCredentials(googleProvider)
    ? {
        google: {
          clientId: googleProvider.clientId!,
          clientSecret: googleProvider.clientSecret!,
          prompt: 'select_account' as const
        }
      }
    : undefined;
}

export function createAuth(options: CreateAuthOptions = {}) {
  const authEnvironment = options.environment ?? getAuthEnvironment();
  const database = options.environment
    ? createDb(authEnvironment.databaseUrl, authEnvironment.databaseAuthToken)
    : getDb();

  return betterAuth({
    appName: 'Favoritable',
    baseURL: authEnvironment.baseUrl,
    secret: authEnvironment.secret,
    trustedOrigins: authEnvironment.trustedOrigins,
    advanced: {
      useSecureCookies: authEnvironment.useSecureCookies
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5
      }
    },
    database: drizzleAdapter(database, {
      provider: 'sqlite',
      schema
    }),
    socialProviders: getConfiguredSocialProviders(authEnvironment),
    plugins: [tanstackStartCookies(), ...(options.additionalPlugins ?? [])]
  });
}

export function getAuth() {
  if (authInstance) {
    return authInstance;
  }

  const auth = createAuth();

  authInstance = auth;

  return auth;
}

export async function getServerAuthSession(request = getRequest()) {
  return getAuth().api.getSession({
    headers: request.headers
  });
}
