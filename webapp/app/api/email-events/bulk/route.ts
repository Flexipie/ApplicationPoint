import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { emailEvents } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { rateLimit, apiRateLimiter } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bulkUpdateSchema = z.object({
  ids: z.array(z.string()).min(1).max(50), // Limit to 50 at a time
  userConfirmed: z.boolean(),
});

/**
 * POST /api/email-events/bulk
 * Bulk update email event confirmation status
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(req, apiRateLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = bulkUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error },
        { status: 400 }
      );
    }

    const { ids, userConfirmed } = validationResult.data;

    // Verify all email events belong to the user
    const existing = await db
      .select({ id: emailEvents.id })
      .from(emailEvents)
      .where(
        and(
          inArray(emailEvents.id, ids),
          eq(emailEvents.userId, session.user.id)
        )
      );

    if (existing.length !== ids.length) {
      return NextResponse.json(
        { error: 'Some email events not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update all email events
    await db
      .update(emailEvents)
      .set({ userConfirmed })
      .where(
        and(
          inArray(emailEvents.id, ids),
          eq(emailEvents.userId, session.user.id)
        )
      );

    return NextResponse.json({
      success: true,
      updated: ids.length,
      status: userConfirmed ? 'confirmed' : 'rejected'
    });
  } catch (error) {
    console.error('Error bulk updating email events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
