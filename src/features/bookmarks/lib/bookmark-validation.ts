import {
  addFieldError,
  createValidationFailure,
  createValidationSuccess,
  hasFieldErrors,
  hasOwnProperty,
  invalidValue,
  isRecord,
  normalizeOptionalBoolean,
  normalizeOptionalDate,
  normalizeOptionalString,
  normalizeOptionalUrl,
  normalizeRequiredString,
  normalizeRequiredUrl,
  unwrapOptionalValidatedValue,
  unwrapRequiredValidatedValue,
  type ValidationFieldErrors,
  type ValidationResult
} from './validation';
import {
  defaultBookmarkState,
  isBookmarkState as isKnownBookmarkState,
  type BookmarkState
} from '@/db/schema/bookmark-state';
import { bookmarkMessageKeys } from '@/features/bookmarks/lib/bookmark-messages';

export const bookmarkValidationLimits = {
  author: 256,
  description: 4096,
  slug: 200,
  thumbnail: 2048,
  title: 512,
  url: 2048
} as const;

type BookmarkValidationField =
  | 'author'
  | 'description'
  | 'favorite'
  | 'publishedAt'
  | 'slug'
  | 'state'
  | 'thumbnail'
  | 'title'
  | 'url';

export type CreateBookmarkInput = {
  author?: string;
  description?: string;
  favorite: boolean;
  publishedAt?: Date;
  slug: string;
  state: BookmarkState;
  thumbnail?: string;
  title: string;
  url: string;
};

export type QuickAddBookmarkField = 'description' | 'title' | 'url';
type QuickAddBookmarkInput = {
  description?: string;
  title?: string;
  url: string;
};

export type UpdateBookmarkInput = Partial<CreateBookmarkInput>;
export type BookmarkValidationResult<TData> = ValidationResult<TData, BookmarkValidationField>;
export type QuickAddBookmarkValidationResult = ValidationResult<
  QuickAddBookmarkInput,
  QuickAddBookmarkField
>;

export function validateCreateBookmarkInput(
  input: unknown
): BookmarkValidationResult<CreateBookmarkInput> {
  if (!isRecord(input)) {
    return createValidationFailure<CreateBookmarkInput, BookmarkValidationField>(
      {},
      'Invalid bookmark input.'
    );
  }

  const fieldErrors: ValidationFieldErrors<BookmarkValidationField> = {};
  const url = normalizeRequiredUrl(input.url);
  const slug = normalizeRequiredString(input.slug);
  const title = normalizeRequiredString(input.title);
  const description = normalizeBookmarkOptionalString(
    fieldErrors,
    'description',
    input.description,
    bookmarkValidationLimits.description,
    'Description'
  );
  const author = normalizeBookmarkOptionalString(
    fieldErrors,
    'author',
    input.author,
    bookmarkValidationLimits.author,
    'Author'
  );
  const thumbnail = normalizeOptionalUrl(input.thumbnail);
  const publishedAt = normalizeOptionalDate(input.publishedAt);
  const state = hasOwnProperty(input, 'state')
    ? normalizeBookmarkState(input.state)
    : defaultBookmarkState;
  const favorite = normalizeOptionalBoolean(input.favorite);

  if (url === invalidValue) {
    addFieldError(fieldErrors, 'url', 'Enter a valid bookmark URL.');
  } else if (url.length > bookmarkValidationLimits.url) {
    addFieldError(
      fieldErrors,
      'url',
      `Bookmark URL must be ${bookmarkValidationLimits.url} characters or fewer.`
    );
  }

  if (slug === invalidValue) {
    addFieldError(fieldErrors, 'slug', 'Slug is required.');
  } else if (slug.length > bookmarkValidationLimits.slug) {
    addFieldError(
      fieldErrors,
      'slug',
      `Slug must be ${bookmarkValidationLimits.slug} characters or fewer.`
    );
  }

  if (title === invalidValue) {
    addFieldError(fieldErrors, 'title', 'Title is required.');
  } else if (title.length > bookmarkValidationLimits.title) {
    addFieldError(
      fieldErrors,
      'title',
      `Title must be ${bookmarkValidationLimits.title} characters or fewer.`
    );
  }

  if (thumbnail === invalidValue) {
    addFieldError(fieldErrors, 'thumbnail', 'Thumbnail must be a valid URL.');
  } else if (thumbnail && thumbnail.length > bookmarkValidationLimits.thumbnail) {
    addFieldError(
      fieldErrors,
      'thumbnail',
      `Thumbnail URL must be ${bookmarkValidationLimits.thumbnail} characters or fewer.`
    );
  }

  if (publishedAt === invalidValue) {
    addFieldError(fieldErrors, 'publishedAt', 'Published date must be a valid date.');
  }

  if (state === invalidValue) {
    addFieldError(fieldErrors, 'state', 'State must be active or archived.');
  }

  if (favorite === invalidValue) {
    addFieldError(fieldErrors, 'favorite', 'Favorite must be true or false.');
  }

  if (hasFieldErrors(fieldErrors)) {
    return createValidationFailure<CreateBookmarkInput, BookmarkValidationField>(fieldErrors);
  }

  const data: CreateBookmarkInput = {
    author: unwrapOptionalValidatedValue(author),
    description: unwrapOptionalValidatedValue(description),
    favorite: unwrapOptionalValidatedValue(favorite) ?? false,
    publishedAt: unwrapOptionalValidatedValue(publishedAt),
    slug: unwrapRequiredValidatedValue(slug),
    state: unwrapRequiredValidatedValue(state),
    thumbnail: unwrapOptionalValidatedValue(thumbnail),
    title: unwrapRequiredValidatedValue(title),
    url: unwrapRequiredValidatedValue(url)
  };

  return createValidationSuccess<CreateBookmarkInput, BookmarkValidationField>(data);
}

export function validateUpdateBookmarkInput(
  input: unknown
): BookmarkValidationResult<UpdateBookmarkInput> {
  if (!isRecord(input)) {
    return createValidationFailure<UpdateBookmarkInput, BookmarkValidationField>(
      {},
      'Invalid bookmark input.'
    );
  }

  const fieldErrors: ValidationFieldErrors<BookmarkValidationField> = {};
  const data: UpdateBookmarkInput = {};
  let hasKnownField = false;

  if (hasOwnProperty(input, 'url')) {
    hasKnownField = true;

    const url = normalizeRequiredUrl(input.url);

    if (url === invalidValue) {
      addFieldError(fieldErrors, 'url', 'Enter a valid bookmark URL.');
    } else if (url.length > bookmarkValidationLimits.url) {
      addFieldError(
        fieldErrors,
        'url',
        `Bookmark URL must be ${bookmarkValidationLimits.url} characters or fewer.`
      );
    } else {
      data.url = url;
    }
  }

  if (hasOwnProperty(input, 'slug')) {
    hasKnownField = true;

    const slug = normalizeRequiredString(input.slug);

    if (slug === invalidValue) {
      addFieldError(fieldErrors, 'slug', 'Slug is required.');
    } else if (slug.length > bookmarkValidationLimits.slug) {
      addFieldError(
        fieldErrors,
        'slug',
        `Slug must be ${bookmarkValidationLimits.slug} characters or fewer.`
      );
    } else {
      data.slug = slug;
    }
  }

  if (hasOwnProperty(input, 'title')) {
    hasKnownField = true;

    const title = normalizeRequiredString(input.title);

    if (title === invalidValue) {
      addFieldError(fieldErrors, 'title', 'Title is required.');
    } else if (title.length > bookmarkValidationLimits.title) {
      addFieldError(
        fieldErrors,
        'title',
        `Title must be ${bookmarkValidationLimits.title} characters or fewer.`
      );
    } else {
      data.title = title;
    }
  }

  if (hasOwnProperty(input, 'description')) {
    hasKnownField = true;

    const description = normalizeBookmarkOptionalString(
      fieldErrors,
      'description',
      input.description,
      bookmarkValidationLimits.description,
      'Description'
    );

    if (description !== invalidValue) {
      data.description = description;
    }
  }

  if (hasOwnProperty(input, 'author')) {
    hasKnownField = true;

    const author = normalizeBookmarkOptionalString(
      fieldErrors,
      'author',
      input.author,
      bookmarkValidationLimits.author,
      'Author'
    );

    if (author !== invalidValue) {
      data.author = author;
    }
  }

  if (hasOwnProperty(input, 'thumbnail')) {
    hasKnownField = true;

    const thumbnail = normalizeOptionalUrl(input.thumbnail);

    if (thumbnail === invalidValue) {
      addFieldError(fieldErrors, 'thumbnail', 'Thumbnail must be a valid URL.');
    } else if (thumbnail && thumbnail.length > bookmarkValidationLimits.thumbnail) {
      addFieldError(
        fieldErrors,
        'thumbnail',
        `Thumbnail URL must be ${bookmarkValidationLimits.thumbnail} characters or fewer.`
      );
    } else {
      data.thumbnail = thumbnail;
    }
  }

  if (hasOwnProperty(input, 'publishedAt')) {
    hasKnownField = true;

    const publishedAt = normalizeOptionalDate(input.publishedAt);

    if (publishedAt === invalidValue) {
      addFieldError(fieldErrors, 'publishedAt', 'Published date must be a valid date.');
    } else {
      data.publishedAt = publishedAt;
    }
  }

  if (hasOwnProperty(input, 'state')) {
    hasKnownField = true;

    const state = normalizeBookmarkState(input.state);

    if (state === invalidValue) {
      addFieldError(fieldErrors, 'state', 'State must be active or archived.');
    } else if (state) {
      data.state = state;
    }
  }

  if (hasOwnProperty(input, 'favorite')) {
    hasKnownField = true;

    const favorite = normalizeOptionalBoolean(input.favorite);

    if (favorite === invalidValue || favorite === undefined) {
      addFieldError(fieldErrors, 'favorite', 'Favorite must be true or false.');
    } else {
      data.favorite = favorite;
    }
  }

  if (!hasKnownField) {
    return createValidationFailure<UpdateBookmarkInput, BookmarkValidationField>(
      {},
      'At least one bookmark field must be provided.'
    );
  }

  if (hasFieldErrors(fieldErrors)) {
    return createValidationFailure<UpdateBookmarkInput, BookmarkValidationField>(fieldErrors);
  }

  return createValidationSuccess<UpdateBookmarkInput, BookmarkValidationField>(data);
}

export function validateQuickAddBookmarkInput(input: unknown): QuickAddBookmarkValidationResult {
  if (!isRecord(input)) {
    return createValidationFailure<QuickAddBookmarkInput, QuickAddBookmarkField>(
      {},
      bookmarkMessageKeys.quickAddInvalidInput
    );
  }

  const fieldErrors: ValidationFieldErrors<QuickAddBookmarkField> = {};
  const url = normalizeRequiredUrl(input.url);
  const title = normalizeOptionalString(input.title);
  const description = normalizeOptionalString(input.description);

  if (url === invalidValue) {
    addFieldError(fieldErrors, 'url', bookmarkMessageKeys.quickAddUrlInvalid);
  } else if (url.length > bookmarkValidationLimits.url) {
    addFieldError(fieldErrors, 'url', bookmarkMessageKeys.quickAddUrlTooLong);
  }

  if (title === invalidValue) {
    addFieldError(fieldErrors, 'title', bookmarkMessageKeys.quickAddTitleInvalid);
  } else if (title && title.length > bookmarkValidationLimits.title) {
    addFieldError(fieldErrors, 'title', bookmarkMessageKeys.quickAddTitleTooLong);
  }

  if (description === invalidValue) {
    addFieldError(fieldErrors, 'description', bookmarkMessageKeys.quickAddDescriptionInvalid);
  } else if (description && description.length > bookmarkValidationLimits.description) {
    addFieldError(fieldErrors, 'description', bookmarkMessageKeys.quickAddDescriptionTooLong);
  }

  if (hasFieldErrors(fieldErrors)) {
    return createValidationFailure<QuickAddBookmarkInput, QuickAddBookmarkField>(fieldErrors);
  }

  return createValidationSuccess<QuickAddBookmarkInput, QuickAddBookmarkField>({
    description: unwrapOptionalValidatedValue(description),
    title: unwrapOptionalValidatedValue(title),
    url: unwrapRequiredValidatedValue(url)
  });
}

function normalizeBookmarkOptionalString(
  fieldErrors: ValidationFieldErrors<BookmarkValidationField>,
  field: 'author' | 'description',
  value: unknown,
  maxLength: number,
  label: string
) {
  const normalizedValue = normalizeOptionalString(value);

  if (normalizedValue === invalidValue) {
    addFieldError(fieldErrors, field, `${label} must be a string.`);
    return invalidValue;
  }

  if (normalizedValue && normalizedValue.length > maxLength) {
    addFieldError(fieldErrors, field, `${label} must be ${maxLength} characters or fewer.`);
    return invalidValue;
  }

  return normalizedValue;
}

function normalizeBookmarkState(value: unknown) {
  if (typeof value !== 'string') {
    return invalidValue;
  }

  const normalizedValue = value.trim();

  return isBookmarkState(normalizedValue) ? normalizedValue : invalidValue;
}

function isBookmarkState(value: string): value is BookmarkState {
  return isKnownBookmarkState(value);
}
