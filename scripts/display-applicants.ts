import { config } from 'dotenv';
import { getAllApplicants } from '../lib/db';

// Load environment variables
config({ path: '.env.local' });

async function displayApplicants() {
  try {
    const result = await getAllApplicants();
    
    if (!result.success || !result.data) {
      console.error('Failed to fetch applicants:', result.error);
      process.exit(1);
    }
    
    const applicants = result.data;
    
    console.log(`\n📊 Total Applicants: ${applicants.length}\n`);
    
    if (applicants.length === 0) {
      console.log('No applicants found in database.');
      return;
    }

    // Group by screening status
    const statusGroups = applicants.reduce((acc, app) => {
      const status = app.screening_status || 'pending';
      if (!acc[status]) acc[status] = [];
      acc[status].push(app);
      return acc;
    }, {} as Record<string, typeof applicants>);

    console.log('Status Summary:');
    Object.entries(statusGroups).forEach(([status, apps]) => {
      console.log(`  ${status}: ${apps.length}`);
    });

    console.log('\n' + '='.repeat(150));
    console.log('| Name'.padEnd(25) + '| GitHub'.padEnd(20) + '| Track'.padEnd(15) + '| Status'.padEnd(15) + '| Repos'.padEnd(10) + '| Contributions'.padEnd(15) + '| Build Plan'.padEnd(50) + '|');
    console.log('='.repeat(150));

    applicants.forEach((app) => {
      const name = (app.name || 'N/A').substring(0, 23).padEnd(25);
      const github = (app.github_username || 'N/A').substring(0, 18).padEnd(20);
      const track = (app.track || 'N/A').substring(0, 13).padEnd(15);
      const status = (app.screening_status || 'pending').substring(0, 13).padEnd(15);
      const repos = String(app.public_repos || 0).padEnd(10);
      const contribs = String(app.recent_contributions || 0).padEnd(15);
      const plan = (app.build_plan || 'N/A').substring(0, 48).padEnd(50);
      
      console.log(`| ${name}| ${github}| ${track}| ${status}| ${repos}| ${contribs}| ${plan}|`);
    });

    console.log('='.repeat(150));
    console.log('\nLegend:');
    console.log('  Repos: Public repositories');
    console.log('  Contributions: Recent contributions');
    console.log('  Status: pending | completed | failed');
    
  } catch (error) {
    console.error('Error fetching applicants:', error);
    process.exit(1);
  }
}

displayApplicants()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Display failed:', error);
    process.exit(1);
  });
