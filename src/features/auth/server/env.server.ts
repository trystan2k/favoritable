import type { AuthProviderAvailability } from '../lib/auth-providers';

const DEFAULT_AUTH_SECRET = 'favoritable-local-auth-secret-must-change-for-production';
const DEFAULT_LOCAL_AUTH_URL = 'http://localhost:4000';
const DEFAULT_PREVIEW_AUTH_URL = 'http://127.0.0.1:4173';
const DEFAULT_DATABASE_URL = 'file:./data/favoritable.db';
const DEFAULT_TRUSTED_ORIGINS = [
  DEFAULT_LOCAL_AUTH_URL,
  'http://127.0.0.1:4000',
  DEFAULT_PREVIEW_AUTH_URL
] as const;
const GOOGLE_OAUTH_CALLBACK_PATH = '/api/auth/callback/google';
const emittedWarnings = new Set<string>();

type ProviderCredentials = {
  clientId?: string;
  clientSecret?: string;
};

export type AuthEnvironment = {
  baseUrl: string;
  databaseAuthToken?: string;
  databaseUrl: string;
  googleProvider: ProviderCredentials;
  secret: string;
  trustedOrigins: string[];
  useSecureCookies: boolean;
};

function getRequestOrigin(request: Request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  if (!host) {
    return undefined;
  }

  const protocolHeader = request.headers.get('x-forwarded-proto');
  const protocol =
    protocolHeader?.split(',')[0]?.trim() || new URL(request.url).protocol.slice(0, -1);

  return `${protocol}://${host}`;
}

function readEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}

function isTestEnvironment() {
  return process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
}

function isLocalDevelopmentEnvironment() {
  return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
}

function getDefaultAuthBaseUrl() {
  return process.env.E2E_PREVIEW === 'true' ? DEFAULT_PREVIEW_AUTH_URL : DEFAULT_LOCAL_AUTH_URL;
}

function getAuthBaseUrl() {
  const configuredBaseUrl = readEnvironmentVariable('BETTER_AUTH_URL');

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (
    isTestEnvironment() ||
    isLocalDevelopmentEnvironment() ||
    process.env.E2E_PREVIEW === 'true'
  ) {
    return getDefaultAuthBaseUrl();
  }

  throw new Error('BETTER_AUTH_URL is required outside local and test environments.');
}

function isLocalBaseUrl(baseUrl: string) {
  try {
    const { hostname } = new URL(baseUrl);

    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function getAuthSecret(baseUrl: string) {
  const configuredSecret = readEnvironmentVariable('BETTER_AUTH_SECRET');
  const canUseLocalFallback = isTestEnvironment() || isLocalBaseUrl(baseUrl);

  if (configuredSecret) {
    if (!canUseLocalFallback && configuredSecret === DEFAULT_AUTH_SECRET) {
      throw new Error('BETTER_AUTH_SECRET must be replaced outside local and test environments.');
    }

    return configuredSecret;
  }

  if (canUseLocalFallback) {
    return DEFAULT_AUTH_SECRET;
  }

  throw new Error('BETTER_AUTH_SECRET is required for non-local Better Auth deployments.');
}

function getDatabaseAuthToken() {
  return readEnvironmentVariable('DATABASE_AUTH_TOKEN');
}

function getGoogleProviderCredentials(): ProviderCredentials {
  return {
    clientId: readEnvironmentVariable('GOOGLE_CLIENT_ID'),
    clientSecret: readEnvironmentVariable('GOOGLE_CLIENT_SECRET')
  };
}

function getTrustedOrigins(baseUrl: string) {
  const trustedOrigins = new Set<string>([baseUrl]);
  const configuredOrigins = readEnvironmentVariable('BETTER_AUTH_TRUSTED_ORIGINS');
  const canUseLocalDefaults = isTestEnvironment() || isLocalBaseUrl(baseUrl);

  if (!canUseLocalDefaults && !configuredOrigins) {
    throw new Error(
      'BETTER_AUTH_TRUSTED_ORIGINS is required for non-local Better Auth deployments.'
    );
  }

  if (canUseLocalDefaults) {
    for (const origin of DEFAULT_TRUSTED_ORIGINS) {
      trustedOrigins.add(origin);
    }
  }

  if (configuredOrigins) {
    for (const origin of configuredOrigins.split(',')) {
      const normalizedOrigin = origin.trim();

      if (normalizedOrigin) {
        trustedOrigins.add(normalizedOrigin);
      }
    }
  }

  return [...trustedOrigins];
}

function emitWarningOnce(key: string, message: string) {
  if (emittedWarnings.has(key)) {
    return;
  }

  emittedWarnings.add(key);
  console.warn(`[auth] ${message}`);
}

function getGoogleOAuthCallbackUrl(baseUrl: string) {
  return new URL(GOOGLE_OAUTH_CALLBACK_PATH, baseUrl).toString();
}

function warnAboutLocalGoogleOAuthConfiguration(
  baseUrl: string,
  googleProvider: ProviderCredentials
) {
  if (isTestEnvironment() || !isLocalDevelopmentEnvironment()) {
    return;
  }

  const hasGoogleClientId = Boolean(googleProvider.clientId);
  const hasGoogleClientSecret = Boolean(googleProvider.clientSecret);

  if (!hasGoogleClientId && !hasGoogleClientSecret) {
    return;
  }

  const callbackUrl = getGoogleOAuthCallbackUrl(baseUrl);

  if (!hasGoogleClientId || !hasGoogleClientSecret) {
    emitWarningOnce(
      'google-provider-partial-credentials',
      `Google OAuth is partially configured. Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET or leave both unset. Expected callback URI: ${callbackUrl}`
    );

    return;
  }

  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const isKnownLocalOAuthOrigin =
    normalizedBaseUrl === DEFAULT_LOCAL_AUTH_URL || normalizedBaseUrl === DEFAULT_PREVIEW_AUTH_URL;

  if (!isKnownLocalOAuthOrigin) {
    emitWarningOnce(
      `google-provider-local-base-url:${normalizedBaseUrl}`,
      `Google OAuth callback is derived from BETTER_AUTH_URL. Verify Google Cloud uses origin ${normalizedBaseUrl} and redirect URI ${callbackUrl}`
    );
  }

  const { pathname } = new URL(baseUrl);

  if (pathname !== '/' && pathname !== '') {
    emitWarningOnce(
      `google-provider-local-pathname:${pathname}`,
      `BETTER_AUTH_URL should be an origin without a path for Google OAuth. Current callback URI resolves to ${callbackUrl}`
    );
  }
}

export function getAuthEnvironment(request?: Request): AuthEnvironment {
  const configuredBaseUrl = getAuthBaseUrl();
  const baseUrl = request ? getRequestOrigin(request) || configuredBaseUrl : configuredBaseUrl;
  const googleProvider = getGoogleProviderCredentials();

  warnAboutLocalGoogleOAuthConfiguration(baseUrl, googleProvider);

  return {
    baseUrl,
    databaseAuthToken: getDatabaseAuthToken(),
    databaseUrl: readEnvironmentVariable('DATABASE_URL') || DEFAULT_DATABASE_URL,
    googleProvider,
    secret: getAuthSecret(baseUrl),
    trustedOrigins: getTrustedOrigins(baseUrl),
    useSecureCookies: baseUrl.startsWith('https://')
  };
}

export function hasProviderCredentials(credentials: ProviderCredentials) {
  return Boolean(credentials.clientId && credentials.clientSecret);
}

export function getAuthProviderAvailability(): AuthProviderAvailability {
  const { googleProvider } = getAuthEnvironment();

  return {
    google: hasProviderCredentials(googleProvider)
  };
}
