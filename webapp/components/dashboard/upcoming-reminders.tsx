'use client';

import { formatDistanceToNow } from 'date-fns';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface Reminder {
  id: string;
  applicationId: string;
  title: string | null;
  dueDate: Date | string;
  isCompleted: boolean;
  reminderType: string;
}

interface UpcomingRemindersProps {
  reminders: Reminder[];
}

export function UpcomingReminders({ reminders }: UpcomingRemindersProps) {
  const now = new Date();

  // Filter and sort reminders
  const upcoming = reminders
    .filter((r) => !r.isCompleted)
    .map((r) => ({ ...r, dueDate: new Date(r.dueDate) }))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  const overdueCount = upcoming.filter((r) => r.dueDate < now).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Upcoming Reminders</CardTitle>
          {overdueCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600">
              <AlertCircle className="h-3 w-3" />
              {overdueCount} overdue
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No upcoming reminders</p>
            <p className="text-xs text-gray-400 mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((reminder) => {
              const isOverdue = reminder.dueDate < now;

              return (
                <Link
                  key={reminder.id}
                  href={`/applications/${reminder.applicationId}`}
                  className="block rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {reminder.title || 'Untitled Reminder'}
                      </h4>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        {isOverdue ? (
                          <span className="flex items-center gap-1 text-red-600 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            Overdue
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-500">
                            <Clock className="h-3 w-3" />
                            Due {formatDistanceToNow(reminder.dueDate, { addSuffix: true })}
                          </span>
                        )}
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 capitalize">
                          {reminder.reminderType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                      isOverdue ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                  </div>
                </Link>
              );
            })}

            {reminders.filter((r) => !r.isCompleted).length > 5 && (
              <Link
                href="/applications"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium pt-2"
              >
                View all reminders →
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
