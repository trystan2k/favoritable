import { createFileRoute } from '@tanstack/react-router';

import { loadLibraryBookmarks } from '@/features/bookmarks/routes/route-library';
import { BookmarkLibraryPage } from '@/features/bookmarks/views/BookmarkLibraryPage';

export const Route = createFileRoute('/_protected/')({
  component: ProtectedIndexRoute,
  loader: () => loadLibraryBookmarks()
});

function ProtectedIndexRoute() {
  const bookmarks = Route.useLoaderData();

  return <BookmarkLibraryPage bookmarks={bookmarks} />;
}
