import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/settings/connect-gmail - Manually connect Gmail for existing users
 * This is a one-time fix for users who signed in before auto-connection was added
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update user to mark Gmail as connected
    await db
      .update(users)
      .set({
        emailConnected: true,
        lastEmailSync: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: 'Gmail connected successfully',
    });
  } catch (error: any) {
    console.error('Error connecting Gmail:', error);
    return NextResponse.json(
      { error: 'Failed to connect Gmail', details: error.message },
      { status: 500 }
    );
  }
}
