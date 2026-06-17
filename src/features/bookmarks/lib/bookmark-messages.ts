export const bookmarkMessageKeys = {
  duplicateBookmarkUrl: 'bookmarks.quickAdd.errors.duplicateUrl',
  quickAddDescriptionInvalid: 'bookmarks.quickAdd.validation.description.invalid',
  quickAddDescriptionTooLong: 'bookmarks.quickAdd.validation.description.tooLong',
  quickAddFormError: 'bookmarks.quickAdd.errors.genericSave',
  quickAddInvalidInput: 'bookmarks.quickAdd.validation.invalidInput',
  quickAddTitleInvalid: 'bookmarks.quickAdd.validation.title.invalid',
  quickAddTitleTooLong: 'bookmarks.quickAdd.validation.title.tooLong',
  quickAddUrlInvalid: 'bookmarks.quickAdd.validation.url.invalid',
  quickAddUrlTooLong: 'bookmarks.quickAdd.validation.url.tooLong'
} as const;

export type BookmarkMessageKey = (typeof bookmarkMessageKeys)[keyof typeof bookmarkMessageKeys];

const bookmarkMessageKeySet = new Set<string>(Object.values(bookmarkMessageKeys));

export const duplicateBookmarkUrlMessage = bookmarkMessageKeys.duplicateBookmarkUrl;
export const quickAddBookmarkFormError = bookmarkMessageKeys.quickAddFormError;

export function isBookmarkMessageKey(value: string): value is BookmarkMessageKey {
  return bookmarkMessageKeySet.has(value);
}
