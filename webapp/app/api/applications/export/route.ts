import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { applications } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * Export applications as CSV
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all applications for the user
    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, session.user.id))
      .orderBy(desc(applications.createdAt));

    // Generate CSV
    const csvRows: string[] = [];

    // Header row
    csvRows.push([
      'ID',
      'Job Title',
      'Company Name',
      'Location',
      'Salary Range',
      'Status',
      'Source',
      'Apply URL',
      'Deadline Date',
      'Next Action Date',
      'Next Action Text',
      'Notes',
      'Created At',
      'Updated At',
    ].join(','));

    // Data rows
    for (const app of userApplications) {
      csvRows.push([
        escapeCsvValue(app.id),
        escapeCsvValue(app.jobTitle),
        escapeCsvValue(app.companyName),
        escapeCsvValue(app.location || ''),
        escapeCsvValue(app.salaryRange || ''),
        escapeCsvValue(app.currentStatus),
        escapeCsvValue(app.source),
        escapeCsvValue(app.applyUrl || ''),
        escapeCsvValue(app.deadlineDate?.toISOString() || ''),
        escapeCsvValue(app.nextActionDate?.toISOString() || ''),
        escapeCsvValue(app.nextActionText || ''),
        escapeCsvValue(app.notes || ''),
        escapeCsvValue(app.createdAt.toISOString()),
        escapeCsvValue(app.updatedAt.toISOString()),
      ].join(','));
    }

    const csv = csvRows.join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="applications-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting applications:', error);
    return NextResponse.json(
      { error: 'Failed to export applications' },
      { status: 500 }
    );
  }
}

/**
 * Escape CSV values to handle commas, quotes, and newlines
 */
function escapeCsvValue(value: string | null | undefined): string {
  if (!value) return '';

  // Convert to string
  const stringValue = String(value);

  // If the value contains comma, quote, or newline, wrap it in quotes and escape inner quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}
