import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ApplicationsList } from '@/components/applications/applications-list';

export default async function ApplicationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track and manage your job applications
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ApplicationsList />
      </main>
    </div>
  );
}
