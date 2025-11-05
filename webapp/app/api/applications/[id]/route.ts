import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ApplicationService } from '@/lib/services/applications';
import { updateApplicationSchema } from '@/lib/validations/application';
import { ZodError } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/applications/[id] - Get a single application
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const application = await ApplicationService.getById(params.id, session.user.id);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/applications/[id] - Update an application
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
    const validatedData = updateApplicationSchema.parse(body);

    // Update application
    const application = await ApplicationService.update(
      params.id,
      session.user.id,
      validatedData
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

    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/applications/[id] - Delete an application
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ApplicationService.delete(params.id, session.user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Application not found') {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
