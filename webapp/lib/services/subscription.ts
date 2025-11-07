import { db } from '@/db';
import { subscriptions, users, usageTracking } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { stripe } from '@/lib/stripe/client';
import { getPlanConfig, type PlanName } from '@/lib/stripe/config';
import Stripe from 'stripe';

export class SubscriptionService {
  /**
   * Get or create subscription for user
   * All users start with a free subscription
   */
  static async getOrCreateSubscription(userId: string) {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (subscription) {
      return subscription;
    }

    // Create free subscription for new user
    const [newSubscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        plan: 'free',
        status: 'active',
      })
      .returning();

    return newSubscription;
  }

  /**
   * Create Stripe customer for user
   */
  static async createStripeCustomer(userId: string, email: string, name?: string | null) {
    // Check if customer already exists
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (subscription?.stripeCustomerId) {
      return subscription.stripeCustomerId;
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        userId,
      },
    });

    // Update subscription with Stripe customer ID
    await db
      .update(subscriptions)
      .set({ stripeCustomerId: customer.id })
      .where(eq(subscriptions.userId, userId));

    return customer.id;
  }

  /**
   * Create checkout session for plan upgrade
   */
  static async createCheckoutSession(
    userId: string,
    plan: PlanName,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    if (plan === 'free') {
      throw new Error('Cannot create checkout session for free plan');
    }

    const planConfig = getPlanConfig(plan);
    if (!planConfig.priceId) {
      throw new Error(`Price ID not configured for ${plan} plan`);
    }

    // Get or create Stripe customer
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    const customerId = await this.createStripeCustomer(userId, user.email, user.name);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        plan,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    return session.url!;
  }

  /**
   * Handle successful checkout (called by webhook)
   */
  static async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as PlanName;

    if (!userId || !plan) {
      throw new Error('Missing metadata in checkout session');
    }

    const subscription = session.subscription as string;
    const customerId = session.customer as string;

    // Fetch subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription);

    // Update subscription in database
    await db
      .update(subscriptions)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0].price.id,
        plan,
        status: stripeSubscription.status as any,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));
  }

  /**
   * Handle subscription update (called by webhook)
   */
  static async handleSubscriptionUpdate(stripeSubscription: Stripe.Subscription) {
    const customerId = stripeSubscription.customer as string;

    // Find subscription by Stripe customer ID
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeCustomerId, customerId))
      .limit(1);

    if (!subscription) {
      throw new Error('Subscription not found for customer');
    }

    await db
      .update(subscriptions)
      .set({
        status: stripeSubscription.status as any,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        canceledAt: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));
  }

  /**
   * Handle subscription deletion (called by webhook)
   */
  static async handleSubscriptionDelete(stripeSubscription: Stripe.Subscription) {
    const customerId = stripeSubscription.customer as string;

    // Find subscription by Stripe customer ID
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeCustomerId, customerId))
      .limit(1);

    if (!subscription) {
      throw new Error('Subscription not found for customer');
    }

    // Downgrade to free plan
    await db
      .update(subscriptions)
      .set({
        plan: 'free',
        status: 'canceled',
        stripeSubscriptionId: null,
        stripePriceId: null,
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));
  }

  /**
   * Cancel subscription (schedules cancellation at period end)
   */
  static async cancelSubscription(userId: string) {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    // Cancel at period end in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update in database
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));
  }

  /**
   * Reactivate canceled subscription
   */
  static async reactivateSubscription(userId: string) {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No subscription found');
    }

    // Reactivate in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update in database
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: false,
        canceledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));
  }

  /**
   * Get or create current usage tracking period
   */
  static async getCurrentUsage(userId: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Try to find existing usage record for current period
    const [usage] = await db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          gte(usageTracking.periodStart, periodStart),
          lte(usageTracking.periodEnd, periodEnd)
        )
      )
      .limit(1);

    if (usage) {
      return usage;
    }

    // Create new usage record for current period
    const [newUsage] = await db
      .insert(usageTracking)
      .values({
        userId,
        applicationsCount: 0,
        emailEventsProcessed: 0,
        periodStart,
        periodEnd,
      })
      .returning();

    return newUsage;
  }

  /**
   * Increment usage counter
   */
  static async incrementUsage(
    userId: string,
    metric: 'applicationsCount' | 'emailEventsProcessed',
    amount: number = 1
  ) {
    const usage = await this.getCurrentUsage(userId);

    await db
      .update(usageTracking)
      .set({
        [metric]: usage[metric] + amount,
        updatedAt: new Date(),
      })
      .where(eq(usageTracking.id, usage.id));
  }

  /**
   * Get customer portal URL for managing subscription
   */
  static async getPortalUrl(userId: string, returnUrl: string): Promise<string> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!subscription?.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }
}
