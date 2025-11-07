import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { applications, reminders } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { StatusChart } from '@/components/dashboard/status-chart';
import { UpcomingReminders } from '@/components/dashboard/upcoming-reminders';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch all applications for the user
  const userApplications = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, session.user.id!))
    .orderBy(desc(applications.updatedAt));

  // Fetch upcoming reminders for the user
  const userReminders = await db
    .select()
    .from(reminders)
    .where(eq(reminders.userId, session.user.id!))
    .orderBy(reminders.dueDate);

  // Convert dates to strings for client components
  const applicationsWithStringDates = userApplications.map((app) => ({
    ...app,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    deadlineDate: app.deadlineDate?.toISOString() || null,
    nextActionDate: app.nextActionDate?.toISOString() || null,
  }));

  const remindersWithStringDates = userReminders.map((reminder) => ({
    ...reminder,
    dueDate: reminder.dueDate.toISOString(),
    createdAt: reminder.createdAt.toISOString(),
    completedAt: reminder.completedAt?.toISOString() || null,
  }));

  // Calculate stats
  const stats = {
    total: userApplications.length,
    byStatus: {
      saved: userApplications.filter((app) => app.currentStatus === 'saved').length,
      applied: userApplications.filter((app) => app.currentStatus === 'applied').length,
      assessment: userApplications.filter((app) => app.currentStatus === 'assessment').length,
      interview: userApplications.filter((app) => app.currentStatus === 'interview').length,
      offer: userApplications.filter((app) => app.currentStatus === 'offer').length,
      accepted: userApplications.filter((app) => app.currentStatus === 'accepted').length,
      rejected: userApplications.filter((app) => app.currentStatus === 'rejected').length,
    },
  };

  // Calculate success metrics
  const activeApps = userApplications.filter(
    (app) => !['rejected', 'accepted'].includes(app.currentStatus)
  ).length;

  const responseRate =
    stats.byStatus.applied > 0
      ? (
          ((stats.byStatus.assessment +
            stats.byStatus.interview +
            stats.byStatus.offer +
            stats.byStatus.accepted) /
            stats.byStatus.applied) *
          100
        ).toFixed(1)
      : '0';

  const interviewRate =
    stats.byStatus.applied > 0
      ? (
          ((stats.byStatus.interview + stats.byStatus.offer + stats.byStatus.accepted) /
            stats.byStatus.applied) *
          100
        ).toFixed(1)
      : '0';

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
            <Button asChild size="sm">
              <Link href="/applications">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New Application
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {/* Empty State */}
          {userApplications.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center">
              <h3 className="text-base font-medium text-gray-900">No applications yet</h3>
              <p className="mt-1.5 text-sm text-gray-500">
                Get started by creating your first job application.
              </p>
              <Link
                href="/applications"
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Application
              </Link>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <StatsCards stats={stats} />

              {/* Success Metrics */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Active Applications</p>
                      <p className="mt-0.5 text-xl font-bold text-gray-900">{activeApps}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-green-100 p-2">
                      <ArrowRight className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Response Rate</p>
                      <p className="mt-0.5 text-xl font-bold text-gray-900">{responseRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <ArrowRight className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Interview Rate</p>
                      <p className="mt-0.5 text-xl font-bold text-gray-900">{interviewRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts and Activity */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <StatusChart stats={stats} />
                <RecentActivity applications={applicationsWithStringDates} />
              </div>

              {/* Upcoming Reminders */}
              <UpcomingReminders reminders={remindersWithStringDates} />

              {/* Quick Actions */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Link
                    href="/applications"
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Application
                  </Link>
                  <Link
                    href="/applications?view=kanban"
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-sm font-medium text-gray-700 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  >
                    View Kanban Board
                  </Link>
                  <Link
                    href="/api/email/process"
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-sm font-medium text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    Sync Emails
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
