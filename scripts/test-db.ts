import { config } from 'dotenv';
import path from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';
import { count, sql } from 'drizzle-orm';
import { transactions } from '@/db/schema';

// Load environment variables from .env files
config({ path: path.resolve(process.cwd(), '.env.local') });
config({ path: path.resolve(process.cwd(), '.env') });

async function testDatabaseConnection() {
  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('💡 Please set DATABASE_URL in your .env or .env.local file');
    process.exit(1);
  }

  try {
    // Create a new PostgreSQL pool
    const pool = new Pool({
      connectionString: databaseUrl,
    });

    // Create the Drizzle ORM instance
    const db = drizzle(pool, { schema });

    // Check if table exists first
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
      ) AS table_exists;
    `);
    
    const tableExists = tableCheck?.rows?.[0]?.table_exists;

    if (!tableExists) {
      console.log('❌ Transactions table does not exist');
      console.log('💡 Run "npm run db:table" to create the table');
      await pool.end();
      return false;
    }

    // Try to connect and run a simple query
    const result = await db.select().from(transactions).limit(1);
    console.log('✅ Database connection successful');
    console.log('✅ Transactions table exists');
    console.log(`✅ Found ${result.length} sample records in the table`);
    
    // Check if table has records
    const totalRecords = await db.select({ count: count() }).from(transactions);
    console.log(`📊 Total records in transactions table: ${totalRecords[0].count}`);
    
    await pool.end();
    return true;
  } catch (error: any) {
    if (error.message.includes('does not exist') || error.message.includes('relation "transactions" does not exist')) {
      console.log('❌ Transactions table does not exist');
      console.log('💡 Run "npm run db:table" to create the table');
      return false;
    } else {
      console.log('❌ Database connection failed');
      console.log('Error:', error.message);
      return false;
    }
  }
}

if (require.main === module) {
  testDatabaseConnection().then(success => {
    if (!success) {
      process.exit(1);
    }
  });
}