import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ApplicationService } from '@/lib/services/applications';
import { createApplicationSchema, listApplicationsSchema } from '@/lib/validations/application';
import { ZodError } from 'zod';
import { rateLimit, readRateLimiter } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/applications - List all applications for authenticated user
 */
export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimit(req, readRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = {
      status: searchParams.get('status') || undefined,
      source: searchParams.get('source') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    };

    // Validate query parameters
    const validatedQuery = listApplicationsSchema.parse(queryParams);

    // Fetch applications
    const result = await ApplicationService.list(session.user.id, validatedQuery);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications - Create a new application
 */
export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const validatedData = createApplicationSchema.parse(body);

    // Create application
    const application = await ApplicationService.create(session.user.id, validatedData);

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
