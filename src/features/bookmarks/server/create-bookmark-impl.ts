import type { ValidationFieldErrors } from '@/features/bookmarks/lib/validation';
import {
  deriveBookmarkSlug,
  deriveBookmarkTitleFromUrl
} from '@/features/bookmarks/lib/bookmark-derived-fields';
import {
  bookmarkMessageKeys,
  duplicateBookmarkUrlMessage
} from '@/features/bookmarks/lib/bookmark-messages';
import {
  bookmarkValidationLimits,
  type QuickAddBookmarkField,
  validateQuickAddBookmarkInput
} from '@/features/bookmarks/lib/bookmark-validation';

type Database = ReturnType<typeof import('@/db/client').createDb>;

export type CreateBookmarkResult =
  | {
      bookmarkId: string;
      success: true;
    }
  | {
      fieldErrors: ValidationFieldErrors<QuickAddBookmarkField>;
      formError?: string;
      success: false;
    };

type CreateBookmarkMutationInput = {
  input: unknown;
  userId: string;
};

type CreateBookmarkMutationOptions = {
  database?: Database;
  idGenerator?: () => string;
};

export async function runCreateBookmarkMutation(
  { input, userId }: CreateBookmarkMutationInput,
  options: CreateBookmarkMutationOptions = {}
): Promise<CreateBookmarkResult> {
  const validationResult = validateQuickAddBookmarkInput(input);

  if (!validationResult.success) {
    return validationResult;
  }

  const { getDb } = await import('@/db/client');
  const { bookmark } = await import('@/db/schema/bookmarks');
  const { getBookmarkByUrlForUser } = await import('@/features/bookmarks/server/user-scope.server');
  const database = options.database ?? getDb();
  const duplicateBookmark = await getBookmarkByUrlForUser(
    {
      url: validationResult.data.url,
      userId
    },
    database
  );

  if (duplicateBookmark) {
    return createDuplicateBookmarkResult();
  }

  const finalTitle =
    validationResult.data.title ?? deriveBookmarkTitleFromUrl(validationResult.data.url);

  if (finalTitle.length > bookmarkValidationLimits.title) {
    return createTitleTooLongResult();
  }

  const bookmarkId = options.idGenerator?.() ?? crypto.randomUUID();

  try {
    await database.insert(bookmark).values({
      description: validationResult.data.description,
      id: bookmarkId,
      slug: deriveBookmarkSlug({
        title: finalTitle,
        url: validationResult.data.url
      }),
      title: finalTitle,
      url: validationResult.data.url,
      userId
    });
  } catch (error) {
    if (isDuplicateBookmarkUrlError(error)) {
      return createDuplicateBookmarkResult();
    }

    throw error;
  }

  return {
    bookmarkId,
    success: true
  };
}

export function createDuplicateBookmarkResult(): CreateBookmarkResult {
  return {
    fieldErrors: {
      url: [duplicateBookmarkUrlMessage]
    },
    success: false
  };
}

function createTitleTooLongResult(): CreateBookmarkResult {
  return {
    fieldErrors: {
      title: [bookmarkMessageKeys.quickAddTitleTooLong]
    },
    success: false
  };
}

function isDuplicateBookmarkUrlError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const message = String(Reflect.get(error, 'message') ?? '');

  return (
    Reflect.get(error, 'code') === 'SQLITE_CONSTRAINT' &&
    Reflect.get(error, 'rawCode') === 2067 &&
    message.includes('UNIQUE constraint failed') &&
    message.includes('bookmark.user_id') &&
    message.includes('bookmark.url')
  );
}
