// Email classification types
export enum EmailType {
  APPLICATION_RECEIVED = 'application_received',
  ASSESSMENT_INVITATION = 'assessment_invitation',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_REMINDER = 'interview_reminder',
  OFFER_EXTENDED = 'offer_extended',
  REJECTION = 'rejection',
  GENERAL = 'general',
  UNKNOWN = 'unknown',
}

// Parsed email data
export interface ParsedEmail {
  messageId: string;
  from: string;
  subject: string;
  body: string;
  date: Date;
  type: EmailType;
  confidence: number; // 0-1 score
  companyName: string | null;
  extractedData: {
    interviewDate?: Date;
    deadline?: Date;
    jobTitle?: string;
  };
}

// Email processing result
export interface EmailProcessingResult {
  email: ParsedEmail;
  matched: boolean;
  applicationId?: string;
  statusUpdated: boolean;
  newStatus?: string;
  error?: string;
}

// Sync status
export interface SyncStatus {
  lastSyncAt: Date | null;
  emailsProcessed: number;
  applicationsUpdated: number;
  errors: number;
}
