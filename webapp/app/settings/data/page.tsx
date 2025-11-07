import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { DataSettings } from '@/components/settings/data-settings';

export const metadata = {
  title: 'Data & Privacy Settings - ApplicationPoint',
  description: 'Export your data or delete your account',
};

export default async function DataSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <AppLayout>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">Data & Privacy</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Export your data or delete your account
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DataSettings user={session.user} />
      </div>
    </AppLayout>
  );
}
