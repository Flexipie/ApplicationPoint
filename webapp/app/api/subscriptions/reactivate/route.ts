import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription';

export const dynamic = 'force-dynamic';

/**
 * Reactivate a canceled subscription
 */
export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await SubscriptionService.reactivateSubscription(session.user.id);

    return NextResponse.json(
      { message: 'Subscription reactivated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Reactivate subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
}
