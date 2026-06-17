import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { drizzle } from 'drizzle-orm/libsql';

import type { createDb } from '@/db/client';
import * as schema from '@/db/schema/schema';
import type { AuthenticatedServerContext } from '@/features/auth/server/authenticated-middleware';
import {
  bookmarkMessageKeys,
  duplicateBookmarkUrlMessage
} from '@/features/bookmarks/lib/bookmark-messages';
import { runCreateBookmarkMutation } from '@/features/bookmarks/server/create-bookmark.server';
import { createDuplicateBookmarkResult } from '@/features/bookmarks/server/create-bookmark-impl';
import {
  createBootstrappedTempDatabase,
  disposeBootstrappedTempDatabase,
  type BootstrappedTempDatabase
} from '@test/lib/bootstrapped-temp-db';

type TempDatabaseContext = BootstrappedTempDatabase & {
  db: ReturnType<typeof createDb>;
};

async function createTempDatabase() {
  const database = await createBootstrappedTempDatabase(
    'favoritable-create-bookmark-',
    'create-bookmark.db'
  );

  return {
    ...database,
    db: drizzle(database.client, {
      schema
    })
  } satisfies TempDatabaseContext;
}

async function seedUsers(client: TempDatabaseContext['client']) {
  await client.execute(`
    insert into user (id, name, email, email_verified, created_at, updated_at, locale)
    values
      ('user-1', 'User One', 'user-one@favoritable.app', 1, 1700000000000, 1700000000000, 'en'),
      ('user-2', 'User Two', 'user-two@favoritable.app', 1, 1700000000001, 1700000000001, 'en')
  `);
}

describe('create bookmark server mutation', () => {
  let context: TempDatabaseContext | null = null;

  beforeEach(async () => {
    context = await createTempDatabase();
    await seedUsers(context.client);
  });

  afterEach(async () => {
    await disposeBootstrappedTempDatabase(context);
    context = null;
  });

  test('creates a bookmark for the authenticated user and derives fallback title and slug', async () => {
    const result = await runCreateBookmarkMutation(
      {
        input: {
          description: '  Launch note.  ',
          title: '   ',
          url: ' https://favoritable.app/articles/launch '
        },
        userId: 'user-1'
      },
      {
        database: context!.db,
        idGenerator: () => 'bookmark-created'
      }
    );

    expect(result).toEqual({
      bookmarkId: 'bookmark-created',
      success: true
    });

    const bookmarkResult = await context!.client.execute(`
      select id, user_id, url, title, slug, description
      from bookmark
      where id = 'bookmark-created'
    `);

    expect(bookmarkResult.rows[0]).toMatchObject({
      description: 'Launch note.',
      id: 'bookmark-created',
      slug: 'favoritable-app-articles-launch',
      title: 'favoritable.app/articles/launch',
      url: 'https://favoritable.app/articles/launch',
      user_id: 'user-1'
    });
  });

  test('clamps server-derived fallback title for long url quick-add submissions', async () => {
    const longPath = `articles/${'launch-segment/'.repeat(60)}`;
    const url = `https://favoritable.app/${longPath}`;

    const result = await runCreateBookmarkMutation(
      {
        input: {
          title: '   ',
          url
        },
        userId: 'user-1'
      },
      {
        database: context!.db,
        idGenerator: () => 'bookmark-long-fallback'
      }
    );

    expect(result).toEqual({
      bookmarkId: 'bookmark-long-fallback',
      success: true
    });

    const bookmarkResult = await context!.client.execute(`
      select title, length(title) as title_length
      from bookmark
      where id = 'bookmark-long-fallback'
    `);
    const savedTitle = bookmarkResult.rows[0]?.title;

    expect(Number(bookmarkResult.rows[0]?.title_length ?? 0)).toBe(512);

    if (typeof savedTitle !== 'string') {
      throw new TypeError('Expected long fallback bookmark title to be a string.');
    }

    expect(savedTitle.startsWith('favoritable.app/articles/')).toBe(true);
  });

  test('returns inline duplicate error for same-user duplicate urls', async () => {
    await runCreateBookmarkMutation(
      {
        input: {
          title: 'First',
          url: 'https://favoritable.app/articles/launch'
        },
        userId: 'user-1'
      },
      {
        database: context!.db,
        idGenerator: () => 'bookmark-first'
      }
    );

    await expect(
      runCreateBookmarkMutation(
        {
          input: {
            title: 'Second',
            url: 'https://favoritable.app/articles/launch'
          },
          userId: 'user-1'
        },
        {
          database: context!.db,
          idGenerator: () => 'bookmark-second'
        }
      )
    ).resolves.toEqual({
      fieldErrors: {
        url: [duplicateBookmarkUrlMessage]
      },
      success: false
    });
  });

  test('blocks same-user duplicate urls after canonicalization', async () => {
    await expect(
      runCreateBookmarkMutation(
        {
          input: {
            title: 'First Root Bookmark',
            url: 'https://example.com'
          },
          userId: 'user-1'
        },
        {
          database: context!.db,
          idGenerator: () => 'bookmark-root-first'
        }
      )
    ).resolves.toMatchObject({ success: true });

    await expect(
      runCreateBookmarkMutation(
        {
          input: {
            title: 'Second Root Bookmark',
            url: 'https://example.com/'
          },
          userId: 'user-1'
        },
        {
          database: context!.db,
          idGenerator: () => 'bookmark-root-second'
        }
      )
    ).resolves.toEqual({
      fieldErrors: {
        url: [duplicateBookmarkUrlMessage]
      },
      success: false
    });
  });

  test('allows different users to save the same url', async () => {
    await expect(
      runCreateBookmarkMutation(
        {
          input: {
            title: 'User One Bookmark',
            url: 'https://favoritable.app/articles/launch'
          },
          userId: 'user-1'
        },
        {
          database: context!.db,
          idGenerator: () => 'bookmark-user-1'
        }
      )
    ).resolves.toMatchObject({ success: true });

    await expect(
      runCreateBookmarkMutation(
        {
          input: {
            title: 'User Two Bookmark',
            url: 'https://favoritable.app/articles/launch'
          },
          userId: 'user-2'
        },
        {
          database: context!.db,
          idGenerator: () => 'bookmark-user-2'
        }
      )
    ).resolves.toMatchObject({ success: true });
  });

  test('returns validation errors when input is missing required url', async () => {
    const result = await runCreateBookmarkMutation(
      {
        input: {
          description: 'Some description',
          title: 'Some title'
        },
        userId: 'user-1'
      },
      {
        database: context!.db,
        idGenerator: () => 'bookmark-invalid'
      }
    );

    expect(result).toEqual({
      fieldErrors: {
        url: [bookmarkMessageKeys.quickAddUrlInvalid]
      },
      success: false
    });
  });

  test('returns validation errors when input is not a record', async () => {
    const result = await runCreateBookmarkMutation(
      {
        input: 'not-an-object',
        userId: 'user-1'
      },
      {
        database: context!.db,
        idGenerator: () => 'bookmark-invalid'
      }
    );

    expect(result).toEqual({
      fieldErrors: {},
      formError: bookmarkMessageKeys.quickAddInvalidInput,
      success: false
    });
  });

  test('catches unique constraint error during insert and returns duplicate result', async () => {
    const duplicateConstraintError = Object.assign(
      new Error(
        'UNIQUE constraint failed: bookmark.url, bookmark.user_id while inserting bookmark'
      ),
      {
        code: 'SQLITE_CONSTRAINT',
        rawCode: 2067
      }
    );
    const mockDatabase = {
      insert: vi.fn<() => { values: (values: unknown) => Promise<never> }>().mockReturnValue({
        values: vi
          .fn<(values: unknown) => Promise<never>>()
          .mockRejectedValue(duplicateConstraintError)
      }),
      select: vi
        .fn<
          () => {
            from: (table: unknown) => {
              where: (clause: unknown) => { limit: (n: number) => Promise<unknown[]> };
            };
          }
        >()
        .mockReturnValue({
          from: vi
            .fn<
              (table: unknown) => {
                where: (clause: unknown) => { limit: (n: number) => Promise<unknown[]> };
              }
            >()
            .mockReturnValue({
              where: vi
                .fn<(clause: unknown) => { limit: (n: number) => Promise<unknown[]> }>()
                .mockReturnValue({
                  limit: vi.fn<(n: number) => Promise<unknown[]>>().mockResolvedValue([])
                })
            })
        })
    };

    const result = await runCreateBookmarkMutation(
      {
        input: {
          title: 'Race Condition Duplicate',
          url: 'https://favoritable.app/race-condition'
        },
        userId: 'user-1'
      },
      {
        database: mockDatabase as unknown as ReturnType<typeof createDb>,
        idGenerator: () => 'bookmark-race'
      }
    );

    expect(result).toEqual({
      fieldErrors: {
        url: [duplicateBookmarkUrlMessage]
      },
      success: false
    });
  });

  test('runCreateBookmarkMutation persists bookmark data for authenticated context values', async () => {
    const requestContext = {
      session: {
        session: {
          createdAt: new Date('2026-06-16T12:00:00.000Z'),
          expiresAt: new Date('2026-06-23T12:00:00.000Z'),
          id: 'session-1',
          token: 'token-1',
          updatedAt: new Date('2026-06-16T12:00:00.000Z'),
          userId: 'user-1'
        },
        user: {
          createdAt: new Date('2026-06-16T12:00:00.000Z'),
          email: 'user-one@favoritable.app',
          emailVerified: true,
          id: 'user-1',
          locale: 'en',
          name: 'User One',
          updatedAt: new Date('2026-06-16T12:00:00.000Z')
        }
      },
      userId: 'user-1'
    } as AuthenticatedServerContext;

    const handlerResult = await runCreateBookmarkMutation(
      {
        input: {
          description: 'Wiring test',
          title: 'Wiring Test',
          url: 'https://favoritable.app/wiring-test'
        },
        userId: requestContext.userId
      },
      {
        database: context!.db,
        idGenerator: () => 'bookmark-wiring'
      }
    );

    expect(handlerResult).toMatchObject({
      success: true
    });

    const bookmarkResult = await context!.client.execute(`
      select id, user_id, url, title
      from bookmark
      where url = 'https://favoritable.app/wiring-test'
    `);

    expect(bookmarkResult.rows[0]).toMatchObject({
      id: 'bookmark-wiring',
      title: 'Wiring Test',
      url: 'https://favoritable.app/wiring-test',
      user_id: 'user-1'
    });
  });

  test('re-throws non-duplicate database errors during insert', async () => {
    const databaseError = new Error('SQLITE_BUSY: database is locked');
    const mockDatabase = {
      insert: vi.fn<() => { values: (values: unknown) => Promise<never> }>().mockReturnValue({
        values: vi.fn<(values: unknown) => Promise<never>>().mockRejectedValue(databaseError)
      }),
      select: vi
        .fn<
          () => {
            from: (table: unknown) => {
              where: (clause: unknown) => { limit: (n: number) => Promise<unknown[]> };
            };
          }
        >()
        .mockReturnValue({
          from: vi
            .fn<
              (table: unknown) => {
                where: (clause: unknown) => { limit: (n: number) => Promise<unknown[]> };
              }
            >()
            .mockReturnValue({
              where: vi
                .fn<(clause: unknown) => { limit: (n: number) => Promise<unknown[]> }>()
                .mockReturnValue({
                  limit: vi.fn<(n: number) => Promise<unknown[]>>().mockResolvedValue([])
                })
            })
        })
    };

    await expect(
      runCreateBookmarkMutation(
        {
          input: {
            title: 'Test',
            url: 'https://example.com/test'
          },
          userId: 'user-1'
        },
        {
          database: mockDatabase as unknown as ReturnType<typeof createDb>,
          idGenerator: () => 'bookmark-error-test'
        }
      )
    ).rejects.toThrow('SQLITE_BUSY: database is locked');
  });

  test('createDuplicateBookmarkResult returns structured duplicate error', () => {
    const result = createDuplicateBookmarkResult();

    expect(result).toEqual({
      fieldErrors: {
        url: [duplicateBookmarkUrlMessage]
      },
      success: false
    });
  });
});
