import { describe, expect, test } from 'vitest';

import {
  bookmarkValidationLimits,
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
});
