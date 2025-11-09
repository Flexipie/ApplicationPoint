'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailScannerProps {
  hasGmailConnected: boolean;
}

export function EmailScanner({ hasGmailConnected }: EmailScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    stats?: {
      emailsScanned: number;
      applicationsCreated: number;
      emailEventsCreated: number;
    };
  } | null>(null);

  async function handleScan() {
    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await fetch('/api/email/scan', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setScanResult({
          success: true,
          message: data.message,
          stats: data.stats,
        });
      } else {
        setScanResult({
          success: false,
          message: data.error || 'Failed to scan emails',
        });
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsScanning(false);
    }
  }

  if (!hasGmailConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Scanner
          </CardTitle>
          <CardDescription>
            Automatically import job applications from your Gmail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800">
              Connect Gmail first to enable email scanning
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Scanner
        </CardTitle>
        <CardDescription>
          Scan your past emails to automatically import job applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How it works</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Scans your Gmail from the past 30 days</li>
            <li>• Detects job application confirmations, interviews, offers, etc.</li>
            <li>• Automatically creates applications for companies you haven&apos;t saved</li>
            <li>• Links emails to existing applications when possible</li>
          </ul>
        </div>

        <Button
          onClick={handleScan}
          disabled={isScanning}
          className="w-full"
          size="lg"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning emails...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Scan Past Month
            </>
          )}
        </Button>

        {scanResult && (
          <div
            className={`rounded-lg border p-4 ${
              scanResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {scanResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    scanResult.success ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {scanResult.message}
                </p>
                {scanResult.success && scanResult.stats && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-green-800">
                      📧 {scanResult.stats.emailsScanned} emails scanned
                    </p>
                    <p className="text-sm text-green-800">
                      ✅ {scanResult.stats.applicationsCreated} new applications created
                    </p>
                    <p className="text-sm text-green-800">
                      📎 {scanResult.stats.emailEventsCreated} email events recorded
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500">
          💡 Tip: Run this scan monthly to catch any emails you might have missed
        </p>
      </CardContent>
    </Card>
  );
}
