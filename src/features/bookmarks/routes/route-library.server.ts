import type { LibraryBookmarkListItem } from '@/features/bookmarks/lib/bookmark-library';

export async function loadLibraryBookmarksForRequest(): Promise<LibraryBookmarkListItem[]> {
  const { getRequest } = await import('@tanstack/react-start/server');
  const { requireAuthenticatedServerSession } =
    await import('@/features/auth/server/authenticated-middleware');
  const { listLibraryBookmarksForUser } =
    await import('@/features/bookmarks/server/user-scope.server');
  const request = getRequest();
  const session = await requireAuthenticatedServerSession(request);

  return listLibraryBookmarksForUser({ userId: session.user.id });
}
