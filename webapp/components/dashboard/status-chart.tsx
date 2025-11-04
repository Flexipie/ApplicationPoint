'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusChartProps {
  stats: {
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

const STATUS_CONFIG = [
  { key: 'saved', label: 'Saved', color: '#6B7280' },
  { key: 'applied', label: 'Applied', color: '#3B82F6' },
  { key: 'assessment', label: 'Assessment', color: '#F59E0B' },
  { key: 'interview', label: 'Interview', color: '#8B5CF6' },
  { key: 'offer', label: 'Offer', color: '#10B981' },
  { key: 'accepted', label: 'Accepted', color: '#059669' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444' },
];

export function StatusChart({ stats }: StatusChartProps) {
  const data = STATUS_CONFIG.map((config) => ({
    name: config.label,
    value: stats.byStatus[config.key as keyof typeof stats.byStatus] || 0,
    color: config.color,
  })).filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Status Distribution
        </h2>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-gray-500">No data to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Status Distribution
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
