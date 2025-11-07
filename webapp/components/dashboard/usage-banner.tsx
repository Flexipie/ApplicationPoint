'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { Subscription, UsageTracking } from '@/db/schema';
import { getPlanConfig } from '@/lib/stripe/config';

interface UsageBannerProps {
  subscription: Subscription;
  usage: UsageTracking;
}

export function UsageBanner({ subscription, usage }: UsageBannerProps) {
  const planConfig = getPlanConfig(subscription.plan);

  // Calculate usage percentages
  const applicationsLimit = planConfig.limits.applications;
  const emailEventsLimit = planConfig.limits.emailEventsPerMonth;

  const applicationsPercent =
    applicationsLimit === -1 ? 0 : (usage.applicationsCount / applicationsLimit) * 100;
  const emailEventsPercent =
    emailEventsLimit === -1 ? 0 : (usage.emailEventsProcessed / emailEventsLimit) * 100;

  // Only show banner if user is approaching limits (90% or more)
  const showApplicationsWarning = applicationsPercent >= 90;
  const showEmailEventsWarning = emailEventsPercent >= 90;

  if (!showApplicationsWarning && !showEmailEventsWarning) {
    return null;
  }

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-900">
            Approaching Plan Limits
          </h3>
          <div className="mt-2 space-y-1 text-sm text-yellow-800">
            {showApplicationsWarning && (
              <p>
                • You've used {usage.applicationsCount} of {applicationsLimit} applications (
                {applicationsPercent.toFixed(0)}%)
              </p>
            )}
            {showEmailEventsWarning && (
              <p>
                • You've processed {usage.emailEventsProcessed} of {emailEventsLimit} email
                events this month ({emailEventsPercent.toFixed(0)}%)
              </p>
            )}
          </div>
          <div className="mt-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-700 transition-colors"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
