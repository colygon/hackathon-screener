import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function addGenderColumn() {
  try {
    console.log('Adding gender column to applicants table...');
    
    await sql`
      ALTER TABLE applicants 
      ADD COLUMN IF NOT EXISTS gender VARCHAR(50)
    `;
    
    console.log('✅ Successfully added gender column!');
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addGenderColumn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
