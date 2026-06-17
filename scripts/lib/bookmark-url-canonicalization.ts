import type { createClient } from '@libsql/client';

import { canonicalizeBookmarkUrl } from '../../src/features/bookmarks/lib/bookmark-url.ts';

export type BookmarkRow = {
  id: string;
  url: string;
  userId: string;
};

export type CanonicalBookmarkUrlUpdate = BookmarkRow & {
  canonicalUrl: string;
};

export type CanonicalDuplicateGroup = {
  canonicalUrl: string;
  rows: BookmarkRow[];
  userId: string;
};

export type BookmarkUrlCanonicalizationSummary = {
  duplicateGroups: CanonicalDuplicateGroup[];
  rows: BookmarkRow[];
  updates: CanonicalBookmarkUrlUpdate[];
};

type SqlClient = Pick<ReturnType<typeof createClient>, 'execute'>;

const bookmarkUniqueUrlIndexName = 'bookmark_userId_url_unique';

export class BookmarkUrlCanonicalizationError extends Error {
  constructor(duplicateGroups: CanonicalDuplicateGroup[]) {
    super(createCanonicalizationErrorMessage(duplicateGroups));
    this.name = 'BookmarkUrlCanonicalizationError';
  }
}

export function toBookmarkRow(row: Record<string, unknown>): BookmarkRow {
  return {
    id: String(row.id),
    url: String(row.url),
    userId: String(row.user_id)
  };
}

export function createCanonicalBookmarkUrlUpdates(
  rows: BookmarkRow[]
): CanonicalBookmarkUrlUpdate[] {
  return rows
    .map((row) => ({
      ...row,
      canonicalUrl: canonicalizeBookmarkUrl(row.url)
    }))
    .filter((row) => row.url !== row.canonicalUrl);
}

export function createCanonicalDuplicateGroups(rows: BookmarkRow[]): CanonicalDuplicateGroup[] {
  const groups = new Map<string, CanonicalDuplicateGroup>();

  for (const row of rows) {
    const canonicalUrl = canonicalizeBookmarkUrl(row.url);
    const key = `${row.userId}\u0000${canonicalUrl}`;
    const group = groups.get(key);

    if (group) {
      group.rows.push(row);
      continue;
    }

    groups.set(key, {
      canonicalUrl,
      rows: [row],
      userId: row.userId
    });
  }

  return [...groups.values()].filter((group) => group.rows.length > 1);
}

export function formatCanonicalDuplicateGroup(group: CanonicalDuplicateGroup) {
  const bookmarks = group.rows.map((row) => `    - ${row.id}: ${row.url}`).join('\n');

  return [`  user ${group.userId} -> ${group.canonicalUrl}`, bookmarks].join('\n');
}

export async function readBookmarkRows(client: SqlClient): Promise<BookmarkRow[]> {
  if (!(await tableExists(client, 'bookmark'))) {
    return [];
  }

  const result = await client.execute(`
    select id, user_id, url
    from bookmark
    order by user_id asc, created_at asc, id asc
  `);

  return result.rows.map((row) => toBookmarkRow(row));
}

export async function shouldCanonicalizeBookmarkUrlsBeforeMigrate(client: SqlClient) {
  if (!(await tableExists(client, 'bookmark'))) {
    return false;
  }

  return !(await bookmarkUrlUniqueIndexExists(client));
}

export async function canonicalizeBookmarkUrls(
  client: SqlClient,
  options: {
    applyChanges?: boolean;
    failOnDuplicates?: boolean;
  } = {}
): Promise<BookmarkUrlCanonicalizationSummary> {
  const rows = await readBookmarkRows(client);
  const summary = {
    duplicateGroups: createCanonicalDuplicateGroups(rows),
    rows,
    updates: createCanonicalBookmarkUrlUpdates(rows)
  } satisfies BookmarkUrlCanonicalizationSummary;

  if (options.failOnDuplicates && summary.duplicateGroups.length > 0) {
    throw new BookmarkUrlCanonicalizationError(summary.duplicateGroups);
  }

  if (!options.applyChanges || summary.updates.length === 0) {
    return summary;
  }

  await client.execute('begin');

  try {
    for (const update of summary.updates) {
      // oxlint-disable-next-line no-await-in-loop -- transaction updates must stay sequential for deterministic rollback behavior
      await client.execute({
        args: [update.canonicalUrl, update.id],
        sql: 'update bookmark set url = ? where id = ?'
      });
    }

    await client.execute('commit');
  } catch (error) {
    await client.execute('rollback');
    throw error;
  }

  return summary;
}

function createCanonicalizationErrorMessage(duplicateGroups: CanonicalDuplicateGroup[]) {
  return [
    'Canonical bookmark URL duplicates detected. Resolve them before running migrations.',
    ...duplicateGroups.map((group) => formatCanonicalDuplicateGroup(group)),
    'No rows were updated.'
  ].join('\n');
}

async function bookmarkUrlUniqueIndexExists(client: SqlClient) {
  const result = await client.execute("PRAGMA index_list('bookmark')");

  return result.rows.some((row) => row.name === bookmarkUniqueUrlIndexName);
}

async function tableExists(client: SqlClient, tableName: string) {
  const result = await client.execute({
    args: [tableName],
    sql: "select 1 from sqlite_master where type = 'table' and name = ? limit 1"
  });

  return result.rows.length > 0;
}
