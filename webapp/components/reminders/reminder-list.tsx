'use client';

import { useState } from 'react';
import { ReminderCard } from './reminder-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Reminder {
  id: string;
  applicationId: string;
  reminderType: string;
  title: string | null;
  description: string | null;
  dueDate: Date | string;
  isCompleted: boolean;
  createdBy: string;
}

interface ReminderListProps {
  reminders: Reminder[];
  showCompleted?: boolean;
  onCreateClick?: () => void;
  onUpdate?: () => void;
}

export function ReminderList({
  reminders,
  showCompleted = false,
  onCreateClick,
  onUpdate,
}: ReminderListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  // Filter reminders
  const filteredReminders = reminders.filter((reminder) => {
    if (filter === 'pending') return !reminder.isCompleted;
    if (filter === 'completed') return reminder.isCompleted;
    return true;
  });

  // Sort by due date (overdue first, then by date)
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    const aDate = new Date(a.dueDate);
    const bDate = new Date(b.dueDate);
    const now = new Date();

    // Both overdue
    if (aDate < now && bDate < now) {
      return bDate.getTime() - aDate.getTime(); // Most overdue first
    }

    // Only a is overdue
    if (aDate < now) return -1;

    // Only b is overdue
    if (bDate < now) return 1;

    // Neither overdue - sort by date ascending
    return aDate.getTime() - bDate.getTime();
  });

  const pendingCount = reminders.filter((r) => !r.isCompleted).length;
  const overdueCount = reminders.filter(
    (r) => !r.isCompleted && new Date(r.dueDate) < new Date()
  ).length;

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
              filter === 'pending'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending
            {pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-blue-600 text-white">
                {pendingCount}
              </span>
            )}
          </button>

          {showCompleted && (
            <>
              <button
                onClick={() => setFilter('completed')}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  filter === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Completed
              </button>

              <button
                onClick={() => setFilter('all')}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
            </>
          )}
        </div>

        {onCreateClick && (
          <Button size="sm" onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-1" />
            Add Reminder
          </Button>
        )}
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && filter !== 'completed' && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-800">
            <strong>{overdueCount}</strong> {overdueCount === 1 ? 'reminder is' : 'reminders are'}{' '}
            overdue
          </p>
        </div>
      )}

      {/* Reminder list */}
      {sortedReminders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            {filter === 'pending' && 'No pending reminders'}
            {filter === 'completed' && 'No completed reminders'}
            {filter === 'all' && 'No reminders yet'}
          </p>
          {onCreateClick && filter === 'pending' && (
            <Button
              variant="link"
              size="sm"
              onClick={onCreateClick}
              className="mt-2"
            >
              Create your first reminder
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
