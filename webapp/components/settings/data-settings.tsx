'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Trash2, AlertTriangle, FileJson, FileSpreadsheet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface DataSettingsProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function DataSettings({ user }: DataSettingsProps) {
  const router = useRouter();
  const [exportingJSON, setExportingJSON] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');

  async function handleExportJSON() {
    setExportingJSON(true);
    try {
      const response = await fetch('/api/user/export');

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applicationpoint-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportingJSON(false);
    }
  }

  async function handleExportCSV() {
    setExportingCSV(true);
    try {
      // Redirect to CSV export (already implemented)
      window.location.href = '/api/applications/export';
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      // Keep loading state as we're navigating away
      setTimeout(() => setExportingCSV(false), 2000);
    }
  }

  async function handleDeleteAccount() {
    if (confirmDelete !== user.email) {
      alert('Please type your email address to confirm account deletion.');
      return;
    }

    if (
      !confirm(
        `Are you absolutely sure? This will permanently delete your account and all data. This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Sign out and redirect to homepage
      alert('Your account has been deleted successfully.');
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete account. Please try again or contact support.');
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download a copy of all your data. You can export as JSON (complete backup) or CSV
            (applications only).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleExportJSON}
              disabled={exportingJSON}
              className="flex-1"
            >
              <FileJson className="h-4 w-4 mr-2" />
              {exportingJSON ? 'Exporting...' : 'Export Complete Data (JSON)'}
            </Button>

            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={exportingCSV}
              className="flex-1"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exportingCSV ? 'Exporting...' : 'Export Applications (CSV)'}
            </Button>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-900">
              <strong>Complete Data Export (JSON)</strong> includes:
            </p>
            <ul className="mt-2 text-sm text-blue-800 list-disc list-inside space-y-1">
              <li>All applications with full details</li>
              <li>All reminders and follow-ups</li>
              <li>All email events and detections</li>
              <li>All contacts (recruiters, hiring managers)</li>
              <li>Complete status change history</li>
              <li>Subscription and usage information</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Warning: This is permanent</p>
                <p className="mt-1 text-sm text-red-800">
                  Deleting your account will:
                </p>
                <ul className="mt-2 text-sm text-red-800 list-disc list-inside space-y-1">
                  <li>Permanently delete all your applications</li>
                  <li>Delete all reminders and email events</li>
                  <li>Cancel any active subscription</li>
                  <li>Remove all contacts and status history</li>
                  <li>Sign you out immediately</li>
                </ul>
                <p className="mt-2 text-sm text-red-800">
                  <strong>This cannot be undone.</strong> Consider exporting your data first.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="confirm-email" className="block text-sm font-medium text-gray-700 mb-1">
                Type your email address to confirm: <strong>{user.email}</strong>
              </label>
              <input
                id="confirm-email"
                type="email"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder={user.email || 'your@email.com'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={deleting}
              />
            </div>

            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting || confirmDelete !== user.email}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting Account...' : 'Delete My Account Permanently'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Privacy Rights</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            You have the right to access, export, and delete your personal data at any time. We
            comply with GDPR, CCPA, and other privacy regulations.
          </p>
          <p>
            For questions about your data or privacy, please contact us at{' '}
            <a href="mailto:privacy@applicationpoint.com" className="text-blue-600 hover:underline">
              privacy@applicationpoint.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
