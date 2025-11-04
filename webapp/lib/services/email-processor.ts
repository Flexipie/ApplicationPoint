import { db } from '@/db';
import { applications, emailEvents, stageHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { EmailType, ParsedEmail, EmailProcessingResult } from '../gmail/types';
import { ApplicationMatcher } from './application-matcher';

// Map email types to application statuses
const EMAIL_TYPE_TO_STATUS: Record<EmailType, string | null> = {
  [EmailType.APPLICATION_RECEIVED]: 'applied',
  [EmailType.ASSESSMENT_INVITATION]: 'assessment',
  [EmailType.INTERVIEW_SCHEDULED]: 'interview',
  [EmailType.INTERVIEW_REMINDER]: null, // Don't change status
  [EmailType.OFFER_EXTENDED]: 'offer',
  [EmailType.REJECTION]: 'rejected',
  [EmailType.GENERAL]: null, // Don't change status
  [EmailType.UNKNOWN]: null, // Don't change status
};

export class EmailProcessor {
  /**
   * Process a single email and update application status if matched
   */
  static async processEmail(
    userId: string,
    email: ParsedEmail
  ): Promise<EmailProcessingResult> {
    console.log('📧 Processing email:', email.subject.substring(0, 60));

    // Find matching application
    const match = await ApplicationMatcher.getBestMatch(
      userId,
      email.companyName,
      email.extractedData.jobTitle || null
    );

    if (!match) {
      console.log('   ❌ No matching application found');
      return {
        email,
        matched: false,
        statusUpdated: false,
      };
    }

    console.log(`   ✅ Matched to application ${match.applicationId} (${Math.round(match.confidence * 100)}%)`);

    // Store email event
    await this.storeEmailEvent(userId, match.applicationId, email);

    // Determine if status should be updated
    const newStatus = EMAIL_TYPE_TO_STATUS[email.type];
    
    if (!newStatus) {
      console.log('   ℹ️  Email type does not trigger status change');
      return {
        email,
        matched: true,
        applicationId: match.applicationId,
        statusUpdated: false,
      };
    }

    // Get current application
    const [app] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, match.applicationId))
      .limit(1);

    if (!app) {
      return {
        email,
        matched: true,
        applicationId: match.applicationId,
        statusUpdated: false,
        error: 'Application not found',
      };
    }

    // Check if status is different
    if (app.currentStatus === newStatus) {
      console.log(`   ℹ️  Status already ${newStatus}, no update needed`);
      return {
        email,
        matched: true,
        applicationId: match.applicationId,
        statusUpdated: false,
        newStatus,
      };
    }

    // Update application status
    await db
      .update(applications)
      .set({
        currentStatus: newStatus as any,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, match.applicationId));

    // Create stage history entry
    await db.insert(stageHistory).values({
      applicationId: match.applicationId,
      fromStatus: app.currentStatus,
      toStatus: newStatus as any,
      trigger: 'email',
      emailReference: email.messageId,
    });

    console.log(`   ✅ Status updated: ${app.currentStatus} → ${newStatus}`);

    return {
      email,
      matched: true,
      applicationId: match.applicationId,
      statusUpdated: true,
      newStatus,
    };
  }

  /**
   * Store email event in database
   */
  private static async storeEmailEvent(
    userId: string,
    applicationId: string,
    email: ParsedEmail
  ): Promise<void> {
    try {
      await db.insert(emailEvents).values({
        applicationId,
        userId,
        emailSubject: email.subject,
        emailFrom: email.from,
        emailDate: email.date,
        detectedAction: email.type,
        confidenceScore: Math.round(email.confidence * 100), // Convert 0-1 to 0-100
        rawSnippet: email.body.substring(0, 500),
      });

      console.log('   💾 Email event stored');
    } catch (error) {
      console.error('   ❌ Failed to store email event:', error);
    }
  }

  /**
   * Process multiple emails in batch
   */
  static async processEmails(
    userId: string,
    emails: ParsedEmail[]
  ): Promise<EmailProcessingResult[]> {
    const results: EmailProcessingResult[] = [];

    for (const email of emails) {
      try {
        const result = await this.processEmail(userId, email);
        results.push(result);
      } catch (error: any) {
        console.error('Error processing email:', error);
        results.push({
          email,
          matched: false,
          statusUpdated: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Get processing summary
   */
  static getSummary(results: EmailProcessingResult[]) {
    return {
      total: results.length,
      matched: results.filter((r) => r.matched).length,
      statusUpdated: results.filter((r) => r.statusUpdated).length,
      errors: results.filter((r) => r.error).length,
    };
  }
}
