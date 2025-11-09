import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users, applications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/settings/connect-gmail - Manually connect Gmail for existing users
 * This is a one-time fix for users who signed in before auto-connection was added
 * Also triggers initial email scan for new users
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user has any existing applications
    const existingApps = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .limit(1);

    const isNewUser = existingApps.length === 0;

    // Update user to mark Gmail as connected
    await db
      .update(users)
      .set({
        emailConnected: true,
        lastEmailSync: new Date(),
      })
      .where(eq(users.id, userId));

    // If new user, trigger automatic email scan in background
    if (isNewUser) {
      console.log(`[Gmail Connect] New user detected, triggering email scan for ${userId}`);

      // Trigger scan asynchronously (fire and forget)
      fetch(`${process.env.NEXTAUTH_URL}/api/email/scan`, {
        method: 'POST',
        headers: {
          Cookie: req.headers.get('cookie') || '',
        },
      }).catch((error) => {
        console.error('[Gmail Connect] Failed to trigger email scan:', error);
      });

      return NextResponse.json({
        success: true,
        message: 'Gmail connected successfully! Scanning your past emails for job applications...',
        scanTriggered: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Gmail connected successfully',
      scanTriggered: false,
    });
  } catch (error: any) {
    console.error('Error connecting Gmail:', error);
    return NextResponse.json(
      { error: 'Failed to connect Gmail', details: error.message },
      { status: 500 }
    );
  }
}
