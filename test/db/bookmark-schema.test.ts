import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import {
  createBootstrappedTempDatabase,
  disposeBootstrappedTempDatabase,
  type BootstrappedTempDatabase
} from '../lib/bootstrapped-temp-db';

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

  test('keeps duplicate bookmark URLs allowed and preserves cascade rules', async () => {
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
          'https://favoritable.app/article',
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

    expect(Number(duplicateUrlResult?.rows[0]?.count ?? 0)).toBe(2);

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
});
