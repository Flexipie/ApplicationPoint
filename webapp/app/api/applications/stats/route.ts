import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ApplicationService } from '@/lib/services/applications';

export const runtime = 'nodejs';

/**
 * GET /api/applications/stats - Get application statistics
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await ApplicationService.getStats(session.user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
