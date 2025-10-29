# 🚀 Hackathon Screener

A beautiful web application for screening hackathon applicants by analyzing their GitHub profiles for open-source contributions.

![Hackathon Screener](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Python](https://img.shields.io/badge/Python-3.8+-green?logo=python)

## ✨ Features

- **📤 CSV Upload**: Upload Luma event CSV exports
- **🔍 GitHub Analysis**: Automatically checks applicants' GitHub profiles via API
- **📊 Contribution Detection**: Identifies public repos, forks, and recent activity
- **📈 Beautiful Dashboard**: View statistics and top contributors
- **💾 Export Results**: Download screening results as CSV
- **⚡ Real-time Processing**: Fast screening with progress indication

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Python 3 (GitHub API integration)
- **Deployment**: Vercel
- **APIs**: GitHub REST API v3

## 🚀 Live Demo

**Production**: [https://hackathon-screener-dob8ajuk2-dablclub.vercel.app](https://hackathon-screener-dob8ajuk2-dablclub.vercel.app)

**Repository**: [https://github.com/colygon/hackathon-screener](https://github.com/colygon/hackathon-screener)

## 📦 Local Development

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/colygon/hackathon-screener.git
cd hackathon-screener
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
cd api/python
pip3 install -r requirements.txt
cd ../..
```

4. (Optional) Set up GitHub token for higher rate limits:
```bash
cp .env.example .env.local
# Edit .env.local and add your GitHub token
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 GitHub Token Setup

To avoid rate limiting (60 requests/hour → 5,000 requests/hour):

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token (classic)
3. Select the `public_repo` scope
4. Copy the token
5. Add it to `.env.local`:
   ```
   GITHUB_TOKEN=your_token_here
   ```

## 📖 Usage

1. **Upload CSV**: Click the upload button and select your Luma CSV export
2. **Wait for Processing**: The app will analyze each applicant's GitHub profile (takes 1-2 minutes for 100 applicants)
3. **View Results**: See summary statistics and top contributors
4. **Download**: Export the full screening report as CSV

## 📊 CSV Format

The app expects a Luma CSV export with these columns:
- `name`: Applicant name
- `email`: Email address
- `What is your GitHub?`: GitHub username or profile URL
- Other fields are preserved in the output

## 🚢 Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/colygon/hackathon-screener)

### Manual Deployment

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
6. Add environment variable:
   - Key: `GITHUB_TOKEN`
   - Value: Your GitHub personal access token
7. Click "Deploy"!

### Important Vercel Settings

The `vercel.json` configuration sets a 5-minute timeout for the screening API:
```json
{
  "functions": {
    "app/api/screen/route.ts": {
      "maxDuration": 300
    }
  }
}
```

## 🏗️ Project Structure

```
hackathon-screener/
├── app/
│   ├── api/
│   │   └── screen/
│   │       └── route.ts          # API endpoint for screening
│   ├── page.tsx                  # Main frontend page
│   └── layout.tsx                # Root layout
├── api/
│   └── python/
│       ├── csv_parser.py         # CSV parsing logic
│       ├── github_scraper.py     # GitHub API integration
│       ├── screening_api.py      # Python API wrapper
│       └── requirements.txt      # Python dependencies
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── vercel.json                   # Vercel configuration
└── package.json                  # Node.js dependencies
```

## 🔧 How It Works

1. **Upload**: User uploads a Luma CSV file via the Next.js frontend
2. **API Route**: Next.js API route (`app/api/screen/route.ts`) receives the file
3. **Python Processing**: Spawns Python script to:
   - Parse the CSV using `pandas`
   - Extract GitHub usernames
   - Query GitHub API for each user
   - Analyze repos, forks, and contributions
4. **Response**: Returns JSON with screening results
5. **Display**: Frontend shows beautiful dashboard with stats and rankings

## 📊 Screening Criteria

The tool checks for:
- ✅ Public repositories count
- ✅ Forked repositories
- ✅ Recent contribution events (pushes, PRs, issues, comments)
- ✅ Profile accessibility
- ❌ Invalid/missing GitHub profiles

## 🎨 UI Features

- Gradient background design
- Responsive layout (mobile-friendly)
- Loading states with spinner
- Error handling with user-friendly messages
- Statistics cards with icons
- Top 10 contributors leaderboard
- CSV export functionality
- "Screen Another File" reset button

## 🐛 Troubleshooting

**Issue**: Rate limit exceeded
- **Solution**: Add a GitHub token to `.env.local` or Vercel environment variables

**Issue**: Python not found
- **Solution**: Ensure Python 3.8+ is installed and in PATH

**Issue**: CSV parsing errors
- **Solution**: Check that the CSV has the required columns

**Issue**: Timeout on Vercel
- **Solution**: The `vercel.json` config allows 5 minutes. For very large files, consider batch processing

## 📝 License

MIT License - feel free to use for your hackathons!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 💡 Future Enhancements

- [ ] Real-time progress bar during screening
- [ ] LinkedIn profile integration
- [ ] Advanced filtering and sorting
- [ ] Machine learning-based scoring
- [ ] Email notifications when screening is complete
- [ ] Bulk GitHub analysis optimization
- [ ] Admin dashboard with analytics
- [ ] Applicant comparison view
- [ ] Export to multiple formats (JSON, Excel)
- [ ] Integration with hackathon management platforms

## 📧 Support

For questions or issues:
- Open an issue on [GitHub](https://github.com/colygon/hackathon-screener/issues)
- Contact: [@colygon](https://github.com/colygon)

---

Built with ❤️ for hackathon organizers
