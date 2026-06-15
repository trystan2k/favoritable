export const supportedLocales = ['en', 'pt-BR', 'es'] as const;

export type Locale = (typeof supportedLocales)[number];

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  'pt-BR': '🇧🇷'
};

export const defaultLocale: Locale = 'en';
const localeStorageKey = 'favoritable-locale';
const localeHintCookieName = 'favoritable-locale-hint';
const localeHintCookieMaxAgeSeconds = 60 * 10;

function getLocaleHintCookieSecureAttribute() {
  return globalThis.location?.protocol === 'https:' ? '; Secure' : '';
}

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'pt-BR' || value === 'es';
}

export function normalizeLocale(value: unknown, fallback: Locale = defaultLocale): Locale {
  return isLocale(value) ? value : fallback;
}

export function mapBrowserLanguageToLocale(value: unknown): Locale {
  if (typeof value !== 'string') {
    return defaultLocale;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (!normalizedValue) {
    return defaultLocale;
  }

  const baseLanguage = normalizedValue.split('-')[0];

  if (baseLanguage === 'pt') {
    return 'pt-BR';
  }

  if (baseLanguage === 'es') {
    return 'es';
  }

  if (baseLanguage === 'en') {
    return 'en';
  }

  return defaultLocale;
}

export function getBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return defaultLocale;
  }

  const preferredLanguage = navigator.languages?.find(Boolean) ?? navigator.language;

  return mapBrowserLanguageToLocale(preferredLanguage);
}

export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedLocale = window.localStorage.getItem(localeStorageKey);

    return isLocale(storedLocale) ? storedLocale : null;
  } catch {
    return null;
  }
}

export function setStoredLocale(locale: Locale) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(localeStorageKey, locale);
  } catch {
    return;
  }
}

function getDocumentLocale(): Locale | null {
  if (typeof document === 'undefined') {
    return null;
  }

  return isLocale(document.documentElement.lang) ? document.documentElement.lang : null;
}

export function resolveClientLocale(): Locale {
  return getStoredLocale() ?? getDocumentLocale() ?? getBrowserLocale() ?? defaultLocale;
}

export function applyDocumentLocale(locale: Locale) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.lang = locale;
}

export function setLocaleHintCookie(locale: Locale) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${localeHintCookieName}=${encodeURIComponent(locale)}; Max-Age=${localeHintCookieMaxAgeSeconds}; Path=/; SameSite=Lax${getLocaleHintCookieSecureAttribute()}`;
}

export function clearLocaleHintCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${localeHintCookieName}=; Max-Age=0; Path=/; SameSite=Lax${getLocaleHintCookieSecureAttribute()}`;
}

export function getLocaleHintFromCookieHeader(
  cookieHeader: string | null | undefined
): Locale | null {
  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(';')) {
    const [name, ...valueParts] = cookie.trim().split('=');

    if (name !== localeHintCookieName) {
      continue;
    }

    try {
      const decodedValue = decodeURIComponent(valueParts.join('='));

      return isLocale(decodedValue) ? decodedValue : null;
    } catch {
      return null;
    }
  }

  return null;
}

export const localeBootstrapScript = `(() => {
  const storageKey = '${localeStorageKey}';
  const root = document.documentElement;
  const isLocale = (value) => value === 'en' || value === 'pt-BR' || value === 'es';
  const mapLanguage = (value) => {
    if (typeof value !== 'string') {
      return 'en';
    }

    const normalizedValue = value.trim().toLowerCase();

    if (!normalizedValue) {
      return 'en';
    }

    const baseLanguage = normalizedValue.split('-')[0];

    if (baseLanguage === 'pt') {
      return 'pt-BR';
    }

    if (baseLanguage === 'es') {
      return 'es';
    }

    if (baseLanguage === 'en') {
      return 'en';
    }

    return 'en';
  };

  if (root.dataset.localeLocked === 'true' && isLocale(root.lang)) {
    return;
  }

  try {
    const storedLocale = window.localStorage.getItem(storageKey);
    const locale = isLocale(storedLocale)
      ? storedLocale
      : mapLanguage(navigator.languages?.find(Boolean) || navigator.language);

    root.lang = locale;
  } catch {
    root.lang = mapLanguage(navigator.languages?.find(Boolean) || navigator.language);
  }
})();`;
