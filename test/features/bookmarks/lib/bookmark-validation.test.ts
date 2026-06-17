import { describe, expect, test } from 'vitest';

import { bookmarkMessageKeys } from '@/features/bookmarks/lib/bookmark-messages';
import {
  bookmarkValidationLimits,
  validateQuickAddBookmarkInput,
  validateCreateBookmarkInput,
  validateUpdateBookmarkInput
} from '@/features/bookmarks/lib/bookmark-validation';

describe('bookmark validation', () => {
  test('normalizes valid create input and applies bookmark defaults', () => {
    const result = validateCreateBookmarkInput({
      author: '  Thiago Mendonca  ',
      description: '  Favoritable launch article.  ',
      publishedAt: '2026-06-16T12:00:00.000Z',
      slug: '  favoritable-launch  ',
      thumbnail: '  https://favoritable.app/thumb.png  ',
      title: '  Favoritable Launch  ',
      url: '  https://favoritable.app/articles/launch  '
    });

    expect(result).toMatchObject({
      data: {
        author: 'Thiago Mendonca',
        description: 'Favoritable launch article.',
        favorite: false,
        slug: 'favoritable-launch',
        state: 'active',
        thumbnail: 'https://favoritable.app/thumb.png',
        title: 'Favoritable Launch',
        url: 'https://favoritable.app/articles/launch'
      },
      fieldErrors: {},
      success: true
    });

    expect(result.success && result.data.publishedAt?.toISOString()).toBe(
      '2026-06-16T12:00:00.000Z'
    );
  });

  test('rejects impossible calendar dates on create', () => {
    const result = validateCreateBookmarkInput({
      publishedAt: '2026-02-31',
      slug: 'favoritable-launch',
      title: 'Favoritable Launch',
      url: 'https://favoritable.app/articles/launch'
    });

    expect(result).toEqual({
      fieldErrors: {
        publishedAt: ['Published date must be a valid date.']
      },
      success: false
    });
  });

  test('rejects invalid bookmark urls with structured field errors', () => {
    const result = validateCreateBookmarkInput({
      slug: 'favoritable-launch',
      title: 'Favoritable Launch',
      url: 'notaurl'
    });

    expect(result).toEqual({
      fieldErrors: {
        url: ['Enter a valid bookmark URL.']
      },
      success: false
    });
  });

  test('rejects explicit blank bookmark state on create', () => {
    const result = validateCreateBookmarkInput({
      slug: 'favoritable-launch',
      state: '   ',
      title: 'Favoritable Launch',
      url: 'https://favoritable.app/articles/launch'
    });

    expect(result).toEqual({
      fieldErrors: {
        state: ['State must be active or archived.']
      },
      success: false
    });
  });

  test('rejects explicit invalid bookmark state on create', () => {
    const result = validateCreateBookmarkInput({
      slug: 'favoritable-launch',
      state: 'draft',
      title: 'Favoritable Launch',
      url: 'https://favoritable.app/articles/launch'
    });

    expect(result).toEqual({
      fieldErrors: {
        state: ['State must be active or archived.']
      },
      success: false
    });
  });

  test('rejects over-limit bookmark fields', () => {
    const result = validateCreateBookmarkInput({
      slug: 'favoritable-launch',
      title: 'x'.repeat(bookmarkValidationLimits.title + 1),
      url: 'https://favoritable.app/articles/launch'
    });

    expect(result).toEqual({
      fieldErrors: {
        title: [`Title must be ${bookmarkValidationLimits.title} characters or fewer.`]
      },
      success: false
    });
  });

  test('normalizes valid update input and allows clearing optional fields', () => {
    const result = validateUpdateBookmarkInput({
      author: '   ',
      description: '  Updated description  ',
      favorite: 'true',
      slug: '  updated-slug  ',
      state: ' archived ',
      thumbnail: '',
      title: '  Updated title  ',
      url: ' https://favoritable.app/articles/updated '
    });

    expect(result).toEqual({
      data: {
        author: undefined,
        description: 'Updated description',
        favorite: true,
        slug: 'updated-slug',
        state: 'archived',
        thumbnail: undefined,
        title: 'Updated title',
        url: 'https://favoritable.app/articles/updated'
      },
      fieldErrors: {},
      success: true
    });
  });

  test('requires at least one bookmark field for updates', () => {
    const result = validateUpdateBookmarkInput({ unrelated: 'value' });

    expect(result).toEqual({
      fieldErrors: {},
      formError: 'At least one bookmark field must be provided.',
      success: false
    });
  });

  test('rejects explicit blank bookmark state on update', () => {
    const result = validateUpdateBookmarkInput({ state: '   ' });

    expect(result).toEqual({
      fieldErrors: {
        state: ['State must be active or archived.']
      },
      success: false
    });
  });

  test('rejects explicit invalid bookmark state on update', () => {
    const result = validateUpdateBookmarkInput({ state: 'draft' });

    expect(result).toEqual({
      fieldErrors: {
        state: ['State must be active or archived.']
      },
      success: false
    });
  });

  test('normalizes quick add input with optional blank title and description', () => {
    const result = validateQuickAddBookmarkInput({
      description: '  Launch note.  ',
      title: '   ',
      url: ' https://favoritable.app/articles/launch '
    });

    expect(result).toEqual({
      data: {
        description: 'Launch note.',
        title: undefined,
        url: 'https://favoritable.app/articles/launch'
      },
      fieldErrors: {},
      success: true
    });
  });

  test('canonicalizes equivalent root quick add urls to one stored value', () => {
    const result = validateQuickAddBookmarkInput({
      url: ' https://example.com '
    });

    expect(result).toEqual({
      data: {
        description: undefined,
        title: undefined,
        url: 'https://example.com/'
      },
      fieldErrors: {},
      success: true
    });
  });

  test('rejects quick add fields that exceed limits or use invalid urls', () => {
    const result = validateQuickAddBookmarkInput({
      description: 'x'.repeat(bookmarkValidationLimits.description + 1),
      title: 'x'.repeat(bookmarkValidationLimits.title + 1),
      url: 'notaurl'
    });

    expect(result).toEqual({
      fieldErrors: {
        description: [bookmarkMessageKeys.quickAddDescriptionTooLong],
        title: [bookmarkMessageKeys.quickAddTitleTooLong],
        url: [bookmarkMessageKeys.quickAddUrlInvalid]
      },
      success: false
    });
  });

  test('rejects non-record input for create bookmark', () => {
    const result = validateCreateBookmarkInput('not-an-object');

    expect(result).toEqual({
      fieldErrors: {},
      formError: 'Invalid bookmark input.',
      success: false
    });
  });

  test('rejects non-record input for update bookmark', () => {
    const result = validateUpdateBookmarkInput(null);

    expect(result).toEqual({
      fieldErrors: {},
      formError: 'Invalid bookmark input.',
      success: false
    });
  });

  test('rejects non-string author on create', () => {
    const result = validateCreateBookmarkInput({
      author: 42,
      slug: 'test-slug',
      title: 'Test Title',
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.author).toEqual(['Author must be a string.']);
    }
  });

  test('rejects over-limit author on create', () => {
    const result = validateCreateBookmarkInput({
      author: 'x'.repeat(bookmarkValidationLimits.author + 1),
      slug: 'test-slug',
      title: 'Test Title',
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.author).toEqual([
        `Author must be ${bookmarkValidationLimits.author} characters or fewer.`
      ]);
    }
  });

  test('rejects over-limit description on create', () => {
    const result = validateCreateBookmarkInput({
      description: 'x'.repeat(bookmarkValidationLimits.description + 1),
      slug: 'test-slug',
      title: 'Test Title',
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.description).toEqual([
        `Description must be ${bookmarkValidationLimits.description} characters or fewer.`
      ]);
    }
  });

  test('rejects non-string state on create', () => {
    const result = validateCreateBookmarkInput({
      slug: 'test-slug',
      state: 123,
      title: 'Test Title',
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.state).toEqual(['State must be active or archived.']);
    }
  });

  test('rejects invalid thumbnail URL on create', () => {
    const result = validateCreateBookmarkInput({
      slug: 'test-slug',
      thumbnail: 'not-a-url',
      title: 'Test Title',
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.thumbnail).toEqual(['Thumbnail must be a valid URL.']);
    }
  });

  test('rejects over-limit thumbnail URL on create', () => {
    const longUrl = `https://example.com/${'x'.repeat(bookmarkValidationLimits.thumbnail)}`;
    const result = validateCreateBookmarkInput({
      slug: 'test-slug',
      thumbnail: longUrl,
      title: 'Test Title',
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.thumbnail).toEqual([
        `Thumbnail URL must be ${bookmarkValidationLimits.thumbnail} characters or fewer.`
      ]);
    }
  });

  test('rejects invalid favorite value on create', () => {
    const result = validateCreateBookmarkInput({
      favorite: 'not-a-boolean',
      slug: 'test-slug',
      title: 'Test Title',
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.favorite).toEqual(['Favorite must be true or false.']);
    }
  });

  test('rejects over-limit url on create', () => {
    const longUrl = `https://example.com/${'x'.repeat(bookmarkValidationLimits.url)}`;
    const result = validateCreateBookmarkInput({
      slug: 'test-slug',
      title: 'Test Title',
      url: longUrl
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.url).toEqual([
        `Bookmark URL must be ${bookmarkValidationLimits.url} characters or fewer.`
      ]);
    }
  });

  test('rejects missing slug on create', () => {
    const result = validateCreateBookmarkInput({
      slug: '   ',
      title: 'Test Title',
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.slug).toEqual(['Slug is required.']);
    }
  });

  test('rejects missing title on create', () => {
    const result = validateCreateBookmarkInput({
      slug: 'test-slug',
      title: '   ',
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.title).toEqual(['Title is required.']);
    }
  });

  test('rejects over-limit slug on create', () => {
    const result = validateCreateBookmarkInput({
      slug: 'x'.repeat(bookmarkValidationLimits.slug + 1),
      title: 'Test Title',
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.slug).toEqual([
        `Slug must be ${bookmarkValidationLimits.slug} characters or fewer.`
      ]);
    }
  });

  test('rejects invalid published date on create', () => {
    const result = validateCreateBookmarkInput({
      publishedAt: 'not-a-date',
      slug: 'test-slug',
      title: 'Test Title',
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.publishedAt).toEqual(['Published date must be a valid date.']);
    }
  });

  test('rejects invalid url on update', () => {
    const result = validateUpdateBookmarkInput({ url: 'not-a-url' });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.url).toEqual(['Enter a valid bookmark URL.']);
    }
  });

  test('rejects over-limit url on update', () => {
    const longUrl = `https://example.com/${'x'.repeat(bookmarkValidationLimits.url)}`;
    const result = validateUpdateBookmarkInput({ url: longUrl });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.url).toEqual([
        `Bookmark URL must be ${bookmarkValidationLimits.url} characters or fewer.`
      ]);
    }
  });

  test('rejects missing slug on update', () => {
    const result = validateUpdateBookmarkInput({ slug: '   ' });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.slug).toEqual(['Slug is required.']);
    }
  });

  test('rejects over-limit slug on update', () => {
    const result = validateUpdateBookmarkInput({
      slug: 'x'.repeat(bookmarkValidationLimits.slug + 1)
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.slug).toEqual([
        `Slug must be ${bookmarkValidationLimits.slug} characters or fewer.`
      ]);
    }
  });

  test('rejects missing title on update', () => {
    const result = validateUpdateBookmarkInput({ title: '   ' });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.title).toEqual(['Title is required.']);
    }
  });

  test('rejects over-limit title on update', () => {
    const result = validateUpdateBookmarkInput({
      title: 'x'.repeat(bookmarkValidationLimits.title + 1)
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.title).toEqual([
        `Title must be ${bookmarkValidationLimits.title} characters or fewer.`
      ]);
    }
  });

  test('rejects non-string description on update', () => {
    const result = validateUpdateBookmarkInput({ description: 42 });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.description).toEqual(['Description must be a string.']);
    }
  });

  test('rejects over-limit description on update', () => {
    const result = validateUpdateBookmarkInput({
      description: 'x'.repeat(bookmarkValidationLimits.description + 1)
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.description).toEqual([
        `Description must be ${bookmarkValidationLimits.description} characters or fewer.`
      ]);
    }
  });

  test('rejects non-string author on update', () => {
    const result = validateUpdateBookmarkInput({ author: 42 });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.author).toEqual(['Author must be a string.']);
    }
  });

  test('rejects over-limit author on update', () => {
    const result = validateUpdateBookmarkInput({
      author: 'x'.repeat(bookmarkValidationLimits.author + 1)
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.author).toEqual([
        `Author must be ${bookmarkValidationLimits.author} characters or fewer.`
      ]);
    }
  });

  test('rejects invalid thumbnail URL on update', () => {
    const result = validateUpdateBookmarkInput({ thumbnail: 'not-a-url' });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.thumbnail).toEqual(['Thumbnail must be a valid URL.']);
    }
  });

  test('rejects over-limit thumbnail URL on update', () => {
    const longUrl = `https://example.com/${'x'.repeat(bookmarkValidationLimits.thumbnail)}`;
    const result = validateUpdateBookmarkInput({ thumbnail: longUrl });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.thumbnail).toEqual([
        `Thumbnail URL must be ${bookmarkValidationLimits.thumbnail} characters or fewer.`
      ]);
    }
  });

  test('rejects invalid published date on update', () => {
    const result = validateUpdateBookmarkInput({ publishedAt: 'not-a-date' });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.publishedAt).toEqual(['Published date must be a valid date.']);
    }
  });

  test('rejects invalid favorite on update', () => {
    const result = validateUpdateBookmarkInput({ favorite: 'not-a-boolean' });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.favorite).toEqual(['Favorite must be true or false.']);
    }
  });

  test('rejects undefined favorite on update', () => {
    const result = validateUpdateBookmarkInput({ favorite: undefined });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.favorite).toEqual(['Favorite must be true or false.']);
    }
  });

  test('accepts valid published date on update', () => {
    const result = validateUpdateBookmarkInput({
      publishedAt: '2026-06-16T12:00:00.000Z'
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.publishedAt).toBeInstanceOf(Date);
    }
  });

  test('accepts valid state on update', () => {
    const result = validateUpdateBookmarkInput({ state: 'active' });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.state).toBe('active');
    }
  });

  test('accepts valid thumbnail on update', () => {
    const result = validateUpdateBookmarkInput({
      thumbnail: 'https://example.com/thumb.png'
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.thumbnail).toBe('https://example.com/thumb.png');
    }
  });

  test('rejects quick add non-record input', () => {
    const result = validateQuickAddBookmarkInput(42);

    expect(result).toEqual({
      fieldErrors: {},
      formError: bookmarkMessageKeys.quickAddInvalidInput,
      success: false
    });
  });

  test('rejects quick add invalid title type', () => {
    const result = validateQuickAddBookmarkInput({
      title: 42,
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.title).toEqual([bookmarkMessageKeys.quickAddTitleInvalid]);
    }
  });

  test('rejects quick add invalid description type', () => {
    const result = validateQuickAddBookmarkInput({
      description: 42,
      url: 'https://example.com'
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.description).toEqual([
        bookmarkMessageKeys.quickAddDescriptionInvalid
      ]);
    }
  });

  test('rejects quick add url that is valid but exceeds length limit', () => {
    const longUrl = `https://example.com/${'x'.repeat(bookmarkValidationLimits.url)}`;
    const result = validateQuickAddBookmarkInput({
      url: longUrl
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.fieldErrors.url).toEqual([bookmarkMessageKeys.quickAddUrlTooLong]);
    }
  });
});
