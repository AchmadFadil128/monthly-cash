import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/db/schema';
import { db as mockDb } from '@/db/mock';

// Use mock database in development if no DATABASE_URL is provided
const db = process.env.DATABASE_URL ? (() => {
  // Database connection URL - using environment variables
  const databaseUrl = process.env.DATABASE_URL!;

  // Create a new PostgreSQL pool
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  // Create the Drizzle ORM instance with the PostgreSQL pool
  return drizzle(pool, { schema });
})() : mockDb;

export { db };