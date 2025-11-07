import { config } from 'dotenv';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { insertApplicant } from '../lib/db';

// Load environment variables
config({ path: '.env.local' });

async function import50kCsv() {
  const csvPath = path.join(process.cwd(), '50k.csv');
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
  let errors = 0;

  for (const record of records as any[]) {
    // Skip if no email
    if (!record.email || record.email.trim() === '') {
      skipped++;
      continue;
    }

    const approvalStatus = record.approval_status;
    const linkedinResponse = record['What is your LinkedIn profile?'];
    
    // Extract LinkedIn URL
    let linkedinUrl = null;
    if (linkedinResponse && linkedinResponse.trim() !== '') {
      linkedinUrl = linkedinResponse.includes('linkedin.com')
        ? linkedinResponse
        : `https://linkedin.com${linkedinResponse}`;
    }

    try {
      await insertApplicant({
        api_id: record.api_id,
        name: record.name || `${record.first_name || ''} ${record.last_name || ''}`.trim() || 'Unknown',
        email: record.email,
        phone_number: record.phone_number || null,
        approval_status: approvalStatus || 'pending',
        github_username: null,
        github_url: null,
        linkedin_url: linkedinUrl,
        track: null,
        build_plan: null,
        screening_status: 'pending',
        has_opensource_contributions: false,
        public_repos: 0,
        forked_repos: 0,
        recent_contributions: 0,
      });
      
      imported++;
      
      if (imported % 100 === 0) {
        console.log(`Progress: ${imported} imported, ${skipped} skipped, ${errors} errors`);
      }
    } catch (error: any) {
      if (error.message?.includes('duplicate key')) {
        skipped++;
        if ((imported + skipped) % 100 === 0) {
          console.log(`Progress: ${imported} imported, ${skipped} skipped (duplicates), ${errors} errors`);
        }
      } else {
        console.error(`✗ Error importing ${record.name}:`, error.message);
        errors++;
      }
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total processed: ${imported + skipped + errors}`);
}

import50kCsv()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
