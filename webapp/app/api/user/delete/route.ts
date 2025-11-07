import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, accounts, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe/client';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/user/delete - Delete user account and all associated data
 *
 * This will:
 * 1. Cancel active Stripe subscription
 * 2. Delete all user data (cascade deletes applications, reminders, etc.)
 * 3. Delete OAuth accounts and sessions
 * 4. Delete user record
 */
export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // 1. Cancel Stripe subscription if exists
    try {
      const [subscription] = await db.query.subscriptions.findMany({
        where: (subscriptions, { eq }) => eq(subscriptions.userId, userId),
        limit: 1,
      });

      if (subscription?.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        console.log(`✅ Canceled Stripe subscription: ${subscription.stripeSubscriptionId}`);
      }
    } catch (error) {
      console.error('Error canceling Stripe subscription:', error);
      // Continue with deletion even if Stripe cancellation fails
    }

    // 2. Delete OAuth accounts
    await db.delete(accounts).where(eq(accounts.userId, userId));
    console.log('✅ Deleted OAuth accounts');

    // 3. Delete sessions
    await db.delete(sessions).where(eq(sessions.userId, userId));
    console.log('✅ Deleted sessions');

    // 4. Delete user (cascade deletes all related data)
    // This will automatically delete:
    // - applications
    // - stageHistory
    // - emailEvents
    // - contacts
    // - attachments
    // - reminders
    // - subscriptions
    // - usageTracking
    await db.delete(users).where(eq(users.id, userId));
    console.log('✅ Deleted user and all associated data');

    return NextResponse.json(
      {
        success: true,
        message: 'Account deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete account',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
