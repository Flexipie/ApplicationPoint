import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { applications, emailEvents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { GmailClient } from '@/lib/gmail/client';
import { EmailClassifier } from '@/lib/email-parser/classifier';
import { EmailProcessor } from '@/lib/services/email-processor';
import { ParsedEmail } from '@/lib/gmail/types';
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for email scanning

/**
 * POST /api/email/scan - Scan past month of emails and auto-create applications
 *
 * This endpoint:
 * 1. Fetches Gmail messages from the past 30 days
 * 2. Detects job-related emails
 * 3. Auto-creates applications for emails without existing applications
 * 4. Creates email event records
 *
 * Use cases:
 * - New user onboarding (scan historical emails)
 * - Manual refresh to catch missed emails
 */
export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Get Gmail client for user
    const gmailClient = await GmailClient.forUser(userId);

    if (!gmailClient) {
      return NextResponse.json(
        { error: 'Gmail not connected. Please connect Gmail first.' },
        { status: 400 }
      );
    }

    // Scan past 30 days
    const afterDate = subDays(new Date(), 30);

    console.log(`[Email Scan] Starting scan for user ${userId} from ${afterDate.toISOString()}`);

    // Fetch Gmail messages
    const messages = await gmailClient.getMessagesSince(afterDate, 100);

    console.log(`[Email Scan] Found ${messages.length} potential job-related emails`);

    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          emailsScanned: 0,
          applicationsCreated: 0,
          emailEventsCreated: 0,
        },
        message: 'No job-related emails found in the past 30 days',
      });
    }

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

    // Filter to only job-related emails
    const jobEmails = parsedEmails.filter((email) => email.type !== 'unknown');

    console.log(`[Email Scan] Found ${jobEmails.length} job-related emails out of ${messages.length}`);

    // Process emails and auto-create applications
    let applicationsCreated = 0;
    let emailEventsCreated = 0;

    // Get existing applications to avoid duplicates
    const existingApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));

    for (const email of jobEmails) {
      try {
        // Check if application already exists for this company
        const existingApp = existingApplications.find(
          (app) =>
            app.companyName.toLowerCase() === (email.companyName?.toLowerCase() || '')
        );

        if (existingApp) {
          // Application already exists, try to process the email
          const result = await EmailProcessor.processEmail(userId, email);

          if (result.matched) {
            emailEventsCreated++;
          }

          console.log(
            `[Email Scan] Linked email to existing application: ${existingApp.companyName}`
          );
        } else if (email.companyName) {
          // Create new application from email
          const status = determineStatusFromType(email.type);
          const jobTitle = email.extractedData.jobTitle || 'Position';

          const [newApp] = await db
            .insert(applications)
            .values({
              userId,
              companyName: email.companyName,
              jobTitle,
              currentStatus: status,
              source: 'other',
              notes: `Auto-imported from email: ${email.subject}`,
            })
            .returning();

          applicationsCreated++;

          // Create email event for new application
          await db.insert(emailEvents).values({
            userId,
            applicationId: newApp.id,
            emailSubject: email.subject,
            emailFrom: email.from,
            emailDate: email.date,
            detectedAction: email.type,
            confidenceScore: email.confidence,
            rawSnippet: email.body.substring(0, 500),
          });

          emailEventsCreated++;

          console.log(
            `[Email Scan] Created new application: ${newApp.companyName} - ${jobTitle}`
          );
        }
      } catch (error) {
        console.error('[Email Scan] Error processing message:', error);
        // Continue processing other messages
      }
    }

    console.log(
      `[Email Scan] Completed. Created ${applicationsCreated} applications, ${emailEventsCreated} email events`
    );

    return NextResponse.json({
      success: true,
      stats: {
        emailsScanned: messages.length,
        applicationsCreated,
        emailEventsCreated,
      },
      message: `Scan complete! Created ${applicationsCreated} new applications from ${emailEventsCreated} detected emails.`,
    });
  } catch (error: any) {
    console.error('[Email Scan] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to scan emails',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Determine application status based on email type
 */
function determineStatusFromType(type: string): 'saved' | 'applied' | 'assessment' | 'interview' | 'offer' | 'accepted' | 'rejected' {
  const typeToStatus: Record<string, 'saved' | 'applied' | 'assessment' | 'interview' | 'offer' | 'accepted' | 'rejected'> = {
    application_confirmation: 'applied',
    interview_scheduled: 'interview',
    assessment_received: 'assessment',
    offer_received: 'offer',
    rejection: 'rejected',
    follow_up: 'applied',
  };

  return typeToStatus[type] || 'saved';
}
