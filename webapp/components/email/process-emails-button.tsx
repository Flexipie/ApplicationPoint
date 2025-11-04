'use client';

import { useState } from 'react';

export function ProcessEmailsButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const processEmails = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/email/process', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Failed to process emails');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-blue-900">🤖 Auto-Update from Emails</h3>
          <p className="mt-1 text-sm text-blue-700">
            Match emails to applications and update statuses automatically
          </p>
        </div>
        <button
          onClick={processEmails}
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Process Emails'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Error</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            ✅ Processing Complete!
          </p>
          <div className="mt-2 grid grid-cols-4 gap-3 text-sm">
            <div className="rounded bg-white p-2">
              <p className="text-xs text-gray-500">Total Emails</p>
              <p className="text-lg font-bold text-gray-900">{result.summary.total}</p>
            </div>
            <div className="rounded bg-white p-2">
              <p className="text-xs text-gray-500">Matched</p>
              <p className="text-lg font-bold text-blue-600">{result.summary.matched}</p>
            </div>
            <div className="rounded bg-white p-2">
              <p className="text-xs text-gray-500">Status Updated</p>
              <p className="text-lg font-bold text-green-600">{result.summary.statusUpdated}</p>
            </div>
            <div className="rounded bg-white p-2">
              <p className="text-xs text-gray-500">Errors</p>
              <p className="text-lg font-bold text-red-600">{result.summary.errors}</p>
            </div>
          </div>

          {result.results && result.results.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium uppercase text-green-800">Results:</p>
              {result.results.map((r: any, i: number) => (
                <div key={i} className="rounded border border-green-200 bg-white p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{r.subject}</p>
                      {r.companyName && (
                        <p className="text-gray-600">🏢 {r.companyName}</p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-1">
                      {r.matched ? (
                        <span className="inline-flex rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                          ✓ Matched
                        </span>
                      ) : (
                        <span className="inline-flex rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                          No match
                        </span>
                      )}
                      {r.statusUpdated && (
                        <span className="inline-flex rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                          → {r.newStatus}
                        </span>
                      )}
                    </div>
                  </div>
                  {r.error && (
                    <p className="mt-1 text-red-600">Error: {r.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-md border-l-4 border-blue-500 bg-blue-50 p-3">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> Check your applications list - statuses should be updated automatically!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
