import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription';

export const dynamic = 'force-dynamic';

/**
 * Get Stripe customer portal URL
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const portalUrl = await SubscriptionService.getPortalUrl(
      session.user.id,
      `${baseUrl}/settings/billing`
    );

    return NextResponse.json({ portalUrl }, { status: 200 });
  } catch (error: any) {
    console.error('Portal URL error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get portal URL' },
      { status: 500 }
    );
  }
}
