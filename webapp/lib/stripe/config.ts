/**
 * Stripe pricing configuration
 *
 * Update these Stripe Price IDs after creating products in Stripe Dashboard
 */

export const STRIPE_CONFIG = {
  plans: {
    free: {
      name: 'Free',
      priceId: null, // No Stripe price for free plan
      price: 0,
      interval: null,
      limits: {
        applications: 25,
        emailEventsPerMonth: 100,
        features: {
          browserExtension: true,
          emailIntegration: false,
          exportData: true,
          reminders: true,
          kanbanView: true,
        },
      },
    },
    premium: {
      name: 'Premium',
      priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '', // Monthly price ID
      price: 999, // $9.99/month in cents
      interval: 'month' as const,
      limits: {
        applications: 500,
        emailEventsPerMonth: 2000,
        features: {
          browserExtension: true,
          emailIntegration: true,
          exportData: true,
          reminders: true,
          kanbanView: true,
          prioritySupport: true,
        },
      },
    },
    enterprise: {
      name: 'Enterprise',
      priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '', // Monthly price ID
      price: 2999, // $29.99/month in cents
      interval: 'month' as const,
      limits: {
        applications: -1, // Unlimited
        emailEventsPerMonth: -1, // Unlimited
        features: {
          browserExtension: true,
          emailIntegration: true,
          exportData: true,
          reminders: true,
          kanbanView: true,
          prioritySupport: true,
          customIntegrations: true,
          dedicatedSupport: true,
        },
      },
    },
  },
} as const;

export type PlanName = keyof typeof STRIPE_CONFIG.plans;
export type PlanConfig = typeof STRIPE_CONFIG.plans[PlanName];

/**
 * Get plan configuration by name
 */
export function getPlanConfig(plan: PlanName): PlanConfig {
  return STRIPE_CONFIG.plans[plan];
}

/**
 * Check if a feature is available for a plan
 */
export function hasFeature(plan: PlanName, feature: string): boolean {
  const config = getPlanConfig(plan);
  return (config.limits.features as any)[feature] === true;
}

/**
 * Check if usage is within plan limits
 */
export function isWithinLimits(
  plan: PlanName,
  metric: 'applications' | 'emailEventsPerMonth',
  currentUsage: number
): boolean {
  const config = getPlanConfig(plan);
  const limit = config.limits[metric];

  // -1 means unlimited
  if (limit === -1) return true;

  return currentUsage < limit;
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
