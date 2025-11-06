import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DisconnectGmailButton } from '@/components/settings/disconnect-gmail-button';
import { ConnectGmailButton } from '@/components/settings/connect-gmail-button';
import { Mail, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get user settings
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const isGmailConnected = user?.emailConnected || false;
  const lastSync = user?.lastEmailSync;

  return (
    <div className="divide-y divide-gray-200">
      {/* Gmail Connection Section */}
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Gmail Integration
        </h2>

        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Gmail Connection
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isGmailConnected
                    ? 'Connected - Emails are being processed daily'
                    : 'Disconnected - Sign out and sign back in to reconnect'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isGmailConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>

          {/* Last Sync Time */}
          {isGmailConnected && lastSync && (
            <div className="flex items-center gap-2 text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
              <Clock className="h-4 w-4" />
              <span>
                Last email sync: {formatDistanceToNow(lastSync, { addSuffix: true })}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {isGmailConnected ? (
              <DisconnectGmailButton userId={session.user.id} />
            ) : (
              <>
                <ConnectGmailButton />
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex-1">
                  <p className="text-sm text-blue-800">
                    Click "Connect Gmail" to enable automatic email processing. We use your existing Google sign-in credentials.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Privacy Note:</strong> We only read emails to detect job application updates.
              We never send emails on your behalf or access other data.
              View all scanned emails in the{' '}
              <a href="/settings/email-access" className="underline font-medium">
                Email Access Log
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Profile
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="mt-1 text-sm text-gray-900">{session.user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <p className="mt-1 text-sm text-gray-900">{session.user.name || 'Not set'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <p className="mt-1 text-sm text-gray-500">{user?.timezone || 'UTC'}</p>
            <p className="mt-1 text-xs text-gray-400">
              Timezone settings coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
