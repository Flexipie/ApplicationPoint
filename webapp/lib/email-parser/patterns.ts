import { EmailType } from '../gmail/types';

// Pattern matching rules for email classification
export interface EmailPattern {
  type: EmailType;
  weight: number; // How important this pattern is (0-1)
  patterns: {
    subject?: RegExp[];
    body?: RegExp[];
    from?: RegExp[];
  };
}

export const EMAIL_PATTERNS: EmailPattern[] = [
  // APPLICATION RECEIVED
  {
    type: EmailType.APPLICATION_RECEIVED,
    weight: 0.95,
    patterns: {
      subject: [
        /application (was|has been)?\s*(received|submitted|sent)/i,
        /your application was sent/i,
        /thank you for (your )?applying/i,
        /we('ve| have) received your application/i,
        /your application (to|for|at)/i,
        /application confirmation/i,
        /applied (to|for|at)/i,
      ],
      body: [
        /thank you for (your )?application/i,
        /we('ve| have) received your (application|resume|cv)/i,
        /application (was|has been) (received|submitted|sent)/i,
        /successfully (applied|submitted)/i,
        /your application was sent/i,
      ],
      from: [
        /jobs-noreply@linkedin/i,
        /noreply.*jobs/i,
      ],
    },
  },

  // ASSESSMENT / TEST INVITATION
  {
    type: EmailType.ASSESSMENT_INVITATION,
    weight: 0.9,
    patterns: {
      subject: [
        /assessment/i,
        /coding (test|challenge|exercise)/i,
        /technical (test|challenge|assessment)/i,
        /complete (the|our|your) (test|assessment|challenge)/i,
        /next step.*(test|assessment)/i,
      ],
      body: [
        /complete (the|our|a) (coding|technical)? ?(test|challenge|assessment)/i,
        /invited? (you )?to (take|complete) (the|a|our) (test|assessment)/i,
        /please complete the following (test|assessment)/i,
        /technical (test|challenge|assessment)/i,
      ],
    },
  },

  // INTERVIEW SCHEDULED
  {
    type: EmailType.INTERVIEW_SCHEDULED,
    weight: 0.95,
    patterns: {
      subject: [
        /interview (invitation|request|scheduled?)/i,
        /schedule (an?|your) interview/i,
        /would like to (schedule|arrange|set up) (an?|a) interview/i,
        /invitation (to|for) interview/i,
        /phone (screen|interview)/i,
        /video interview/i,
      ],
      body: [
        /schedule (an?|your) interview/i,
        /would like to speak with you/i,
        /phone (screen|interview|call)/i,
        /video (interview|call)/i,
        /meet with (you|us)/i,
        /discuss your (application|candidacy)/i,
        /available (for|to) (meet|interview|chat|speak)/i,
      ],
    },
  },

  // INTERVIEW REMINDER
  {
    type: EmailType.INTERVIEW_REMINDER,
    weight: 0.85,
    patterns: {
      subject: [
        /interview reminder/i,
        /upcoming interview/i,
        /reminder.*interview/i,
        /tomorrow.*interview/i,
        /today.*interview/i,
      ],
      body: [
        /reminder (about|for) (your|our|the) interview/i,
        /interview (is )?scheduled for/i,
        /looking forward to (speaking|meeting) with you/i,
        /see you (tomorrow|today)/i,
      ],
    },
  },

  // JOB OFFER
  {
    type: EmailType.OFFER_EXTENDED,
    weight: 1.0,
    patterns: {
      subject: [
        /offer of employment/i,
        /job offer/i,
        /congratulations/i,
        /we('d| would) like to (offer|extend)/i,
        /offer letter/i,
      ],
      body: [
        /pleased to (offer|extend)/i,
        /offer (you )?the position/i,
        /congratulations/i,
        /excited to (offer|have) you/i,
        /accept (this|our|the) offer/i,
        /starting salary/i,
        /compensation package/i,
      ],
    },
  },

  // REJECTION
  {
    type: EmailType.REJECTION,
    weight: 0.9,
    patterns: {
      subject: [
        /update (on|about|regarding) your application/i,
        /thank you for your (interest|application)/i,
        /application (status|update)/i,
        /regarding your (recent )?application/i,
      ],
      body: [
        /(unfortunately|regret(fully)?|sorry)/i,
        /decided to (move forward|pursue|proceed) with other candidate/i,
        /not (moving|proceeding) forward/i,
        /will not be (moving|proceeding) forward/i,
        /position has been filled/i,
        /more qualified candidate/i,
        /not (be )?(the best|a) (fit|match)/i,
        /have chosen to pursue other/i,
      ],
    },
  },

  // GENERAL JOB-RELATED (lowest priority)
  {
    type: EmailType.GENERAL,
    weight: 0.3,
    patterns: {
      subject: [
        /job (alert|notification)/i,
        /new job(s)? (for|match)/i,
        /recommended job/i,
        /jobs? you might (like|be interested)/i,
        /top job picks/i,
        /\d+ new jobs?/i,
        /is hiring/i,
        /apply now to/i,
        /saved job/i,
      ],
      body: [
        /job (alert|notification|recommendation)/i,
        /view job/i,
        /apply (now|here)/i,
      ],
      from: [
        /jobalerts.*@linkedin/i,
        /job-listings.*@linkedin/i,
        /jobs.*@linkedin/i,
        /linkedin.*job/i,
        /careers/i,
        /recruiting/i,
      ],
    },
  },
];

// Keywords that indicate it's NOT a job application email
// NOTE: These should be very specific to avoid filtering out real job emails
export const EXCLUDE_PATTERNS = [
  /news.*newsletter/i, // More specific than just "newsletter"
  /medium daily digest/i, // Specific to Medium
  /github.*dependabot/i, // GitHub notifications
  /weekly summary/i,
  /unsubscribe/i,
  /marketing.*update/i,
  /promotional.*offer/i,
];

// Extract company name patterns
export const COMPANY_PATTERNS = {
  // "Your application to [Company]"
  applicationTo: /application (to|at|for) ([A-Z][A-Za-z\s&.]+?)(?=\s*(?:was|has|for|in|$))/i,
  
  // "Interview with [Company]"
  interviewWith: /interview (with|at) ([A-Z][A-Za-z\s&.]+?)(?=\s*(?:on|for|is|$))/i,
  
  // "Offer from [Company]"
  offerFrom: /offer (from|at) ([A-Z][A-Za-z\s&.]+?)(?=\s*(?:for|$))/i,
  
  // "[Company] is hiring" or "[Company] - Position"
  isHiring: /^([A-Z][A-Za-z\s&.]+?) (is hiring|[-–])/i,
};

// Extract job title patterns
export const JOB_TITLE_PATTERNS = [
  // "for the [Title] position"
  /for the ([A-Z][A-Za-z\s/]+?) position/i,
  
  // "applied for [Title]"
  /applied for ([A-Z][A-Za-z\s/]+?)(?=\s*(?:at|with|in|$))/i,
  
  // "role of [Title]"
  /role of ([A-Z][A-Za-z\s/]+?)(?=\s*(?:at|with|$))/i,
  
  // "[Title] at [Company]"
  /^([A-Z][A-Za-z\s/]+?) at [A-Z]/i,
];

// Date extraction patterns
export const DATE_PATTERNS = [
  // "on Monday, January 15"
  /(?:on|for)\s+(\w+day),?\s+(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
  
  // "January 15, 2024"
  /(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i,
  
  // "15/01/2024" or "01/15/2024"
  /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  
  // "at 2:00 PM" or "at 14:00"
  /at\s+(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i,
];
