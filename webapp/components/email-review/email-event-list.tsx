'use client';

import { useState } from 'react';
import { EmailEventCard } from './email-event-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Inbox, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  currentStatus: string;
}

interface EmailEvent {
  id: string;
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  detectedAction: string;
  confidenceScore: number;
  rawSnippet: string | null;
  userConfirmed: boolean | null;
  applicationId: string;
}

interface EmailEventWithApp {
  emailEvent: EmailEvent;
  application: Application | null;
}

interface EmailEventListProps {
  events: EmailEventWithApp[];
  initialFilter?: 'pending' | 'confirmed' | 'rejected' | 'all';
  onUpdate?: () => void;
}

export function EmailEventList({ events, initialFilter = 'pending', onUpdate }: EmailEventListProps) {
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'rejected' | 'all'>(initialFilter);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Filter events by status
  const filteredEvents = events.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return item.emailEvent.userConfirmed === null;
    if (filter === 'confirmed') return item.emailEvent.userConfirmed === true;
    if (filter === 'rejected') return item.emailEvent.userConfirmed === false;
    return true;
  });

  // Calculate counts
  const pendingCount = events.filter((e) => e.emailEvent.userConfirmed === null).length;
  const confirmedCount = events.filter((e) => e.emailEvent.userConfirmed === true).length;
  const rejectedCount = events.filter((e) => e.emailEvent.userConfirmed === false).length;

  const handleBulkConfirm = async () => {
    const pendingIds = filteredEvents
      .filter((e) => e.emailEvent.userConfirmed === null)
      .map((e) => e.emailEvent.id);

    if (pendingIds.length === 0) {
      toast({
        title: 'No pending events',
        description: 'There are no pending events to confirm.',
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/email-events/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: pendingIds, userConfirmed: true }),
      });

      if (!response.ok) throw new Error('Failed to confirm emails');

      const result = await response.json();

      toast({
        title: 'Emails confirmed',
        description: `Successfully confirmed ${result.updated} email events.`,
      });

      setSelectedIds([]);
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to confirm emails. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkReject = async () => {
    const pendingIds = filteredEvents
      .filter((e) => e.emailEvent.userConfirmed === null)
      .map((e) => e.emailEvent.id);

    if (pendingIds.length === 0) {
      toast({
        title: 'No pending events',
        description: 'There are no pending events to reject.',
      });
      return;
    }

    if (!confirm(`Are you sure you want to reject ${pendingIds.length} email events?`)) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/email-events/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: pendingIds, userConfirmed: false }),
      });

      if (!response.ok) throw new Error('Failed to reject emails');

      const result = await response.json();

      toast({
        title: 'Emails rejected',
        description: `Successfully rejected ${result.updated} email events.`,
      });

      setSelectedIds([]);
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject emails. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs and bulk actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Inbox className="h-4 w-4" />
              Pending
              {pendingCount > 0 && (
                <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Confirmed
              {confirmedCount > 0 && (
                <span className="ml-1 text-xs text-gray-500">
                  {confirmedCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
              {rejectedCount > 0 && (
                <span className="ml-1 text-xs text-gray-500">
                  {rejectedCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">
              All
              <span className="ml-1 text-xs text-gray-500">
                {events.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bulk actions */}
        {filter === 'pending' && pendingCount > 0 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBulkConfirm}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <Check className="h-4 w-4 mr-1" />
              Confirm All ({pendingCount})
            </Button>
            <Button
              onClick={handleBulkReject}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <X className="h-4 w-4 mr-1" />
              Reject All
            </Button>
          </div>
        )}
      </div>

      {/* Event list */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            {filter === 'pending' && <Inbox className="h-6 w-6 text-gray-400" />}
            {filter === 'confirmed' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
            {filter === 'rejected' && <XCircle className="h-6 w-6 text-gray-400" />}
            {filter === 'all' && <Inbox className="h-6 w-6 text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {filter === 'pending' && 'No pending emails'}
            {filter === 'confirmed' && 'No confirmed emails'}
            {filter === 'rejected' && 'No rejected emails'}
            {filter === 'all' && 'No email events'}
          </h3>
          <p className="text-sm text-gray-500">
            {filter === 'pending' && "You're all caught up! Email detections will appear here."}
            {filter === 'confirmed' && 'Confirmed emails will appear here.'}
            {filter === 'rejected' && 'Rejected emails will appear here.'}
            {filter === 'all' && 'Email detections will appear here once you sync your emails.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((item) => (
            <EmailEventCard
              key={item.emailEvent.id}
              emailEvent={item.emailEvent}
              application={item.application}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
