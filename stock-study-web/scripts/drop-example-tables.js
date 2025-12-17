import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function dropTables() {
  try {
    console.log('Dropping pre-existing example tables...');

    await sql`DROP TABLE IF EXISTS invoices CASCADE`;
    console.log('✓ Dropped invoices table');

    await sql`DROP TABLE IF EXISTS customers CASCADE`;
    console.log('✓ Dropped customers table');

    await sql`DROP TABLE IF EXISTS revenue CASCADE`;
    console.log('✓ Dropped revenue table');

    console.log('\n✅ All pre-existing tables dropped successfully!');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

dropTables();
