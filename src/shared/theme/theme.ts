export const themeStorageKey = 'favoritable-theme';
export const themeMediaQuery = '(prefers-color-scheme: dark)';

const supportedThemes = ['light', 'dark'] as const;

export type Theme = (typeof supportedThemes)[number];

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia(themeMediaQuery).matches ? 'dark' : 'light';
}

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);

    return isTheme(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

export function getPreferredTheme(): Theme {
  if (typeof document !== 'undefined') {
    const documentTheme = document.documentElement.dataset.theme;

    if (isTheme(documentTheme)) {
      return documentTheme;
    }
  }

  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export const themeBootstrapScript = `(() => {
  const storageKey = '${themeStorageKey}';
  const mediaQuery = '${themeMediaQuery}';
  const root = document.documentElement;

  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    const theme = storedTheme === 'dark' || storedTheme === 'light'
      ? storedTheme
      : window.matchMedia(mediaQuery).matches
        ? 'dark'
        : 'light';

    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch {
    const fallbackTheme = window.matchMedia(mediaQuery).matches ? 'dark' : 'light';

    root.dataset.theme = fallbackTheme;
    root.style.colorScheme = fallbackTheme;
  }
})();`;
