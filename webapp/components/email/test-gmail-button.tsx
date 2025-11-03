'use client';

import { useState } from 'react';

export function TestGmailButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testGmail = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/email/test');
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Failed to test Gmail');
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
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">📧 Gmail Integration</h3>
          <p className="mt-1 text-sm text-gray-500">
            Test your Gmail connection and see recent job-related emails
          </p>
        </div>
        <button
          onClick={testGmail}
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Gmail'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Error</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          {error.includes('Gmail not connected') && (
            <p className="mt-2 text-sm text-red-600">
              → Please <strong>sign out</strong> and <strong>sign in again</strong> to grant Gmail access
            </p>
          )}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            ✅ Gmail Connected!
          </p>
          <p className="mt-1 text-sm text-green-700">
            Found {result.messagesFound} job-related emails from the last 7 days
          </p>
          
          {result.messages && result.messages.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium uppercase text-green-800">
                Recent Emails:
              </p>
              {result.messages.map((msg: any, i: number) => (
                <div key={i} className="rounded border border-green-200 bg-white p-2 text-xs">
                  <p className="font-medium text-gray-900">{msg.headers.subject}</p>
                  <p className="text-gray-600">From: {msg.companyName || msg.headers.from}</p>
                  <p className="mt-1 text-gray-500">{msg.bodyPreview}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
