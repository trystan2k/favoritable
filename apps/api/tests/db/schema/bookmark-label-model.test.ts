import { eq, like } from 'drizzle-orm';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import {
  type BookmarkDTO,
  bookmark,
  type InsertBookmarkDTO,
} from '../../../src/db/schema/bookmark.schema.js';
import { bookmarkLabel } from '../../../src/db/schema/bookmark-label.schema.js';
import {
  type InsertLabelDTO,
  type LabelDTO,
  label,
} from '../../../src/db/schema/label.schema.js';
import {
  type InsertUserDTO,
  type UserDTO,
  user,
} from '../../../src/db/schema/user.schema.js';
import {
  setupTestDatabase,
  teardownTestDatabase,
} from '../../test-db-setup.js';

describe('BookmarkLabel Relationship Tests', () => {
  let testUser: UserDTO;
  let testBookmark: BookmarkDTO;
  let testLabel: LabelDTO;
  let db: Awaited<ReturnType<typeof setupTestDatabase>>;

  beforeAll(async () => {
    db = await setupTestDatabase();

    // Create a test user for our relationship tests
    const newUser: InsertUserDTO = {
      id: 'test-user-bookmark-label',
      email: 'bookmark-label@example.com',
      name: 'BookmarkLabel Test User',
      provider: 'github',
    };

    testUser = await db.insert(user).values(newUser).returning().get();
  });

  afterAll(async () => {
    // Clean up test user (cascade will handle bookmarks, labels, and relationships)
    await db.delete(user).where(eq(user.id, 'test-user-bookmark-label'));
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await db.delete(bookmarkLabel);
    await db
      .delete(bookmark)
      .where(like(bookmark.url, '%bookmark-label-test%'));
    await db.delete(label).where(like(label.name, '%test-label%'));

    // Create fresh test bookmark and label for each test
    const newBookmark: InsertBookmarkDTO = {
      id: 'test-bookmark-label-rel',
      url: 'https://bookmark-label-test.example.com',
      slug: 'bookmark-label-test',
      title: 'Bookmark Label Test',
      userId: testUser.id,
    };

    const newLabel: InsertLabelDTO = {
      id: 'test-label-bookmark-rel',
      name: 'test-label-bookmark',
      color: '#ff0000',
      userId: testUser.id,
    };

    testBookmark = await db
      .insert(bookmark)
      .values(newBookmark)
      .returning()
      .get();
    testLabel = await db.insert(label).values(newLabel).returning().get();
  });

  test('should create bookmark-label association', async () => {
    // Create the association
    const association = await db
      .insert(bookmarkLabel)
      .values({
        id: 'test-association-1',
        bookmarkId: testBookmark.id,
        labelId: testLabel.id,
      })
      .returning()
      .get();

    expect(association).toBeDefined();
    expect(association.bookmarkId).toBe(testBookmark.id);
    expect(association.labelId).toBe(testLabel.id);
    expect(association.createdAt).toBeDefined();
    expect(association.updatedAt).toBeDefined();
  });

  test('should query bookmark with its labels using relations', async () => {
    // Create the association
    await db.insert(bookmarkLabel).values({
      id: 'test-association-2',
      bookmarkId: testBookmark.id,
      labelId: testLabel.id,
    });

    // Query bookmark with its labels
    const bookmarkWithLabels = await db.query.bookmark.findFirst({
      where: eq(bookmark.id, testBookmark.id),
      with: {
        bookmarkLabel: {
          with: {
            label: true,
          },
        },
      },
    });

    expect(bookmarkWithLabels).toBeDefined();
    expect(bookmarkWithLabels?.bookmarkLabel).toHaveLength(1);
    expect(bookmarkWithLabels?.bookmarkLabel?.[0]?.label.id).toBe(testLabel.id);
    expect(bookmarkWithLabels?.bookmarkLabel?.[0]?.label.name).toBe(
      testLabel.name
    );
  });

  test('should query label with its bookmarks using relations', async () => {
    // Create the association
    await db.insert(bookmarkLabel).values({
      id: 'test-association-3',
      bookmarkId: testBookmark.id,
      labelId: testLabel.id,
    });

    // Query label with its bookmarks
    const labelWithBookmarks = await db.query.label.findFirst({
      where: eq(label.id, testLabel.id),
      with: {
        bookmarkLabel: {
          with: {
            bookmark: true,
          },
        },
      },
    });

    expect(labelWithBookmarks).toBeDefined();
    expect(labelWithBookmarks?.bookmarkLabel).toHaveLength(1);
    expect(labelWithBookmarks?.bookmarkLabel?.[0]?.bookmark.id).toBe(
      testBookmark.id
    );
    expect(labelWithBookmarks?.bookmarkLabel?.[0]?.bookmark.title).toBe(
      testBookmark.title
    );
  });

  test('should remove bookmark-label association', async () => {
    // Create the association
    const association = await db
      .insert(bookmarkLabel)
      .values({
        id: 'test-association-4',
        bookmarkId: testBookmark.id,
        labelId: testLabel.id,
      })
      .returning()
      .get();

    // Verify it exists
    const existingAssociation = await db
      .select()
      .from(bookmarkLabel)
      .where(eq(bookmarkLabel.id, association.id))
      .get();
    expect(existingAssociation).toBeDefined();

    // Remove the association
    await db.delete(bookmarkLabel).where(eq(bookmarkLabel.id, association.id));

    // Verify it's removed
    const removedAssociation = await db
      .select()
      .from(bookmarkLabel)
      .where(eq(bookmarkLabel.id, association.id))
      .get();
    expect(removedAssociation).toBeUndefined();
  });

  test('should support multiple labels for one bookmark', async () => {
    // Create a second label
    const secondLabel = await db
      .insert(label)
      .values({
        id: 'test-label-second',
        name: 'test-label-second',
        color: '#00ff00',
        userId: testUser.id,
      })
      .returning()
      .get();

    // Create associations with both labels
    await db.insert(bookmarkLabel).values([
      {
        id: 'test-association-5a',
        bookmarkId: testBookmark.id,
        labelId: testLabel.id,
      },
      {
        id: 'test-association-5b',
        bookmarkId: testBookmark.id,
        labelId: secondLabel.id,
      },
    ]);

    // Query bookmark with all its labels
    const bookmarkWithLabels = await db.query.bookmark.findFirst({
      where: eq(bookmark.id, testBookmark.id),
      with: {
        bookmarkLabel: {
          with: {
            label: true,
          },
        },
      },
    });

    expect(bookmarkWithLabels?.bookmarkLabel).toHaveLength(2);
    const labelIds =
      bookmarkWithLabels?.bookmarkLabel?.map((bl) => bl.label.id) || [];
    expect(labelIds).toContain(testLabel.id);
    expect(labelIds).toContain(secondLabel.id);
  });

  test('should support multiple bookmarks for one label', async () => {
    // Create a second bookmark
    const secondBookmark = await db
      .insert(bookmark)
      .values({
        id: 'test-bookmark-second',
        url: 'https://bookmark-label-test-2.example.com',
        slug: 'bookmark-label-test-2',
        title: 'Second Bookmark Label Test',
        userId: testUser.id,
      })
      .returning()
      .get();

    // Create associations with both bookmarks
    await db.insert(bookmarkLabel).values([
      {
        id: 'test-association-6a',
        bookmarkId: testBookmark.id,
        labelId: testLabel.id,
      },
      {
        id: 'test-association-6b',
        bookmarkId: secondBookmark.id,
        labelId: testLabel.id,
      },
    ]);

    // Query label with all its bookmarks
    const labelWithBookmarks = await db.query.label.findFirst({
      where: eq(label.id, testLabel.id),
      with: {
        bookmarkLabel: {
          with: {
            bookmark: true,
          },
        },
      },
    });

    expect(labelWithBookmarks?.bookmarkLabel).toHaveLength(2);
    const bookmarkIds =
      labelWithBookmarks?.bookmarkLabel?.map((bl) => bl.bookmark.id) || [];
    expect(bookmarkIds).toContain(testBookmark.id);
    expect(bookmarkIds).toContain(secondBookmark.id);
  });

  test('should cascade delete associations when bookmark is deleted', async () => {
    // Create the association
    const association = await db
      .insert(bookmarkLabel)
      .values({
        id: 'test-association-7',
        bookmarkId: testBookmark.id,
        labelId: testLabel.id,
      })
      .returning()
      .get();

    // Verify association exists
    const existingAssociation = await db
      .select()
      .from(bookmarkLabel)
      .where(eq(bookmarkLabel.id, association.id))
      .get();
    expect(existingAssociation).toBeDefined();

    // Delete the bookmark
    await db.delete(bookmark).where(eq(bookmark.id, testBookmark.id));

    // Verify association was cascade deleted
    const remainingAssociation = await db
      .select()
      .from(bookmarkLabel)
      .where(eq(bookmarkLabel.id, association.id))
      .get();
    expect(remainingAssociation).toBeUndefined();

    // Verify label still exists
    const remainingLabel = await db
      .select()
      .from(label)
      .where(eq(label.id, testLabel.id))
      .get();
    expect(remainingLabel).toBeDefined();
  });

  test('should cascade delete associations when label is deleted', async () => {
    // Create the association
    const association = await db
      .insert(bookmarkLabel)
      .values({
        id: 'test-association-8',
        bookmarkId: testBookmark.id,
        labelId: testLabel.id,
      })
      .returning()
      .get();

    // Verify association exists
    const existingAssociation = await db
      .select()
      .from(bookmarkLabel)
      .where(eq(bookmarkLabel.id, association.id))
      .get();
    expect(existingAssociation).toBeDefined();

    // Delete the label
    await db.delete(label).where(eq(label.id, testLabel.id));

    // Verify association was cascade deleted
    const remainingAssociation = await db
      .select()
      .from(bookmarkLabel)
      .where(eq(bookmarkLabel.id, association.id))
      .get();
    expect(remainingAssociation).toBeUndefined();

    // Verify bookmark still exists
    const remainingBookmark = await db
      .select()
      .from(bookmark)
      .where(eq(bookmark.id, testBookmark.id))
      .get();
    expect(remainingBookmark).toBeDefined();
  });
});
