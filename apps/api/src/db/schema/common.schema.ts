import { sql } from "drizzle-orm/sql";
import { integer } from "drizzle-orm/sqlite-core";

export const trackingDates = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
}
