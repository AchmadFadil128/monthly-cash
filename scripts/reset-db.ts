import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
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

    console.log('🗑️  Dropping existing transactions table...');
    
    // Drop the transactions table and any related enums
    await db.execute(sql`DROP TABLE IF EXISTS transactions CASCADE;`);
    
    // Drop the kategori enum type if it exists
    await db.execute(sql`DROP TYPE IF EXISTS kategori CASCADE;`);
    
    console.log('✅ Table and enum dropped successfully');
    
    await pool.end();
    console.log('💡 Now run: npm run db:table');
  } catch (error: any) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  resetDatabase();
}