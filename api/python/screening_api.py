#!/usr/bin/env python3
"""
Screening API script for Next.js integration.
Outputs JSON results to stdout.
"""

import sys
import json
import os
from csv_parser import LumaCSVParser
from github_scraper import GitHubScraper

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "CSV file path required"}), file=sys.stderr)
        sys.exit(1)
    
    csv_path = sys.argv[1]
    
    if not os.path.exists(csv_path):
        print(json.dumps({"error": f"File not found: {csv_path}"}), file=sys.stderr)
        sys.exit(1)
    
    try:
        # Parse CSV
        parser = LumaCSVParser(csv_path)
        applicants = parser.extract_github_usernames()
        
        # Initialize GitHub scraper
        github_token = os.getenv('GITHUB_TOKEN')
        scraper = GitHubScraper(github_token)
        
        # Extract unique GitHub usernames
        usernames = [a['github_username'] for a in applicants if a['github_username']]
        unique_usernames = list(set(usernames))
        
        # Check GitHub contributions with faster delay for API
        github_results = scraper.batch_check_users(unique_usernames, delay=0.3)
        
        # Create lookup dictionary
        github_lookup = {r['username']: r for r in github_results}
        
        # Combine results
        final_applicants = []
        for applicant in applicants:
            github_username = applicant['github_username']
            github_data = github_lookup.get(github_username, {})
            
            result = {
                'api_id': applicant['api_id'],
                'name': applicant['name'],
                'email': applicant['email'],
                'approval_status': applicant['approval_status'],
                'github_username': github_username,
                'has_opensource_contributions': github_data.get('has_contributions', False),
                'public_repos': github_data.get('public_repos', 0),
                'forked_repos': github_data.get('forked_repos', 0),
                'recent_contributions': github_data.get('total_contributions', 0),
                'github_profile_url': github_data.get('profile_url', ''),
                'github_check_error': github_data.get('error', ''),
                'track': applicant['track'],
                'build_plan': applicant['build_plan']
            }
            final_applicants.append(result)
        
        # Calculate summary
        total = len(final_applicants)
        with_github = sum(1 for a in final_applicants if a['github_username'])
        with_contributions = sum(1 for a in final_applicants if a['has_opensource_contributions'])
        
        output = {
            'applicants': final_applicants,
            'summary': {
                'total': total,
                'withGithub': with_github,
                'withoutGithub': total - with_github,
                'withContributions': with_contributions
            }
        }
        
        # Output JSON to stdout
        print(json.dumps(output))
        
    except Exception as e:
        error_output = {
            'error': str(e),
            'type': type(e).__name__
        }
        print(json.dumps(error_output), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
