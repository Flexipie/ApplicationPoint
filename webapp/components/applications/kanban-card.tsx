'use client';

import Link from 'next/link';
import { MapPin, Calendar, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Application {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
  salaryRange: string | null;
}

interface KanbanCardProps {
  application: Application;
  onDelete: (id: string) => void;
}

export function KanbanCard({ application, onDelete }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md cursor-move"
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/applications/${application.id}`}
          className="flex-1 min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
            {application.jobTitle}
          </h4>
          <p className="mt-1 text-sm text-gray-600 font-medium">
            {application.companyName}
          </p>
        </Link>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(application.id);
          }}
          className="opacity-0 group-hover:opacity-100 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-opacity"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Meta Info */}
      <div className="mt-3 space-y-1.5 text-xs text-gray-500">
        {application.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{application.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(application.updatedAt)}</span>
        </div>
        {application.salaryRange && (
          <div className="text-gray-600 font-medium truncate">
            {application.salaryRange}
          </div>
        )}
      </div>

      {/* Source Badge */}
      <div className="mt-2">
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 capitalize">
          {application.source.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}
