'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface EmailEvent {
  id: string;
  type: string;
  subject: string | null;
  detectedAt: string;
  reason: string;
  companyName?: string;
  applicationId?: string;
}

interface ActivityProofZoneProps {
  recentEmailEvents: EmailEvent[];
}

export function ActivityProofZone({
  recentEmailEvents,
}: ActivityProofZoneProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Activity & Proof</h2>

      {/* Recent Email Events - Full Width */}
      <div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Email Activity</h3>
              </div>
              <Link
                href="/email-review"
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            {recentEmailEvents.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <Mail className="mx-auto h-5 w-5 text-gray-400" />
                <p className="mt-2 text-xs text-gray-500">
                  No email events detected yet
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Connect Gmail to automatically track job emails
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentEmailEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={
                      event.applicationId
                        ? `/applications/${event.applicationId}`
                        : '/email-review'
                    }
                    className="block rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:border-gray-200 hover:bg-gray-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 line-clamp-1">
                          {event.companyName || 'Unknown Company'}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-600 line-clamp-1">
                          {event.subject || 'No subject'}
                        </p>
                        <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{event.reason}</p>
                      </div>
                      <span className="flex-shrink-0 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(event.detectedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getEventTypeBadge(event.type)}`}>
                        {getEventTypeLabel(event.type)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

function getEventTypeBadge(type: string): string {
  const badges: Record<string, string> = {
    'application_confirmation': 'bg-blue-100 text-blue-700',
    'interview_scheduled': 'bg-purple-100 text-purple-700',
    'assessment_received': 'bg-amber-100 text-amber-700',
    'offer_received': 'bg-green-100 text-green-700',
    'rejection': 'bg-red-100 text-red-700',
    'follow_up': 'bg-gray-100 text-gray-700',
  };
  return badges[type] || 'bg-gray-100 text-gray-700';
}

function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'application_confirmation': 'Applied',
    'interview_scheduled': 'Interview',
    'assessment_received': 'Assessment',
    'offer_received': 'Offer',
    'rejection': 'Rejected',
    'follow_up': 'Follow-up',
  };
  return labels[type] || type.replace(/_/g, ' ');
}
