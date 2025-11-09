'use client';

import { TrendingUp, TrendingDown, AlertCircle, Calendar, Target } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  currentStatus: string;
  source: string | null;
  updatedAt: string;
}

interface FunnelStats {
  saved: { current: number; delta: number };
  applied: { current: number; delta: number };
  assessment: { current: number; delta: number };
  interview: { current: number; delta: number };
  offer: { current: number; delta: number };
}

interface UpcomingInterview {
  id: string;
  companyName: string;
  jobTitle: string;
  interviewDate: Date;
  interviewType?: string;
}

interface SourceStat {
  source: string;
  total: number;
  interviews: number;
  conversionRate: number;
}

interface PipelineHealthZoneProps {
  funnelStats: FunnelStats;
  stuckApplications: Application[];
  upcomingInterviews: UpcomingInterview[];
  sourceStats: SourceStat[];
}

export function PipelineHealthZone({
  funnelStats,
  stuckApplications,
  upcomingInterviews,
  sourceStats,
}: PipelineHealthZoneProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Pipeline Health</h2>

      {/* Funnel Mini-Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 mb-4">
        <FunnelCard
          label="Saved"
          count={funnelStats.saved.current}
          delta={funnelStats.saved.delta}
          color="gray"
        />
        <FunnelCard
          label="Applied"
          count={funnelStats.applied.current}
          delta={funnelStats.applied.delta}
          color="blue"
        />
        <FunnelCard
          label="Assessment"
          count={funnelStats.assessment.current}
          delta={funnelStats.assessment.delta}
          color="purple"
        />
        <FunnelCard
          label="Interview"
          count={funnelStats.interview.current}
          delta={funnelStats.interview.delta}
          color="amber"
        />
        <FunnelCard
          label="Offer"
          count={funnelStats.offer.current}
          delta={funnelStats.offer.delta}
          color="green"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Stuck Applications */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-gray-900">Stuck</h3>
            <span className="text-xs text-gray-500">Applied &gt;7 days</span>
          </div>

          {stuckApplications.length === 0 ? (
            <p className="text-xs text-gray-500">No stuck applications</p>
          ) : (
            <div className="space-y-2">
              {stuckApplications.slice(0, 3).map((app) => (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  className="block rounded-lg border border-amber-100 bg-amber-50 p-2 transition-colors hover:border-amber-200 hover:bg-amber-100"
                >
                  <p className="text-xs font-medium text-gray-900 line-clamp-1">
                    {app.companyName}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600 line-clamp-1">{app.jobTitle}</p>
                  <p className="mt-1 text-xs text-amber-700">
                    {formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true })}
                  </p>
                </Link>
              ))}
              {stuckApplications.length > 3 && (
                <Link
                  href="/applications?filter=stuck"
                  className="block text-center text-xs text-blue-600 hover:text-blue-700"
                >
                  +{stuckApplications.length - 3} more
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Upcoming</h3>
            <span className="text-xs text-gray-500">Next 7 days</span>
          </div>

          {upcomingInterviews.length === 0 ? (
            <p className="text-xs text-gray-500">No upcoming interviews</p>
          ) : (
            <div className="space-y-2">
              {upcomingInterviews.map((interview) => (
                <Link
                  key={interview.id}
                  href={`/applications/${interview.id}`}
                  className="block rounded-lg border border-blue-100 bg-blue-50 p-2 transition-colors hover:border-blue-200 hover:bg-blue-100"
                >
                  <p className="text-xs font-medium text-gray-900 line-clamp-1">
                    {interview.companyName}
                  </p>
                  {interview.interviewType && (
                    <p className="mt-0.5 text-xs text-gray-600">{interview.interviewType}</p>
                  )}
                  <p className="mt-1 text-xs text-blue-700">
                    {formatDistanceToNow(interview.interviewDate, { addSuffix: true })}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Source Snapshot */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">Top Sources</h3>
            <span className="text-xs text-gray-500">By interview rate</span>
          </div>

          {sourceStats.length === 0 ? (
            <p className="text-xs text-gray-500">No data yet</p>
          ) : (
            <div className="space-y-2">
              {sourceStats.slice(0, 3).map((stat) => (
                <div
                  key={stat.source}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-900">{stat.source}</p>
                    <p className="text-xs font-semibold text-green-600">
                      {stat.conversionRate}%
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {stat.interviews}/{stat.total} to interview
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FunnelCardProps {
  label: string;
  count: number;
  delta: number;
  color: 'gray' | 'blue' | 'purple' | 'amber' | 'green';
}

function FunnelCard({ label, count, delta, color }: FunnelCardProps) {
  const colorClasses = {
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    green: 'bg-green-50 border-green-200 text-green-900',
  };

  const deltaColor = delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-gray-500';
  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : null;

  return (
    <div className={`rounded-lg border p-3 ${colorClasses[color]}`}>
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-2xl font-bold">{count}</p>
        {delta !== 0 && DeltaIcon && (
          <div className={`flex items-center gap-0.5 ${deltaColor}`}>
            <DeltaIcon className="h-3 w-3" />
            <span className="text-xs font-medium">{Math.abs(delta)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
