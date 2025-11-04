'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanCard } from './kanban-card';

interface Application {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string | null;
  currentStatus: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  salaryRange: string | null;
}

interface KanbanColumnProps {
  status: string;
  label: string;
  color: string;
  applications: Application[];
  onDelete: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-gray-100 border-gray-300',
  applied: 'bg-blue-50 border-blue-300',
  assessment: 'bg-amber-50 border-amber-300',
  interview: 'bg-purple-50 border-purple-300',
  offer: 'bg-green-50 border-green-300',
  accepted: 'bg-emerald-50 border-emerald-300',
  rejected: 'bg-red-50 border-red-300',
};

export function KanbanColumn({
  status,
  label,
  color,
  applications,
  onDelete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const columnColor = STATUS_COLORS[status] || 'bg-gray-100 border-gray-300';

  return (
    <div className="flex min-w-[280px] flex-col rounded-lg">
      {/* Column Header */}
      <div
        className={`rounded-t-lg border-t-4 ${color} px-4 py-3 ${
          isOver ? 'bg-gray-100' : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{label}</h3>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-700">
            {applications.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-3 rounded-b-lg border-x border-b ${
          isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
        } p-3 transition-colors min-h-[500px]`}
      >
        <SortableContext
          items={applications.map((app) => app.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-gray-400">No applications</p>
            </div>
          ) : (
            applications.map((application) => (
              <KanbanCard
                key={application.id}
                application={application}
                onDelete={onDelete}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
