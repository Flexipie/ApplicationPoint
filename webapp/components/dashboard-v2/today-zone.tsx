'use client';

import { useState } from 'react';
import { Check, Plus, Clock, AlertTriangle, Mail, Download, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, isBefore, isToday } from 'date-fns';

interface Reminder {
  id: string;
  title: string | null;
  description: string | null;
  dueDate: string;
  isCompleted: boolean;
  applicationId: string;
}

interface TodayZoneProps {
  reminders: Reminder[];
  onToggleComplete: (id: string) => Promise<void>;
  onSnooze: (id: string) => Promise<void>;
  onAddQuick: (title: string) => Promise<void>;
  showEmailCTA: boolean;
  showExtensionCTA: boolean;
}

export function TodayZone({
  reminders,
  onToggleComplete,
  onSnooze,
  onAddQuick,
  showEmailCTA,
  showExtensionCTA,
}: TodayZoneProps) {
  const [newActionTitle, setNewActionTitle] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Get today's reminders and sort by urgency
  const todayReminders = reminders
    .filter((r) => !r.isCompleted)
    .sort((a, b) => {
      const aDate = new Date(a.dueDate);
      const bDate = new Date(b.dueDate);
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, 3);

  function getAlertColor(dueDate: string) {
    const due = new Date(dueDate);
    const now = new Date();

    if (isBefore(due, now)) {
      return 'text-red-600 bg-red-50 border-red-200'; // Overdue
    }

    if (isToday(due)) {
      return 'text-amber-600 bg-amber-50 border-amber-200'; // Due today
    }

    return 'text-gray-600 bg-gray-50 border-gray-200'; // Future
  }

  function getAlertIcon(dueDate: string) {
    const due = new Date(dueDate);
    const now = new Date();

    if (isBefore(due, now)) {
      return <AlertTriangle className="h-4 w-4" />;
    }

    return <Clock className="h-4 w-4" />;
  }

  async function handleToggleComplete(id: string) {
    setLoadingId(id);
    try {
      await onToggleComplete(id);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleSnooze(id: string) {
    setLoadingId(id);
    try {
      await onSnooze(id);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleAddQuick() {
    if (!newActionTitle.trim()) return;

    try {
      await onAddQuick(newActionTitle.trim());
      setNewActionTitle('');
    } catch (error) {
      console.error('Failed to add action:', error);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Today</h2>
        <span className="text-xs text-gray-500">{todayReminders.length} actions</span>
      </div>

      {/* Today's Actions */}
      <div className="space-y-2 mb-4">
        {todayReminders.length === 0 ? (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
            <Check className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">All clear!</p>
            <p className="text-xs text-green-700 mt-1">No actions due today</p>
          </div>
        ) : (
          todayReminders.map((reminder) => {
            const alertColor = getAlertColor(reminder.dueDate);
            const AlertIcon = () => getAlertIcon(reminder.dueDate);

            return (
              <div
                key={reminder.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${alertColor}`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleComplete(reminder.id)}
                  disabled={loadingId === reminder.id}
                  className="flex-shrink-0 mt-0.5"
                >
                  <div
                    className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all ${
                      reminder.isCompleted
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {reminder.isCompleted && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {reminder.title || reminder.description || 'Untitled action'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <AlertIcon />
                    <span className="text-xs">
                      {isBefore(new Date(reminder.dueDate), new Date())
                        ? 'Overdue'
                        : isToday(new Date(reminder.dueDate))
                        ? 'Due today'
                        : formatDistanceToNow(new Date(reminder.dueDate), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSnooze(reminder.id)}
                    disabled={loadingId === reminder.id}
                    className="text-xs"
                  >
                    Snooze
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleComplete(reminder.id)}
                    disabled={loadingId === reminder.id}
                    className="text-xs"
                  >
                    Complete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newActionTitle}
          onChange={(e) => setNewActionTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddQuick()}
          placeholder="+ Next action"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button size="sm" onClick={handleAddQuick} disabled={!newActionTitle.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* CTA Chips */}
      {(showEmailCTA || showExtensionCTA) && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {showEmailCTA && (
            <a
              href="/settings/general"
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              Connect Email
            </a>
          )}
          {showExtensionCTA && (
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200 transition-colors"
            >
              <Chrome className="h-3.5 w-3.5" />
              Install Extension
            </a>
          )}
        </div>
      )}
    </div>
  );
}
