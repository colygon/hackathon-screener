import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function addStudentColumn() {
  try {
    console.log('Adding is_student column to applicants table...');
    
    await sql`
      ALTER TABLE applicants 
      ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT FALSE
    `;
    
    console.log('✅ Successfully added is_student column!');
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addStudentColumn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
