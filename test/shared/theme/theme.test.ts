import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  applyTheme,
  getPreferredTheme,
  getStoredTheme,
  getSystemTheme,
  isTheme,
  themeBootstrapScript
} from '@/shared/theme/theme';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('theme helpers', () => {
  test('accepts only supported theme values', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('sepia')).toBe(false);
    expect(isTheme(undefined)).toBe(false);
  });

  test('falls back safely without browser globals', () => {
    expect(getSystemTheme()).toBe('light');
    expect(getStoredTheme()).toBeNull();
    expect(getPreferredTheme()).toBe('light');
    expect(() => applyTheme('dark')).not.toThrow();
  });

  test('prefers document theme before storage or system theme', () => {
    vi.stubGlobal('document', {
      documentElement: {
        dataset: { theme: 'dark' },
        style: { colorScheme: '' }
      }
    });

    expect(getPreferredTheme()).toBe('dark');
  });

  test('bootstraps theme from storage or system preference', () => {
    expect(themeBootstrapScript).toContain("storedTheme === 'dark' || storedTheme === 'light'");
    expect(themeBootstrapScript).toContain('window.matchMedia(mediaQuery).matches');
  });
});
