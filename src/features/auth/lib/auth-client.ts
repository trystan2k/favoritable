import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { Locale } from '@/shared/i18n/locale';

import { authApiBasePath } from './auth-defaults';

const localeFieldSchema = {
  locale: {
    type: 'string',
    input: true,
    required: false,
    returned: true
  }
} as const;

type AuthMutationResult = {
  error?: {
    message?: string;
  } | null;
};

type BetterAuthUpdateUserBody = {
  locale: Locale;
};

type BetterAuthMutationPayload = {
  error?: {
    message?: string;
  } | null;
} | null;

function parseBetterAuthMutationPayload(value: unknown): BetterAuthMutationPayload {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const error = Reflect.get(value, 'error');

  if (typeof error !== 'object' || error === null) {
    return {};
  }

  const message = Reflect.get(error, 'message');

  return {
    error: typeof message === 'string' ? { message } : {}
  };
}

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
    },
    plugins: [
      inferAdditionalFields({
        user: localeFieldSchema
      })
    ]
  });

  return browserAuthClient;
}

export async function updateBrowserUserLocale(locale: Locale): Promise<AuthMutationResult> {
  if (typeof window === 'undefined') {
    throw new Error('Better Auth client is browser-only. Use server auth helpers during SSR.');
  }

  // Better Auth exposes /update-user, but inferred additional field input typing does not currently
  // flow into authClient.updateUser(...) for locale. Keep this contract isolated here until upstream
  // client typing can own the mutation end-to-end.
  const response = await fetch(`${getAuthClientBaseUrl(window.location.origin)}/update-user`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ locale } satisfies BetterAuthUpdateUserBody)
  });
  const payload = parseBetterAuthMutationPayload(await response.json().catch(() => null));

  if (!response.ok) {
    return {
      error: {
        message: payload?.error?.message || 'Locale update failed.'
      }
    };
  }

  return {
    error: null
  };
}
