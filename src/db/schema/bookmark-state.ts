export const bookmarkStates = ['active', 'archived'] as const;

export const defaultBookmarkState = bookmarkStates[0];

export type BookmarkState = (typeof bookmarkStates)[number];

export function isBookmarkState(value: string): value is BookmarkState {
  return bookmarkStates.some((bookmarkState) => bookmarkState === value);
}
