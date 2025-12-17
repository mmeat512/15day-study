import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function dropAllTables() {
  try {
    console.log('Dropping all pre-existing example tables...\n');

    await sql`DROP TABLE IF EXISTS users CASCADE`;
    console.log('✓ Dropped users table');

    console.log('\n✅ All example tables dropped successfully!');
    console.log('Ready to apply Drizzle schema.\n');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

dropAllTables();
