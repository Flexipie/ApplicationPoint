import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ApplicationService } from '@/lib/services/applications';
import { updateStatusSchema } from '@/lib/validations/application';
import { ZodError } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PATCH /api/applications/[id]/status - Update application status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const { currentStatus, trigger } = updateStatusSchema.parse(body);

    // Update status
    const application = await ApplicationService.updateStatus(
      params.id,
      session.user.id,
      currentStatus,
      trigger
    );

    return NextResponse.json(application);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Application not found') {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
