import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription';

export const dynamic = 'force-dynamic';

/**
 * Cancel subscription (schedules cancellation at period end)
 */
export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await SubscriptionService.cancelSubscription(session.user.id);

    return NextResponse.json(
      { message: 'Subscription canceled successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
