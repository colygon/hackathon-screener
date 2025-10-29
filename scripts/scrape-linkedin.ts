import { config } from 'dotenv';
import { getAllApplicants, updateApplicantLinkedIn } from '../lib/db';
import { LinkedInScraper } from '../lib/linkedin';

// Load environment variables
config({ path: '.env.local' });

async function scrapeLinkedInProfiles() {
  console.log('📊 Fetching applicants from database...\n');
  const result = await getAllApplicants();
  
  if (!result.success || !result.data) {
    console.error('Failed to fetch applicants:', result.error);
    process.exit(1);
  }

  const applicants = result.data;
  const applicantsWithLinkedIn = applicants.filter(
    (a: any) => a.linkedin_url && !a.linkedin_scraped_at
  );

  console.log(`Found ${applicantsWithLinkedIn.length} applicants with LinkedIn profiles to scrape\n`);
  
  if (applicantsWithLinkedIn.length === 0) {
    console.log('✅ All LinkedIn profiles already scraped!');
    return;
  }

  console.log('Starting LinkedIn scraping...\n');
  console.log('⚠️  Note: LinkedIn scraping may have limitations due to bot protection.');
  console.log('For better results, consider using a service like Proxycurl.\n');

  const scraper = new LinkedInScraper();
  let completed = 0;
  let failed = 0;

  for (const applicant of applicantsWithLinkedIn) {
    try {
      console.log(`🔍 Scraping: ${applicant.name}`);
      console.log(`   URL: ${applicant.linkedin_url}`);
      
      const linkedinData = await scraper.scrapeProfile(applicant.linkedin_url);
      
      if (linkedinData.error) {
        console.log(`  ✗ Error: ${linkedinData.error}`);
        failed++;
      } else {
        await updateApplicantLinkedIn(applicant.api_id, linkedinData);
        
        console.log(`  ✓ Graduation: ${linkedinData.graduation_year || 'N/A'}`);
        console.log(`  ✓ Company: ${linkedinData.company || 'N/A'}`);
        console.log(`  ✓ Title: ${linkedinData.job_title || 'N/A'}`);
        completed++;
      }
      
      // Rate limiting: wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error: any) {
      console.error(`  ✗ Exception: ${error.message}`);
      failed++;
    }
    
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('✅ LinkedIn Scraping Complete!');
  console.log(`   Completed: ${completed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${applicantsWithLinkedIn.length}`);
  console.log('='.repeat(60));
}

scrapeLinkedInProfiles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Scraping failed:', error);
    process.exit(1);
  });
