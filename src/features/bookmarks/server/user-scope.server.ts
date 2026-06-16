import { and, eq } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { bookmark, label } from '@/db/schema/bookmarks';

const bookmarkNotFoundForUserMessage = 'Bookmark not found.';
const labelNotFoundForUserMessage = 'Label not found.';

type Database = ReturnType<typeof getDb>;
type BookmarkRecord = typeof bookmark.$inferSelect;
type LabelRecord = typeof label.$inferSelect;

type BookmarkLookup = {
  bookmarkId: string;
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
  database: Database = getDb()
): Promise<BookmarkRecord | null> {
  const [bookmarkRecord] = await database
    .select()
    .from(bookmark)
    .where(and(eq(bookmark.id, lookup.bookmarkId), eq(bookmark.userId, lookup.userId)))
    .limit(1);

  return bookmarkRecord ?? null;
}

export async function requireBookmarkByIdForUser(
  lookup: BookmarkLookup,
  database: Database = getDb()
): Promise<BookmarkRecord> {
  const bookmarkRecord = await getBookmarkByIdForUser(lookup, database);

  if (!bookmarkRecord) {
    throw new UserScopeAccessError(bookmarkNotFoundForUserMessage);
  }

  return bookmarkRecord;
}

export async function getLabelByIdForUser(
  lookup: LabelLookup,
  database: Database = getDb()
): Promise<LabelRecord | null> {
  const [labelRecord] = await database
    .select()
    .from(label)
    .where(and(eq(label.id, lookup.labelId), eq(label.userId, lookup.userId)))
    .limit(1);

  return labelRecord ?? null;
}

export async function assertBookmarkLabelOwnership(
  lookup: BookmarkLabelOwnershipLookup,
  database: Database = getDb()
): Promise<{
  bookmark: BookmarkRecord;
  label: LabelRecord;
}> {
  const [record] = await database
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
