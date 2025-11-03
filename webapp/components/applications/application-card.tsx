'use client';

import { useState } from 'react';

interface Application {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string | null;
  currentStatus: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  deadlineDate: string | null;
  salaryRange: string | null;
  notes: string | null;
}

interface ApplicationCardProps {
  application: Application;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
}

const statusColors: Record<string, string> = {
  saved: 'bg-gray-100 text-gray-800',
  applied: 'bg-blue-100 text-blue-800',
  assessment: 'bg-purple-100 text-purple-800',
  interview: 'bg-yellow-100 text-yellow-800',
  offer: 'bg-green-100 text-green-800',
  accepted: 'bg-green-600 text-white',
  rejected: 'bg-red-100 text-red-800',
};

const statuses = ['saved', 'applied', 'assessment', 'interview', 'offer', 'accepted', 'rejected'];

export function ApplicationCard({ application, onDelete, onStatusChange }: ApplicationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Main Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Company & Job Info */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 text-left"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {application.jobTitle}
                </h3>
                <p className="text-sm font-medium text-gray-600">
                  {application.companyName}
                </p>
                {application.location && (
                  <p className="mt-1 text-sm text-gray-500">{application.location}</p>
                )}
              </div>
            </div>
          </button>

          {/* Right: Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Status Dropdown */}
            <select
              value={application.currentStatus}
              onChange={(e) => onStatusChange(application.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                statusColors[application.currentStatus]
              } border-none cursor-pointer`}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(application.id);
              }}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
              title="Delete application"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Meta Info */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="capitalize">{application.source.replace('_', ' ')}</span>
          <span>•</span>
          <span>Updated {formatDate(application.updatedAt)}</span>
          {application.salaryRange && (
            <>
              <span>•</span>
              <span>{application.salaryRange}</span>
            </>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="space-y-3">
            {application.deadlineDate && (
              <div>
                <span className="font-medium text-gray-700">Deadline: </span>
                <span className="text-gray-600">{formatDate(application.deadlineDate)}</span>
              </div>
            )}
            {application.notes && (
              <div>
                <span className="font-medium text-gray-700">Notes: </span>
                <p className="mt-1 text-gray-600 whitespace-pre-wrap">{application.notes}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Created: </span>
              <span className="text-gray-600">{formatDate(application.createdAt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
