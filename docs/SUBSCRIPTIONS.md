# Subscription System

This document describes how the subscription and billing system works in ApplicationPoint.

## Overview

ApplicationPoint uses a tiered subscription model with three plans:
- **Free**: Limited features for casual users
- **Premium**: Full features for active job seekers
- **Enterprise**: Unlimited usage with priority support

## Database Schema

### Subscriptions Table

Tracks user subscription status and Stripe relationship:

```typescript
{
  id: string;                        // CUID2
  userId: string;                    // References users.id
  stripeCustomerId: string;          // Stripe customer ID
  stripeSubscriptionId: string;      // Stripe subscription ID
  stripePriceId: string;             // Current price ID
  plan: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | ...;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date;
  trialStart: Date;
  trialEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Usage Tracking Table

Tracks monthly usage for plan limit enforcement:

```typescript
{
  id: string;
  userId: string;
  applicationsCount: number;         // Applications created this period
  emailEventsProcessed: number;      // Emails processed this period
  periodStart: Date;                 // Start of billing period
  periodEnd: Date;                   // End of billing period
  createdAt: Date;
  updatedAt: Date;
}
```

## Plan Limits

Defined in `webapp/lib/stripe/config.ts`:

### Free Plan
- **Applications**: 25 max
- **Email Events**: 100/month
- **Features**:
  - ✅ Browser extension
  - ❌ Email integration
  - ✅ Export data
  - ✅ Reminders
  - ✅ Kanban view

### Premium Plan ($9.99/month)
- **Applications**: 500 max
- **Email Events**: 2,000/month
- **Features**:
  - ✅ Everything in Free
  - ✅ Email integration
  - ✅ Priority support

### Enterprise Plan ($29.99/month)
- **Applications**: Unlimited
- **Email Events**: Unlimited
- **Features**:
  - ✅ Everything in Premium
  - ✅ Custom integrations
  - ✅ Dedicated support

## Subscription Service

Located in `webapp/lib/services/subscription.ts`

### Key Methods

#### `getOrCreateSubscription(userId: string)`
Gets existing subscription or creates free subscription for new user.

```typescript
const subscription = await SubscriptionService.getOrCreateSubscription(userId);
```

#### `createCheckoutSession(userId, plan, successUrl, cancelUrl)`
Creates Stripe checkout session for plan upgrade.

```typescript
const checkoutUrl = await SubscriptionService.createCheckoutSession(
  userId,
  'premium',
  'https://example.com/success',
  'https://example.com/cancel'
);
```

#### `cancelSubscription(userId: string)`
Schedules subscription cancellation at period end.

```typescript
await SubscriptionService.cancelSubscription(userId);
```

#### `reactivateSubscription(userId: string)`
Reactivates a subscription scheduled for cancellation.

```typescript
await SubscriptionService.reactivateSubscription(userId);
```

#### `getCurrentUsage(userId: string)`
Gets or creates usage tracking for current billing period.

```typescript
const usage = await SubscriptionService.getCurrentUsage(userId);
console.log(usage.applicationsCount); // Number of apps created this month
```

#### `incrementUsage(userId, metric, amount)`
Increments usage counter for limit enforcement.

```typescript
// When user creates an application
await SubscriptionService.incrementUsage(userId, 'applicationsCount', 1);

// When processing an email
await SubscriptionService.incrementUsage(userId, 'emailEventsProcessed', 1);
```

#### `getPortalUrl(userId: string, returnUrl: string)`
Gets Stripe customer portal URL for self-service management.

```typescript
const portalUrl = await SubscriptionService.getPortalUrl(
  userId,
  'https://example.com/settings'
);
```

## Webhook Handling

Webhook endpoint: `/api/webhooks/stripe`

### Events Handled

1. **`checkout.session.completed`**
   - Triggered when user completes checkout
   - Creates/updates subscription record
   - Syncs Stripe subscription data to database

2. **`customer.subscription.updated`**
   - Triggered when subscription changes (upgrade, downgrade, renewal)
   - Updates subscription status and period dates

3. **`customer.subscription.deleted`**
   - Triggered when subscription ends
   - Downgrades user to free plan

4. **`invoice.payment_succeeded`**
   - Triggered on successful payment
   - Log success (no action needed)

5. **`invoice.payment_failed`**
   - Triggered on failed payment
   - Could send notification to user

## Usage Flow

### New User Sign Up

```typescript
// 1. User signs up via OAuth
const user = await createUser(email);

// 2. Create free subscription automatically
const subscription = await SubscriptionService.getOrCreateSubscription(user.id);
// subscription.plan === 'free'

// 3. Create initial usage tracking
const usage = await SubscriptionService.getCurrentUsage(user.id);
// usage.applicationsCount === 0
```

### Upgrading to Premium

```typescript
// 1. User clicks "Upgrade to Premium"
const checkoutUrl = await SubscriptionService.createCheckoutSession(
  userId,
  'premium',
  `${baseUrl}/dashboard?checkout=success`,
  `${baseUrl}/pricing?checkout=canceled`
);

// 2. Redirect user to Stripe Checkout
redirect(checkoutUrl);

// 3. User completes payment in Stripe
// 4. Stripe sends webhook: checkout.session.completed
// 5. Webhook handler updates subscription:
await SubscriptionService.handleCheckoutComplete(session);

// 6. User redirected to success URL
// subscription.plan === 'premium'
```

### Enforcing Plan Limits

```typescript
// When creating application
async function createApplication(userId: string, data: ApplicationData) {
  // 1. Get subscription and usage
  const subscription = await SubscriptionService.getOrCreateSubscription(userId);
  const usage = await SubscriptionService.getCurrentUsage(userId);

  // 2. Check limits
  const planConfig = getPlanConfig(subscription.plan);
  const limit = planConfig.limits.applications;

  if (limit !== -1 && usage.applicationsCount >= limit) {
    throw new Error('Application limit reached. Please upgrade your plan.');
  }

  // 3. Create application
  const app = await db.insert(applications).values({ userId, ...data });

  // 4. Increment usage
  await SubscriptionService.incrementUsage(userId, 'applicationsCount', 1);

  return app;
}
```

### Checking Feature Access

```typescript
import { hasFeature } from '@/lib/stripe/config';

// Check if user has access to email integration
const subscription = await SubscriptionService.getOrCreateSubscription(userId);
const hasEmailAccess = hasFeature(subscription.plan, 'emailIntegration');

if (!hasEmailAccess) {
  throw new Error('Email integration requires Premium or Enterprise plan');
}
```

### Managing Subscription

```typescript
// Get customer portal URL
const portalUrl = await SubscriptionService.getPortalUrl(
  userId,
  `${baseUrl}/settings/billing`
);

// User can:
// - Update payment method
// - Cancel subscription
// - View invoices
// - Reactivate canceled subscription
```

## Testing

See `SETUP_STRIPE.md` for detailed testing instructions.

### Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication: `4000 0025 0000 3155`

### Local Webhook Testing

```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Trigger test event
stripe trigger checkout.session.completed
```

## Common Patterns

### Display Plan Status in UI

```typescript
const subscription = await SubscriptionService.getOrCreateSubscription(userId);
const usage = await SubscriptionService.getCurrentUsage(userId);
const planConfig = getPlanConfig(subscription.plan);

return (
  <div>
    <h2>Current Plan: {planConfig.name}</h2>
    <p>Applications: {usage.applicationsCount} / {planConfig.limits.applications}</p>

    {subscription.cancelAtPeriodEnd && (
      <Alert>
        Your subscription will end on {subscription.currentPeriodEnd}
      </Alert>
    )}
  </div>
);
```

### Upgrade Button with Loading State

```typescript
const [loading, setLoading] = useState(false);

async function handleUpgrade() {
  setLoading(true);
  try {
    const checkoutUrl = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan: 'premium' }),
    }).then(r => r.json());

    window.location.href = checkoutUrl;
  } catch (error) {
    toast.error('Failed to start checkout');
    setLoading(false);
  }
}
```

### Usage Warning Banner

```typescript
const subscription = await SubscriptionService.getOrCreateSubscription(userId);
const usage = await SubscriptionService.getCurrentUsage(userId);
const planConfig = getPlanConfig(subscription.plan);
const limit = planConfig.limits.applications;

const usagePercent = limit === -1 ? 0 : (usage.applicationsCount / limit) * 100;

if (usagePercent >= 90) {
  return (
    <Alert variant="warning">
      You've used {usagePercent.toFixed(0)}% of your plan's application limit.
      <Link href="/pricing">Upgrade now</Link>
    </Alert>
  );
}
```

## Production Considerations

1. **Webhook Reliability**
   - Stripe retries failed webhooks automatically
   - Implement idempotency in webhook handlers
   - Monitor webhook delivery in Stripe Dashboard

2. **Failed Payments**
   - Stripe automatically retries failed payments
   - Consider email notifications for past_due status
   - Implement grace period before feature restriction

3. **Plan Migrations**
   - Handle users upgrading mid-billing cycle
   - Proration handled automatically by Stripe
   - Consider migration scripts for plan changes

4. **Security**
   - Never expose `STRIPE_SECRET_KEY` client-side
   - Always verify webhook signatures
   - Validate all user input before Stripe API calls

## References

- [Stripe Subscriptions Docs](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks Docs](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Plan Limits Config](../webapp/lib/stripe/config.ts)
- [Subscription Service](../webapp/lib/services/subscription.ts)
- [Webhook Handler](../webapp/app/api/webhooks/stripe/route.ts)
