import { createClient } from '@libsql/client';

import { resolveDatabaseCredentials } from '../src/db/database-url.ts';
import {
  BookmarkUrlCanonicalizationError,
  canonicalizeBookmarkUrls,
  formatCanonicalDuplicateGroup
} from './lib/bookmark-url-canonicalization.ts';

const applyChanges = process.argv.includes('--apply');
const databaseCredentials = resolveDatabaseCredentials();

function writeStderrLine(message: string) {
  process.stderr.write(`${message}\n`);
}

function writeStdoutLine(message: string) {
  process.stdout.write(`${message}\n`);
}

async function main() {
  const client = createClient(databaseCredentials);

  try {
    const summary = await canonicalizeBookmarkUrls(client, {
      applyChanges,
      failOnDuplicates: applyChanges
    });

    if (summary.updates.length === 0 && summary.duplicateGroups.length === 0) {
      writeStdoutLine('No bookmark URL canonicalization changes needed.');
      return;
    }

    if (!applyChanges) {
      writeStdoutLine(
        `Bookmark URL canonicalization dry run. Rows to update: ${summary.updates.length}.`
      );

      for (const update of summary.updates) {
        writeStdoutLine(`  ${update.id} (${update.userId})`);
        writeStdoutLine(`    from: ${update.url}`);
        writeStdoutLine(`    to:   ${update.canonicalUrl}`);
      }

      if (summary.duplicateGroups.length > 0) {
        writeStdoutLine(
          'Canonical duplicate groups detected. Resolve these before running migrations:'
        );

        for (const group of summary.duplicateGroups) {
          writeStdoutLine(formatCanonicalDuplicateGroup(group));
        }
      }

      writeStdoutLine('Re-run with --apply to write canonical URLs without deleting any rows.');
      return;
    }

    writeStdoutLine(`Applied canonical bookmark URLs for ${summary.updates.length} rows.`);
  } catch (error) {
    if (error instanceof BookmarkUrlCanonicalizationError) {
      writeStderrLine(error.message);
      process.exitCode = 1;
      return;
    }

    throw error;
  } finally {
    client.close();
  }
}

await main();
