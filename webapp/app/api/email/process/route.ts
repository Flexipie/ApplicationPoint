import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GmailClient } from '@/lib/gmail/client';
import { EmailClassifier } from '@/lib/email-parser/classifier';
import { EmailProcessor } from '@/lib/services/email-processor';
import { ParsedEmail } from '@/lib/gmail/types';

export const runtime = 'nodejs';

/**
 * POST /api/email/process - Process emails and update application statuses
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Gmail client for user
    const gmailClient = await GmailClient.forUser(session.user.id);
    
    if (!gmailClient) {
      return NextResponse.json(
        { 
          error: 'Gmail not connected',
          message: 'Please sign out and sign in again to grant Gmail access'
        },
        { status: 400 }
      );
    }

    // Fetch emails from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log('🔄 Fetching and processing emails...');
    
    const messages = await gmailClient.getMessagesSince(sevenDaysAgo, 20);

    console.log(`📧 Found ${messages.length} emails to process`);

    // Parse and classify emails
    const parsedEmails: ParsedEmail[] = messages.map((message) => {
      const headers = GmailClient.parseHeaders(message);
      const body = GmailClient.getPlainTextBody(message);
      
      return EmailClassifier.parse(
        message.id || 'unknown',
        headers.from,
        headers.subject,
        body,
        new Date(headers.date)
      );
    });

    // Filter to only job-related emails (not UNKNOWN)
    const jobEmails = parsedEmails.filter((email) => email.type !== 'unknown');
    
    console.log(`✅ ${jobEmails.length} job-related emails identified`);

    // Process emails (match to applications and update statuses)
    const results = await EmailProcessor.processEmails(session.user.id, jobEmails);
    
    const summary = EmailProcessor.getSummary(results);

    console.log('📊 Processing complete:', summary);

    return NextResponse.json({
      success: true,
      summary,
      results: results.map((r) => ({
        subject: r.email.subject,
        type: r.email.type,
        companyName: r.email.companyName,
        matched: r.matched,
        applicationId: r.applicationId,
        statusUpdated: r.statusUpdated,
        newStatus: r.newStatus,
        error: r.error,
      })),
    });
  } catch (error: any) {
    console.error('❌ Error processing emails:', error);
    return NextResponse.json(
      {
        error: 'Failed to process emails',
        message: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
