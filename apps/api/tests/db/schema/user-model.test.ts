import { eq, like } from 'drizzle-orm';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { db } from '../../../src/db/index.js';
import {
  type InsertUserDTO,
  type UserDTO,
  user,
} from '../../../src/db/schema/user.schema.js';
import {
  setupTestDatabase,
  teardownTestDatabase,
} from '../../test-db-setup.js';

describe('User Model Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    // Clean up any test users before each test
    await db.delete(user).where(like(user.email, '%@example.com'));
  });

  test('should create a new user', async () => {
    const newUser: InsertUserDTO = {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
      provider: 'github',
    };

    const createdUser: UserDTO = await db
      .insert(user)
      .values(newUser)
      .returning()
      .get();

    expect(createdUser).toMatchObject({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatarUrl: newUser.avatarUrl,
      provider: newUser.provider,
    });
    expect(createdUser.createdAt).toBeInstanceOf(Date);
    expect(createdUser.updatedAt).toBeInstanceOf(Date);
  });

  test('should read a user by id', async () => {
    // First create a user
    const newUser: InsertUserDTO = {
      id: 'test-user-2',
      email: 'test2@example.com',
      name: 'Test User 2',
      avatarUrl: null,
      provider: 'google',
    };

    await db.insert(user).values(newUser).returning().get();

    // Then read it back
    const foundUser: UserDTO | undefined = await db.query.user.findFirst({
      where: (userTable, { eq }) => eq(userTable.id, newUser.id),
    });

    expect(foundUser).toBeDefined();
    expect(foundUser).toMatchObject({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatarUrl: null,
      provider: newUser.provider,
    });
  });

  test('should read a user by email', async () => {
    // First create a user
    const newUser: InsertUserDTO = {
      id: 'test-user-3',
      email: 'test3@example.com',
      name: 'Test User 3',
      provider: 'discord',
    };

    await db.insert(user).values(newUser).returning().get();

    // Then read it back by email
    const foundUser: UserDTO | undefined = await db.query.user.findFirst({
      where: (userTable, { eq }) => eq(userTable.email, newUser.email),
    });

    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(newUser.email);
    expect(foundUser?.id).toBe(newUser.id);
  });

  test('should enforce email uniqueness', async () => {
    const user1: InsertUserDTO = {
      id: 'test-user-4',
      email: 'duplicate@example.com',
      name: 'First User',
      provider: 'github',
    };

    const user2: InsertUserDTO = {
      id: 'test-user-5',
      email: 'duplicate@example.com',
      name: 'Second User',
      provider: 'google',
    };

    // First user should succeed
    await db.insert(user).values(user1).returning().get();

    // Second user with same email should fail
    await expect(
      db.insert(user).values(user2).returning().get()
    ).rejects.toThrow();
  });

  test('should update user information', async () => {
    // First create a user
    const newUser: InsertUserDTO = {
      id: 'test-user-6',
      email: 'update@example.com',
      name: 'Original Name',
      provider: 'github',
    };

    const createdUser = await db.insert(user).values(newUser).returning().get();

    // Then update it
    const updatedUser = await db
      .update(user)
      .set({
        name: 'Updated Name',
        avatarUrl: 'https://example.com/new-avatar.png',
        updatedAt: new Date(),
      })
      .where(eq(user.id, createdUser.id))
      .returning()
      .get();

    expect(updatedUser.name).toBe('Updated Name');
    expect(updatedUser.avatarUrl).toBe('https://example.com/new-avatar.png');
    expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
      createdUser.updatedAt.getTime()
    );
  });

  test('should validate provider enum values at compile time', async () => {
    // Test valid providers
    const validProviders = ['github', 'google', 'discord'] as const;

    for (const provider of validProviders) {
      const newUser: InsertUserDTO = {
        id: `test-user-provider-${provider}`,
        email: `${provider}@example.com`,
        name: `${provider} Test User`,
        provider: provider,
      };

      const createdUser = await db
        .insert(user)
        .values(newUser)
        .returning()
        .get();
      expect(createdUser.provider).toBe(provider);

      // Clean up
      await db.delete(user).where(eq(user.id, createdUser.id));
    }
  });
});
