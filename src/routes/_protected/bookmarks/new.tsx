import { createFileRoute } from '@tanstack/react-router';

import { QuickAddBookmarkPage } from '@/features/bookmarks/views/QuickAddBookmarkPage';

export const Route = createFileRoute('/_protected/bookmarks/new')({
  component: QuickAddBookmarkPage
});
