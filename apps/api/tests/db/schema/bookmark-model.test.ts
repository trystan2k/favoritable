import { eq, like } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import {
  type BookmarkDTO,
  bookmark,
  type InsertBookmarkDTO,
} from '../../../src/db/schema/bookmark.schema.js';
import { type InsertUserDTO, user } from '../../../src/db/schema/user.schema.js';
import { setupTestDatabase, teardownTestDatabase } from '../../test-db-setup.js';

describe('Bookmark Model Tests', () => {
  let db: Awaited<ReturnType<typeof setupTestDatabase>>;

  beforeAll(async () => {
    db = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    // Clean up any test bookmarks and users before each test
    await db.delete(bookmark).where(like(bookmark.url, '%example.com%'));
    await db.delete(user).where(like(user.email, '%@example.com'));
  });

  test('should create a new bookmark', async () => {
    // First create a user
    const testUser: InsertUserDTO = {
      id: 'test-user-bookmark-1',
      email: 'bookmarks@example.com',
      name: 'Bookmark Test User',
      provider: 'github',
    };

    await db.insert(user).values(testUser).returning().get();

    const newBookmark: InsertBookmarkDTO = {
      id: 'test-bookmark-1',
      url: 'https://example.com/test-bookmark',
      slug: 'test-bookmark',
      title: 'Test Bookmark',
      description: 'This is a test bookmark',
      author: 'Test Author',
      thumbnail: 'https://example.com/thumbnail.jpg',
      userId: testUser.id,
    };

    const createdBookmark: BookmarkDTO = await db
      .insert(bookmark)
      .values(newBookmark)
      .returning()
      .get();

    expect(createdBookmark).toMatchObject({
      id: newBookmark.id,
      url: newBookmark.url,
      slug: newBookmark.slug,
      title: newBookmark.title,
      description: newBookmark.description,
      author: newBookmark.author,
      thumbnail: newBookmark.thumbnail,
      userId: newBookmark.userId,
      state: 'active', // default value
    });
    expect(createdBookmark.createdAt).toBeInstanceOf(Date);
    expect(createdBookmark.updatedAt).toBeInstanceOf(Date);
    expect(createdBookmark.publishedAt).toBeNull();
  });

  test('should read a bookmark by id', async () => {
    // First create a user
    const testUser: InsertUserDTO = {
      id: 'test-user-bookmark-2',
      email: 'bookmarks2@example.com',
      name: 'Bookmark Test User 2',
      provider: 'google',
    };

    await db.insert(user).values(testUser).returning().get();

    // Create a bookmark
    const newBookmark: InsertBookmarkDTO = {
      id: 'test-bookmark-2',
      url: 'https://example.com/test-bookmark-2',
      slug: 'test-bookmark-2',
      title: 'Test Bookmark 2',
      userId: testUser.id,
    };

    await db.insert(bookmark).values(newBookmark).returning().get();

    // Then read it back
    const foundBookmark: BookmarkDTO | undefined = await db.query.bookmark.findFirst({
      where: (bookmarkTable, { eq }) => eq(bookmarkTable.id, newBookmark.id),
    });

    expect(foundBookmark).toBeDefined();
    expect(foundBookmark).toMatchObject({
      id: newBookmark.id,
      url: newBookmark.url,
      slug: newBookmark.slug,
      title: newBookmark.title,
      userId: newBookmark.userId,
    });
  });

  test('should allow multiple bookmarks with same URL for same user', async () => {
    // First create a user
    const testUser: InsertUserDTO = {
      id: 'test-user-bookmark-3',
      email: 'bookmarks3@example.com',
      name: 'Bookmark Test User 3',
      provider: 'discord',
    };

    await db.insert(user).values(testUser).returning().get();

    const bookmark1: InsertBookmarkDTO = {
      id: 'test-bookmark-duplicate-1',
      url: 'https://example.com/duplicate-url',
      slug: 'duplicate-url-1',
      title: 'First Bookmark',
      userId: testUser.id,
    };

    const bookmark2: InsertBookmarkDTO = {
      id: 'test-bookmark-duplicate-2',
      url: 'https://example.com/duplicate-url',
      slug: 'duplicate-url-2',
      title: 'Second Bookmark',
      userId: testUser.id,
    };

    // Both bookmarks should succeed - no URL uniqueness constraint
    const createdBookmark1 = await db.insert(bookmark).values(bookmark1).returning().get();
    const createdBookmark2 = await db.insert(bookmark).values(bookmark2).returning().get();

    expect(createdBookmark1.url).toBe(bookmark1.url);
    expect(createdBookmark2.url).toBe(bookmark2.url);
    expect(createdBookmark1.url).toBe(createdBookmark2.url);
  });

  test('should create bookmark with user relationship', async () => {
    // First create a user
    const testUser: InsertUserDTO = {
      id: 'test-user-bookmark-4',
      email: 'bookmarks4@example.com',
      name: 'Bookmark Test User 4',
      provider: 'github',
    };

    const createdUser = await db.insert(user).values(testUser).returning().get();

    // Create a bookmark
    const newBookmark: InsertBookmarkDTO = {
      id: 'test-bookmark-4',
      url: 'https://example.com/test-bookmark-4',
      slug: 'test-bookmark-4',
      title: 'Test Bookmark 4',
      userId: createdUser.id,
    };

    const createdBookmark = await db.insert(bookmark).values(newBookmark).returning().get();

    // Query bookmark with user relationship
    const bookmarkWithUser = await db.query.bookmark.findFirst({
      where: (bookmarkTable, { eq }) => eq(bookmarkTable.id, createdBookmark.id),
      with: {
        user: true,
      },
    });

    expect(bookmarkWithUser).toBeDefined();
    expect(bookmarkWithUser?.user).toBeDefined();
    expect(bookmarkWithUser?.user.id).toBe(createdUser.id);
    expect(bookmarkWithUser?.user.email).toBe(createdUser.email);
  });

  test('should enforce foreign key constraint for userId', async () => {
    const newBookmark: InsertBookmarkDTO = {
      id: 'test-bookmark-5',
      url: 'https://example.com/test-bookmark-5',
      slug: 'test-bookmark-5',
      title: 'Test Bookmark 5',
      userId: 'non-existent-user-id',
    };

    // Should fail due to foreign key constraint
    await expect(db.insert(bookmark).values(newBookmark).returning().get()).rejects.toThrow();
  });

  test('should update bookmark information', async () => {
    // First create a user
    const testUser: InsertUserDTO = {
      id: 'test-user-bookmark-6',
      email: 'bookmarks6@example.com',
      name: 'Bookmark Test User 6',
      provider: 'google',
    };

    await db.insert(user).values(testUser).returning().get();

    // Create a bookmark
    const newBookmark: InsertBookmarkDTO = {
      id: 'test-bookmark-6',
      url: 'https://example.com/test-bookmark-6',
      slug: 'test-bookmark-6',
      title: 'Original Title',
      userId: testUser.id,
    };

    const createdBookmark = await db.insert(bookmark).values(newBookmark).returning().get();

    // Then update it
    const updatedBookmark = await db
      .update(bookmark)
      .set({
        title: 'Updated Title',
        description: 'Updated description',
        publishedAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      })
      .where(eq(bookmark.id, createdBookmark.id))
      .returning()
      .get();

    expect(updatedBookmark.title).toBe('Updated Title');
    expect(updatedBookmark.description).toBe('Updated description');
    expect(updatedBookmark.publishedAt).toEqual(new Date('2024-01-01'));
    expect(updatedBookmark.updatedAt.getTime()).toBeGreaterThan(
      createdBookmark.updatedAt.getTime()
    );
  });

  test('should cascade delete when user is deleted', async () => {
    // First create a user
    const testUser: InsertUserDTO = {
      id: 'test-user-bookmark-7',
      email: 'bookmarks7@example.com',
      name: 'Bookmark Test User 7',
      provider: 'discord',
    };

    const createdUser = await db.insert(user).values(testUser).returning().get();

    // Create a bookmark
    const newBookmark: InsertBookmarkDTO = {
      id: 'test-bookmark-7',
      url: 'https://example.com/test-bookmark-7',
      slug: 'test-bookmark-7',
      title: 'Test Bookmark 7',
      userId: createdUser.id,
    };

    const createdBookmark = await db.insert(bookmark).values(newBookmark).returning().get();

    // Verify bookmark exists
    let foundBookmark = await db.query.bookmark.findFirst({
      where: (bookmarkTable, { eq }) => eq(bookmarkTable.id, createdBookmark.id),
    });
    expect(foundBookmark).toBeDefined();

    // Delete the user
    await db.delete(user).where(eq(user.id, createdUser.id));

    // Bookmark should be cascade deleted
    foundBookmark = await db.query.bookmark.findFirst({
      where: (bookmarkTable, { eq }) => eq(bookmarkTable.id, createdBookmark.id),
    });
    expect(foundBookmark).toBeUndefined();
  });
});
