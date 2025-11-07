import { NextResponse } from 'next/server';
import { db } from '@/db';
import { applications } from '@/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * Readiness check - determines if the app is ready to serve traffic
 * Used by load balancers and orchestration systems
 */
export async function GET() {
  const checks = [];

  try {
    // 1. Database connection check
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbTime = Date.now() - dbStart;

    checks.push({
      name: 'database_connection',
      status: dbTime < 1000 ? 'pass' : 'warn',
      responseTime: `${dbTime}ms`,
    });

    // 2. Database query check (can we query tables?)
    const queryStart = Date.now();
    await db.select().from(applications).limit(1);
    const queryTime = Date.now() - queryStart;

    checks.push({
      name: 'database_query',
      status: queryTime < 500 ? 'pass' : 'warn',
      responseTime: `${queryTime}ms`,
    });

    // 3. Environment variables check
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    checks.push({
      name: 'environment_variables',
      status: missingVars.length === 0 ? 'pass' : 'fail',
      missing: missingVars.length > 0 ? missingVars : undefined,
    });

    // Determine overall status
    const hasFailed = checks.some((check) => check.status === 'fail');
    const hasWarnings = checks.some((check) => check.status === 'warn');

    const overallStatus = hasFailed ? 'not_ready' : hasWarnings ? 'ready_with_warnings' : 'ready';

    return NextResponse.json(
      {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks,
      },
      { status: hasFailed ? 503 : 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error.message,
        checks,
      },
      { status: 503 }
    );
  }
}
