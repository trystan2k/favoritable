import { getRequest } from '@tanstack/react-start/server';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

import { createDb, getDb } from '@/db/client';
import * as schema from '@/db/schema/schema';
import {
  defaultLocale,
  getLocaleHintFromCookieHeader,
  isLocale,
  type Locale
} from '@/shared/i18n/locale';
import { appLogger } from '@/shared/logging/logger';
import { getAuthEnvironment, hasProviderCredentials } from './env.server';
import type { AuthEnvironment } from './env.server';

type AuthPlugin = NonNullable<Parameters<typeof betterAuth>[0]['plugins']>[number];

type CreateAuthOptions = {
  additionalPlugins?: AuthPlugin[];
  environment?: AuthEnvironment;
  request?: Request;
};

type BetterAuthSession = Awaited<ReturnType<ReturnType<typeof createAuth>['api']['getSession']>>;
type BaseAuthSession = NonNullable<BetterAuthSession>;
type AuthSessionWithLocale =
  | null
  | (BaseAuthSession & {
      user: BaseAuthSession['user'] & {
        locale: Locale;
      };
    });
const authInstances = new Map<string, ReturnType<typeof createAuth>>();

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

function getLocaleProperty(value: object) {
  return Reflect.get(value, 'locale');
}

function resolveCanonicalLocale(
  request: Request | null | undefined,
  candidateLocale?: unknown,
  fallback: Locale = defaultLocale
) {
  if (isLocale(candidateLocale)) {
    return candidateLocale;
  }

  return getLocaleHintFromCookieHeader(request?.headers.get('cookie')) ?? fallback;
}

async function repairSessionLocale(
  request: Request,
  session: BetterAuthSession
): Promise<AuthSessionWithLocale> {
  if (!session) {
    return null;
  }

  const storedLocale = getLocaleProperty(session.user);
  const locale = resolveCanonicalLocale(request, storedLocale);

  if (!isLocale(storedLocale)) {
    try {
      await getAuth(request).api.updateUser({
        body: { locale },
        headers: request.headers
      });
    } catch (error) {
      appLogger.warn(
        '[auth] Failed to repair Better Auth session locale. Returning normalized session.',
        {
          error,
          locale,
          storedLocale
        }
      );
    }
  }

  return {
    ...session,
    user: {
      ...session.user,
      locale
    }
  };
}

export function createAuth(options: CreateAuthOptions = {}) {
  const authEnvironment = options.environment ?? getAuthEnvironment(options.request);
  const database = options.environment
    ? createDb(authEnvironment.databaseUrl, authEnvironment.databaseAuthToken)
    : getDb();

  return betterAuth({
    appName: 'Favoritable',
    baseURL: authEnvironment.baseUrl,
    secret: authEnvironment.secret,
    trustedOrigins: authEnvironment.trustedOrigins,
    onAPIError: {
      errorURL: '/auth-error'
    },
    advanced: {
      ipAddress: {
        ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for', 'x-real-ip']
      },
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
    user: {
      additionalFields: {
        locale: {
          type: 'string',
          input: true,
          required: false,
          returned: true
        }
      }
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user, context) => ({
            data: {
              ...user,
              locale: resolveCanonicalLocale(context?.request, getLocaleProperty(user))
            }
          })
        },
        update: {
          before: async (user) => {
            const locale = getLocaleProperty(user);

            if (!Object.prototype.hasOwnProperty.call(user, 'locale') || locale === undefined) {
              return undefined;
            }

            if (!isLocale(locale)) {
              throw APIError.fromStatus('BAD_REQUEST', {
                message: 'Unsupported locale.'
              });
            }

            return {
              data: {
                ...user,
                locale
              }
            };
          }
        }
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

export function getAuth(request?: Request) {
  const authEnvironment = getAuthEnvironment(request);
  const cacheKey = authEnvironment.baseUrl;
  const cachedAuth = authInstances.get(cacheKey);

  if (cachedAuth) {
    return cachedAuth;
  }

  const authInstance = createAuth({ environment: authEnvironment });

  authInstances.set(cacheKey, authInstance);

  return authInstance;
}

export async function getServerAuthSession(request = getRequest()): Promise<AuthSessionWithLocale> {
  const session = await getAuth(request).api.getSession({
    headers: request.headers
  });

  return repairSessionLocale(request, session);
}
