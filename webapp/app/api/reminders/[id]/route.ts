import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ReminderService } from '@/lib/services/reminder-service';
import { z } from 'zod';
import { rateLimit, apiRateLimiter } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validation schema for updating reminders
const updateReminderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  dueDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  isCompleted: z.boolean().optional(),
});

/**
 * PATCH /api/reminders/[id] - Update a reminder
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting
  const rateLimitResponse = await rateLimit(req, apiRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const validatedData = updateReminderSchema.parse(body);

    // Update reminder
    const reminder = await ReminderService.update(
      params.id,
      session.user.id,
      validatedData
    );

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(reminder);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reminders/[id] - Delete a reminder
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting
  const rateLimitResponse = await rateLimit(req, apiRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ReminderService.delete(params.id, session.user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder', details: error.message },
      { status: 500 }
    );
  }
}
