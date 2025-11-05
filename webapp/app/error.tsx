'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto px-6 py-12 text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
          <p className="text-muted-foreground">
            We encountered an unexpected error. This has been logged and we'll look into it.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-left">
            <p className="text-sm font-mono text-destructive break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={() => reset()} className="w-full">
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/dashboard')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
