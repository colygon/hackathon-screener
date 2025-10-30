import { config } from 'dotenv';
import { sql } from '@vercel/postgres';
import { getAllApplicants } from '../lib/db';

// Load environment variables
config({ path: '.env.local' });

// Common student email patterns
const STUDENT_EMAIL_PATTERNS = [
  /\.edu$/i,              // .edu domains
  /\.ac\.[a-z]{2}$/i,     // .ac.uk, .ac.in, etc.
  /\.edu\.[a-z]{2}$/i,    // .edu.au, .edu.in, etc.
  /@student\./i,          // student.something.com
  /@students\./i,         // students.something.com
];

function isStudentEmail(email: string): boolean {
  if (!email) return false;
  
  // Check against patterns
  for (const pattern of STUDENT_EMAIL_PATTERNS) {
    if (pattern.test(email)) {
      return true;
    }
  }
  
  return false;
}

async function detectStudents() {
  console.log('📊 Fetching applicants from database...\n');
  const result = await getAllApplicants();
  
  if (!result.success || !result.data) {
    console.error('Failed to fetch applicants:', result.error);
    process.exit(1);
  }

  const applicants = result.data;
  console.log(`Found ${applicants.length} applicants\n`);
  console.log('Detecting students from email addresses...\n');

  let updated = 0;
  let students = 0;
  let nonStudents = 0;

  for (const applicant of applicants) {
    try {
      const isStudent = isStudentEmail(applicant.email);
      
      if (isStudent) {
        students++;
      } else {
        nonStudents++;
      }
      
      await sql`
        UPDATE applicants 
        SET is_student = ${isStudent}, updated_at = CURRENT_TIMESTAMP
        WHERE api_id = ${applicant.api_id}
      `;
      
      console.log(`✓ ${applicant.name}: ${isStudent ? 'Student' : 'Non-student'} (${applicant.email})`);
      updated++;
      
    } catch (error: any) {
      console.error(`✗ Error for ${applicant.name}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Student Detection Complete!');
  console.log(`   Updated: ${updated} applicants`);
  console.log(`\n   Distribution:`);
  console.log(`   - Students: ${students}`);
  console.log(`   - Non-students: ${nonStudents}`);
  console.log('='.repeat(60));
}

detectStudents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Detection failed:', error);
    process.exit(1);
  });
