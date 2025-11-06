import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ReminderService } from '@/lib/services/reminder-service';
import { z } from 'zod';
import { rateLimit, apiRateLimiter } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validation schema for creating reminders
const createReminderSchema = z.object({
  applicationId: z.string().min(1),
  reminderType: z.enum(['follow_up', 'thank_you', 'deadline', 'preparation', 'other']),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().or(z.date()).transform((val) => new Date(val)),
});

/**
 * GET /api/reminders - List all reminders for user
 */
export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimit(req, apiRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const isCompleted = searchParams.get('completed');

    const filters = isCompleted !== null ? { isCompleted: isCompleted === 'true' } : undefined;

    const reminders = await ReminderService.list(session.user.id, filters);

    return NextResponse.json({ reminders });
  } catch (error: any) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reminders - Create a new manual reminder
 */
export async function POST(req: NextRequest) {
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
    const validatedData = createReminderSchema.parse(body);

    // Create reminder
    const reminder = await ReminderService.create({
      ...validatedData,
      userId: session.user.id,
      createdBy: 'user',
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder', details: error.message },
      { status: 500 }
    );
  }
}
