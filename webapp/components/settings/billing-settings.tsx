'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlanConfig, formatPrice } from '@/lib/stripe/config';
import type { Subscription, UsageTracking } from '@/db/schema';
import { CreditCard, Calendar, TrendingUp, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface BillingSettingsProps {
  subscription: Subscription;
  usage: UsageTracking;
}

export function BillingSettings({ subscription, usage }: BillingSettingsProps) {
  const [loading, setLoading] = useState(false);
  const planConfig = getPlanConfig(subscription.plan);

  const applicationsLimit = planConfig.limits.applications;
  const emailEventsLimit = planConfig.limits.emailEventsPerMonth;

  const applicationsPercent =
    applicationsLimit === -1 ? 0 : (usage.applicationsCount / applicationsLimit) * 100;
  const emailEventsPercent =
    emailEventsLimit === -1 ? 0 : (usage.emailEventsProcessed / emailEventsLimit) * 100;

  async function handleManageSubscription() {
    setLoading(true);

    try {
      const response = await fetch('/api/subscriptions/portal');

      if (!response.ok) {
        throw new Error('Failed to get portal URL');
      }

      const { portalUrl } = await response.json();
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
      setLoading(false);
    }
  }

  async function handleCancelSubscription() {
    if (
      !confirm(
        'Are you sure you want to cancel? Your subscription will remain active until the end of your billing period.'
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/subscriptions/cancel', { method: 'POST' });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      window.location.reload();
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel subscription. Please try again.');
      setLoading(false);
    }
  }

  async function handleReactivateSubscription() {
    setLoading(true);

    try {
      const response = await fetch('/api/subscriptions/reactivate', { method: 'POST' });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      window.location.reload();
    } catch (error) {
      console.error('Reactivate error:', error);
      alert('Failed to reactivate subscription. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{planConfig.name}</h3>
              {subscription.plan !== 'free' && (
                <p className="mt-1 text-lg text-gray-600">
                  {formatPrice(planConfig.price)}/{planConfig.interval}
                </p>
              )}
              {subscription.plan === 'free' && (
                <p className="mt-1 text-sm text-gray-600">
                  Free forever - <Link href="/pricing" className="text-indigo-600 hover:underline">Upgrade for more features</Link>
                </p>
              )}
            </div>

            {subscription.plan !== 'free' && (
              <div className="flex gap-2">
                {subscription.cancelAtPeriodEnd ? (
                  <Button onClick={handleReactivateSubscription} disabled={loading}>
                    Reactivate
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleManageSubscription}
                      disabled={loading}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage Billing
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={loading}
                    >
                      Cancel Plan
                    </Button>
                  </>
                )}
              </div>
            )}

            {subscription.plan === 'free' && (
              <Link href="/pricing">
                <Button>Upgrade Plan</Button>
              </Link>
            )}
          </div>

          {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
            <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Subscription scheduled for cancellation
                  </p>
                  <p className="mt-1 text-sm text-yellow-800">
                    Your plan will be active until{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {subscription.plan !== 'free' &&
            !subscription.cancelAtPeriodEnd &&
            subscription.currentPeriodEnd && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Next billing date:{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Applications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Applications Created</span>
              <span className="text-sm font-semibold text-gray-900">
                {usage.applicationsCount} /{' '}
                {applicationsLimit === -1 ? '∞' : applicationsLimit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  applicationsPercent >= 90
                    ? 'bg-red-600'
                    : applicationsPercent >= 70
                    ? 'bg-yellow-600'
                    : 'bg-green-600'
                }`}
                style={{
                  width: applicationsLimit === -1 ? '0%' : `${Math.min(applicationsPercent, 100)}%`,
                }}
              />
            </div>
            {applicationsPercent >= 90 && applicationsLimit !== -1 && (
              <p className="mt-2 text-sm text-red-600">
                You're approaching your limit. Consider{' '}
                <Link href="/pricing" className="underline">
                  upgrading your plan
                </Link>
                .
              </p>
            )}
          </div>

          {/* Email Events */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Email Events Processed</span>
              <span className="text-sm font-semibold text-gray-900">
                {usage.emailEventsProcessed} /{' '}
                {emailEventsLimit === -1 ? '∞' : emailEventsLimit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  emailEventsPercent >= 90
                    ? 'bg-red-600'
                    : emailEventsPercent >= 70
                    ? 'bg-yellow-600'
                    : 'bg-green-600'
                }`}
                style={{
                  width: emailEventsLimit === -1 ? '0%' : `${Math.min(emailEventsPercent, 100)}%`,
                }}
              />
            </div>
            {emailEventsPercent >= 90 && emailEventsLimit !== -1 && (
              <p className="mt-2 text-sm text-red-600">
                You're approaching your limit. Consider{' '}
                <Link href="/pricing" className="underline">
                  upgrading your plan
                </Link>
                .
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Usage resets on{' '}
              {new Date(usage.periodEnd).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      {subscription.plan === 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>Why Upgrade?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Premium - $9.99/month</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Track up to 500 applications</li>
                  <li>✓ 2,000 email events per month</li>
                  <li>✓ Full email integration</li>
                  <li>✓ Priority support</li>
                </ul>
                <Link href="/pricing">
                  <Button className="w-full mt-4">Upgrade to Premium</Button>
                </Link>
              </div>

              <div className="rounded-lg border border-indigo-600 p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Enterprise - $29.99/month
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Unlimited applications</li>
                  <li>✓ Unlimited email events</li>
                  <li>✓ Custom integrations</li>
                  <li>✓ Dedicated support</li>
                </ul>
                <Link href="/pricing">
                  <Button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Upgrade to Enterprise
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
