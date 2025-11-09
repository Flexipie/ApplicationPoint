import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import {
  applications,
  reminders,
  emailEvents,
  stageHistory,
  accounts,
} from '@/db/schema';
import { eq, desc, gte, lte, and, isNull, sql } from 'drizzle-orm';
import { AppLayout } from '@/components/layout/app-layout';
import { TodayZone } from '@/components/dashboard-v2/today-zone';
import { PipelineHealthZone } from '@/components/dashboard-v2/pipeline-health-zone';
import { ActivityProofZone } from '@/components/dashboard-v2/activity-proof-zone';
import { UsageBanner } from '@/components/dashboard/usage-banner';
import { SubscriptionService } from '@/lib/services/subscription';
import { toggleReminderComplete, snoozeReminder, addQuickReminder } from './actions';
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  addDays,
  startOfDay,
  endOfDay,
} from 'date-fns';

export const metadata = {
  title: 'Dashboard - ApplicationPoint',
  description: 'Your job application command center',
};

export default async function DashboardV2Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch subscription and usage
  const subscription = await SubscriptionService.getOrCreateSubscription(userId);
  const usage = await SubscriptionService.getCurrentUsage(userId);

  // Fetch all applications
  const userApplications = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.updatedAt));

  // Check for Gmail connection (for CTA chips)
  const gmailAccount = await db.query.accounts.findFirst({
    where: (accounts, { and, eq }) =>
      and(
        eq(accounts.userId, userId),
        eq(accounts.provider, 'google')
      ),
  });
  const hasGmailConnected = !!gmailAccount;

  // Check for extension usage (if they have any applications from generic/linkedin/indeed sources)
  const hasExtension = userApplications.some(
    (app) => ['linkedin', 'indeed', 'generic'].includes(app.source)
  );

  // ======================
  // TODAY ZONE DATA
  // ======================
  const userReminders = await db
    .select()
    .from(reminders)
    .where(eq(reminders.userId, userId))
    .orderBy(reminders.dueDate);

  const remindersWithStringDates = userReminders.map((r) => ({
    ...r,
    dueDate: r.dueDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
    completedAt: r.completedAt?.toISOString() || null,
  }));

  // ======================
  // PIPELINE HEALTH ZONE DATA
  // ======================

  // Calculate date ranges for this week and last week
  const now = new Date();
  const thisWeekStart = startOfWeek(now);
  const thisWeekEnd = endOfWeek(now);
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const lastWeekEnd = subWeeks(thisWeekEnd, 1);

  // Get applications from this week and last week
  const thisWeekApps = userApplications.filter(
    (app) =>
      new Date(app.createdAt) >= thisWeekStart &&
      new Date(app.createdAt) <= thisWeekEnd
  );

  const lastWeekApps = userApplications.filter(
    (app) =>
      new Date(app.createdAt) >= lastWeekStart &&
      new Date(app.createdAt) <= lastWeekEnd
  );

  // Calculate funnel stats with deltas
  const calculateStatusCount = (apps: typeof userApplications, status: string) =>
    apps.filter((app) => app.currentStatus === status).length;

  const funnelStats = {
    saved: {
      current: calculateStatusCount(userApplications, 'saved'),
      delta:
        calculateStatusCount(thisWeekApps, 'saved') -
        calculateStatusCount(lastWeekApps, 'saved'),
    },
    applied: {
      current: calculateStatusCount(userApplications, 'applied'),
      delta:
        calculateStatusCount(thisWeekApps, 'applied') -
        calculateStatusCount(lastWeekApps, 'applied'),
    },
    assessment: {
      current: calculateStatusCount(userApplications, 'assessment'),
      delta:
        calculateStatusCount(thisWeekApps, 'assessment') -
        calculateStatusCount(lastWeekApps, 'assessment'),
    },
    interview: {
      current: calculateStatusCount(userApplications, 'interview'),
      delta:
        calculateStatusCount(thisWeekApps, 'interview') -
        calculateStatusCount(lastWeekApps, 'interview'),
    },
    offer: {
      current: calculateStatusCount(userApplications, 'offer'),
      delta:
        calculateStatusCount(thisWeekApps, 'offer') -
        calculateStatusCount(lastWeekApps, 'offer'),
    },
  };

  // Find stuck applications (Applied status for >7 days with no status change)
  const sevenDaysAgo = addDays(now, -7);
  const stuckApplications = userApplications
    .filter(
      (app) =>
        app.currentStatus === 'applied' &&
        new Date(app.updatedAt) < sevenDaysAgo
    )
    .map((app) => ({
      ...app,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      deadlineDate: app.deadlineDate?.toISOString() || null,
      nextActionDate: app.nextActionDate?.toISOString() || null,
    }));

  // Find upcoming interviews (next 7 days)
  const nextWeek = addDays(now, 7);
  const upcomingInterviews = userApplications
    .filter(
      (app) =>
        app.currentStatus === 'interview' &&
        app.nextActionDate &&
        new Date(app.nextActionDate) >= now &&
        new Date(app.nextActionDate) <= nextWeek
    )
    .map((app) => ({
      id: app.id,
      companyName: app.companyName,
      jobTitle: app.jobTitle,
      interviewDate: new Date(app.nextActionDate!),
      interviewType: 'Interview', // Could be enhanced with more data
    }))
    .sort(
      (a, b) => a.interviewDate.getTime() - b.interviewDate.getTime()
    );

  // Calculate source statistics by interview conversion rate
  const sourceMap = new Map<string, { total: number; interviews: number }>();

  userApplications.forEach((app) => {
    const source = app.source || 'Unknown';
    const existing = sourceMap.get(source) || { total: 0, interviews: 0 };

    existing.total += 1;
    if (['interview', 'offer', 'accepted'].includes(app.currentStatus)) {
      existing.interviews += 1;
    }

    sourceMap.set(source, existing);
  });

  const sourceStats = Array.from(sourceMap.entries())
    .map(([source, stats]) => ({
      source,
      total: stats.total,
      interviews: stats.interviews,
      conversionRate:
        stats.total > 0
          ? Math.round((stats.interviews / stats.total) * 100)
          : 0,
    }))
    .sort((a, b) => b.conversionRate - a.conversionRate);

  // ======================
  // ACTIVITY & PROOF ZONE DATA
  // ======================

  // Fetch recent email events
  const recentEvents = await db
    .select()
    .from(emailEvents)
    .where(eq(emailEvents.userId, userId))
    .orderBy(desc(emailEvents.createdAt))
    .limit(5);

  const recentEmailEvents = recentEvents.map((event) => ({
    id: event.id,
    type: event.detectedAction,
    subject: event.emailSubject,
    detectedAt: event.emailDate.toISOString(),
    reason: event.rawSnippet || 'Job application email detected',
    companyName: undefined, // Not stored in email events
    applicationId: event.applicationId,
  }));


  return (
    <AppLayout>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-0.5 text-xs text-gray-500">
                Welcome back, {session.user.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Usage Banner */}
          <UsageBanner subscription={subscription} usage={usage} />

          {/* THREE-ZONE LAYOUT */}

          {/* Zone 1: Today (Action-First) */}
          <TodayZone
            reminders={remindersWithStringDates}
            onToggleComplete={toggleReminderComplete}
            onSnooze={snoozeReminder}
            onAddQuick={addQuickReminder}
            showEmailCTA={!hasGmailConnected}
            showExtensionCTA={!hasExtension}
          />

          {/* Zone 2: Pipeline Health */}
          <PipelineHealthZone
            funnelStats={funnelStats}
            stuckApplications={stuckApplications}
            upcomingInterviews={upcomingInterviews}
            sourceStats={sourceStats}
          />

          {/* Zone 3: Activity & Proof */}
          <ActivityProofZone
            recentEmailEvents={recentEmailEvents}
          />
        </div>
      </div>
    </AppLayout>
  );
}
