# Database Setup Instructions

## Setting up Vercel Postgres

1. Go to your Vercel dashboard: https://vercel.com/dablclub/hackathon-screener
2. Click on the **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Choose a name (e.g., `hackathon-screener-db`)
6. Select your region (choose one close to your users)
7. Click **"Create"**

## Connect to Your Project

1. After creating the database, click **"Connect Project"**
2. Select your `hackathon-screener` project
3. Vercel will automatically add the required environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NO_SSL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

## Database will auto-initialize

The database table will be created automatically on the first API call. The schema is:

```sql
CREATE TABLE applicants (
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
```

## Redeploy

After setting up the database, trigger a new deployment:
```bash
git commit --allow-empty -m "trigger redeploy"
git push
```

Or redeploy from the Vercel dashboard.

## Done!

Your applicants will now be automatically saved to the database after each CSV upload, and you'll see them in the comprehensive table with:
- Names
- Email addresses
- GitHub links (clickable)
- LinkedIn links (clickable)
- Track selection
- Repository counts
- Contribution counts
- Screening status (Pending/Completed/Failed)
- Build plans
