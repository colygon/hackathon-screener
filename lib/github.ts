interface GitHubUser {
  login: string;
  public_repos: number;
  html_url: string;
}

interface GitHubRepo {
  fork: boolean;
}

interface GitHubEvent {
  type: string;
}

interface ApplicantResult {
  api_id: string;
  name: string;
  email: string;
  approval_status: string;
  github_username: string;
  has_opensource_contributions: boolean;
  public_repos: number;
  forked_repos: number;
  recent_contributions: number;
  github_profile_url: string;
  github_check_error: string;
  track: string;
  build_plan: string;
}

export class GitHubScreener {
  private token?: string;
  private baseUrl = 'https://api.github.com';

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN;
  }

  private getHeaders() {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Hackathon-Screener',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async checkUser(username: string): Promise<Partial<ApplicantResult>> {
    if (!username || username.toLowerCase() === 'na' || username.toLowerCase() === 'n/a') {
      return {
        github_username: username,
        has_opensource_contributions: false,
        public_repos: 0,
        forked_repos: 0,
        recent_contributions: 0,
        github_profile_url: '',
        github_check_error: 'Invalid or missing username',
      };
    }

    try {
      // Get user profile
      const userResponse = await fetch(
        `${this.baseUrl}/users/${username}`,
        { headers: this.getHeaders() }
      );

      if (userResponse.status === 404) {
        return {
          github_username: username,
          has_opensource_contributions: false,
          public_repos: 0,
          forked_repos: 0,
          recent_contributions: 0,
          github_profile_url: '',
          github_check_error: 'User not found',
        };
      }

      if (userResponse.status === 403) {
        return {
          github_username: username,
          has_opensource_contributions: false,
          public_repos: 0,
          forked_repos: 0,
          recent_contributions: 0,
          github_profile_url: '',
          github_check_error: 'Rate limit exceeded',
        };
      }

      const user: GitHubUser = await userResponse.json();

      // Get user's repos
      const reposResponse = await fetch(
        `${this.baseUrl}/users/${username}/repos?per_page=100`,
        { headers: this.getHeaders() }
      );
      const repos: GitHubRepo[] = await reposResponse.json();

      // Get user's recent events
      const eventsResponse = await fetch(
        `${this.baseUrl}/users/${username}/events/public?per_page=100`,
        { headers: this.getHeaders() }
      );
      const events: GitHubEvent[] = await eventsResponse.json();

      // Count contributions
      const contributionEvents = [
        'PushEvent',
        'PullRequestEvent',
        'IssuesEvent',
        'IssueCommentEvent',
        'CreateEvent',
        'ForkEvent',
      ];
      const contributions = events.filter(e => contributionEvents.includes(e.type)).length;

      const forkedRepos = repos.filter(r => r.fork).length;
      const hasContributions = user.public_repos > 0 || contributions > 0 || forkedRepos > 0;

      return {
        github_username: username,
        has_opensource_contributions: hasContributions,
        public_repos: user.public_repos,
        forked_repos: forkedRepos,
        recent_contributions: contributions,
        github_profile_url: user.html_url,
        github_check_error: '',
      };
    } catch (error) {
      return {
        github_username: username,
        has_opensource_contributions: false,
        public_repos: 0,
        forked_repos: 0,
        recent_contributions: 0,
        github_profile_url: '',
        github_check_error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async batchCheckUsers(usernames: string[], delayMs = 300): Promise<Map<string, Partial<ApplicantResult>>> {
    const results = new Map<string, Partial<ApplicantResult>>();
    
    for (const username of usernames) {
      const result = await this.checkUser(username);
      results.set(username, result);
      
      // Add delay to respect rate limits
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    return results;
  }
}

export function extractGitHubUsername(value: string): string {
  if (!value || value.toLowerCase() === 'na' || value.toLowerCase() === 'n/a') {
    return '';
  }

  value = value.trim();

  // Handle full URLs like https://github.com/username
  if (value.includes('github.com/')) {
    const parts = value.split('github.com/');
    if (parts.length > 1) {
      const username = parts[1].trim().split('/')[0];
      return username;
    }
  }

  // Handle @ mentions
  if (value.startsWith('@')) {
    return value.substring(1);
  }

  // If it's just a username
  if (!value.includes('/') && !value.includes(' ')) {
    return value;
  }

  return value;
}
