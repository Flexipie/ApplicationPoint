import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { applications, reminders, emailEvents, contacts, stageHistory } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/export - Export all user data as JSON
 *
 * Exports:
 * - User profile
 * - All applications
 * - All reminders
 * - All email events
 * - All contacts
 * - All stage history
 * - Subscription info
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Fetch all user data
    const [
      userApplications,
      userReminders,
      userEmailEvents,
      userContacts,
      userStageHistory,
      userSubscription,
      userUsage,
    ] = await Promise.all([
      db
        .select()
        .from(applications)
        .where(eq(applications.userId, userId))
        .orderBy(desc(applications.createdAt)),
      db
        .select()
        .from(reminders)
        .where(eq(reminders.userId, userId))
        .orderBy(reminders.dueDate),
      db
        .select()
        .from(emailEvents)
        .where(eq(emailEvents.userId, userId))
        .orderBy(desc(emailEvents.createdAt)),
      db.query.contacts.findMany({
        where: (contacts, { eq, inArray }) =>
          inArray(
            contacts.applicationId,
            userApplications.map((app) => app.id)
          ),
      }),
      db.query.stageHistory.findMany({
        where: (stageHistory, { eq, inArray }) =>
          inArray(
            stageHistory.applicationId,
            userApplications.map((app) => app.id)
          ),
      }),
      db.query.subscriptions.findFirst({
        where: (subscriptions, { eq }) => eq(subscriptions.userId, userId),
      }),
      db.query.usageTracking.findFirst({
        where: (usageTracking, { eq }) => eq(usageTracking.userId, userId),
      }),
    ]);

    // Build export object
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: userId,
        email: session.user.email,
        name: session.user.name,
      },
      subscription: userSubscription || null,
      usage: userUsage || null,
      applications: userApplications,
      reminders: userReminders,
      emailEvents: userEmailEvents,
      contacts: userContacts,
      stageHistory: userStageHistory,
      statistics: {
        totalApplications: userApplications.length,
        totalReminders: userReminders.length,
        totalEmailEvents: userEmailEvents.length,
        totalContacts: userContacts.length,
        applicationsByStatus: {
          saved: userApplications.filter((app) => app.currentStatus === 'saved').length,
          applied: userApplications.filter((app) => app.currentStatus === 'applied').length,
          assessment: userApplications.filter((app) => app.currentStatus === 'assessment')
            .length,
          interview: userApplications.filter((app) => app.currentStatus === 'interview').length,
          offer: userApplications.filter((app) => app.currentStatus === 'offer').length,
          accepted: userApplications.filter((app) => app.currentStatus === 'accepted').length,
          rejected: userApplications.filter((app) => app.currentStatus === 'rejected').length,
        },
      },
    };

    const json = JSON.stringify(exportData, null, 2);

    // Return JSON file
    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="applicationpoint-data-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
