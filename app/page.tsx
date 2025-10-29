'use client';

import { useState, useEffect } from 'react';
import { Upload, Github, Users, TrendingUp, Download, AlertCircle, RefreshCw } from 'lucide-react';
import ApplicantsTable from '../components/ApplicantsTable';

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  github_username: string;
  github_url: string;
  linkedin_url: string;
  track: string;
  build_plan: string;
  public_repos: number;
  recent_contributions: number;
  screening_status: 'pending' | 'completed' | 'failed';
  has_opensource_contributions: boolean;
  created_at: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  // Load existing applicants on mount
  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const res = await fetch('/api/applicants');
      const data = await res.json();
      if (data.applicants) {
        setApplicants(data.applicants);
        setShowTable(data.applicants.length > 0);
      }
    } catch (err) {
      console.error('Failed to fetch applicants:', err);
    }
  };

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
      
      // Reload applicants from database
      await fetchApplicants();
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: applicants.length,
    withGithub: applicants.filter(a => a.github_username).length,
    withContributions: applicants.filter(a => a.has_opensource_contributions).length,
    completed: applicants.filter(a => a.screening_status === 'completed').length,
  };

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

        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
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
        </div>

        {showTable && applicants.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">With GitHub</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.withGithub}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((stats.withGithub / stats.total) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Github className="w-12 h-12 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">With Contributions</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.withContributions}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Screened</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                  <RefreshCw className="w-12 h-12 text-indigo-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All Applicants</h2>
                <button onClick={fetchApplicants} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>

              <ApplicantsTable applicants={applicants} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
