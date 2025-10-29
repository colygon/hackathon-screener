'use client';

import { ExternalLink, Check, X, Clock } from 'lucide-react';

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

interface Props {
  applicants: Applicant[];
}

export default function ApplicantsTable({ applicants }: Props) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            <Check className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            <X className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              GitHub
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              LinkedIn
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Track
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Repos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contributions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Build Plan
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applicants.map((applicant) => (
            <tr key={applicant.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{applicant.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {applicant.github_username ? (
                  <a
                    href={applicant.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    {applicant.github_username}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">N/A</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {applicant.linkedin_url ? (
                  <a
                    href={`https://linkedin.com${applicant.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Profile
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">N/A</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{applicant.track || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{applicant.public_repos}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm text-gray-900">{applicant.recent_contributions}</div>
                  {applicant.has_opensource_contributions && (
                    <Check className="w-4 h-4 ml-2 text-green-500" />
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(applicant.screening_status)}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 max-w-xs truncate">
                  {applicant.build_plan || 'N/A'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
