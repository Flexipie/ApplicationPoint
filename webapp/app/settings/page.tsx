import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import Link from 'next/link';
import { Settings as SettingsIcon, CreditCard, Database, Mail, ChevronRight } from 'lucide-react';

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const settingsSections = [
    {
      title: 'General',
      description: 'Profile, timezone, and Gmail integration',
      href: '/settings/general',
      icon: SettingsIcon,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      title: 'Billing',
      description: 'Manage your subscription and usage',
      href: '/settings/billing',
      icon: CreditCard,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Data & Privacy',
      description: 'Export your data or delete your account',
      href: '/settings/data',
      icon: Database,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <AppLayout>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Manage your account, billing, and privacy settings
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group relative rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`inline-flex rounded-lg ${section.bgColor} p-2.5 mb-3`}>
                      <Icon className={`h-5 w-5 ${section.iconColor}`} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ml-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
