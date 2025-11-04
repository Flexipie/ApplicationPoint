'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { KanbanColumn } from './kanban-column';
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

interface KanbanBoardProps {
  applications: Application[];
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
}

const COLUMNS = [
  { id: 'saved', label: 'Saved', color: 'border-gray-400' },
  { id: 'applied', label: 'Applied', color: 'border-blue-500' },
  { id: 'assessment', label: 'Assessment', color: 'border-amber-500' },
  { id: 'interview', label: 'Interview', color: 'border-purple-500' },
  { id: 'offer', label: 'Offer', color: 'border-green-500' },
  { id: 'rejected', label: 'Rejected', color: 'border-red-500' },
];

export function KanbanBoard({
  applications,
  onStatusChange,
  onDelete,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  // Group applications by status
  const groupedApplications = COLUMNS.reduce((acc, column) => {
    acc[column.id] = applications.filter(
      (app) => app.currentStatus === column.id
    );
    return acc;
  }, {} as Record<string, Application[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which column the card is being dragged over
    const overColumn = COLUMNS.find((col) => col.id === overId);
    
    if (overColumn) {
      // Dragging over a column
      const application = applications.find((app) => app.id === activeId);
      if (application && application.currentStatus !== overColumn.id) {
        // Optimistically update the UI
        onStatusChange(activeId, overColumn.id);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the application being dragged
    const application = applications.find((app) => app.id === activeId);
    if (!application) return;

    // Check if dropped on a different column
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn && application.currentStatus !== overColumn.id) {
      onStatusChange(activeId, overColumn.id);
    }
  };

  const activeApplication = activeId
    ? applications.find((app) => app.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            status={column.id}
            label={column.label}
            color={column.color}
            applications={groupedApplications[column.id] || []}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeApplication ? (
          <div className="rotate-3 opacity-80">
            <KanbanCard
              application={activeApplication}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
