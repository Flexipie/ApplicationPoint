'use client';

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STRIPE_CONFIG, formatPrice, type PlanName } from '@/lib/stripe/config';

interface PricingCardsProps {
  isAuthenticated: boolean;
  userId?: string;
}

const PLANS: Array<{
  key: PlanName;
  recommended?: boolean;
}> = [
  { key: 'free' },
  { key: 'premium', recommended: true },
  { key: 'enterprise' },
];

export function PricingCards({ isAuthenticated, userId }: PricingCardsProps) {
  const [loadingPlan, setLoadingPlan] = useState<PlanName | null>(null);

  async function handleSelectPlan(plan: PlanName) {
    if (plan === 'free') {
      // Redirect to signup if not authenticated
      if (!isAuthenticated) {
        window.location.href = '/login';
      } else {
        window.location.href = '/dashboard';
      }
      return;
    }

    if (!isAuthenticated) {
      // Redirect to login with return URL
      window.location.href = `/login?callbackUrl=/pricing?plan=${plan}`;
      return;
    }

    setLoadingPlan(plan);

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
      setLoadingPlan(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {PLANS.map(({ key, recommended }) => {
        const config = STRIPE_CONFIG.plans[key];
        const features = Object.entries(config.limits.features)
          .filter(([_, enabled]) => enabled)
          .map(([feature]) => formatFeatureName(feature));

        const isLoading = loadingPlan === key;

        return (
          <div
            key={key}
            className={`relative rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-lg ${
              recommended
                ? 'border-indigo-600 ring-2 ring-indigo-600 scale-105'
                : 'border-gray-200'
            }`}
          >
            {recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                  <Sparkles className="h-4 w-4" />
                  Recommended
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{config.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900">
                  {formatPrice(config.price)}
                </span>
                {config.interval && (
                  <span className="text-lg text-gray-600">/{config.interval}</span>
                )}
              </div>
            </div>

            <Button
              className={`w-full mb-6 ${
                recommended
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  : ''
              }`}
              onClick={() => handleSelectPlan(key)}
              disabled={isLoading}
            >
              {isLoading
                ? 'Loading...'
                : key === 'free'
                ? isAuthenticated
                  ? 'Current Plan'
                  : 'Get Started'
                : 'Upgrade Now'}
            </Button>

            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Usage Limits</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>
                      {config.limits.applications === -1
                        ? 'Unlimited'
                        : config.limits.applications}{' '}
                      applications
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>
                      {config.limits.emailEventsPerMonth === -1
                        ? 'Unlimited'
                        : config.limits.emailEventsPerMonth}{' '}
                      email events/month
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Features</p>
                <ul className="space-y-2">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatFeatureName(feature: string): string {
  const names: Record<string, string> = {
    browserExtension: 'Browser extension',
    emailIntegration: 'Email integration',
    exportData: 'Export data (CSV)',
    reminders: 'Reminders & follow-ups',
    kanbanView: 'Kanban board view',
    prioritySupport: 'Priority support',
    customIntegrations: 'Custom integrations',
    dedicatedSupport: 'Dedicated support',
  };

  return names[feature] || feature;
}
