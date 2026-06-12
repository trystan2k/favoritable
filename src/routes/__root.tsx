import type { ReactNode } from 'react';
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';

import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { themeBootstrapScript } from '@/shared/theme/theme';
import appCss from '@/styles.css?url';

export const Route = createRootRoute({
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
  shellComponent: RootDocument
});

const themeBootstrapScriptMarkup = { __html: themeBootstrapScript };

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Keep theme bootstrap inline before hydration. If CSP nonces land later, apply same nonce here. */}
        <script dangerouslySetInnerHTML={themeBootstrapScriptMarkup} />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  );
}
