import { NextRequest, NextResponse } from 'next/server';
import { GitHubScreener, extractGitHubUsername } from '@/lib/github';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for long-running screening

interface CSVRow {
  api_id: string;
  name: string;
  email: string;
  approval_status: string;
  [key: string]: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read and parse CSV
    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No data found in CSV' },
        { status: 400 }
      );
    }

    // Extract applicants with GitHub usernames
    const applicants = rows.map(row => ({
      api_id: row.api_id || '',
      name: row.name || '',
      email: row.email || '',
      approval_status: row.approval_status || '',
      github_raw: row['What is your GitHub?'] || '',
      github_username: extractGitHubUsername(row['What is your GitHub?'] || ''),
      track: row['Which track are you doing?'] || '',
      build_plan: row['What do you plan to build? (you can change it later)'] || '',
    }));

    // Get unique GitHub usernames
    const uniqueUsernames = Array.from(
      new Set(applicants.map(a => a.github_username).filter(u => u))
    );

    console.log(`Screening ${uniqueUsernames.length} unique GitHub profiles...`);

    // Screen GitHub profiles
    const screener = new GitHubScreener(process.env.GITHUB_TOKEN);
    const githubResults = await screener.batchCheckUsers(uniqueUsernames, 300);

    // Combine results
    const finalApplicants = applicants.map(applicant => {
      const githubData = githubResults.get(applicant.github_username) || {};
      
      return {
        api_id: applicant.api_id,
        name: applicant.name,
        email: applicant.email,
        approval_status: applicant.approval_status,
        github_username: applicant.github_username,
        has_opensource_contributions: githubData.has_opensource_contributions || false,
        public_repos: githubData.public_repos || 0,
        forked_repos: githubData.forked_repos || 0,
        recent_contributions: githubData.recent_contributions || 0,
        github_profile_url: githubData.github_profile_url || '',
        github_check_error: githubData.github_check_error || '',
        track: applicant.track,
        build_plan: applicant.build_plan,
      };
    });

    // Calculate summary
    const total = finalApplicants.length;
    const withGithub = finalApplicants.filter(a => a.github_username).length;
    const withContributions = finalApplicants.filter(a => a.has_opensource_contributions).length;

    const results = {
      applicants: finalApplicants,
      summary: {
        total,
        withGithub,
        withoutGithub: total - withGithub,
        withContributions,
      },
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Screening error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

function parseCSV(text: string): CSVRow[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    const row: CSVRow = {
      api_id: '',
      name: '',
      email: '',
      approval_status: '',
    };

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return rows;
}
