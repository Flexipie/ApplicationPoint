import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const checkoutSchema = z.object({
  plan: z.enum(['premium', 'enterprise']),
});

/**
 * Create Stripe checkout session for subscription upgrade
 */
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid plan', details: result.error },
        { status: 400 }
      );
    }

    const { plan } = result.data;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Create checkout session
    const checkoutUrl = await SubscriptionService.createCheckoutSession(
      session.user.id,
      plan,
      `${baseUrl}/dashboard?checkout=success`,
      `${baseUrl}/pricing?checkout=canceled`
    );

    return NextResponse.json({ checkoutUrl }, { status: 200 });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
