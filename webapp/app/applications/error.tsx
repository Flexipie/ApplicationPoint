'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ApplicationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Applications page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3">Failed to load applications</h2>
        <p className="text-muted-foreground mb-8">
          We couldn't load your job applications. This might be a temporary issue.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-4 bg-muted rounded-lg text-left">
            <p className="text-xs font-mono break-words">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={() => reset()}>Try Again</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
