'use client';

import { useState, useEffect } from 'react';
import { ApplicationCard } from './application-card';
import { ApplicationFilters } from './application-filters';
import { CreateApplicationDialog } from './create-application-dialog';
import { ViewToggle } from './view-toggle';
import { KanbanBoard } from './kanban-board';

interface Application {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string | null;
  currentStatus: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  deadlineDate: string | null;
  salaryRange: string | null;
  notes: string | null;
}

export function ApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    search: '',
  });
  const [stats, setStats] = useState<any>(null);

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.source) params.append('source', filters.source);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`/api/applications?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setApplications(data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/applications/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    // Store old application for rollback
    const oldApplication = applications.find((app) => app.id === id);
    if (!oldApplication) return;

    // Optimistic delete - remove from UI immediately
    setApplications((prev) => prev.filter((app) => app.id !== id));

    // Optimistically update stats
    if (stats && oldApplication.currentStatus) {
      setStats((prev: any) => ({
        ...prev,
        total: prev.total - 1,
        byStatus: {
          ...prev.byStatus,
          [oldApplication.currentStatus]: (prev.byStatus[oldApplication.currentStatus] || 0) - 1,
        },
      }));
    }

    // Make API call in background
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      // Success! No need to refresh - already updated
    } catch (error) {
      console.error('Error deleting application:', error);
      
      // Rollback on error - restore the application
      setApplications((prev) => [...prev, oldApplication].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));

      if (stats && oldApplication.currentStatus) {
        setStats((prev: any) => ({
          ...prev,
          total: prev.total + 1,
          byStatus: {
            ...prev.byStatus,
            [oldApplication.currentStatus]: (prev.byStatus[oldApplication.currentStatus] || 0) + 1,
          },
        }));
      }

      alert('Failed to delete application');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Store old application for rollback
    const oldApplication = applications.find((app) => app.id === id);
    if (!oldApplication) return;

    const oldStatus = oldApplication.currentStatus;

    // Optimistic update - update UI immediately
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, currentStatus: newStatus } : app
      )
    );

    // Optimistically update stats
    if (stats) {
      setStats((prev: any) => ({
        ...prev,
        byStatus: {
          ...prev.byStatus,
          [oldStatus]: (prev.byStatus[oldStatus] || 0) - 1,
          [newStatus]: (prev.byStatus[newStatus] || 0) + 1,
        },
      }));
    }

    // Make API call in background
    try {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStatus: newStatus, trigger: 'manual' }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Success! No need to refresh - already updated
    } catch (error) {
      console.error('Error updating status:', error);
      
      // Rollback on error
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, currentStatus: oldStatus } : app
        )
      );

      if (stats) {
        setStats((prev: any) => ({
          ...prev,
          byStatus: {
            ...prev.byStatus,
            [oldStatus]: (prev.byStatus[oldStatus] || 0) + 1,
            [newStatus]: (prev.byStatus[newStatus] || 0) - 1,
          },
        }));
      }

      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div
              key={status}
              className="rounded-lg border border-gray-200 bg-white p-4 text-center"
            >
              <div className="text-2xl font-bold text-gray-900">{count as number}</div>
              <div className="mt-1 text-xs font-medium uppercase text-gray-500">
                {status}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters, View Toggle, and Create Button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <ApplicationFilters filters={filters} onChange={setFilters} />
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          {applications.length > 0 && (
            <a
              href="/api/applications/export"
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </a>
          )}
          <CreateApplicationDialog onSuccess={() => { fetchApplications(); fetchStats(); }} />
        </div>
      </div>

      {/* Applications View */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading applications...</div>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first application.
          </p>
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard
          applications={applications}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
