import requests
import time
from typing import Dict, Optional
import os

class GitHubScraper:
    """Scrapes GitHub profiles to check for open-source contributions."""
    
    def __init__(self, github_token: Optional[str] = None):
        """
        Initialize the GitHub scraper.
        
        Args:
            github_token: Optional GitHub personal access token for higher rate limits
        """
        self.github_token = github_token or os.getenv('GITHUB_TOKEN')
        self.headers = {}
        if self.github_token:
            self.headers['Authorization'] = f'token {self.github_token}'
        self.headers['Accept'] = 'application/vnd.github.v3+json'
        
    def check_opensource_contributions(self, username: str) -> Dict:
        """
        Check if a GitHub user has open-source contributions.
        
        Args:
            username: GitHub username to check
            
        Returns:
            Dictionary with contribution details
        """
        if not username or username.lower() in ['na', 'n/a', '', 'none']:
            return {
                'username': username,
                'has_contributions': False,
                'public_repos': 0,
                'total_contributions': 0,
                'error': 'Invalid or missing username'
            }
        
        try:
            # Get user profile
            user_url = f'https://api.github.com/users/{username}'
            response = requests.get(user_url, headers=self.headers, timeout=10)
            
            if response.status_code == 404:
                return {
                    'username': username,
                    'has_contributions': False,
                    'public_repos': 0,
                    'total_contributions': 0,
                    'error': 'User not found'
                }
            
            if response.status_code == 403:
                return {
                    'username': username,
                    'has_contributions': None,
                    'public_repos': None,
                    'total_contributions': None,
                    'error': 'Rate limit exceeded'
                }
            
            response.raise_for_status()
            user_data = response.json()
            
            public_repos = user_data.get('public_repos', 0)
            
            # Get user's public events to check for contributions
            events_url = f'https://api.github.com/users/{username}/events/public'
            events_response = requests.get(events_url, headers=self.headers, timeout=10)
            events_response.raise_for_status()
            events = events_response.json()
            
            # Count contribution events (PushEvent, PullRequestEvent, IssuesEvent, etc.)
            contribution_events = [
                'PushEvent', 'PullRequestEvent', 'IssuesEvent', 
                'IssueCommentEvent', 'CreateEvent', 'ForkEvent'
            ]
            contributions = sum(1 for event in events if event.get('type') in contribution_events)
            
            # Check if user has forked repos or contributed to repos they don't own
            repos_url = f'https://api.github.com/users/{username}/repos?per_page=100'
            repos_response = requests.get(repos_url, headers=self.headers, timeout=10)
            repos_response.raise_for_status()
            repos = repos_response.json()
            
            forked_repos = sum(1 for repo in repos if repo.get('fork', False))
            has_contributions = public_repos > 0 or contributions > 0 or forked_repos > 0
            
            return {
                'username': username,
                'has_contributions': has_contributions,
                'public_repos': public_repos,
                'forked_repos': forked_repos,
                'total_contributions': contributions,
                'profile_url': user_data.get('html_url', ''),
                'error': None
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'username': username,
                'has_contributions': None,
                'public_repos': None,
                'total_contributions': None,
                'error': str(e)
            }
        except Exception as e:
            return {
                'username': username,
                'has_contributions': None,
                'public_repos': None,
                'total_contributions': None,
                'error': f'Unexpected error: {str(e)}'
            }
    
    def batch_check_users(self, usernames: list, delay: float = 0.5) -> list:
        """
        Check multiple GitHub users for contributions.
        
        Args:
            usernames: List of GitHub usernames
            delay: Delay between requests in seconds (to respect rate limits)
            
        Returns:
            List of dictionaries with contribution details
        """
        results = []
        for i, username in enumerate(usernames):
            print(f"Checking {i+1}/{len(usernames)}: {username}")
            result = self.check_opensource_contributions(username)
            results.append(result)
            
            # Add delay to avoid rate limiting
            if i < len(usernames) - 1:
                time.sleep(delay)
        
        return results
