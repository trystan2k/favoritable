import { and, desc, eq } from 'drizzle-orm';

import type { LibraryBookmarkListItem } from '@/features/bookmarks/lib/bookmark-library';
import { canonicalizeBookmarkUrl } from '@/features/bookmarks/lib/bookmark-url';

const bookmarkNotFoundForUserMessage = 'Bookmark not found.';
const labelNotFoundForUserMessage = 'Label not found.';

type Database = ReturnType<typeof import('@/db/client').createDb>;
type BookmarkRecord = typeof import('@/db/schema/bookmarks').bookmark.$inferSelect;
type LabelRecord = typeof import('@/db/schema/bookmarks').label.$inferSelect;

type BookmarkLookup = {
  bookmarkId: string;
  userId: string;
};

type BookmarkUrlLookup = {
  url: string;
  userId: string;
};

type LabelLookup = {
  labelId: string;
  userId: string;
};

type BookmarkLabelOwnershipLookup = {
  bookmarkId: string;
  labelId: string;
  userId: string;
};

export class UserScopeAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserScopeAccessError';
  }
}

export async function getBookmarkByIdForUser(
  lookup: BookmarkLookup,
  database?: Database
): Promise<BookmarkRecord | null> {
  const { getDb } = await import('@/db/client');
  const { bookmark } = await import('@/db/schema/bookmarks');
  const resolvedDatabase = database ?? getDb();
  const [bookmarkRecord] = await resolvedDatabase
    .select()
    .from(bookmark)
    .where(and(eq(bookmark.id, lookup.bookmarkId), eq(bookmark.userId, lookup.userId)))
    .limit(1);

  return bookmarkRecord ?? null;
}

export async function requireBookmarkByIdForUser(
  lookup: BookmarkLookup,
  database?: Database
): Promise<BookmarkRecord> {
  const bookmarkRecord = await getBookmarkByIdForUser(lookup, database);

  if (!bookmarkRecord) {
    throw new UserScopeAccessError(bookmarkNotFoundForUserMessage);
  }

  return bookmarkRecord;
}

export async function getBookmarkByUrlForUser(
  lookup: BookmarkUrlLookup,
  database?: Database
): Promise<BookmarkRecord | null> {
  const { getDb } = await import('@/db/client');
  const { bookmark } = await import('@/db/schema/bookmarks');
  const resolvedDatabase = database ?? getDb();
  const canonicalLookupUrl = canonicalizeBookmarkUrl(lookup.url);
  const [bookmarkRecord] = await resolvedDatabase
    .select()
    .from(bookmark)
    .where(and(eq(bookmark.userId, lookup.userId), eq(bookmark.url, canonicalLookupUrl)))
    .limit(1);

  return bookmarkRecord ?? null;
}

export async function listBookmarksForUser(
  lookup: Pick<BookmarkLookup, 'userId'>,
  database?: Database
): Promise<BookmarkRecord[]> {
  const { getDb } = await import('@/db/client');
  const { bookmark } = await import('@/db/schema/bookmarks');
  const resolvedDatabase = database ?? getDb();

  return resolvedDatabase
    .select()
    .from(bookmark)
    .where(eq(bookmark.userId, lookup.userId))
    .orderBy(desc(bookmark.createdAt), desc(bookmark.updatedAt));
}

export async function listLibraryBookmarksForUser(
  lookup: Pick<BookmarkLookup, 'userId'>,
  database?: Database
): Promise<LibraryBookmarkListItem[]> {
  const { getDb } = await import('@/db/client');
  const { bookmark } = await import('@/db/schema/bookmarks');
  const resolvedDatabase = database ?? getDb();

  return resolvedDatabase
    .select({
      description: bookmark.description,
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url
    })
    .from(bookmark)
    .where(eq(bookmark.userId, lookup.userId))
    .orderBy(desc(bookmark.createdAt), desc(bookmark.updatedAt));
}

export async function getLabelByIdForUser(
  lookup: LabelLookup,
  database?: Database
): Promise<LabelRecord | null> {
  const { getDb } = await import('@/db/client');
  const { label } = await import('@/db/schema/bookmarks');
  const resolvedDatabase = database ?? getDb();
  const [labelRecord] = await resolvedDatabase
    .select()
    .from(label)
    .where(and(eq(label.id, lookup.labelId), eq(label.userId, lookup.userId)))
    .limit(1);

  return labelRecord ?? null;
}

export async function assertBookmarkLabelOwnership(
  lookup: BookmarkLabelOwnershipLookup,
  database?: Database
): Promise<{
  bookmark: BookmarkRecord;
  label: LabelRecord;
}> {
  const { getDb } = await import('@/db/client');
  const { bookmark, label } = await import('@/db/schema/bookmarks');
  const resolvedDatabase = database ?? getDb();
  const [record] = await resolvedDatabase
    .select({
      bookmark,
      label
    })
    .from(bookmark)
    .leftJoin(label, and(eq(label.id, lookup.labelId), eq(label.userId, lookup.userId)))
    .where(and(eq(bookmark.id, lookup.bookmarkId), eq(bookmark.userId, lookup.userId)))
    .limit(1);

  const bookmarkRecord = record?.bookmark ?? null;

  if (!bookmarkRecord) {
    throw new UserScopeAccessError(bookmarkNotFoundForUserMessage);
  }

  const labelRecord = record?.label ?? null;

  if (!labelRecord) {
    throw new UserScopeAccessError(labelNotFoundForUserMessage);
  }

  return {
    bookmark: bookmarkRecord,
    label: labelRecord
  };
}
