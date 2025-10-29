import pandas as pd
from typing import List, Dict

class LumaCSVParser:
    """Parses Luma CSV files containing hackathon applications."""
    
    def __init__(self, csv_path: str):
        """
        Initialize the CSV parser.
        
        Args:
            csv_path: Path to the Luma CSV file
        """
        self.csv_path = csv_path
        self.df = None
        
    def load_csv(self) -> pd.DataFrame:
        """
        Load the CSV file into a pandas DataFrame.
        
        Returns:
            DataFrame with the CSV data
        """
        try:
            self.df = pd.read_csv(self.csv_path, encoding='utf-8-sig')
            return self.df
        except Exception as e:
            raise Exception(f"Error loading CSV file: {str(e)}")
    
    def extract_github_usernames(self) -> List[Dict[str, str]]:
        """
        Extract GitHub usernames from the CSV.
        
        Returns:
            List of dictionaries with applicant info and GitHub usernames
        """
        if self.df is None:
            self.load_csv()
        
        # Find the GitHub column
        github_col = None
        for col in self.df.columns:
            if 'github' in col.lower():
                github_col = col
                break
        
        if github_col is None:
            raise Exception("No GitHub column found in CSV")
        
        applicants = []
        for _, row in self.df.iterrows():
            github_value = str(row.get(github_col, '')).strip()
            
            # Extract username from various GitHub URL formats
            github_username = self._extract_username(github_value)
            
            applicants.append({
                'api_id': row.get('api_id', ''),
                'name': row.get('name', ''),
                'email': row.get('email', ''),
                'approval_status': row.get('approval_status', ''),
                'github_raw': github_value,
                'github_username': github_username,
                'track': row.get('Which track are you doing?', ''),
                'build_plan': row.get('What do you plan to build? (you can change it later)', '')
            })
        
        return applicants
    
    def _extract_username(self, github_value: str) -> str:
        """
        Extract GitHub username from various formats.
        
        Args:
            github_value: Raw GitHub value from CSV
            
        Returns:
            Extracted username or empty string
        """
        if not github_value or github_value.lower() in ['na', 'n/a', 'nan', '']:
            return ''
        
        # Remove common prefixes
        github_value = github_value.strip()
        
        # Handle full URLs like https://github.com/username
        if 'github.com/' in github_value:
            parts = github_value.split('github.com/')
            if len(parts) > 1:
                username = parts[1].strip('/').split('/')[0]
                return username
        
        # Handle @ mentions
        if github_value.startswith('@'):
            return github_value[1:]
        
        # If it's just a username
        if '/' not in github_value and ' ' not in github_value:
            return github_value
        
        return github_value
    
    def get_applicants_by_status(self, status: str = None) -> List[Dict]:
        """
        Get applicants filtered by approval status.
        
        Args:
            status: Approval status to filter by (e.g., 'pending_approval', 'approved')
            
        Returns:
            List of applicant dictionaries
        """
        applicants = self.extract_github_usernames()
        
        if status:
            applicants = [a for a in applicants if a['approval_status'] == status]
        
        return applicants
