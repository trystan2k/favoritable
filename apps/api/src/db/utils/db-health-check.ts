import { sql } from 'drizzle-orm';
import { logger } from '../../core/logger.js';
import { db } from '../index.js';

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    logger.info('Testing database connection...');

    await db.get(sql`SELECT 1 as test`);

    logger.info('✅ Database connection successful');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error instanceof Error ? error.message : error);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabaseConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Unexpected error during database health check:', error);
      process.exit(1);
    });
}
