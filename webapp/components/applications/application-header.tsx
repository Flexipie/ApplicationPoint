'use client';

import { useState } from 'react';
import { Building2, MapPin } from 'lucide-react';

interface ApplicationHeaderProps {
  application: {
    id: string;
    companyName: string;
    jobTitle: string;
    location: string | null;
    currentStatus: string;
  };
}

const STATUS_COLORS = {
  saved: 'bg-gray-100 text-gray-800',
  applied: 'bg-blue-100 text-blue-800',
  assessment: 'bg-amber-100 text-amber-800',
  interview: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  assessment: 'Assessment',
  interview: 'Interview',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export function ApplicationHeader({ application }: ApplicationHeaderProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStatus: newStatus }),
      });

      if (res.ok) {
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {/* Left: Company & Job Title */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
            <Building2 className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {application.jobTitle}
            </h1>
            <p className="text-lg text-gray-600">{application.companyName}</p>
          </div>
        </div>
        {application.location && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            {application.location}
          </div>
        )}
      </div>

      {/* Right: Status Dropdown */}
      <div className="flex items-center gap-3">
        <label htmlFor="status" className="text-sm font-medium text-gray-700">
          Status:
        </label>
        <select
          id="status"
          value={application.currentStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isUpdating}
          className={`rounded-md px-3 py-2 text-sm font-semibold ${
            STATUS_COLORS[application.currentStatus as keyof typeof STATUS_COLORS]
          } border-0 focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
