import { pgTable, text, timestamp, integer, boolean, pgEnum, primaryKey, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Enums
export const applicationStatusEnum = pgEnum('application_status', [
  'saved',
  'applied',
  'assessment',
  'interview',
  'offer',
  'accepted',
  'rejected',
]);

export const applicationSourceEnum = pgEnum('application_source', [
  'linkedin',
  'indeed',
  'generic',  // Fallback parser for unsupported sites
  'company_site',
  'referral',
  'other',
]);

export const reminderTypeEnum = pgEnum('reminder_type', [
  'follow_up',
  'thank_you',
  'deadline',
  'preparation',
  'other',
]);

// Users table
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  
  // User settings
  timezone: text('timezone').default('UTC'),
  digestTime: integer('digest_time').default(6), // 6 AM
  emailConnected: boolean('email_connected').default(false),
  calendarConnected: boolean('calendar_connected').default(false),
  lastEmailSync: timestamp('last_email_sync', { mode: 'date' }), // Last time emails were processed

  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Applications table (main entity)
export const applications = pgTable('applications', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Job details
  jobTitle: text('job_title').notNull(),
  companyName: text('company_name').notNull(),
  location: text('location'),
  salaryRange: text('salary_range'),
  applyUrl: text('apply_url'),
  descriptionPreview: text('description_preview'),

  // Status and metadata
  currentStatus: applicationStatusEnum('current_status').default('saved').notNull(),
  source: applicationSourceEnum('source').default('other').notNull(),

  // Dates
  deadlineDate: timestamp('deadline_date', { mode: 'date' }),
  nextActionText: text('next_action_text'),
  nextActionDate: timestamp('next_action_date', { mode: 'date' }),

  // Duplicate tracking
  isDuplicate: boolean('is_duplicate').default(false),
  canonicalApplicationId: text('canonical_application_id'),

  // Notes
  notes: text('notes'),

  // Timestamps
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => ({
  // Indexes for performance optimization
  userIdIdx: index('applications_user_id_idx').on(table.userId),
  statusIdx: index('applications_status_idx').on(table.currentStatus),
  createdAtIdx: index('applications_created_at_idx').on(table.createdAt),
  userStatusIdx: index('applications_user_status_idx').on(table.userId, table.currentStatus),
}));

// Stage history (track all status changes)
export const stageHistory = pgTable('stage_history', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  applicationId: text('application_id')
    .notNull()
    .references(() => applications.id, { onDelete: 'cascade' }),
  
  fromStatus: applicationStatusEnum('from_status'),
  toStatus: applicationStatusEnum('to_status').notNull(),
  trigger: text('trigger').notNull(), // 'manual', 'email', 'reminder'
  emailReference: text('email_reference'), // Link to email_events if triggered by email
  
  timestamp: timestamp('timestamp', { mode: 'date' }).defaultNow().notNull(),
});

// Email events (detected emails)
export const emailEvents = pgTable('email_events', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  applicationId: text('application_id')
    .notNull()
    .references(() => applications.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // Email details
  emailSubject: text('email_subject').notNull(),
  emailFrom: text('email_from').notNull(),
  emailDate: timestamp('email_date', { mode: 'date' }).notNull(),
  
  // Detection
  detectedAction: text('detected_action').notNull(), // e.g., 'application_received', 'interview_scheduled'
  confidenceScore: integer('confidence_score').notNull(), // 0-100
  rawSnippet: text('raw_snippet'), // For audit trail
  
  // User confirmation
  userConfirmed: boolean('user_confirmed'), // null = pending, true = confirmed, false = rejected
  
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Contacts (recruiters, hiring managers)
export const contacts = pgTable('contacts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  applicationId: text('application_id')
    .notNull()
    .references(() => applications.id, { onDelete: 'cascade' }),
  
  name: text('name').notNull(),
  role: text('role'), // e.g., 'Recruiter', 'Hiring Manager'
  email: text('email'),
  phone: text('phone'),
  notes: text('notes'),
  source: text('source'), // 'email', 'linkedin', 'manual'
  
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Attachments (resumes, cover letters)
export const attachments = pgTable('attachments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  applicationId: text('application_id')
    .notNull()
    .references(() => applications.id, { onDelete: 'cascade' }),
  
  fileType: text('file_type').notNull(), // 'resume', 'cover_letter', 'assessment', 'other'
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'), // in bytes
  versionNumber: integer('version_number').default(1),
  
  uploadedAt: timestamp('uploaded_at', { mode: 'date' }).defaultNow().notNull(),
});

// Reminders
export const reminders = pgTable('reminders', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  applicationId: text('application_id')
    .notNull()
    .references(() => applications.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  reminderType: reminderTypeEnum('reminder_type').notNull(),
  dueDate: timestamp('due_date', { mode: 'date' }).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdBy: text('created_by').notNull(), // 'auto' or 'manual'
  
  // Optional details
  title: text('title'),
  description: text('description'),
  
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { mode: 'date' }),
});

// Accounts table (for NextAuth OAuth)
export const accounts = pgTable('accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

// Sessions table (for NextAuth)
export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// Verification tokens (for NextAuth)
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;

export type StageHistory = typeof stageHistory.$inferSelect;
export type NewStageHistory = typeof stageHistory.$inferInsert;

export type EmailEvent = typeof emailEvents.$inferSelect;
export type NewEmailEvent = typeof emailEvents.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;

export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;
