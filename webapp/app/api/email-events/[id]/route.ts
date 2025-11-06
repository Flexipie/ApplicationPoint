import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { emailEvents } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { rateLimit, apiRateLimiter } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updateEmailEventSchema = z.object({
  userConfirmed: z.boolean(),
  // Optional: Allow updating applicationId if user wants to link to different application
  applicationId: z.string().optional(),
});

/**
 * PATCH /api/email-events/[id]
 * Update email event confirmation status (confirm or reject)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(req, apiRateLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = updateEmailEventSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error },
        { status: 400 }
      );
    }

    const { userConfirmed, applicationId } = validationResult.data;

    // Verify the email event exists and belongs to the user
    const existing = await db
      .select()
      .from(emailEvents)
      .where(
        and(
          eq(emailEvents.id, params.id),
          eq(emailEvents.userId, session.user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Email event not found' },
        { status: 404 }
      );
    }

    // Update the email event
    const updateData: any = { userConfirmed };
    if (applicationId !== undefined) {
      updateData.applicationId = applicationId;
    }

    const [updated] = await db
      .update(emailEvents)
      .set(updateData)
      .where(eq(emailEvents.id, params.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating email event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/email-events/[id]
 * Delete an email event (for rejected/spam events)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(req, apiRateLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the email event exists and belongs to the user
    const existing = await db
      .select()
      .from(emailEvents)
      .where(
        and(
          eq(emailEvents.id, params.id),
          eq(emailEvents.userId, session.user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Email event not found' },
        { status: 404 }
      );
    }

    await db.delete(emailEvents).where(eq(emailEvents.id, params.id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting email event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
