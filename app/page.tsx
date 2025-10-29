'use client';

import { useState } from 'react';
import { Upload, Github, Users, TrendingUp, Download, AlertCircle } from 'lucide-react';

interface Applicant {
  api_id: string;
  name: string;
  email: string;
  github_username: string;
  has_opensource_contributions: boolean;
  public_repos: number;
  forked_repos: number;
  recent_contributions: number;
  github_profile_url: string;
  track: string;
  build_plan: string;
}

interface Results {
  applicants: Applicant[];
  summary: {
    total: number;
    withGithub: number;
    withoutGithub: number;
    withContributions: number;
  };
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/screen', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to process file');
      
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!results) return;
    const headers = ['Name', 'Email', 'GitHub', 'Has Contributions', 'Public Repos', 'Contributions', 'Profile'];
    const rows = results.applicants.map(a => [
      a.name, a.email, a.github_username, a.has_opensource_contributions,
      a.public_repos, a.recent_contributions, a.github_profile_url
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screening_results.csv';
    a.click();
  };

  const topContributors = results?.applicants
    .filter(a => a.public_repos > 0)
    .sort((a, b) => (b.public_repos + b.recent_contributions) - (a.public_repos + a.recent_contributions))
    .slice(0, 10) || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Github className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-5xl font-bold text-gray-900">Hackathon Screener</h1>
          </div>
          <p className="text-xl text-gray-600">
            Screen applicants by analyzing GitHub profiles for open-source contributions
          </p>
        </div>

        {!results && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Luma CSV File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        <span>Upload a file</span>
                        <input id="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">CSV files only</p>
                  </div>
                </div>
                {file && <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!file || loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Screening Applicants...
                  </>
                ) : 'Screen Applicants'}
              </button>
            </form>
          </div>
        )}

        {results && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                    <p className="text-3xl font-bold text-gray-900">{results.summary.total}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">With GitHub</p>
                    <p className="text-3xl font-bold text-gray-900">{results.summary.withGithub}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((results.summary.withGithub / results.summary.total) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Github className="w-12 h-12 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">With Contributions</p>
                    <p className="text-3xl font-bold text-gray-900">{results.summary.withContributions}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((results.summary.withContributions / results.summary.withGithub) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Missing GitHub</p>
                    <p className="text-3xl font-bold text-gray-900">{results.summary.withoutGithub}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((results.summary.withoutGithub / results.summary.total) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Top Contributors</h2>
                <button onClick={downloadCSV} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </button>
              </div>

              <div className="space-y-4">
                {topContributors.map((c, i) => (
                  <div key={c.api_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{c.name}</h3>
                        <a href={c.github_profile_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                          @{c.github_username}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-gray-900">{c.public_repos}</p>
                        <p className="text-gray-500">repos</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900">{c.recent_contributions}</p>
                        <p className="text-gray-500">contributions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => { setResults(null); setFile(null); }} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Screen Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
