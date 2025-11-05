import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Settings, Mail, Bell, User } from 'lucide-react';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <nav className="lg:col-span-1">
            <div className="space-y-1">
              <SettingsNavLink
                href="/settings"
                icon={<User className="h-5 w-5" />}
                label="General"
              />
              <SettingsNavLink
                href="/settings/email-access"
                icon={<Mail className="h-5 w-5" />}
                label="Email Access Log"
              />
              <SettingsNavLink
                href="/settings/notifications"
                icon={<Bell className="h-5 w-5" />}
                label="Notifications"
              />
            </div>
          </nav>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg">
              {children}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SettingsNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    >
      <span className="text-gray-400 group-hover:text-gray-600">{icon}</span>
      {label}
    </Link>
  );
}
