import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function addLinkedInColumns() {
  try {
    console.log('Adding LinkedIn columns to applicants table...');
    
    await sql`
      ALTER TABLE applicants 
      ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
      ADD COLUMN IF NOT EXISTS company VARCHAR(255),
      ADD COLUMN IF NOT EXISTS job_title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS linkedin_scraped_at TIMESTAMP
    `;
    
    console.log('✅ Successfully added LinkedIn columns!');
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
}

addLinkedInColumns()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
