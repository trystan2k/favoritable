import type { ReactNode } from 'react';

import { LocaleProvider } from '@/shared/i18n/LocaleProvider';

type TestI18nProviderProps = {
  children: ReactNode;
  isAuthenticated?: boolean;
  serverLocale?: unknown;
};

export function TestI18nProvider({
  children,
  isAuthenticated = false,
  serverLocale
}: TestI18nProviderProps) {
  return (
    <LocaleProvider isAuthenticated={isAuthenticated} serverLocale={serverLocale}>
      {children}
    </LocaleProvider>
  );
}
