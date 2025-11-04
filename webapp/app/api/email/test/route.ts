import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GmailClient } from '@/lib/gmail/client';
import { EmailClassifier } from '@/lib/email-parser/classifier';
import { DataExtractor } from '@/lib/email-parser/extractor';

export const runtime = 'nodejs';

/**
 * GET /api/email/test - Test Gmail connection and fetch recent emails
 */
export async function GET(req: NextRequest) {
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

    console.log('Fetching emails since:', sevenDaysAgo);
    
    const messages = await gmailClient.getMessagesSince(sevenDaysAgo, 10);

    console.log(`Found ${messages.length} messages`);

    // Parse and classify messages
    const parsedMessages = messages.map((message) => {
      const headers = GmailClient.parseHeaders(message);
      const body = GmailClient.getPlainTextBody(message);
      
      // Classify email
      const classification = EmailClassifier.classify(
        headers.subject,
        body,
        headers.from
      );

      // Extract additional data
      const companyName = EmailClassifier.extractCompany(
        headers.subject,
        body,
        headers.from
      );
      
      const jobTitle = EmailClassifier.extractJobTitle(
        headers.subject,
        body
      );

      const interviewDate = DataExtractor.extractInterviewDate(
        headers.subject,
        body
      );

      const isRemote = DataExtractor.isRemote(`${headers.subject} ${body}`);

      return {
        id: message.id,
        headers,
        bodyPreview: body.substring(0, 200),
        classification: {
          type: classification.type,
          confidence: classification.confidence,
          matches: classification.matches.slice(0, 3), // Top 3 matches
        },
        extractedData: {
          companyName,
          jobTitle,
          interviewDate,
          isRemote,
        },
      };
    });

    // Separate classified vs unknown
    const classifiedMessages = parsedMessages.filter(
      (msg) => msg.classification.type !== 'unknown'
    );

    return NextResponse.json({
      success: true,
      messagesFound: messages.length,
      classifiedMessages: classifiedMessages.length,
      unknownMessages: parsedMessages.length - classifiedMessages.length,
      messages: parsedMessages, // Show ALL for debugging (including unknown)
      classified: classifiedMessages, // Just the classified ones
    });
  } catch (error: any) {
    console.error('Error testing Gmail connection:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch emails',
        message: error.message,
        details: error.response?.data || error.toString(),
      },
      { status: 500 }
    );
  }
}
