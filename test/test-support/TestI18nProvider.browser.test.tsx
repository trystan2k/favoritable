import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { TestI18nProvider } from '@/test-support/TestI18nProvider';

describe('TestI18nProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = '';
    vi.stubGlobal('navigator', {
      language: 'es-AR',
      languages: ['es-AR']
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('does not mutate locale storage or document lang during render', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const markup = renderToStaticMarkup(
      <TestI18nProvider>
        <span>ready</span>
      </TestI18nProvider>
    );

    expect(markup).toBe('');
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(document.documentElement.lang).toBe('');
  });
});
