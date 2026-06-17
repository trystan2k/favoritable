import { describe, expect, test } from 'vitest';

import {
  deriveBookmarkSlug,
  deriveBookmarkTitleFromUrl
} from '@/features/bookmarks/lib/bookmark-derived-fields';

describe('bookmark derived fields', () => {
  test('builds fallback title from hostname and pathname', () => {
    expect(deriveBookmarkTitleFromUrl('https://favoritable.app/articles/launch/')).toBe(
      'favoritable.app/articles/launch'
    );
    expect(deriveBookmarkTitleFromUrl('https://favoritable.app/')).toBe('favoritable.app');
  });

  test('clamps fallback title length for long urls', () => {
    const longPath = 'segment/'.repeat(80);
    const fallbackTitle = deriveBookmarkTitleFromUrl(`https://favoritable.app/${longPath}`);

    expect(fallbackTitle).toHaveLength(512);
    expect(fallbackTitle.startsWith('favoritable.app/segment/segment/')).toBe(true);
  });

  test('builds slug from title with url fallback when title has no slug content', () => {
    expect(
      deriveBookmarkSlug({
        title: ' Favoritable Launch! ',
        url: 'https://favoritable.app/articles/launch'
      })
    ).toBe('favoritable-launch');

    expect(
      deriveBookmarkSlug({
        title: '!!!',
        url: 'https://favoritable.app/articles/launch'
      })
    ).toBe('favoritable-app-articles-launch');
  });
});
