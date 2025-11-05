'use client';

import { format } from 'date-fns';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import type { EmailEvent } from '@/db/schema';

export function EmailAccessLogTable({ events }: { events: EmailEvent[] }) {
  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action Detected
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(event.emailDate, 'MMM d, yyyy')}
                  <br />
                  <span className="text-xs text-gray-500">
                    {format(event.emailDate, 'h:mm a')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate" title={event.emailFrom}>
                    {event.emailFrom}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate" title={event.emailSubject}>
                    {event.emailSubject}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {formatActionType(event.detectedAction)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                      <div
                        className={`h-2 rounded-full ${
                          event.confidenceScore >= 80
                            ? 'bg-green-500'
                            : event.confidenceScore >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${event.confidenceScore}%` }}
                      />
                    </div>
                    <span className="text-xs">{event.confidenceScore}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {renderConfirmationStatus(event.userConfirmed)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatActionType(action: string): string {
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function renderConfirmationStatus(confirmed: boolean | null) {
  if (confirmed === true) {
    return (
      <span className="flex items-center gap-1 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-xs">Confirmed</span>
      </span>
    );
  }

  if (confirmed === false) {
    return (
      <span className="flex items-center gap-1 text-red-600">
        <XCircle className="h-4 w-4" />
        <span className="text-xs">Rejected</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-gray-500">
      <HelpCircle className="h-4 w-4" />
      <span className="text-xs">Pending</span>
    </span>
  );
}
