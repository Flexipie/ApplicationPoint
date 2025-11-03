import { google } from 'googleapis';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export class GmailClient {
  private oauth2Client;
  private gmail;

  constructor(accessToken: string, refreshToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL
    );

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Get Gmail client for a user
   */
  static async forUser(userId: string): Promise<GmailClient | null> {
    // Get user's Google account from database
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);

    if (!account || !account.refresh_token) {
      return null;
    }

    return new GmailClient(
      account.access_token || '',
      account.refresh_token
    );
  }

  /**
   * List messages matching a query
   */
  async listMessages(query: string, maxResults: number = 50) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      return response.data.messages || [];
    } catch (error) {
      console.error('Error listing Gmail messages:', error);
      throw error;
    }
  }

  /**
   * Get a specific message by ID
   */
  async getMessage(messageId: string) {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      return response.data;
    } catch (error) {
      console.error('Error getting Gmail message:', error);
      throw error;
    }
  }

  /**
   * Get messages received after a specific date
   */
  async getMessagesSince(afterDate: Date, maxResults: number = 100) {
    // Format date for Gmail query (YYYY/MM/DD)
    const dateStr = afterDate.toISOString().split('T')[0].replace(/-/g, '/');
    
    // Search for messages that might be job-related
    const query = `after:${dateStr} (from:noreply OR from:jobs OR from:recruiting OR from:talent OR from:hr OR subject:application OR subject:interview OR subject:assessment OR subject:offer OR subject:position)`;
    
    const messageRefs = await this.listMessages(query, maxResults);
    
    // Fetch full message details
    const messages = await Promise.all(
      messageRefs.map((ref) => this.getMessage(ref.id!))
    );

    return messages;
  }

  /**
   * Parse email headers
   */
  static parseHeaders(message: any) {
    const headers = message.payload?.headers || [];
    const headerMap: Record<string, string> = {};

    for (const header of headers) {
      headerMap[header.name.toLowerCase()] = header.value;
    }

    return {
      from: headerMap['from'] || '',
      to: headerMap['to'] || '',
      subject: headerMap['subject'] || '',
      date: headerMap['date'] || '',
      messageId: headerMap['message-id'] || '',
    };
  }

  /**
   * Extract plain text body from message
   */
  static getPlainTextBody(message: any): string {
    const parts = message.payload?.parts || [message.payload];
    
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      
      // Check nested parts
      if (part.parts) {
        const nestedBody = this.getPlainTextBody({ payload: part });
        if (nestedBody) return nestedBody;
      }
    }

    // Fallback to HTML body if plain text not found
    for (const part of parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = Buffer.from(part.body.data, 'base64').toString('utf-8');
        // Strip HTML tags (basic)
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }

    return '';
  }

  /**
   * Extract email domain from "from" address
   */
  static extractDomain(fromAddress: string): string {
    const match = fromAddress.match(/@([^>]+)/);
    return match ? match[1].toLowerCase() : '';
  }

  /**
   * Extract company name from email address or display name
   */
  static extractCompanyName(fromAddress: string): string | null {
    // Try to extract from display name first
    const displayNameMatch = fromAddress.match(/^([^<]+)</);
    if (displayNameMatch) {
      const name = displayNameMatch[1].trim();
      // Remove common words
      const cleanName = name
        .replace(/\b(via|team|recruiting|careers|jobs|talent|hr|noreply)\b/gi, '')
        .trim();
      if (cleanName && cleanName.length > 2) {
        return cleanName;
      }
    }

    // Extract from domain
    const domain = this.extractDomain(fromAddress);
    if (!domain) return null;

    // Remove common TLDs and subdomains
    const companyMatch = domain.match(/([^.]+)\.(com|net|org|io|co)/);
    if (companyMatch) {
      const company = companyMatch[1];
      // Capitalize first letter
      return company.charAt(0).toUpperCase() + company.slice(1);
    }

    return null;
  }
}
