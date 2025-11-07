import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Liveness check - determines if the app process is alive
 * Used by orchestration systems to detect if the app needs to be restarted
 * This should be a simple check that doesn't depend on external services
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid,
    },
    { status: 200 }
  );
}
