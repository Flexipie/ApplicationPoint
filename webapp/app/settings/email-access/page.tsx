import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { emailEvents } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { EmailAccessLogTable } from '@/components/settings/email-access-log-table';
import { Mail, AlertCircle } from 'lucide-react';

export default async function EmailAccessLogPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch email events for this user
  const events = await db
    .select()
    .from(emailEvents)
    .where(eq(emailEvents.userId, session.user.id))
    .orderBy(desc(emailEvents.emailDate))
    .limit(100); // Show last 100 emails

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Access Log
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          View all emails that were scanned for job application updates
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Full Transparency</p>
          <p className="mt-1">
            This log shows every email we've scanned. We only process emails to detect job
            application updates and never access other data or send emails on your behalf.
          </p>
        </div>
      </div>

      {/* Email Events Table */}
      {events.length > 0 ? (
        <EmailAccessLogTable events={events} />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No emails scanned yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Connect your Gmail account to start processing emails automatically
          </p>
        </div>
      )}

      {events.length === 100 && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          Showing the 100 most recent emails. Older emails are archived.
        </p>
      )}
    </div>
  );
}
