'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Building2, ArrowRight } from 'lucide-react';

interface Application {
  id: string;
  jobTitle: string;
  companyName: string;
  currentStatus: string;
  updatedAt: string;
}

interface RecentActivityProps {
  applications: Application[];
}

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-gray-100 text-gray-800',
  applied: 'bg-blue-100 text-blue-800',
  assessment: 'bg-amber-100 text-amber-800',
  interview: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  saved: 'Saved',
  applied: 'Applied',
  assessment: 'Assessment',
  interview: 'Interview',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export function RecentActivity({ applications }: RecentActivityProps) {
  const recentApps = applications.slice(0, 5);

  if (recentApps.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <p className="text-sm text-gray-500">No applications yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <Link
          href="/applications"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {recentApps.map((app) => (
          <Link
            key={app.id}
            href={`/applications/${app.id}`}
            className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Building2 className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {app.jobTitle}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {app.companyName}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  STATUS_COLORS[app.currentStatus]
                }`}
              >
                {STATUS_LABELS[app.currentStatus]}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(app.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
