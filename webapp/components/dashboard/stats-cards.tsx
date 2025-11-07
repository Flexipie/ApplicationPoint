'use client';

import { Briefcase, Send, FileCheck, Calendar, Gift, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  stats: {
    total: number;
    byStatus: {
      saved: number;
      applied: number;
      assessment: number;
      interview: number;
      offer: number;
      accepted: number;
      rejected: number;
    };
  };
}

const STAT_CONFIGS = [
  {
    key: 'total',
    label: 'Total Applications',
    icon: Briefcase,
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    key: 'applied',
    label: 'Applied',
    icon: Send,
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    key: 'assessment',
    label: 'Assessment',
    icon: FileCheck,
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    key: 'interview',
    label: 'Interviews',
    icon: Calendar,
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    key: 'offer',
    label: 'Offers',
    icon: Gift,
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    key: 'accepted',
    label: 'Accepted',
    icon: CheckCircle,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  const getValue = (key: string) => {
    if (key === 'total') return stats.total;
    return stats.byStatus[key as keyof typeof stats.byStatus] || 0;
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {STAT_CONFIGS.map((config) => {
        const Icon = config.icon;
        const value = getValue(config.key);

        return (
          <Card key={config.key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-1.5 ${config.bgColor}`}>
                  <Icon className={`h-4 w-4 ${config.textColor}`} />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xl font-bold">{value}</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {config.label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
