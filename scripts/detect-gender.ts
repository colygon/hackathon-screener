import { config } from 'dotenv';
import { getAllApplicants } from '../lib/db';
import { detectGender, updateApplicantGender } from '../lib/gender';

// Load environment variables
config({ path: '.env.local' });

async function detectGenderForAll() {
  console.log('📊 Fetching applicants from database...\n');
  const result = await getAllApplicants();
  
  if (!result.success || !result.data) {
    console.error('Failed to fetch applicants:', result.error);
    process.exit(1);
  }

  const applicants = result.data;
  console.log(`Found ${applicants.length} applicants\n`);
  console.log('Detecting gender from names...\n');

  let updated = 0;
  const genderCounts = {
    'Male': 0,
    'Female': 0,
    'Non-binary/Unknown': 0,
  };

  for (const applicant of applicants) {
    try {
      const gender = detectGender(applicant.name);
      genderCounts[gender]++;
      
      await updateApplicantGender(applicant.api_id, gender);
      console.log(`✓ ${applicant.name}: ${gender}`);
      updated++;
      
    } catch (error: any) {
      console.error(`✗ Error for ${applicant.name}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Gender Detection Complete!');
  console.log(`   Updated: ${updated} applicants`);
  console.log(`\n   Gender Distribution:`);
  console.log(`   - Male: ${genderCounts['Male']}`);
  console.log(`   - Female: ${genderCounts['Female']}`);
  console.log(`   - Non-binary/Unknown: ${genderCounts['Non-binary/Unknown']}`);
  console.log('='.repeat(60));
}

detectGenderForAll()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Detection failed:', error);
    process.exit(1);
  });
