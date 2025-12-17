import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function checkUsersTable() {
  try {
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
      ORDER BY ordinal_position
    `;

    console.log('\nColumns in users table:');
    console.log('======================');
    columns.forEach(({ column_name, data_type }) => {
      console.log(`- ${column_name}: ${data_type}`);
    });
    console.log('');
  } catch (error) {
    console.error('Error checking users table:', error);
  } finally {
    await sql.end();
  }
}

checkUsersTable();
