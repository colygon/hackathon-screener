import { config } from 'dotenv';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { insertApplicant } from '../lib/db';

// Load environment variables
config({ path: '.env.local' });

async function importLumaCsv() {
  const csvPath = path.join(process.cwd(), 'luma.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Parse CSV with BOM handling
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  console.log(`Found ${records.length} records in CSV`);
  
  let imported = 0;
  let skipped = 0;

  for (const record of records) {
    // Only import approved or pending_approval records with GitHub usernames
    const approvalStatus = record.approval_status;
    const githubResponse = record['What is your GitHub?'];
    
    if (!githubResponse || githubResponse.trim() === '') {
      skipped++;
      continue;
    }

    // Extract GitHub username from response
    let githubUsername = githubResponse.trim();
    
    // Handle various GitHub URL formats
    if (githubUsername.includes('github.com/')) {
      const match = githubUsername.match(/github\.com\/([^\/\s]+)/);
      if (match) {
        githubUsername = match[1];
      }
    }
    
    // Remove leading @ if present
    githubUsername = githubUsername.replace(/^@/, '');

    try {
      await insertApplicant({
        api_id: record.api_id,
        name: record.name || `${record.first_name} ${record.last_name}`.trim(),
        email: record.email,
        phone_number: record.phone_number || null,
        approval_status: approvalStatus,
        github_username: githubUsername,
        github_url: `https://github.com/${githubUsername}`,
        linkedin_url: record['What is your LinkedIn profile?'] 
          ? record['What is your LinkedIn profile?'].includes('linkedin.com')
            ? record['What is your LinkedIn profile?']
            : `https://linkedin.com${record['What is your LinkedIn profile?']}`
          : null,
        track: record['Which track are you doing?'] || null,
        build_plan: record['What do you plan to build? (you can change it later)'] || null,
        screening_status: 'pending',
      });
      
      imported++;
      console.log(`✓ Imported: ${record.name} (@${githubUsername})`);
    } catch (error: any) {
      if (error.message?.includes('duplicate key')) {
        console.log(`⊘ Skipped (duplicate): ${record.name}`);
        skipped++;
      } else {
        console.error(`✗ Error importing ${record.name}:`, error.message);
        skipped++;
      }
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
}

importLumaCsv()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
