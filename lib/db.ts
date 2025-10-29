import { sql } from '@vercel/postgres';

export interface Applicant {
  id: string;
  api_id: string;
  name: string;
  email: string;
  phone_number: string;
  approval_status: string;
  github_username: string;
  github_url: string;
  linkedin_url: string;
  track: string;
  build_plan: string;
  has_opensource_contributions: boolean;
  public_repos: number;
  forked_repos: number;
  recent_contributions: number;
  screening_status: 'pending' | 'completed' | 'failed';
  screening_error: string;
  created_at: Date;
  updated_at: Date;
}

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS applicants (
        id SERIAL PRIMARY KEY,
        api_id VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        email VARCHAR(255),
        phone_number VARCHAR(50),
        approval_status VARCHAR(50),
        github_username VARCHAR(255),
        github_url TEXT,
        linkedin_url TEXT,
        track VARCHAR(255),
        build_plan TEXT,
        has_opensource_contributions BOOLEAN DEFAULT FALSE,
        public_repos INTEGER DEFAULT 0,
        forked_repos INTEGER DEFAULT 0,
        recent_contributions INTEGER DEFAULT 0,
        screening_status VARCHAR(50) DEFAULT 'pending',
        screening_error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    return { success: false, error };
  }
}

export async function insertApplicant(applicant: Partial<Applicant>) {
  try {
    const result = await sql`
      INSERT INTO applicants (
        api_id, name, email, phone_number, approval_status,
        github_username, github_url, linkedin_url, track, build_plan,
        has_opensource_contributions, public_repos, forked_repos,
        recent_contributions, screening_status, screening_error
      ) VALUES (
        ${applicant.api_id}, ${applicant.name}, ${applicant.email},
        ${applicant.phone_number || ''}, ${applicant.approval_status},
        ${applicant.github_username}, ${applicant.github_url || ''},
        ${applicant.linkedin_url || ''}, ${applicant.track}, ${applicant.build_plan},
        ${applicant.has_opensource_contributions}, ${applicant.public_repos},
        ${applicant.forked_repos}, ${applicant.recent_contributions},
        ${applicant.screening_status}, ${applicant.screening_error || ''}
      )
      ON CONFLICT (api_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        github_username = EXCLUDED.github_username,
        github_url = EXCLUDED.github_url,
        linkedin_url = EXCLUDED.linkedin_url,
        has_opensource_contributions = EXCLUDED.has_opensource_contributions,
        public_repos = EXCLUDED.public_repos,
        forked_repos = EXCLUDED.forked_repos,
        recent_contributions = EXCLUDED.recent_contributions,
        screening_status = EXCLUDED.screening_status,
        screening_error = EXCLUDED.screening_error,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Insert applicant error:', error);
    return { success: false, error };
  }
}

export async function getAllApplicants() {
  try {
    const result = await sql`
      SELECT * FROM applicants
      ORDER BY created_at DESC
    `;
    return { success: true, data: result.rows };
  } catch (error) {
    console.error('Get applicants error:', error);
    return { success: false, error };
  }
}

export async function updateApplicantScreening(
  apiId: string,
  screening: Partial<Applicant>
) {
  try {
    const result = await sql`
      UPDATE applicants SET
        has_opensource_contributions = ${screening.has_opensource_contributions},
        public_repos = ${screening.public_repos},
        forked_repos = ${screening.forked_repos},
        recent_contributions = ${screening.recent_contributions},
        screening_status = ${screening.screening_status},
        screening_error = ${screening.screening_error || ''},
        updated_at = CURRENT_TIMESTAMP
      WHERE api_id = ${apiId}
      RETURNING *
    `;
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Update screening error:', error);
    return { success: false, error };
  }
}
