'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, Clock, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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

interface ReminderCardProps {
  reminder: Reminder;
  onUpdate?: () => void;
}

export function ReminderCard({ reminder, onUpdate }: ReminderCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const dueDate = new Date(reminder.dueDate);
  const isOverdue = !reminder.isCompleted && dueDate < new Date();
  const isPastDue = dueDate < new Date();

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true }),
      });

      if (!response.ok) throw new Error('Failed to complete reminder');

      toast({
        title: 'Reminder completed',
        description: 'The reminder has been marked as complete.',
      });

      if (onUpdate) onUpdate();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete reminder. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete reminder');

      toast({
        title: 'Reminder deleted',
        description: 'The reminder has been removed.',
      });

      if (onUpdate) onUpdate();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete reminder. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={`
        ${reminder.isCompleted ? 'opacity-60' : ''}
        ${isOverdue ? 'border-red-300 bg-red-50' : ''}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4
              className={`text-sm font-medium ${
                reminder.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {reminder.title || 'Untitled Reminder'}
            </h4>

            {/* Description */}
            {reminder.description && (
              <p className="mt-1 text-sm text-gray-600">{reminder.description}</p>
            )}

            {/* Meta info */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {/* Due date */}
              <div className="flex items-center gap-1">
                {isOverdue ? (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  {isPastDue ? 'Overdue by' : 'Due'}{' '}
                  {formatDistanceToNow(dueDate, { addSuffix: !isPastDue })}
                </span>
              </div>

              {/* Type badge */}
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize">
                {reminder.reminderType.replace('_', ' ')}
              </span>

              {/* Auto-created indicator */}
              {reminder.createdBy === 'system' && (
                <span className="text-xs text-blue-600">Auto-created</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!reminder.isCompleted && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleComplete}
                disabled={isLoading}
                className="h-8 px-3"
              >
                <Check className="h-3 w-3 mr-1" />
                Complete
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={isLoading}
              className="h-8 px-2 text-gray-500 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
