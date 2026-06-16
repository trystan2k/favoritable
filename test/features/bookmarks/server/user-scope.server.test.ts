import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { drizzle } from 'drizzle-orm/libsql';

import type { createDb } from '@/db/client';
import * as schema from '@/db/schema/schema';
import {
  authenticatedMiddleware,
  createAuthenticatedServerFn,
  type AuthenticatedServerContext
} from '@/features/auth/server/authenticated-middleware';
import {
  type UpdateBookmarkInput,
  validateUpdateBookmarkInput
} from '@/features/bookmarks/lib/bookmark-validation';
import {
  assertBookmarkLabelOwnership,
  getBookmarkByIdForUser,
  getLabelByIdForUser,
  requireBookmarkByIdForUser,
  UserScopeAccessError
} from '@/features/bookmarks/server/user-scope.server';
import {
  createBootstrappedTempDatabase,
  disposeBootstrappedTempDatabase,
  type BootstrappedTempDatabase
} from '@test/lib/bootstrapped-temp-db';

type TempDatabaseContext = BootstrappedTempDatabase & {
  db: ReturnType<typeof createDb>;
};

async function createTempDatabase() {
  const database = await createBootstrappedTempDatabase('favoritable-user-scope-', 'user-scope.db');

  return {
    ...database,
    db: drizzle(database.client, {
      schema
    })
  } satisfies TempDatabaseContext;
}

async function seedUserScopedRecords(client: TempDatabaseContext['client']) {
  await client.execute(`
    insert into user (id, name, email, email_verified, created_at, updated_at, locale)
    values
      ('user-1', 'User One', 'user-one@favoritable.app', 1, 1700000000000, 1700000000000, 'en'),
      ('user-2', 'User Two', 'user-two@favoritable.app', 1, 1700000000000, 1700000000000, 'es')
  `);

  await client.execute(`
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
        'https://favoritable.app/owner-bookmark',
        'owner-bookmark',
        'Owner Bookmark',
        null,
        null,
        null,
        null,
        'active',
        0,
        1700000000000,
        1700000000000
      ),
      (
        'bookmark-2',
        'user-2',
        'https://favoritable.app/other-bookmark',
        'other-bookmark',
        'Other Bookmark',
        null,
        null,
        null,
        null,
        'active',
        0,
        1700000000001,
        1700000000001
      )
  `);

  await client.execute(`
    insert into label (id, user_id, name, created_at, updated_at)
    values
      ('label-1', 'user-1', 'Reading', 1700000000000, 1700000000000),
      ('label-2', 'user-2', 'Archive', 1700000000001, 1700000000001)
  `);
}

type UpdateBookmarkPayload = {
  bookmarkId: string;
  changes: UpdateBookmarkInput;
};

function parseUpdateBookmarkPayload(input: unknown): UpdateBookmarkPayload {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Invalid bookmark input.');
  }

  const { bookmarkId, ...bookmarkInput } = input as Record<string, unknown>;

  if (typeof bookmarkId !== 'string' || !bookmarkId.trim()) {
    throw new Error('Bookmark id is required.');
  }

  const validationResult = validateUpdateBookmarkInput(bookmarkInput);

  if (!validationResult.success) {
    throw validationResult;
  }

  return {
    bookmarkId: bookmarkId.trim(),
    changes: validationResult.data
  };
}

async function runUpdateBookmarkMutation(
  context: AuthenticatedServerContext,
  data: UpdateBookmarkPayload,
  db: TempDatabaseContext['db']
) {
  const bookmarkRecord = await requireBookmarkByIdForUser(
    {
      bookmarkId: data.bookmarkId,
      userId: context.userId
    },
    db
  );

  return {
    bookmarkId: bookmarkRecord.id,
    title: data.changes.title ?? bookmarkRecord.title,
    userId: bookmarkRecord.userId
  };
}

describe('bookmark user scope helpers', () => {
  let context: TempDatabaseContext | null = null;

  beforeEach(async () => {
    context = await createTempDatabase();
    await seedUserScopedRecords(context.client);
  });

  afterEach(async () => {
    await disposeBootstrappedTempDatabase(context);
    context = null;
  });

  test('returns bookmarks only for the authenticated owner', async () => {
    await expect(
      getBookmarkByIdForUser(
        {
          bookmarkId: 'bookmark-1',
          userId: 'user-1'
        },
        context!.db
      )
    ).resolves.toMatchObject({
      id: 'bookmark-1',
      userId: 'user-1'
    });

    await expect(
      getBookmarkByIdForUser(
        {
          bookmarkId: 'bookmark-1',
          userId: 'user-2'
        },
        context!.db
      )
    ).resolves.toBeNull();
  });

  test('returns labels only for the authenticated owner', async () => {
    await expect(
      getLabelByIdForUser(
        {
          labelId: 'label-1',
          userId: 'user-1'
        },
        context!.db
      )
    ).resolves.toMatchObject({
      id: 'label-1',
      userId: 'user-1'
    });

    await expect(
      getLabelByIdForUser(
        {
          labelId: 'label-1',
          userId: 'user-2'
        },
        context!.db
      )
    ).resolves.toBeNull();
  });

  test('rejects cross-user bookmark reads with a scoped access error', async () => {
    await expect(
      requireBookmarkByIdForUser(
        {
          bookmarkId: 'bookmark-1',
          userId: 'user-2'
        },
        context!.db
      )
    ).rejects.toMatchObject({
      message: 'Bookmark not found.',
      name: UserScopeAccessError.name
    });
  });

  test('allows bookmark-label ownership checks only when both records belong to the user', async () => {
    await expect(
      assertBookmarkLabelOwnership(
        {
          bookmarkId: 'bookmark-1',
          labelId: 'label-1',
          userId: 'user-1'
        },
        context!.db
      )
    ).resolves.toMatchObject({
      bookmark: {
        id: 'bookmark-1',
        userId: 'user-1'
      },
      label: {
        id: 'label-1',
        userId: 'user-1'
      }
    });
  });

  test('rejects cross-user bookmark-label attach attempts', async () => {
    await expect(
      assertBookmarkLabelOwnership(
        {
          bookmarkId: 'bookmark-1',
          labelId: 'label-2',
          userId: 'user-1'
        },
        context!.db
      )
    ).rejects.toMatchObject({
      message: 'Label not found.',
      name: UserScopeAccessError.name
    });
  });

  test('supports downstream server-function composition without helper duplication', async () => {
    const updateBookmarkBuilder = createAuthenticatedServerFn({ method: 'POST' }).validator(
      parseUpdateBookmarkPayload
    );
    const protectedUpdateBookmark = updateBookmarkBuilder.handler(
      ({ context: authContext, data }) => runUpdateBookmarkMutation(authContext, data, context!.db)
    );
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
    const parsedInput = parseUpdateBookmarkPayload({
      bookmarkId: '  bookmark-1  ',
      title: '  Updated Bookmark Title  '
    });

    expect(updateBookmarkBuilder.options.middleware).toEqual([authenticatedMiddleware]);
    expect(updateBookmarkBuilder.options.validator).toBe(parseUpdateBookmarkPayload);
    expect(protectedUpdateBookmark).toBeTypeOf('function');
    expect(parsedInput).toEqual({
      bookmarkId: 'bookmark-1',
      changes: {
        title: 'Updated Bookmark Title'
      }
    });

    await expect(
      runUpdateBookmarkMutation(requestContext, parsedInput, context!.db)
    ).resolves.toEqual({
      bookmarkId: 'bookmark-1',
      title: 'Updated Bookmark Title',
      userId: 'user-1'
    });

    await expect(
      runUpdateBookmarkMutation(
        {
          ...requestContext,
          userId: 'user-2'
        },
        parsedInput,
        context!.db
      )
    ).rejects.toMatchObject({
      message: 'Bookmark not found.',
      name: UserScopeAccessError.name
    });
  });
});
