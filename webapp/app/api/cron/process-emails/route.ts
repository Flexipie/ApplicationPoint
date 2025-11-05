import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { GmailClient } from '@/lib/gmail/client';
import { EmailClassifier } from '@/lib/email-parser/classifier';
import { EmailProcessor } from '@/lib/services/email-processor';
import { ParsedEmail } from '@/lib/gmail/types';

export const runtime = 'nodejs';

/**
 * GET /api/cron/process-emails - Automated email processing for all users
 *
 * This endpoint is called by Vercel Cron every 15 minutes.
 * It processes emails for all users who have Gmail connected.
 */
export async function GET(req: NextRequest) {
  try {
    // Verify request is from Vercel Cron
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
      console.error('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting automated email processing for all users...');

    // Get all users with Gmail connected
    const usersWithGmail = await db
      .select()
      .from(users)
      .where(eq(users.emailConnected, true));

    console.log(`📧 Found ${usersWithGmail.length} users with Gmail connected`);

    if (usersWithGmail.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with Gmail connected',
        processed: 0,
      });
    }

    const results = [];
    let totalProcessed = 0;
    let totalErrors = 0;

    // Process emails for each user
    for (const user of usersWithGmail) {
      try {
        console.log(`\n👤 Processing emails for user ${user.id} (${user.email})`);

        // Get Gmail client for user
        const gmailClient = await GmailClient.forUser(user.id);

        if (!gmailClient) {
          console.error(`❌ Failed to get Gmail client for user ${user.id}`);
          results.push({
            userId: user.id,
            email: user.email,
            success: false,
            error: 'Failed to get Gmail client',
          });
          totalErrors++;
          continue;
        }

        // Determine date to fetch emails from
        // Use lastEmailSync if available, otherwise fetch from 7 days ago
        let fetchFrom: Date;
        if (user.lastEmailSync) {
          fetchFrom = user.lastEmailSync;
          console.log(`  📅 Fetching emails since last sync: ${fetchFrom.toISOString()}`);
        } else {
          // First sync - get last 7 days
          fetchFrom = new Date();
          fetchFrom.setDate(fetchFrom.getDate() - 7);
          console.log(`  📅 First sync - fetching last 7 days`);
        }

        // Fetch messages
        const messages = await gmailClient.getMessagesSince(fetchFrom, 50);
        console.log(`  📬 Found ${messages.length} emails`);

        if (messages.length === 0) {
          // Update lastEmailSync even if no messages found
          await db
            .update(users)
            .set({ lastEmailSync: new Date() })
            .where(eq(users.id, user.id));

          results.push({
            userId: user.id,
            email: user.email,
            success: true,
            emailsFound: 0,
            emailsProcessed: 0,
          });
          continue;
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
        console.log(`  ✅ ${jobEmails.length} job-related emails identified`);

        if (jobEmails.length === 0) {
          // Update lastEmailSync even if no job emails found
          await db
            .update(users)
            .set({ lastEmailSync: new Date() })
            .where(eq(users.id, user.id));

          results.push({
            userId: user.id,
            email: user.email,
            success: true,
            emailsFound: messages.length,
            emailsProcessed: 0,
          });
          continue;
        }

        // Process emails (match to applications and update statuses)
        const processingResults = await EmailProcessor.processEmails(user.id, jobEmails);
        const summary = EmailProcessor.getSummary(processingResults);

        console.log(`  📊 Processing complete:`, summary);

        // Update lastEmailSync timestamp
        await db
          .update(users)
          .set({ lastEmailSync: new Date() })
          .where(eq(users.id, user.id));

        results.push({
          userId: user.id,
          email: user.email,
          success: true,
          emailsFound: messages.length,
          emailsProcessed: jobEmails.length,
          summary,
        });

        totalProcessed++;

      } catch (userError: any) {
        // Log error but continue processing other users
        console.error(`❌ Error processing emails for user ${user.id}:`, userError);
        results.push({
          userId: user.id,
          email: user.email,
          success: false,
          error: userError.message || 'Unknown error',
        });
        totalErrors++;
      }
    }

    console.log(`\n✅ Email processing complete!`);
    console.log(`   Processed: ${totalProcessed}/${usersWithGmail.length} users`);
    console.log(`   Errors: ${totalErrors}`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalUsers: usersWithGmail.length,
      processedSuccessfully: totalProcessed,
      errors: totalErrors,
      results,
    });

  } catch (error: any) {
    console.error('❌ Fatal error in cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
