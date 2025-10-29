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
  graduation_year?: number;
  company?: string;
  job_title?: string;
  gender?: string;
  created_at: string;
}

interface Props {
  applicants: Applicant[];
}

type SortField = 'name' | 'email' | 'public_repos' | 'recent_contributions' | 'approval_status' | 'gender' | 'track' | 'company' | 'graduation_year';
type SortDirection = 'asc' | 'desc';

export default function ApplicantsTable({ applicants }: Props) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [applicantStatuses, setApplicantStatuses] = useState<Record<number, string>>({});
  const [applicantGenders, setApplicantGenders] = useState<Record<number, string>>({});
  const [editingField, setEditingField] = useState<{ id: number; field: string } | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editingGender, setEditingGender] = useState<number | null>(null);
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleApprove = async (id: number) => {
    setApplicantStatuses(prev => ({ ...prev, [id]: 'approved' }));
    try {
      await fetch(`/api/applicants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_status: 'approved' }),
      });
    } catch (error) {
      console.error('Failed to update approval status:', error);
    }
  };

  const handleReject = async (id: number) => {
    setApplicantStatuses(prev => ({ ...prev, [id]: 'rejected' }));
    try {
      await fetch(`/api/applicants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_status: 'rejected' }),
      });
    } catch (error) {
      console.error('Failed to update approval status:', error);
    }
  };

  const handleUndo = async (id: number) => {
    setApplicantStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[id];
      return newStatuses;
    });
    try {
      await fetch(`/api/applicants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_status: 'pending' }),
      });
    } catch (error) {
      console.error('Failed to update approval status:', error);
    }
  };

  const handleSetGender = (id: number, gender: string) => {
    setApplicantGenders(prev => ({ ...prev, [id]: gender }));
    setEditingGender(null);
  };

  const handleEditGender = (id: number) => {
    setEditingGender(id);
  };

  const handleEditField = (id: number, field: string, currentValue: string) => {
    setEditingField({ id, field });
    setEditValues(prev => ({ ...prev, [`${id}-${field}`]: currentValue || '' }));
  };

  const handleSaveField = (id: number, field: string) => {
    // In a real app, this would save to the database
    // For now, we'll just close the edit mode
    setEditingField(null);
    // Note: The edited value is stored in editValues and will persist in the session
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  const getFieldValue = (applicant: any, field: string) => {
    const key = `${applicant.id}-${field}`;
    if (editValues[key] !== undefined) {
      return editValues[key];
    }
    return applicant[field];
  };

  const sortedApplicants = [...applicants].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    // Handle approval status from state
    if (sortField === 'approval_status') {
      aVal = applicantStatuses[a.id] || a.approval_status || 'pending';
      bVal = applicantStatuses[b.id] || b.approval_status || 'pending';
    }

    // Handle gender from state
    if (sortField === 'gender') {
      aVal = applicantGenders[a.id] || a.gender || '';
      bVal = applicantGenders[b.id] || b.gender || '';
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
              onClick={() => handleSort('approval_status')}
            >
              <div className="flex items-center">
                Decision
                <SortIcon field="approval_status" />
              </div>
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              LinkedIn
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('track')}
            >
              <div className="flex items-center">
                Track
                <SortIcon field="track" />
              </div>
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
              Build Plan
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('track')}
            >
              <div className="flex items-center">
                Track
                <SortIcon field="track" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('graduation_year')}
            >
              <div className="flex items-center">
                Grad Year
                <SortIcon field="graduation_year" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('company')}
            >
              <div className="flex items-center">
                Company
                <SortIcon field="company" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('gender')}
            >
              <div className="flex items-center">
                Gender
                <SortIcon field="gender" />
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
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedApplicants.map((applicant) => {
            const currentStatus = applicantStatuses[applicant.id] || applicant.approval_status;
            return (
              <tr key={applicant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {currentStatus === 'approved' || currentStatus === 'rejected' ? (
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        currentStatus === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {currentStatus === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                      <button
                        onClick={() => handleUndo(applicant.id)}
                        className="text-xs text-gray-600 hover:text-gray-900 underline"
                      >
                        Undo
                      </button>
                    </div>
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
                <td className="px-3 py-4 whitespace-nowrap">
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
                <td className="px-3 py-4 whitespace-nowrap">
                  {applicant.linkedin_url ? (
                    <a
                      href={applicant.linkedin_url.startsWith('http') ? applicant.linkedin_url : `https://linkedin.com${applicant.linkedin_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      {applicant.name}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
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
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {applicant.build_plan || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{applicant.track || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingField?.id === applicant.id && editingField?.field === 'graduation_year' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editValues[`${applicant.id}-graduation_year`] || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, [`${applicant.id}-graduation_year`]: e.target.value }))}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Year"
                        autoFocus
                      />
                      <button onClick={() => handleSaveField(applicant.id, 'graduation_year')} className="text-xs text-green-600 hover:text-green-800">✓</button>
                      <button onClick={handleCancelEdit} className="text-xs text-red-600 hover:text-red-800">✗</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-900">{getFieldValue(applicant, 'graduation_year') || 'N/A'}</div>
                      <button
                        onClick={() => handleEditField(applicant.id, 'graduation_year', applicant.graduation_year)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        ✎
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingField?.id === applicant.id && editingField?.field === 'company' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValues[`${applicant.id}-company`] || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, [`${applicant.id}-company`]: e.target.value }))}
                        className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Company"
                        autoFocus
                      />
                      <button onClick={() => handleSaveField(applicant.id, 'company')} className="text-xs text-green-600 hover:text-green-800">✓</button>
                      <button onClick={handleCancelEdit} className="text-xs text-red-600 hover:text-red-800">✗</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-900">{getFieldValue(applicant, 'company') || 'N/A'}</div>
                      <button
                        onClick={() => handleEditField(applicant.id, 'company', applicant.company)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        ✎
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingField?.id === applicant.id && editingField?.field === 'job_title' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValues[`${applicant.id}-job_title`] || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, [`${applicant.id}-job_title`]: e.target.value }))}
                        className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Title"
                        autoFocus
                      />
                      <button onClick={() => handleSaveField(applicant.id, 'job_title')} className="text-xs text-green-600 hover:text-green-800">✓</button>
                      <button onClick={handleCancelEdit} className="text-xs text-red-600 hover:text-red-800">✗</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-900 max-w-[150px] truncate">{getFieldValue(applicant, 'job_title') || 'N/A'}</div>
                      <button
                        onClick={() => handleEditField(applicant.id, 'job_title', applicant.job_title)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        ✎
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    const currentGender = applicantGenders[applicant.id] || applicant.gender;
                    
                    if (editingGender === applicant.id) {
                      return (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSetGender(applicant.id, 'Male')}
                            className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                          >
                            M
                          </button>
                          <button
                            onClick={() => handleSetGender(applicant.id, 'Female')}
                            className="px-2 py-1 text-xs font-medium text-white bg-pink-600 rounded hover:bg-pink-700 transition-colors"
                          >
                            F
                          </button>
                        </div>
                      );
                    }
                    
                    if (currentGender === 'Male' || currentGender === 'Female') {
                      return (
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-900">{currentGender}</div>
                          <button
                            onClick={() => handleEditGender(applicant.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            ✎
                          </button>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSetGender(applicant.id, 'Male')}
                            className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                          >
                            M
                          </button>
                          <button
                            onClick={() => handleSetGender(applicant.id, 'Female')}
                            className="px-2 py-1 text-xs font-medium text-white bg-pink-600 rounded hover:bg-pink-700 transition-colors"
                          >
                            F
                          </button>
                        </div>
                      );
                    }
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{applicant.email}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
