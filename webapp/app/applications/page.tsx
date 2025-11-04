import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ApplicationsList } from '@/components/applications/applications-list';
import { TestGmailButton } from '@/components/email/test-gmail-button';
import { ProcessEmailsButton } from '@/components/email/process-emails-button';
import { AppLayout } from '@/components/layout/app-layout';

export default async function ApplicationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <AppLayout>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage your job applications
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Email Integration Testing - Remove after Phase 2 */}
        <div className="mb-6 space-y-4">
          <TestGmailButton />
          <ProcessEmailsButton />
        </div>

        <ApplicationsList />
      </div>
    </AppLayout>
  );
}
