import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { createClient } from '@libsql/client';

import {
  createBootstrappedTempDatabase,
  disposeBootstrappedTempDatabase,
  type BootstrappedTempDatabase
} from '../lib/bootstrapped-temp-db';

const execFileAsync = promisify(execFile);
const preUniqueIndexMigrationJournalEntries = [
  {
    createdAt: 1781177036842,
    hash: '66aa24c1650de43e3240f01805560e3401a34c9568958876cb3b5eaa42113f6a'
  },
  {
    createdAt: 1781339456890,
    hash: '207c705ea3d93730e0d31a58fe3d736f550e4eca419ab95efc7a7f46d99d4d93'
  },
  {
    createdAt: 1781604015302,
    hash: 'b170f23f2b26cee1a39aa664f3352592f823b644b4330c363010d9e91340b558'
  }
] as const;

async function createTempDatabase() {
  return createBootstrappedTempDatabase('favoritable-bookmark-schema-', 'bookmark-schema.db');
}

async function seedUsers(client: BootstrappedTempDatabase['client']) {
  await client.execute(`
    insert into user (id, name, email, email_verified, created_at, updated_at)
    values
      ('user-1', 'User One', 'user-one@favoritable.app', 1, 1700000000000, 1700000000000),
      ('user-2', 'User Two', 'user-two@favoritable.app', 1, 1700000000000, 1700000000000)
  `);
}

async function createPreUniqueIndexDatabase() {
  const tempDirectory = await mkdtemp(path.join(tmpdir(), 'favoritable-bookmark-migration-'));
  const databasePath = path.join(tempDirectory, 'bookmark-migration.db');
  const client = createClient({ url: `file:${databasePath}` });

  try {
    await client.execute('PRAGMA foreign_keys = ON');

    const migrationFiles = [
      'drizzle/0000_great_tigra.sql',
      'drizzle/0001_strange_medusa.sql',
      'drizzle/0002_violet_union_jack.sql'
    ];
    const migrationContents = await Promise.all(
      migrationFiles.map((migrationFile) =>
        readFile(path.join(process.cwd(), migrationFile), 'utf8')
      )
    );
    const allStatements = migrationContents.flatMap((content) =>
      content
        .split('--> statement-breakpoint')
        .map((statement) => statement.trim())
        .filter(Boolean)
    );

    await executeStatementsSequentially(client, allStatements);
    await client.execute(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at numeric
      )
    `);

    await Promise.all(
      preUniqueIndexMigrationJournalEntries.map((entry) =>
        client.execute({
          args: [entry.hash, entry.createdAt],
          sql: 'insert into __drizzle_migrations (hash, created_at) values (?, ?)'
        })
      )
    );

    return {
      client,
      databaseUrl: `file:${databasePath}`,
      tempDirectory
    };
  } catch (error) {
    client.close();
    await rm(tempDirectory, { force: true, recursive: true });
    throw error;
  }
}

async function executeStatementsSequentially(
  client: { execute: (sql: string) => Promise<unknown> },
  statements: string[]
) {
  await statements.reduce<Promise<void>>(async (chain, statement) => {
    await chain;
    await client.execute(statement);
  }, Promise.resolve());
}

async function runBootstrapMigration(databaseUrl: string) {
  return execFileAsync(process.execPath, ['./scripts/bootstrap-db.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl
    }
  });
}

function expectColumnNames(
  rows: Array<Record<string, unknown>> | undefined,
  expectedColumnNames: string[]
) {
  const columnNames = rows?.map((row) => String(row.name)) ?? [];

  expect(columnNames).toHaveLength(expectedColumnNames.length);
  expect(columnNames).toEqual(expect.arrayContaining(expectedColumnNames));
}

describe('bookmark schema migration', () => {
  let context: BootstrappedTempDatabase | null = null;

  beforeEach(async () => {
    context = await createTempDatabase();
  });

  afterEach(async () => {
    await disposeBootstrappedTempDatabase(context);
    context = null;
  });

  test('creates user-scoped bookmark tables with all PRD-required columns', async () => {
    const tablesResult = await context?.client.execute(`
      select name
      from sqlite_master
      where type = 'table'
        and name in ('bookmark', 'label', 'bookmark_label')
      order by name
    `);

    expect(tablesResult?.rows.map((row) => row.name)).toEqual([
      'bookmark',
      'bookmark_label',
      'label'
    ]);

    const [bookmarkColumnsResult, labelColumnsResult, bookmarkLabelColumnsResult] =
      await Promise.all([
        context?.client.execute(`PRAGMA table_info('bookmark')`),
        context?.client.execute(`PRAGMA table_info('label')`),
        context?.client.execute(`PRAGMA table_info('bookmark_label')`)
      ]);

    expectColumnNames(bookmarkColumnsResult?.rows, [
      'id',
      'user_id',
      'url',
      'slug',
      'title',
      'description',
      'author',
      'thumbnail',
      'published_at',
      'state',
      'favorite',
      'created_at',
      'updated_at'
    ]);

    expectColumnNames(labelColumnsResult?.rows, [
      'id',
      'user_id',
      'name',
      'color',
      'created_at',
      'updated_at'
    ]);

    expectColumnNames(bookmarkLabelColumnsResult?.rows, [
      'id',
      'bookmark_id',
      'label_id',
      'created_at',
      'updated_at'
    ]);
  });

  test('creates composite unique index for label names per user', async () => {
    const indexesResult = await context?.client.execute(`PRAGMA index_list('label')`);

    expect(indexesResult?.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'label_userId_name_unique',
          unique: 1
        })
      ])
    );

    const indexColumnsResult = await context?.client.execute(
      `PRAGMA index_info('label_userId_name_unique')`
    );

    expect(indexColumnsResult?.rows.map((row) => row.name)).toEqual(['user_id', 'name']);
  });

  test('enforces bookmark state values at database level', async () => {
    await seedUsers(context!.client);

    await expect(
      context?.client.execute(`
        insert into bookmark (
          id,
          user_id,
          url,
          slug,
          title,
          state,
          favorite,
          created_at,
          updated_at
        )
        values (
          'bookmark-invalid-state',
          'user-1',
          'https://favoritable.app/article',
          'invalid-state',
          'Invalid State Bookmark',
          'draft',
          0,
          1700000000000,
          1700000000000
        )
      `)
    ).rejects.toMatchObject({
      code: 'SQLITE_CONSTRAINT',
      message: expect.stringContaining('CHECK constraint failed: bookmark_state_check'),
      name: 'LibsqlError',
      rawCode: 275
    });
  });

  test('applies bookmark state and favorite defaults when inserts omit both columns', async () => {
    await seedUsers(context!.client);

    await context?.client.execute(`
      insert into bookmark (
        id,
        user_id,
        url,
        slug,
        title,
        created_at,
        updated_at
      )
      values (
        'bookmark-defaults',
        'user-1',
        'https://favoritable.app/defaults',
        'bookmark-defaults',
        'Bookmark Defaults',
        1700000000000,
        1700000000000
      )
    `);

    const bookmarkResult = await context?.client.execute(`
      select state, favorite
      from bookmark
      where id = 'bookmark-defaults'
    `);

    expect(bookmarkResult?.rows[0]).toMatchObject({
      favorite: 0,
      state: 'active'
    });
  });

  test('rejects duplicate label names for same user with stable SQLite constraint details', async () => {
    await seedUsers(context!.client);

    await context?.client.execute(`
      insert into label (id, user_id, name, created_at, updated_at)
      values ('label-1', 'user-1', 'Reading', 1700000000000, 1700000000000)
    `);

    await expect(
      context?.client.execute(`
        insert into label (id, user_id, name, created_at, updated_at)
        values ('label-2', 'user-1', 'Reading', 1700000000001, 1700000000001)
      `)
    ).rejects.toMatchObject({
      code: 'SQLITE_CONSTRAINT',
      message: expect.stringContaining('UNIQUE constraint failed: label.user_id, label.name'),
      name: 'LibsqlError',
      rawCode: 2067
    });
  });

  test('allows same label name across different users', async () => {
    await seedUsers(context!.client);

    await context?.client.execute(`
      insert into label (id, user_id, name, created_at, updated_at)
      values
        ('label-1', 'user-1', 'Reading', 1700000000000, 1700000000000),
        ('label-2', 'user-2', 'Reading', 1700000000001, 1700000000001)
    `);

    const labelCountResult = await context?.client.execute(`
      select count(*) as count
      from label
      where name = 'Reading'
    `);

    expect(Number(labelCountResult?.rows[0]?.count ?? 0)).toBe(2);
  });

  test('rejects duplicate bookmark urls for the same user and preserves cascade rules', async () => {
    await seedUsers(context!.client);

    await context?.client.execute(`
      insert into label (id, user_id, name, created_at, updated_at)
      values ('label-1', 'user-1', 'Reading', 1700000000000, 1700000000000)
    `);

    await context?.client.execute(`
      insert into bookmark (
        id,
        user_id,
        url,
        slug,
        title,
        description,
        author,
        thumbnail,
        published_at,
        state,
        favorite,
        created_at,
        updated_at
      )
      values
        (
          'bookmark-1',
          'user-1',
          'https://favoritable.app/article',
          'favoritable-article',
          'Favoritable Article',
          'Primary bookmark',
          'Thiago',
          'https://favoritable.app/thumb.png',
          1700000000000,
          'active',
          0,
          1700000000000,
          1700000000000
        ),
        (
          'bookmark-2',
          'user-1',
          'https://favoritable.app/second-article',
          'favoritable-article-copy',
          'Favoritable Article Copy',
          null,
          null,
          null,
          null,
          'archived',
          1,
          1700000000001,
          1700000000001
        )
    `);

    await expect(
      context?.client.execute(`
        insert into bookmark (
          id,
          user_id,
          url,
          slug,
          title,
          state,
          favorite,
          created_at,
          updated_at
        )
        values (
          'bookmark-duplicate',
          'user-1',
          'https://favoritable.app/article',
          'favoritable-article-duplicate',
          'Favoritable Article Duplicate',
          'active',
          0,
          1700000000002,
          1700000000002
        )
      `)
    ).rejects.toMatchObject({
      code: 'SQLITE_CONSTRAINT',
      message: expect.stringContaining('UNIQUE constraint failed: bookmark.user_id, bookmark.url'),
      name: 'LibsqlError',
      rawCode: 2067
    });

    await expect(
      context?.client.execute(`
        insert into bookmark (
          id,
          user_id,
          url,
          slug,
          title,
          state,
          favorite,
          created_at,
          updated_at
        )
        values (
          'bookmark-cross-user',
          'user-2',
          'https://favoritable.app/article',
          'favoritable-article-user-2',
          'Favoritable Article User Two',
          'active',
          0,
          1700000000003,
          1700000000003
        )
      `)
    ).resolves.toBeDefined();

    await context?.client.execute(`
      insert into bookmark_label (bookmark_id, label_id, created_at)
      values ('bookmark-1', 'label-1', 1700000000000)
    `);

    await expect(
      context?.client.execute(`
        insert into bookmark_label (bookmark_id, label_id, created_at)
        values ('bookmark-1', 'label-1', 1700000000001)
      `)
    ).rejects.toMatchObject({
      code: 'SQLITE_CONSTRAINT',
      message: expect.stringContaining(
        'UNIQUE constraint failed: bookmark_label.bookmark_id, bookmark_label.label_id'
      ),
      name: 'LibsqlError',
      rawCode: 2067
    });

    const duplicateUrlResult = await context?.client.execute(`
      select count(*) as count
      from bookmark
      where user_id = 'user-1'
        and url = 'https://favoritable.app/article'
    `);

    expect(Number(duplicateUrlResult?.rows[0]?.count ?? 0)).toBe(1);

    await context?.client.execute("delete from bookmark where id = 'bookmark-1'");

    const joinCountAfterBookmarkDelete = await context?.client.execute(`
      select count(*) as count
      from bookmark_label
      where label_id = 'label-1'
    `);

    expect(Number(joinCountAfterBookmarkDelete?.rows[0]?.count ?? 0)).toBe(0);

    await context?.client.execute(`
      insert into bookmark_label (bookmark_id, label_id, created_at)
      values ('bookmark-2', 'label-1', 1700000000002)
    `);
    await context?.client.execute("delete from label where id = 'label-1'");

    const joinCountAfterLabelDelete = await context?.client.execute(`
      select count(*) as count
      from bookmark_label
      where bookmark_id = 'bookmark-2'
    `);

    expect(Number(joinCountAfterLabelDelete?.rows[0]?.count ?? 0)).toBe(0);

    await context?.client.execute(`
      insert into label (id, user_id, name, created_at, updated_at)
      values ('label-4', 'user-1', 'Archive', 1700000000003, 1700000000003)
    `);
    await context?.client.execute(`
      insert into bookmark_label (bookmark_id, label_id, created_at)
      values ('bookmark-2', 'label-4', 1700000000004)
    `);
    await context?.client.execute("delete from user where id = 'user-1'");

    const [bookmarkCountResult, labelCountResult, joinCountResult] = await Promise.all([
      context?.client.execute("select count(*) as count from bookmark where user_id = 'user-1'"),
      context?.client.execute("select count(*) as count from label where user_id = 'user-1'"),
      context?.client.execute('select count(*) as count from bookmark_label')
    ]);

    expect(Number(bookmarkCountResult?.rows[0]?.count ?? 0)).toBe(0);
    expect(Number(labelCountResult?.rows[0]?.count ?? 0)).toBe(0);
    expect(Number(joinCountResult?.rows[0]?.count ?? 0)).toBe(0);
  });

  test('fails loud on legacy same-user duplicate urls before creating unique bookmark index', async () => {
    const legacyDatabase = await createPreUniqueIndexDatabase();

    try {
      await legacyDatabase.client.execute(`
        insert into user (id, name, email, email_verified, created_at, updated_at)
        values ('user-1', 'User One', 'user-one@favoritable.app', 1, 1700000000000, 1700000000000)
      `);
      await legacyDatabase.client.execute(`
        insert into label (id, user_id, name, created_at, updated_at)
        values ('label-1', 'user-1', 'Reading', 1700000000000, 1700000000000)
      `);
      await legacyDatabase.client.execute(`
        insert into bookmark (
          id,
          user_id,
          url,
          slug,
          title,
          description,
          state,
          favorite,
          created_at,
          updated_at
        )
        values
          (
            'bookmark-old',
            'user-1',
            'https://favoritable.app/article',
            'bookmark-old',
            'Older Bookmark',
            'Older description',
            'active',
            0,
            1700000000000,
            1700000000000
          ),
          (
            'bookmark-new',
            'user-1',
            'https://favoritable.app/article',
            'bookmark-new',
            'Newer Bookmark',
            'Newer description',
            'archived',
            1,
            1700000000100,
            1700000000100
          )
      `);
      await legacyDatabase.client.execute(`
        insert into bookmark_label (id, bookmark_id, label_id, created_at, updated_at)
        values
          ('bookmark-label-old', 'bookmark-old', 'label-1', 1700000000000, 1700000000000),
          ('bookmark-label-new', 'bookmark-new', 'label-1', 1700000000100, 1700000000100)
      `);

      const migrationContent = await readFile(
        path.join(process.cwd(), 'drizzle/0003_giant_expediter.sql'),
        'utf8'
      );
      const migrationStatements = migrationContent
        .split('--> statement-breakpoint')
        .map((statement) => statement.trim())
        .filter(Boolean);

      await expect(
        executeStatementsSequentially(legacyDatabase.client, migrationStatements)
      ).rejects.toMatchObject({
        code: 'SQLITE_CONSTRAINT',
        message: expect.stringContaining(
          'UNIQUE constraint failed: __bookmark_url_uniqueness_preflight.user_id, __bookmark_url_uniqueness_preflight.url'
        )
      });

      const bookmarkRows = await legacyDatabase.client.execute(`
        select id, title, description, state, favorite
        from bookmark
        where user_id = 'user-1'
          and url = 'https://favoritable.app/article'
        order by created_at asc
      `);
      const bookmarkLabelRows = await legacyDatabase.client.execute(`
        select bookmark_id, label_id
        from bookmark_label
        order by bookmark_id, label_id
      `);
      const bookmarkIndexes = await legacyDatabase.client.execute(`PRAGMA index_list('bookmark')`);

      expect(bookmarkRows.rows).toEqual([
        {
          description: 'Older description',
          favorite: 0,
          id: 'bookmark-old',
          state: 'active',
          title: 'Older Bookmark'
        },
        {
          description: 'Newer description',
          favorite: 1,
          id: 'bookmark-new',
          state: 'archived',
          title: 'Newer Bookmark'
        }
      ]);
      expect(bookmarkLabelRows.rows).toEqual([
        {
          bookmark_id: 'bookmark-new',
          label_id: 'label-1'
        },
        {
          bookmark_id: 'bookmark-old',
          label_id: 'label-1'
        }
      ]);
      expect(bookmarkIndexes.rows).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'bookmark_userId_url_unique' })])
      );
    } finally {
      legacyDatabase.client.close();
      await rm(legacyDatabase.tempDirectory, { force: true, recursive: true });
    }
  });

  test('fails loud without mutating legacy duplicates that have overlapping labels', async () => {
    const legacyDatabase = await createPreUniqueIndexDatabase();

    try {
      await seedUsers(legacyDatabase.client);
      await legacyDatabase.client.execute(`
        insert into label (id, user_id, name, created_at, updated_at)
        values
          ('label-1', 'user-1', 'Reading', 1700000000000, 1700000000000),
          ('label-2', 'user-1', 'Later', 1700000000001, 1700000000001)
      `);
      await legacyDatabase.client.execute(`
        insert into bookmark (
          id,
          user_id,
          url,
          slug,
          title,
          state,
          favorite,
          created_at,
          updated_at
        )
        values
          (
            'bookmark-old',
            'user-1',
            'https://favoritable.app/overlap',
            'bookmark-old',
            'Old Bookmark',
            'active',
            0,
            1700000000000,
            1700000000000
          ),
          (
            'bookmark-middle',
            'user-1',
            'https://favoritable.app/overlap',
            'bookmark-middle',
            'Middle Bookmark',
            'active',
            0,
            1700000000100,
            1700000000100
          ),
          (
            'bookmark-new',
            'user-1',
            'https://favoritable.app/overlap',
            'bookmark-new',
            'New Bookmark',
            'active',
            1,
            1700000000200,
            1700000000200
          )
      `);
      await legacyDatabase.client.execute(`
        insert into bookmark_label (id, bookmark_id, label_id, created_at, updated_at)
        values
          ('bookmark-label-old-reading', 'bookmark-old', 'label-1', 1700000000000, 1700000000000),
          ('bookmark-label-old-later', 'bookmark-old', 'label-2', 1700000000001, 1700000000001),
          ('bookmark-label-middle-reading', 'bookmark-middle', 'label-1', 1700000000100, 1700000000100),
          ('bookmark-label-new-later', 'bookmark-new', 'label-2', 1700000000200, 1700000000200)
      `);

      const migrationContent = await readFile(
        path.join(process.cwd(), 'drizzle/0003_giant_expediter.sql'),
        'utf8'
      );
      const migrationStatements = migrationContent
        .split('--> statement-breakpoint')
        .map((statement) => statement.trim())
        .filter(Boolean);

      await expect(
        executeStatementsSequentially(legacyDatabase.client, migrationStatements)
      ).rejects.toMatchObject({
        code: 'SQLITE_CONSTRAINT',
        message: expect.stringContaining(
          'UNIQUE constraint failed: __bookmark_url_uniqueness_preflight.user_id, __bookmark_url_uniqueness_preflight.url'
        )
      });

      const bookmarkRows = await legacyDatabase.client.execute(`
        select id
        from bookmark
        where user_id = 'user-1'
          and url = 'https://favoritable.app/overlap'
        order by id
      `);
      const bookmarkLabelRows = await legacyDatabase.client.execute(`
        select bookmark_id, label_id
        from bookmark_label
        order by bookmark_id, label_id
      `);

      expect(bookmarkRows.rows).toEqual([
        {
          id: 'bookmark-middle'
        },
        {
          id: 'bookmark-new'
        },
        {
          id: 'bookmark-old'
        }
      ]);
      expect(bookmarkLabelRows.rows).toEqual([
        {
          bookmark_id: 'bookmark-middle',
          label_id: 'label-1'
        },
        {
          bookmark_id: 'bookmark-new',
          label_id: 'label-2'
        },
        {
          bookmark_id: 'bookmark-old',
          label_id: 'label-1'
        },
        {
          bookmark_id: 'bookmark-old',
          label_id: 'label-2'
        }
      ]);
    } finally {
      legacyDatabase.client.close();
      await rm(legacyDatabase.tempDirectory, { force: true, recursive: true });
    }
  });

  test('bootstrap upgrade canonicalizes stored bookmark urls before adding the unique index', async () => {
    const legacyDatabase = await createPreUniqueIndexDatabase();

    try {
      await seedUsers(legacyDatabase.client);
      await legacyDatabase.client.execute(`
        insert into bookmark (
          id,
          user_id,
          url,
          slug,
          title,
          state,
          favorite,
          created_at,
          updated_at
        )
        values (
          'bookmark-root-legacy',
          'user-1',
          'https://example.com',
          'bookmark-root-legacy',
          'Legacy Root Bookmark',
          'active',
          0,
          1700000000000,
          1700000000000
        )
      `);

      await expect(runBootstrapMigration(legacyDatabase.databaseUrl)).resolves.toBeDefined();

      const bookmarkRows = await legacyDatabase.client.execute(`
        select id, url
        from bookmark
        where id = 'bookmark-root-legacy'
      `);
      const bookmarkIndexes = await legacyDatabase.client.execute(`PRAGMA index_list('bookmark')`);

      expect(bookmarkRows.rows).toEqual([
        {
          id: 'bookmark-root-legacy',
          url: 'https://example.com/'
        }
      ]);
      expect(bookmarkIndexes.rows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'bookmark_userId_url_unique',
            unique: 1
          })
        ])
      );
    } finally {
      legacyDatabase.client.close();
      await rm(legacyDatabase.tempDirectory, { force: true, recursive: true });
    }
  });

  test('bootstrap upgrade fails loud on canonical-equivalent duplicates before adding the unique index', async () => {
    const legacyDatabase = await createPreUniqueIndexDatabase();

    try {
      await seedUsers(legacyDatabase.client);
      await legacyDatabase.client.execute(`
        insert into bookmark (
          id,
          user_id,
          url,
          slug,
          title,
          state,
          favorite,
          created_at,
          updated_at
        )
        values
          (
            'bookmark-root-legacy',
            'user-1',
            'https://example.com',
            'bookmark-root-legacy',
            'Legacy Root Bookmark',
            'active',
            0,
            1700000000000,
            1700000000000
          ),
          (
            'bookmark-root-canonical',
            'user-1',
            'https://example.com/',
            'bookmark-root-canonical',
            'Canonical Root Bookmark',
            'active',
            0,
            1700000000100,
            1700000000100
          )
      `);

      await expect(runBootstrapMigration(legacyDatabase.databaseUrl)).rejects.toMatchObject({
        stderr: expect.stringContaining('Canonical bookmark URL duplicates detected.')
      });

      const bookmarkRows = await legacyDatabase.client.execute(`
        select id, url
        from bookmark
        where user_id = 'user-1'
        order by created_at asc, id asc
      `);
      const bookmarkIndexes = await legacyDatabase.client.execute(`PRAGMA index_list('bookmark')`);

      expect(bookmarkRows.rows).toEqual([
        {
          id: 'bookmark-root-legacy',
          url: 'https://example.com'
        },
        {
          id: 'bookmark-root-canonical',
          url: 'https://example.com/'
        }
      ]);
      expect(bookmarkIndexes.rows).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'bookmark_userId_url_unique' })])
      );
    } finally {
      legacyDatabase.client.close();
      await rm(legacyDatabase.tempDirectory, { force: true, recursive: true });
    }
  });
});
