import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function listTables() {
  try {
    const tables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log('\nTables in database:');
    console.log('===================');
    if (tables.length === 0) {
      console.log('No tables found');
    } else {
      tables.forEach(({ tablename }) => {
        console.log(`- ${tablename}`);
      });
    }
    console.log('');
  } catch (error) {
    console.error('Error listing tables:', error);
  } finally {
    await sql.end();
  }
}

listTables();
