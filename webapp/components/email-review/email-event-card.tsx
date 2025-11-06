'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Trash2, Mail, AlertCircle, Building2, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface EmailEventCardProps {
  emailEvent: EmailEvent;
  application: Application | null;
  onUpdate?: () => void;
}

export function EmailEventCard({ emailEvent, application, onUpdate }: EmailEventCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const emailDate = new Date(emailEvent.emailDate);
  const isPending = emailEvent.userConfirmed === null;
  const isConfirmed = emailEvent.userConfirmed === true;
  const isRejected = emailEvent.userConfirmed === false;

  // Color based on confidence score
  const getConfidenceBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/email-events/${emailEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userConfirmed: true }),
      });

      if (!response.ok) throw new Error('Failed to confirm email event');

      toast({
        title: 'Email confirmed',
        description: 'The email has been confirmed and linked to the application.',
      });

      if (onUpdate) onUpdate();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to confirm email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/email-events/${emailEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userConfirmed: false }),
      });

      if (!response.ok) throw new Error('Failed to reject email event');

      toast({
        title: 'Email rejected',
        description: 'The email has been marked as not relevant.',
      });

      if (onUpdate) onUpdate();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this email event? This cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/email-events/${emailEvent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete email event');

      toast({
        title: 'Email deleted',
        description: 'The email event has been removed.',
      });

      if (onUpdate) onUpdate();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={`
        ${isConfirmed ? 'border-green-300 bg-green-50' : ''}
        ${isRejected ? 'opacity-60' : ''}
      `}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {emailEvent.emailSubject}
                </h4>
              </div>
              <p className="text-xs text-gray-600 truncate">From: {emailEvent.emailFrom}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(emailDate, { addSuffix: true })}
              </p>
            </div>

            {/* Status badge */}
            <div>
              {isPending && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Pending Review
                </Badge>
              )}
              {isConfirmed && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  Confirmed
                </Badge>
              )}
              {isRejected && (
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                  Rejected
                </Badge>
              )}
            </div>
          </div>

          {/* Detection details */}
          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-700">Detected Action</p>
                <p className="text-sm text-gray-900 capitalize">
                  {emailEvent.detectedAction.replace(/_/g, ' ')}
                </p>
              </div>
              <Badge className={`${getConfidenceBadgeColor(emailEvent.confidenceScore)}`}>
                {emailEvent.confidenceScore}% confident
              </Badge>
            </div>

            {emailEvent.rawSnippet && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Snippet</p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {emailEvent.rawSnippet}
                </p>
              </div>
            )}
          </div>

          {/* Linked application */}
          {application && (
            <div className="flex items-center gap-3 p-2 bg-white rounded-md border border-gray-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {application.companyName}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Briefcase className="h-3 w-3" />
                    <span className="truncate">{application.jobTitle}</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/applications/${application.id}`)}
              >
                View
              </Button>
            </div>
          )}

          {/* Actions */}
          {isPending && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                size="sm"
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-1" />
                Confirm
              </Button>
              <Button
                onClick={handleReject}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isLoading}
                size="sm"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {(isConfirmed || isRejected) && (
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
              <Button
                onClick={handleDelete}
                disabled={isLoading}
                size="sm"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
