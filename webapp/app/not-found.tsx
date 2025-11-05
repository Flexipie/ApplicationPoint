import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto px-6 py-12 text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold text-muted-foreground mb-4">404</div>
          <h2 className="text-2xl font-bold mb-2">Page not found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <Link href="/applications">
            <Button variant="outline" className="w-full">
              View Applications
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
