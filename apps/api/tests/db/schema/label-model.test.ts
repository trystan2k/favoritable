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

describe('Label Model Tests', () => {
  let testUser: UserDTO;
  let db: Awaited<ReturnType<typeof setupTestDatabase>>;

  beforeAll(async () => {
    db = await setupTestDatabase();

    // Create a test user for our label tests
    const newUser: InsertUserDTO = {
      id: 'test-user-labels',
      email: 'labels@example.com',
      name: 'Labels Test User',
      provider: 'github',
    };

    testUser = await db.insert(user).values(newUser).returning().get();
  });

  afterAll(async () => {
    // Clean up test user
    await db.delete(user).where(eq(user.id, 'test-user-labels'));
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    // Clean up any test labels before each test
    await db.delete(label).where(like(label.name, 'Test%'));
  });

  test('should create a new label', async () => {
    const newLabel: InsertLabelDTO = {
      id: 'test-label-1',
      name: 'Test Label',
      color: '#ff0000',
      userId: testUser.id,
    };

    const createdLabel: LabelDTO = await db
      .insert(label)
      .values(newLabel)
      .returning()
      .get();

    expect(createdLabel).toMatchObject({
      id: newLabel.id,
      name: newLabel.name,
      color: newLabel.color,
      userId: newLabel.userId,
    });
    expect(createdLabel.createdAt).toBeInstanceOf(Date);
    expect(createdLabel.updatedAt).toBeInstanceOf(Date);
  });

  test('should read a label by id', async () => {
    // First create a label
    const newLabel: InsertLabelDTO = {
      id: 'test-label-2',
      name: 'Test Label 2',
      color: '#00ff00',
      userId: testUser.id,
    };

    await db.insert(label).values(newLabel).returning().get();

    // Then read it back
    const foundLabel: LabelDTO | undefined = await db.query.label.findFirst({
      where: (labelTable, { eq }) => eq(labelTable.id, newLabel.id),
    });

    expect(foundLabel).toBeDefined();
    expect(foundLabel).toMatchObject({
      id: newLabel.id,
      name: newLabel.name,
      color: newLabel.color,
      userId: newLabel.userId,
    });
  });

  test('should create a label without color (color is optional)', async () => {
    const newLabel: InsertLabelDTO = {
      id: 'test-label-3',
      name: 'Test Label No Color',
      userId: testUser.id,
    };

    const createdLabel: LabelDTO = await db
      .insert(label)
      .values(newLabel)
      .returning()
      .get();

    expect(createdLabel.name).toBe(newLabel.name);
    expect(createdLabel.color).toBeNull();
    expect(createdLabel.userId).toBe(newLabel.userId);
  });

  test('should enforce userId as required field', async () => {
    const labelWithoutUserId = {
      id: 'test-label-4',
      name: 'Test Label No User',
      color: '#0000ff',
      // userId is missing
    };

    // This should fail due to database constraint
    await expect(
      db
        .insert(label)
        .values(labelWithoutUserId as never)
        .returning()
        .get()
    ).rejects.toThrow();
  });

  test('should enforce foreign key constraint with user', async () => {
    const labelWithInvalidUser: InsertLabelDTO = {
      id: 'test-label-5',
      name: 'Test Label Invalid User',
      color: '#ff00ff',
      userId: 'non-existent-user-id',
    };

    // Should fail due to foreign key constraint
    await expect(
      db.insert(label).values(labelWithInvalidUser).returning().get()
    ).rejects.toThrow();
  });

  test('should retrieve label with user relationship', async () => {
    // Create a label
    const newLabel: InsertLabelDTO = {
      id: 'test-label-6',
      name: 'Test Label With User',
      color: '#ffff00',
      userId: testUser.id,
    };

    await db.insert(label).values(newLabel).returning().get();

    // Query label with user relationship
    const labelWithUser = await db.query.label.findFirst({
      where: (labelTable, { eq }) => eq(labelTable.id, newLabel.id),
      with: {
        user: true,
      },
    });

    expect(labelWithUser).toBeDefined();
    expect(labelWithUser?.user).toBeDefined();
    expect(labelWithUser?.user.id).toBe(testUser.id);
    expect(labelWithUser?.user.email).toBe(testUser.email);
  });

  test('should cascade delete labels when user is deleted', async () => {
    // Create a temporary user
    const tempUser: InsertUserDTO = {
      id: 'temp-user-cascade',
      email: 'temp@example.com',
      name: 'Temporary User',
      provider: 'github',
    };

    const createdTempUser = await db
      .insert(user)
      .values(tempUser)
      .returning()
      .get();

    // Create a label associated with the temporary user
    const labelForTempUser: InsertLabelDTO = {
      id: 'test-label-cascade',
      name: 'Test Label Cascade',
      color: '#000000',
      userId: createdTempUser.id,
    };

    await db.insert(label).values(labelForTempUser).returning().get();

    // Delete the user
    await db.delete(user).where(eq(user.id, createdTempUser.id));

    // Check that the label was also deleted due to cascade
    const deletedLabel = await db.query.label.findFirst({
      where: (labelTable, { eq }) => eq(labelTable.id, labelForTempUser.id),
    });

    expect(deletedLabel).toBeUndefined();
  });
});
