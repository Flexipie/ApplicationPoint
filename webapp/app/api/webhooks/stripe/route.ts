import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { SubscriptionService } from '@/lib/services/subscription';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

/**
 * Stripe webhook handler
 *
 * Processes subscription events from Stripe
 * Configure webhook in Stripe Dashboard to point to: /api/webhooks/stripe
 *
 * Events handled:
 * - checkout.session.completed: New subscription created
 * - customer.subscription.updated: Subscription changed
 * - customer.subscription.deleted: Subscription canceled
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only handle subscription checkouts
        if (session.mode === 'subscription') {
          await SubscriptionService.handleCheckoutComplete(session);
          console.log(`✅ Checkout completed for customer: ${session.customer}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await SubscriptionService.handleSubscriptionUpdate(subscription);
        console.log(`✅ Subscription updated: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await SubscriptionService.handleSubscriptionDelete(subscription);
        console.log(`✅ Subscription deleted: ${subscription.id}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`✅ Payment succeeded for invoice: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`⚠️  Payment failed for invoice: ${invoice.id}`);
        // Could send notification to user here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}
