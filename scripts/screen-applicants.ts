import { config } from 'dotenv';
import { getAllApplicants, updateApplicantScreening } from '../lib/db';
import { GitHubScreener } from '../lib/github';

// Load environment variables
config({ path: '.env.local' });

async function screenApplicants() {
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.error('❌ GITHUB_TOKEN not found in environment variables');
    process.exit(1);
  }

  const screener = new GitHubScreener(githubToken);
  
  console.log('📊 Fetching applicants from database...\n');
  const result = await getAllApplicants();
  
  if (!result.success || !result.data) {
    console.error('Failed to fetch applicants:', result.error);
    process.exit(1);
  }

  const applicants = result.data;
  const pendingApplicants = applicants.filter(
    (a: any) => a.screening_status === 'pending' && a.github_username
  );

  console.log(`Found ${pendingApplicants.length} applicants pending screening\n`);
  console.log('Starting GitHub screening...\n');

  let completed = 0;
  let failed = 0;

  for (const applicant of pendingApplicants) {
    try {
      console.log(`🔍 Screening: ${applicant.name} (@${applicant.github_username})`);
      
      const screeningResult = await screener.checkUser(applicant.github_username);
      
      if (!screeningResult.github_check_error) {
        await updateApplicantScreening(applicant.api_id, {
          has_opensource_contributions: screeningResult.has_opensource_contributions || false,
          public_repos: screeningResult.public_repos || 0,
          forked_repos: screeningResult.forked_repos || 0,
          recent_contributions: screeningResult.recent_contributions || 0,
          screening_status: 'completed',
          screening_error: null,
        });
        
        completed++;
        console.log(`  ✓ Repos: ${screeningResult.public_repos}, Contributions: ${screeningResult.recent_contributions}`);
      } else {
        await updateApplicantScreening(applicant.api_id, {
          screening_status: 'failed',
          screening_error: screeningResult.github_check_error || 'Unknown error',
          has_opensource_contributions: false,
          public_repos: 0,
          forked_repos: 0,
          recent_contributions: 0,
        });
        
        failed++;
        console.log(`  ✗ Error: ${screeningResult.github_check_error}`);
      }
      
      // Rate limiting: wait 1 second between requests to avoid hitting GitHub API limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`  ✗ Exception: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Screening Complete!');
  console.log(`   Completed: ${completed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${pendingApplicants.length}`);
  console.log('='.repeat(60));
}

screenApplicants()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Screening failed:', error);
    process.exit(1);
  });
