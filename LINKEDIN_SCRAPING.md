# LinkedIn Scraping

## Overview
The system includes LinkedIn scraping functionality to extract:
- Graduation year
- Current company
- Job title

## Database Schema
New columns added to `applicants` table:
- `graduation_year` (INTEGER)
- `company` (VARCHAR 255)
- `job_title` (VARCHAR 255)
- `linkedin_scraped_at` (TIMESTAMP)

## Usage

### Run the scraper
```bash
npx tsx scripts/scrape-linkedin.ts
```

## Important Notes

### LinkedIn Bot Protection
LinkedIn actively blocks automated scraping with HTTP 999 responses. The basic implementation provided will have limited success.

### Recommended Solutions

For production use, consider these alternatives:

#### 1. **Proxycurl API** (Recommended)
- Professional LinkedIn data API
- Reliable and legal
- $0.01-0.02 per profile
- Website: https://nubela.co/proxycurl/

Setup:
```bash
# Add to .env.local
PROXYCURL_API_KEY=your_api_key
```

Uncomment the `scrapeWithProxycurl` method in `lib/linkedin.ts`

#### 2. **ScraperAPI**
- Handles proxies and CAPTCHAs
- Website: https://www.scraperapi.com/

#### 3. **Apify LinkedIn Scrapers**
- Pre-built LinkedIn scraping actors
- Website: https://apify.com/

#### 4. **Puppeteer with Proxies**
- More complex but free
- Requires proxy rotation and CAPTCHA solving
- Higher maintenance

### Manual Alternative
For small batches, you can:
1. Export LinkedIn data manually
2. Use the CSV import to add company/title data

## Files
- `lib/linkedin.ts` - LinkedIn scraper class
- `scripts/scrape-linkedin.ts` - Scraping script
- `scripts/add-linkedin-columns.ts` - Database migration
- `lib/db.ts` - Database functions including `updateApplicantLinkedIn()`
