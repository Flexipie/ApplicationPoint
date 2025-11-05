import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/settings/disconnect-gmail - Disconnect Gmail integration
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update user to mark Gmail as disconnected
    await db
      .update(users)
      .set({
        emailConnected: false,
        lastEmailSync: null,
      })
      .where(eq(users.id, session.user.id));

    // Note: We're not deleting the OAuth tokens from the accounts table
    // This allows the user to reconnect easily if they want to
    // If you want to fully revoke access, you'd need to:
    // 1. Delete the account record from accounts table
    // 2. Revoke the token with Google's API

    return NextResponse.json({
      success: true,
      message: 'Gmail disconnected successfully',
    });
  } catch (error: any) {
    console.error('Error disconnecting Gmail:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Gmail', details: error.message },
      { status: 500 }
    );
  }
}
