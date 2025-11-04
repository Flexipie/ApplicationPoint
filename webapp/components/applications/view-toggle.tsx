'use client';

import { LayoutList, LayoutGrid } from 'lucide-react';

interface ViewToggleProps {
  view: 'list' | 'kanban';
  onViewChange: (view: 'list' | 'kanban') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          view === 'list'
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <LayoutList className="h-4 w-4" />
        List
      </button>
      <button
        onClick={() => onViewChange('kanban')}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          view === 'kanban'
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        Kanban
      </button>
    </div>
  );
}
