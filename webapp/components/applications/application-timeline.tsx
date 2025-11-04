import { db } from '@/db';
import { stageHistory } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Clock, Mail, User } from 'lucide-react';

interface ApplicationTimelineProps {
  applicationId: string;
}

const STATUS_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  assessment: 'Assessment',
  interview: 'Interview',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const STATUS_ICONS = {
  manual: User,
  email: Mail,
  reminder: Clock,
};

export async function ApplicationTimeline({
  applicationId,
}: ApplicationTimelineProps) {
  // Fetch stage history
  const history = await db
    .select()
    .from(stageHistory)
    .where(eq(stageHistory.applicationId, applicationId))
    .orderBy(desc(stageHistory.timestamp));

  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
        <p className="text-sm text-gray-500">No status changes yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
      <div className="flow-root">
        <ul className="-mb-8">
          {history.map((event, idx) => {
            const Icon = STATUS_ICONS[event.trigger as keyof typeof STATUS_ICONS] || Clock;
            const isLast = idx === history.length - 1;

            return (
              <li key={event.id}>
                <div className="relative pb-8">
                  {!isLast && (
                    <span
                      className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white">
                        <Icon className="h-4 w-4 text-blue-600" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-900">
                          Status changed to{' '}
                          <span className="font-semibold">
                            {STATUS_LABELS[event.toStatus as keyof typeof STATUS_LABELS]}
                          </span>
                          {event.fromStatus && (
                            <span className="text-gray-500">
                              {' '}
                              from{' '}
                              {STATUS_LABELS[event.fromStatus as keyof typeof STATUS_LABELS]}
                            </span>
                          )}
                        </p>
                        {event.trigger === 'email' && (
                          <p className="mt-1 text-xs text-gray-500">
                            📧 Automatically updated from email
                          </p>
                        )}
                        {event.emailReference && (
                          <p className="mt-1 text-xs text-gray-500">
                            Email ID: {event.emailReference.substring(0, 20)}...
                          </p>
                        )}
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time dateTime={event.timestamp.toISOString()}>
                          {new Date(event.timestamp).toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
