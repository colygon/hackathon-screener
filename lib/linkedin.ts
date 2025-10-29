interface LinkedInData {
  graduation_year: number | null;
  company: string | null;
  job_title: string | null;
  error?: string;
}

export class LinkedInScraper {
  /**
   * Scrape LinkedIn profile for graduation year, company, and job title
   * Note: This is a simplified implementation. For production use, consider:
   * 1. Using a service like Proxycurl, ScraperAPI, or Apify
   * 2. Implementing proper authentication with LinkedIn's API
   * 3. Using a headless browser like Puppeteer with proper rate limiting
   */
  async scrapeProfile(linkedinUrl: string): Promise<LinkedInData> {
    try {
      // Extract username from LinkedIn URL
      const username = this.extractUsername(linkedinUrl);
      if (!username) {
        return {
          graduation_year: null,
          company: null,
          job_title: null,
          error: 'Invalid LinkedIn URL',
        };
      }

      // For now, we'll use a fetch-based approach to get public profile data
      // Note: This may not work for all profiles due to LinkedIn's restrictions
      const response = await fetch(linkedinUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        return {
          graduation_year: null,
          company: null,
          job_title: null,
          error: `HTTP ${response.status}`,
        };
      }

      const html = await response.text();
      
      // Extract data from HTML using regex patterns
      const data = this.parseLinkedInHTML(html);
      
      return data;
    } catch (error: any) {
      console.error('LinkedIn scrape error:', error.message);
      return {
        graduation_year: null,
        company: null,
        job_title: null,
        error: error.message,
      };
    }
  }

  private extractUsername(url: string): string | null {
    // Extract username from various LinkedIn URL formats
    const patterns = [
      /linkedin\.com\/in\/([^\/\?]+)/,
      /linkedin\.com\/pub\/([^\/\?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  private parseLinkedInHTML(html: string): LinkedInData {
    // This is a basic implementation - LinkedIn's HTML structure may change
    // For production, use a proper HTML parser or a service like Proxycurl
    
    const result: LinkedInData = {
      graduation_year: null,
      company: null,
      job_title: null,
    };

    // Try to extract graduation year (look for patterns like "2020 - 2024" or "Graduated 2023")
    const gradYearPatterns = [
      /(?:graduated|graduation).*?(\d{4})/i,
      /(\d{4})\s*-\s*(\d{4})/,
      /class of (\d{4})/i,
    ];

    for (const pattern of gradYearPatterns) {
      const match = html.match(pattern);
      if (match) {
        // Get the most recent year (graduation year is typically the end year)
        const years = match.slice(1).map(y => parseInt(y)).filter(y => !isNaN(y));
        if (years.length > 0) {
          result.graduation_year = Math.max(...years);
          break;
        }
      }
    }

    // Try to extract current company and title from meta tags or structured data
    const companyMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/);
    if (companyMatch) {
      const description = companyMatch[1];
      
      // Description often follows format: "Title at Company | LinkedIn"
      const titleCompanyMatch = description.match(/^([^|]+?)\s+at\s+([^|]+)/);
      if (titleCompanyMatch) {
        result.job_title = titleCompanyMatch[1].trim();
        result.company = titleCompanyMatch[2].trim();
      }
    }

    return result;
  }

  /**
   * Alternative: Use a third-party API service
   * Uncomment and configure if you have access to a service like Proxycurl
   */
  /*
  async scrapeWithProxycurl(linkedinUrl: string): Promise<LinkedInData> {
    const apiKey = process.env.PROXYCURL_API_KEY;
    if (!apiKey) {
      throw new Error('PROXYCURL_API_KEY not configured');
    }

    try {
      const response = await fetch(
        `https://nubela.co/proxycurl/api/v2/linkedin?url=${encodeURIComponent(linkedinUrl)}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      const data = await response.json();

      return {
        graduation_year: this.extractGraduationYear(data.education),
        company: data.experiences?.[0]?.company || null,
        job_title: data.experiences?.[0]?.title || null,
      };
    } catch (error: any) {
      return {
        graduation_year: null,
        company: null,
        job_title: null,
        error: error.message,
      };
    }
  }

  private extractGraduationYear(education: any[]): number | null {
    if (!education || education.length === 0) return null;
    
    // Get the most recent education's end year
    const sortedEd = education
      .filter(e => e.ends_at?.year)
      .sort((a, b) => b.ends_at.year - a.ends_at.year);
    
    return sortedEd[0]?.ends_at?.year || null;
  }
  */
}
