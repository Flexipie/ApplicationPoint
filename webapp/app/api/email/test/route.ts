import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GmailClient } from '@/lib/gmail/client';

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

    // Parse messages
    const parsedMessages = messages.map((message) => {
      const headers = GmailClient.parseHeaders(message);
      const body = GmailClient.getPlainTextBody(message);
      const companyName = GmailClient.extractCompanyName(headers.from);

      return {
        id: message.id,
        headers,
        bodyPreview: body.substring(0, 200),
        companyName,
      };
    });

    return NextResponse.json({
      success: true,
      messagesFound: messages.length,
      messages: parsedMessages,
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
