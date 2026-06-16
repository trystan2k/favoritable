import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { createClient } from '@libsql/client';

const execFileAsync = promisify(execFile);

export type BootstrappedTempDatabase = {
  client: ReturnType<typeof createClient>;
  databaseUrl: string;
  tempDirectory: string;
};

export async function createBootstrappedTempDatabase(
  prefix: string,
  databaseFileName: string
): Promise<BootstrappedTempDatabase> {
  const tempDirectory = await mkdtemp(path.join(tmpdir(), prefix));
  const databasePath = path.join(tempDirectory, databaseFileName);
  const databaseUrl = `file:${databasePath}`;

  await execFileAsync('node', ['./scripts/bootstrap-db.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl
    }
  });

  const client = createClient({ url: databaseUrl });

  await client.execute('PRAGMA foreign_keys = ON');

  return {
    client,
    databaseUrl,
    tempDirectory
  };
}

export async function disposeBootstrappedTempDatabase(
  database: BootstrappedTempDatabase | null
): Promise<void> {
  if (!database) {
    return;
  }

  database.client.close();
  await rm(database.tempDirectory, { force: true, recursive: true });
}
