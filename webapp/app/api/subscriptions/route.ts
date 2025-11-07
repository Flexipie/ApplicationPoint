import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription';

export const dynamic = 'force-dynamic';

/**
 * Get current subscription details
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscription = await SubscriptionService.getOrCreateSubscription(session.user.id);
    const usage = await SubscriptionService.getCurrentUsage(session.user.id);

    return NextResponse.json(
      {
        subscription,
        usage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
