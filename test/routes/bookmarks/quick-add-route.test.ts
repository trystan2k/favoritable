import { describe, expect, test } from 'vitest';

import { Route as QuickAddBookmarkRoute } from '@/routes/_protected/bookmarks/new';

describe('quick add bookmark route', () => {
  test('is a registered file route with a component', () => {
    expect(QuickAddBookmarkRoute).toBeDefined();
    expect(QuickAddBookmarkRoute.options.component).toBeTypeOf('function');
  });
});
