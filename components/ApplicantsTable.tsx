'use client';

import { useState } from 'react';
import { ExternalLink, Check, X, Clock, ChevronUp, ChevronDown, ThumbsUp, ThumbsDown } from 'lucide-react';

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
  approval_status?: string;
  created_at: string;
}

interface Props {
  applicants: Applicant[];
}

type SortField = 'name' | 'email' | 'public_repos' | 'recent_contributions' | 'approval_status';
type SortDirection = 'asc' | 'desc';

export default function ApplicantsTable({ applicants }: Props) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [applicantStatuses, setApplicantStatuses] = useState<Record<number, string>>({});
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleApprove = (id: number) => {
    setApplicantStatuses(prev => ({ ...prev, [id]: 'approved' }));
  };

  const handleReject = (id: number) => {
    setApplicantStatuses(prev => ({ ...prev, [id]: 'rejected' }));
  };

  const sortedApplicants = [...applicants].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    // Handle approval status from state
    if (sortField === 'approval_status') {
      aVal = applicantStatuses[a.id] || a.approval_status || 'pending';
      bVal = applicantStatuses[b.id] || b.approval_status || 'pending';
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-indigo-600" /> : 
      <ChevronDown className="w-4 h-4 text-indigo-600" />;
  };

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
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Name
                <SortIcon field="name" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('email')}
            >
              <div className="flex items-center">
                Email
                <SortIcon field="email" />
              </div>
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
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('public_repos')}
            >
              <div className="flex items-center">
                Repos
                <SortIcon field="public_repos" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('recent_contributions')}
            >
              <div className="flex items-center">
                Contributions
                <SortIcon field="recent_contributions" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Screening
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Build Plan
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('approval_status')}
            >
              <div className="flex items-center">
                Decision
                <SortIcon field="approval_status" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedApplicants.map((applicant) => {
            const currentStatus = applicantStatuses[applicant.id] || applicant.approval_status;
            return (
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
                <td className="px-6 py-4 whitespace-nowrap">
                  {currentStatus ? (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      currentStatus === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {currentStatus === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(applicant.id)}
                        className="flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(applicant.id)}
                        className="flex items-center px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
