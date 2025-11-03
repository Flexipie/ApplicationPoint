# Phase 2: Email Integration Plan

## 🎯 Goal
Automatically detect job-related emails and update application statuses based on email content.

---

## 📋 Overview

When you receive emails from companies about your job applications, the system will:
1. **Detect** job-related emails (application received, interview invites, rejections, etc.)
2. **Parse** the content to extract key information
3. **Match** emails to existing applications in your tracker
4. **Update** application statuses automatically
5. **Store** email events for audit trail

---

## 🔧 Technical Architecture

### Components to Build:

#### 1. Gmail API Integration
- OAuth 2.0 with Gmail scope (`gmail.readonly`)
- Fetch recent emails (last 7 days)
- Filter by job-related senders/keywords
- Mark processed emails to avoid duplicates

#### 2. Email Parser Service
- Extract sender, subject, body
- Identify email type (confirmation, interview, rejection, offer)
- Extract company name from email
- Extract key dates (interview times, deadlines)
- Calculate confidence score for matches

#### 3. Pattern Matching Engine
- Regex patterns for common email types:
  - "Thank you for applying"
  - "We'd like to schedule an interview"
  - "Unfortunately, we've decided to move forward with other candidates"
  - "Congratulations! We'd like to extend an offer"
- Company name extraction from email domains and signatures
- Job title extraction from subject lines

#### 4. Application Matcher
- Match email to existing applications by:
  - Company name (fuzzy matching)
  - Job title (if available)
  - Time proximity (recent applications prioritized)
- Handle multiple applications at same company

#### 5. Status Updater
- Email Type → Status Mapping:
  - Application Received → `applied`
  - Assessment/Test Invited → `assessment`
  - Interview Scheduled → `interview`
  - Offer Extended → `offer`
  - Rejection → `rejected`
- Create email_event records
- Create stage_history records

#### 6. Background Sync Job
- Run every 15 minutes (or configurable)
- Check for new emails since last sync
- Process in batches
- Error handling and retry logic

---

## 🗂️ Database Changes

Already have these tables (designed for email integration):
- ✅ `email_events` - Store all job-related emails
- ✅ `stage_history` - Track status changes with trigger type

No new migrations needed! Schema is ready. 🎉

---

## 📝 Implementation Plan

### Sprint 2.1: Gmail API Setup (1-2 days)

**Tasks:**
1. Set up Google Cloud OAuth for Gmail
2. Add Gmail scope to NextAuth
3. Store refresh token in database
4. Create Gmail API client wrapper
5. Test fetching emails

**Files to Create:**
- `webapp/lib/gmail/client.ts` - Gmail API wrapper
- `webapp/lib/gmail/types.ts` - Email type definitions
- `webapp/app/api/auth/gmail/route.ts` - Gmail OAuth handler

**Environment Variables:**
```env
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
```

---

### Sprint 2.2: Email Parser (1-2 days)

**Tasks:**
1. Build email type classifier
2. Create pattern matching rules
3. Extract company names
4. Extract dates and times
5. Calculate confidence scores
6. Write tests for parser

**Files to Create:**
- `webapp/lib/email-parser/classifier.ts` - Classify email type
- `webapp/lib/email-parser/patterns.ts` - Regex patterns
- `webapp/lib/email-parser/extractor.ts` - Extract data
- `webapp/lib/email-parser/matcher.ts` - Match to applications

**Email Types to Detect:**
```typescript
enum EmailType {
  APPLICATION_RECEIVED = 'application_received',
  ASSESSMENT_INVITATION = 'assessment_invitation',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_REMINDER = 'interview_reminder',
  OFFER_EXTENDED = 'offer_extended',
  REJECTION = 'rejection',
  GENERAL = 'general',
}
```

---

### Sprint 2.3: Status Update Logic (1 day)

**Tasks:**
1. Build application matcher (fuzzy search by company)
2. Implement status update service
3. Create email_events records
4. Update stage_history with 'email' trigger
5. Handle edge cases (multiple matches, no matches)

**Files to Create:**
- `webapp/lib/services/email-processor.ts` - Main processing logic
- `webapp/lib/services/application-matcher.ts` - Match emails to apps

**Status Update Rules:**
```typescript
const EMAIL_TYPE_TO_STATUS: Record<EmailType, ApplicationStatus> = {
  APPLICATION_RECEIVED: 'applied',
  ASSESSMENT_INVITATION: 'assessment',
  INTERVIEW_SCHEDULED: 'interview',
  INTERVIEW_REMINDER: 'interview', // Don't change status
  OFFER_EXTENDED: 'offer',
  REJECTION: 'rejected',
  GENERAL: null, // Don't change status
};
```

---

### Sprint 2.4: Background Sync (1 day)

**Tasks:**
1. Create API endpoint for manual sync
2. Implement incremental sync (only new emails)
3. Store last sync timestamp
4. Add cron job / scheduled task (using Vercel Cron or similar)
5. Error handling and logging

**Files to Create:**
- `webapp/app/api/email/sync/route.ts` - Sync endpoint
- `webapp/lib/services/email-sync.ts` - Sync logic

**API Endpoints:**
```
POST /api/email/sync           - Manually trigger sync
GET  /api/email/sync/status    - Get last sync time
GET  /api/email/events         - List email events
```

---

### Sprint 2.5: UI Updates (1 day)

**Tasks:**
1. Add "Sync Emails" button to applications page
2. Show last sync time
3. Display email events on application cards
4. Show "Updated by email" indicator
5. Add settings page for email sync preferences

**Files to Create/Update:**
- `webapp/components/email/sync-button.tsx`
- `webapp/components/email/email-events-list.tsx`
- `webapp/app/applications/settings/page.tsx`

---

## 🔐 Gmail OAuth Setup

### Scopes Needed:
```
https://www.googleapis.com/auth/gmail.readonly
```

### OAuth Flow:
1. User clicks "Connect Gmail"
2. Google OAuth consent screen
3. User grants Gmail read permission
4. Store refresh token in database
5. Use refresh token for background syncs

---

## 🧪 Testing Strategy

### Unit Tests:
- Email classifier accuracy
- Pattern matching
- Company name extraction
- Date parsing

### Integration Tests:
- Gmail API connection
- End-to-end email processing
- Status updates
- Email event creation

### Manual Testing:
- Send test emails to yourself
- Verify they're detected
- Check status updates
- Verify email events stored

---

## 📊 Success Metrics

Phase 2 is complete when:
- ✅ User can connect Gmail account
- ✅ System fetches job-related emails
- ✅ Emails are classified correctly (>80% accuracy)
- ✅ Application statuses update automatically
- ✅ Email events are stored and visible
- ✅ Background sync runs every 15 minutes
- ✅ User can manually trigger sync

---

## 🚀 Getting Started

**Estimated Time:** 5-7 days (1 week)

**Priority Order:**
1. Gmail API Setup (most critical)
2. Email Parser (core functionality)
3. Status Update Logic (value delivery)
4. Background Sync (automation)
5. UI Updates (polish)

---

## 🎯 Phase 2 Deliverables

By the end of Phase 2, users can:
1. ✅ Connect their Gmail account
2. ✅ See job emails automatically detected
3. ✅ Watch application statuses update in real-time
4. ✅ View email history for each application
5. ✅ Manually trigger email sync
6. ✅ Know when last sync happened

---

**Ready to start with Sprint 2.1: Gmail API Setup?**

This is the foundation - once Gmail is connected, everything else flows naturally! 🚀
