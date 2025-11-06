import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { emailEvents, applications } from '@/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { rateLimit, readRateLimiter } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/email-events
 * Fetch email events for review queue
 * Query params:
 *  - status: 'pending' | 'confirmed' | 'rejected' | 'all' (default: 'pending')
 */
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(req, readRateLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    let query = db
      .select({
        emailEvent: emailEvents,
        application: {
          id: applications.id,
          companyName: applications.companyName,
          jobTitle: applications.jobTitle,
          currentStatus: applications.currentStatus,
        },
      })
      .from(emailEvents)
      .leftJoin(applications, eq(emailEvents.applicationId, applications.id))
      .where(eq(emailEvents.userId, session.user.id))
      .$dynamic();

    // Filter by confirmation status
    if (status === 'pending') {
      query = query.where(isNull(emailEvents.userConfirmed));
    } else if (status === 'confirmed') {
      query = query.where(eq(emailEvents.userConfirmed, true));
    } else if (status === 'rejected') {
      query = query.where(eq(emailEvents.userConfirmed, false));
    }
    // 'all' = no additional filter

    const results = await query.orderBy(desc(emailEvents.emailDate));

    return NextResponse.json({ emailEvents: results });
  } catch (error) {
    console.error('Error fetching email events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
