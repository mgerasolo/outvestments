import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database connection URL
 * Falls back to local development credentials if DATABASE_URL is not set
 */
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://outvestments:outvestments_dev@localhost:5432/outvestments";

/**
 * PostgreSQL client configuration
 * - max: Maximum number of connections in the pool
 * - idle_timeout: Close connections after this many seconds of inactivity
 * - connect_timeout: Timeout for establishing new connections
 */
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: false,
  prepare: false,
});

/**
 * Drizzle ORM database instance
 * Includes all schema definitions for type-safe queries
 */
export const db = drizzle(client, { schema });

/**
 * Export schema for use in queries
 */
export * from "./schema";

/**
 * Type representing the database instance
 */
export type Database = typeof db;
