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
            ✅ Gmail Connected & Classifier Working!
          </p>
          <p className="mt-1 text-sm text-green-700">
            Found {result.messagesFound} emails: {result.classifiedMessages} classified, {result.unknownMessages || 0} unknown
          </p>
          
          {result.messages && result.messages.length > 0 && (
            <div className="mt-3 space-y-3">
              <p className="text-xs font-medium uppercase text-green-800">
                Classified Emails:
              </p>
              {result.messages.map((msg: any, i: number) => (
                <div key={i} className="rounded border border-green-200 bg-white p-3 text-xs">
                  {/* Email Type Badge */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${
                      msg.classification.type === 'application_received' ? 'bg-blue-100 text-blue-800' :
                      msg.classification.type === 'interview_scheduled' ? 'bg-purple-100 text-purple-800' :
                      msg.classification.type === 'assessment_invitation' ? 'bg-yellow-100 text-yellow-800' :
                      msg.classification.type === 'offer_extended' ? 'bg-green-100 text-green-800' :
                      msg.classification.type === 'rejection' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {msg.classification.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-gray-500">
                      {Math.round(msg.classification.confidence * 100)}% confident
                    </span>
                  </div>

                  {/* Subject */}
                  <p className="font-medium text-gray-900">{msg.headers.subject}</p>
                  
                  {/* Extracted Data */}
                  {msg.extractedData && (
                    <div className="mt-2 space-y-1 text-gray-600">
                      {msg.extractedData.companyName && (
                        <p>🏢 Company: <strong>{msg.extractedData.companyName}</strong></p>
                      )}
                      {msg.extractedData.jobTitle && (
                        <p>💼 Role: {msg.extractedData.jobTitle}</p>
                      )}
                      {msg.extractedData.interviewDate && (
                        <p>📅 Date: {new Date(msg.extractedData.interviewDate).toLocaleDateString()}</p>
                      )}
                      {msg.extractedData.isRemote && (
                        <p>🏠 Remote</p>
                      )}
                    </div>
                  )}

                  {/* Body Preview */}
                  <p className="mt-2 text-gray-500">{msg.bodyPreview}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
