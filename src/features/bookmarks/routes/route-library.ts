import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { isUnauthorizedError } from '@/features/auth/lib/is-unauthorized-error';
import type { LibraryBookmarkListItem } from '@/features/bookmarks/lib/bookmark-library';

const getLibraryBookmarks = createServerFn({ method: 'GET' }).handler(
  async (): Promise<LibraryBookmarkListItem[]> => {
    const { loadLibraryBookmarksForRequest } = await import('./route-library.server');

    return loadLibraryBookmarksForRequest();
  }
);

export async function loadLibraryBookmarks() {
  try {
    return await getLibraryBookmarks();
  } catch (error) {
    if (isUnauthorizedError(error)) {
      throw redirect({ to: '/login' });
    }

    throw error;
  }
}
