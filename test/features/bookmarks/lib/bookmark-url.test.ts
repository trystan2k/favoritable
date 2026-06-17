import { describe, expect, test } from 'vitest';

import { canonicalizeBookmarkUrl, isValidHttpUrl } from '@/features/bookmarks/lib/bookmark-url';

describe('bookmark url helpers', () => {
  test('canonicalizes equivalent root urls to the same value', () => {
    expect(canonicalizeBookmarkUrl('https://example.com')).toBe('https://example.com/');
    expect(canonicalizeBookmarkUrl('https://example.com/')).toBe('https://example.com/');
  });

  test('accepts only http and https urls', () => {
    expect(isValidHttpUrl('https://example.com')).toBe(true);
    expect(isValidHttpUrl('http://example.com')).toBe(true);
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
  });
});
