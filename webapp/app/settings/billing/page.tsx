import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { BillingSettings } from '@/components/settings/billing-settings';
import { SubscriptionService } from '@/lib/services/subscription';

export const metadata = {
  title: 'Billing Settings - ApplicationPoint',
  description: 'Manage your subscription and billing',
};

export default async function BillingSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const subscription = await SubscriptionService.getOrCreateSubscription(session.user.id);
  const usage = await SubscriptionService.getCurrentUsage(session.user.id);

  return (
    <AppLayout>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">Billing Settings</h1>
          <p className="mt-0.5 text-xs text-gray-500">Manage your subscription and usage</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <BillingSettings subscription={subscription} usage={usage} />
      </div>
    </AppLayout>
  );
}
