import { createServerFn } from '@tanstack/react-start';

import type { CreateBookmarkResult } from '@/features/bookmarks/server/create-bookmark-impl';

export type { CreateBookmarkResult };

export const createBookmark = createServerFn({ method: 'POST' })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<CreateBookmarkResult> => {
    const { handleCreateBookmarkRequest } =
      await import('@/features/bookmarks/server/create-bookmark.server');

    return handleCreateBookmarkRequest(data);
  });
