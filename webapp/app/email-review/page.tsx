import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { emailEvents, applications } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { EmailEventList } from '@/components/email-review/email-event-list';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';

export default async function EmailReviewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch all email events with their linked applications
  const results = await db
    .select({
      emailEvent: emailEvents,
      application: {
        id: applications.id,
        companyName: applications.companyName,
        jobTitle: applications.jobTitle,
        currentStatus: applications.currentStatus,
      },
    })
    .from(emailEvents)
    .leftJoin(applications, eq(emailEvents.applicationId, applications.id))
    .where(eq(emailEvents.userId, session.user.id!))
    .orderBy(desc(emailEvents.emailDate));

  // Convert dates to strings for client components
  const eventsWithStringDates = results.map((result) => ({
    emailEvent: {
      ...result.emailEvent,
      emailDate: result.emailEvent.emailDate.toISOString(),
    },
    application: result.application,
  }));

  // Calculate stats
  const pendingCount = results.filter((r) => r.emailEvent.userConfirmed === null).length;
  const confirmedCount = results.filter((r) => r.emailEvent.userConfirmed === true).length;

  return (
    <AppLayout>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Mail className="h-6 w-6 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">Email Review Queue</h1>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Review and confirm auto-detected job-related emails
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
                <div className="text-xs text-gray-600">Confirmed</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {results.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No email events yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Email detections will appear here once you sync your emails with Gmail.
            </p>
            <Button asChild>
              <Link href="/api/email/process">
                Sync Emails
              </Link>
            </Button>
          </div>
        ) : (
          <div>
            <EmailEventList
              events={eventsWithStringDates}
              initialFilter="pending"
            />

            {/* Help text */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                How does this work?
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• We automatically scan your Gmail for job-related emails (confirmations, interview invites, etc.)</li>
                <li>• Review each detection and confirm if it's correct or reject if it's wrong</li>
                <li>• Confirmed emails update your application status automatically</li>
                <li>• Use bulk actions to quickly process multiple emails at once</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
