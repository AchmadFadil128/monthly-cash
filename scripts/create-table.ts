import { config } from 'dotenv';
import path from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';
import { sql } from 'drizzle-orm';

// Load environment variables from .env files
config({ path: path.resolve(process.cwd(), '.env.local') });
config({ path: path.resolve(process.cwd(), '.env') });

async function createTable() {
  try {
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('💡 Please set DATABASE_URL in your .env or .env.local file');
      process.exit(1);
    }

    // Create a new PostgreSQL pool
    const pool = new Pool({
      connectionString: databaseUrl,
    });

    // Create the Drizzle ORM instance
    const db = drizzle(pool, { schema });

    // Check if table exists first
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
      ) AS table_exists;
    `);

    const tableExists = result?.rows?.[0]?.table_exists;

    if (tableExists) {
      console.log('✅ Transactions table already exists');
    } else {
      console.log('💡 Transactions table does not exist');
      console.log('💡 Creating table using drizzle-kit...');
      console.log('💡 Please run: npx drizzle-kit push');
    }

    await pool.end();
  } catch (error: any) {
    console.error('❌ Error checking table:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  createTable();
}