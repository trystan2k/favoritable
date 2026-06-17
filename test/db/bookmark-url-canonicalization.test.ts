import type { InArgs, InStatement, ResultSet, createClient } from '@libsql/client';
import { describe, expect, test, vi } from 'vitest';

import { canonicalizeBookmarkUrls } from '../../scripts/lib/bookmark-url-canonicalization';

type SqlClient = Pick<ReturnType<typeof createClient>, 'execute'>;

function createResult(rows: unknown): ResultSet {
  return {
    columns: [],
    columnTypes: [],
    lastInsertRowid: undefined,
    rows,
    rowsAffected: 0,
    toJSON() {
      return {
        columns: this.columns,
        columnTypes: this.columnTypes,
        lastInsertRowid: this.lastInsertRowid,
        rows: this.rows,
        rowsAffected: this.rowsAffected
      };
    }
  } as ResultSet;
}

type MockBookmarkRow = {
  id: string;
  url: string;
  userId: string;
};

function createMockClient(
  rows: MockBookmarkRow[],
  options: {
    failUpdateId?: string;
  } = {}
) {
  const commands: string[] = [];
  const updateIds: string[] = [];

  const executeMock = vi.fn<SqlClient['execute']>(
    async (stmtOrSql: InStatement | string, args?: InArgs): Promise<ResultSet> => {
      const statement = typeof stmtOrSql === 'string' ? stmtOrSql : stmtOrSql.sql;
      const statementArgs =
        typeof stmtOrSql === 'string' ? args : 'args' in stmtOrSql ? stmtOrSql.args : undefined;

      commands.push(statement);

      if (statement.includes("sqlite_master where type = 'table'")) {
        return createResult([{ 1: 1 }]);
      }

      if (statement.includes('select id, user_id, url')) {
        return createResult(
          rows.map((row) => ({
            id: row.id,
            url: row.url,
            user_id: row.userId
          }))
        );
      }

      if (statement === 'begin' || statement === 'commit' || statement === 'rollback') {
        return createResult([]);
      }

      if (statement === 'update bookmark set url = ? where id = ?') {
        const updateIdArg = Array.isArray(statementArgs) ? statementArgs[1] : undefined;
        const updateId = typeof updateIdArg === 'string' ? updateIdArg : '';

        updateIds.push(updateId);

        if (updateId === options.failUpdateId) {
          throw new Error('update failed');
        }

        return createResult([]);
      }

      throw new Error(`Unexpected statement: ${statement}`);
    }
  );
  const client: SqlClient = {
    execute: executeMock as SqlClient['execute']
  };

  return {
    client,
    commands,
    updateIds
  };
}

describe('bookmark url canonicalization transaction', () => {
  test('applies url updates sequentially before commit', async () => {
    const { client, commands, updateIds } = createMockClient([
      { id: 'bookmark-1', url: 'https://example.com', userId: 'user-1' },
      { id: 'bookmark-2', url: 'https://example.com/path', userId: 'user-1' },
      { id: 'bookmark-3', url: 'https://example.org', userId: 'user-2' }
    ]);

    const summary = await canonicalizeBookmarkUrls(client, { applyChanges: true });

    expect(summary.updates.map((update) => update.id)).toEqual(['bookmark-1', 'bookmark-3']);
    expect(updateIds).toEqual(['bookmark-1', 'bookmark-3']);
    expect(commands.at(-1)).toBe('commit');
  });

  test('rolls back after first failed update without starting later updates', async () => {
    const { client, commands, updateIds } = createMockClient(
      [
        { id: 'bookmark-1', url: 'https://example.com', userId: 'user-1' },
        { id: 'bookmark-2', url: 'https://example.net', userId: 'user-1' },
        { id: 'bookmark-3', url: 'https://example.org', userId: 'user-2' }
      ],
      { failUpdateId: 'bookmark-2' }
    );

    await expect(canonicalizeBookmarkUrls(client, { applyChanges: true })).rejects.toThrow(
      'update failed'
    );

    expect(updateIds).toEqual(['bookmark-1', 'bookmark-2']);
    expect(commands.at(-1)).toBe('rollback');
    expect(commands).not.toContain('commit');
  });
});
