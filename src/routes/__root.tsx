import type { ReactNode } from 'react';
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';

import { getRouteAuthSession, routeAuthErrorMessage } from '@/features/auth/routes/route-auth';
import { ProtectedNotFoundPage } from '@/features/not-found/views/ProtectedNotFoundPage';
import { PublicNotFoundPage } from '@/features/not-found/views/PublicNotFoundPage';
import { LocaleProvider } from '@/shared/i18n/LocaleProvider';
import { defaultLocale, localeBootstrapScript, normalizeLocale } from '@/shared/i18n/locale';
import { appLogger } from '@/shared/logging/logger';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { themeBootstrapScript } from '@/shared/theme/theme';
import appCss from '@/styles.css?url';

export async function loadOptionalRouteSession() {
  try {
    return await getRouteAuthSession();
  } catch (error) {
    if (error instanceof Error && error.message === routeAuthErrorMessage) {
      appLogger.warn(
        '[auth] Optional Better Auth session load failed. Rendering signed-out fallback.'
      );
      return null;
    }

    appLogger.error('[auth] Unexpected optional Better Auth session load failure.', { error });
    return null;
  }
}

export const Route = createRootRoute({
  beforeLoad: async () => ({
    session: await loadOptionalRouteSession()
  }),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        title: 'Favoritable'
      }
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss
      }
    ]
  }),
  notFoundComponent: RootNotFoundComponent,
  shellComponent: RootDocument
});

const themeBootstrapScriptMarkup = { __html: themeBootstrapScript };
const localeBootstrapScriptMarkup = { __html: localeBootstrapScript };

export function RootNotFoundComponent() {
  const { session } = Route.useRouteContext();

  if (session) {
    return <ProtectedNotFoundPage userEmail={session.user.email} userName={session.user.name} />;
  }

  return <PublicNotFoundPage />;
}

function RootDocument({ children }: { children: ReactNode }) {
  const { session } = Route.useRouteContext();
  const isAuthenticated = Boolean(session);
  const serverLocale = session ? normalizeLocale(session.user.locale) : defaultLocale;

  return (
    <html
      data-locale-locked={isAuthenticated ? 'true' : undefined}
      lang={serverLocale}
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
        {/* Keep bootstrap scripts inline before hydration. If CSP nonces land later, apply same nonce here. */}
        <script dangerouslySetInnerHTML={themeBootstrapScriptMarkup} />
        <script dangerouslySetInnerHTML={localeBootstrapScriptMarkup} />
      </head>
      <body>
        <LocaleProvider isAuthenticated={isAuthenticated} serverLocale={session?.user.locale}>
          <ThemeProvider>
            {children}
            <Scripts />
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
