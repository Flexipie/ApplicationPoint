# Stripe Setup Guide

This guide walks you through setting up Stripe for subscription billing.

## Prerequisites

- Stripe account (create at https://stripe.com)
- Access to Stripe Dashboard
- Local development environment running

## Step 1: Get Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** and **Secret key**
3. Add to `webapp/.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Step 2: Create Products and Prices

### Premium Plan ($9.99/month)

1. Go to https://dashboard.stripe.com/test/products
2. Click "Add product"
3. Fill in:
   - **Name**: ApplicationPoint Premium
   - **Description**: Track unlimited job applications with email integration
   - **Pricing model**: Standard pricing
   - **Price**: $9.99
   - **Billing period**: Monthly
   - **Currency**: USD
4. Click "Save product"
5. Copy the **Price ID** (starts with `price_`)
6. Add to `webapp/.env.local`:

```bash
STRIPE_PREMIUM_PRICE_ID=price_...
```

### Enterprise Plan ($29.99/month)

1. Repeat steps above with:
   - **Name**: ApplicationPoint Enterprise
   - **Description**: Unlimited applications with priority support
   - **Price**: $29.99
2. Copy the **Price ID**
3. Add to `webapp/.env.local`:

```bash
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

## Step 3: Set Up Webhook

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Fill in:
   - **Endpoint URL**: `https://your-domain.com/api/webhooks/stripe`
     - For local testing: Use ngrok or Stripe CLI (see below)
   - **Events to send**: Select these events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Click "Add endpoint"
5. Click "Reveal" on the signing secret
6. Add to `webapp/.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 4: Local Testing with Stripe CLI (Recommended)

Install Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with scoop)
scoop install stripe

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

Login to Stripe:

```bash
stripe login
```

Forward webhooks to local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output a webhook signing secret. Add it to `webapp/.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Test a payment:

```bash
stripe trigger checkout.session.completed
```

## Step 5: Test Cards

Use these test cards in Stripe Checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Authentication required**: `4000 0025 0000 3155`

Use any:
- Future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any ZIP code

## Step 6: Customer Portal

Enable customer portal for self-service subscription management:

1. Go to https://dashboard.stripe.com/test/settings/billing/portal
2. Click "Activate"
3. Configure settings:
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to view invoices
   - Set cancellation behavior: "Cancel at end of billing period"
4. Save settings

## Step 7: Production Checklist

Before going live:

1. Switch to **Live mode** in Stripe Dashboard
2. Update API keys in production environment:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
3. Create production products and prices (repeat Step 2)
4. Set up production webhook (repeat Step 3)
5. Complete Stripe account activation:
   - Add business details
   - Add bank account for payouts
   - Complete identity verification

## Environment Variables Summary

Add these to `webapp/.env.local`:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs (from products created in dashboard)
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Stripe Webhook Secret (from webhook endpoint)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Troubleshooting

### Webhooks not firing

- Verify webhook endpoint URL is correct
- Check webhook signing secret matches
- Use Stripe CLI to test locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Checkout session not creating subscription

- Verify price IDs are correct in `.env.local`
- Check that products are set to "Recurring" billing
- Ensure webhook events are configured

### Usage limits not enforcing

- Run migration to create usage_tracking table: `pnpm db:migrate`
- Check that subscription record exists for user
- Verify plan limits in `webapp/lib/stripe/config.ts`

## Testing Subscription Flow

1. Start development server: `pnpm dev`
2. Start Stripe webhook listener: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Go to pricing page: http://localhost:3000/pricing
4. Click "Upgrade to Premium"
5. Use test card: `4242 4242 4242 4242`
6. Complete checkout
7. Verify subscription in database
8. Check webhook received: Look for "✅ Checkout completed" in webhook listener

## Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Testing Cards](https://stripe.com/docs/testing)
- [Webhook Reference](https://stripe.com/docs/api/webhooks)
