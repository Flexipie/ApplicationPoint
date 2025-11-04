import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/db';
import { applications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ApplicationHeader } from '@/components/applications/application-header';
import { ApplicationTimeline } from '@/components/applications/application-timeline';
import { ApplicationNotes } from '@/components/applications/application-notes';
import { AppLayout } from '@/components/layout/app-layout';

interface ApplicationDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch application
  const [application] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, params.id))
    .limit(1);

  // Check if exists and belongs to user
  if (!application) {
    notFound();
  }

  if (application.userId !== session.user.id) {
    notFound();
  }

  return (
    <AppLayout>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm">
            <Link
              href="/applications"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Applications
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{application.companyName}</span>
          </div>

          {/* Application Header */}
          <ApplicationHeader application={application} />
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Details Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Job Details
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {application.location && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">{application.location}</dd>
                  </div>
                )}
                {application.salaryRange && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Salary Range</dt>
                    <dd className="mt-1 text-sm text-gray-900">{application.salaryRange}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Source</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{application.source}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Applied Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                {application.applyUrl && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Job Posting</dt>
                    <dd className="mt-1">
                      <a
                        href={application.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        View original posting →
                      </a>
                    </dd>
                  </div>
                )}
                {application.deadlineDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(application.deadlineDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {application.nextActionDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Next Action</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.nextActionText || 'Follow up'} -{' '}
                      {new Date(application.nextActionDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Notes Section */}
            <ApplicationNotes application={application} />

            {/* Timeline */}
            <ApplicationTimeline applicationId={application.id} />
          </div>

          {/* Right Column - Actions & Meta */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Days Since Applied</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.floor(
                      (Date.now() - new Date(application.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(application.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Actions</h3>
              <div className="space-y-2">
                {application.applyUrl && (
                  <a
                    href={application.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                  >
                    View Job Posting
                  </a>
                )}
                <button className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Add Reminder
                </button>
                <button className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
