# MailAware Job Tracker (MJT) - Product Requirements Document

## Executive Summary

**What:** Privacy-first job application tracker with browser extension and web app
**For whom:** Students and early-career job seekers applying to 20+ roles
**Core value:** One-click job capture + automated email-to-status updates + calendar-first reminders
**Differentiator:** Transparent email scanning with visible access logs and narrow permissions

**MVP Timeline:** 4-6 weeks for functional prototype
**Key Technical Challenges:** Email parsing accuracy, cross-site job scraping, real-time sync

---

## Table of Contents

### Strategy & Vision
- [Product Concept](#product-concept-what-it-is)
- [Target Users & Problems](#target-users--problems-why-it-exists)
- [Product Pillars](#product-pillars-guiding-principles)
- [Scope Overview](#scope-overview-two-components)

### Technical Specifications
- [Technical Architecture](#technical-architecture-high-level)
- [Data Models](#data-models-core-entities)
- [API Endpoints](#api-endpoints-restful-design)
- [Application State Machine](#application-state-machine)

### Features & Implementation
- [MVP Feature List](#mvp-feature-list-foundation--acceptance-criteria)
- [User Stories](#user-stories-mvp)
- [Implementation Priorities & Phasing](#implementation-priorities--phasing)

### Design & UX
- [UX/UI Specifications](#uxui-specifications)
- [Onboarding & Setup](#onboarding--setup)
- [Content & Copy](#content--copy-what-the-product-must-communicate)

### Quality & Operations
- [Testing Strategy](#testing-strategy)
- [Environment Configuration](#environment-configuration)
- [Success Metrics](#success-metrics-non-technical)
- [Risks & Mitigations](#risks--mitigations-conceptual)

### Execution
- [Pre-Development Setup Checklist](#pre-development-setup-checklist)
- [Launch Checklist](#launch-checklist-mvp-release)
- [Quick Start Command Reference](#quick-start-command-reference)
- [Post-MVP Roadmap](#post-mvp-roadmap-high-level)
- [Document Summary & Next Steps](#document-summary--next-steps)

---

# Product Concept (What it is)

A personal job-search cockpit for students and early-career applicants. It captures any job listing in one click, turns messy emails into clear status updates, and keeps you on track with dates, reminders, and a morning focus digest—**without creepy permissions**.

**Working name:** MailAware Job Tracker (MJT)

---

# Target Users & Problems (Why it exists)

**Who:** Students, interns, and recent grads applying across LinkedIn, company career pages, and job boards.
**Core pains today:**

* Manually copying details from many sites; losing track of where/when to follow up.
* Important emails (“assessment,” “interview”) buried in inboxes → missed deadlines.
* No single place that shows pipeline stage and **what to do next**.
* Anxiety about tools reading mail or saving data without transparency.

**JTBD (Jobs to be Done):**

* “When I spot a role, I want to **save it fast** with the right details.”
* “When an email arrives, I want my board to **update itself** and **tell me the next step**.”
* “I want to **see which sources** lead to interviews/offers and **plan my week** accordingly.”

---

# Product Pillars (Guiding Principles)

1. **Capture anywhere, quickly:** One click from any job page, minimal edits.
2. **Calendar-first clarity:** Every card carries a next-action and a date; you always know what’s due.
3. **Email-aware automation:** Key emails trigger stage changes and reminders automatically.
4. **Trust & transparency:** Narrow permissions, a visible **Access Log**, and easy revoke/delete.
5. **Lightweight & focused:** Only the features that directly reduce misses and improve outcomes.

---

# Scope Overview (Two Components)

## A) Browser Extension — “Save Job”

* **One-click capture** from LinkedIn, company ATS pages, and job boards.
* A **confirm panel** appears with parsed fields (title, company, location, apply link, salary if present, deadline, and a preview of the description). User can tweak before saving.
* **Duplicate prevention:** If the same role appears on different sites, it consolidates into one application.
* Works even with weak pages: last-resort manual mapping (highlight a title or deadline → assign to field).

**Job Page Parsing Strategy (Priority Order):**

1. **LinkedIn** (Schema.org + DOM selectors)
   - Title: `h1` with class containing "job-title" OR schema.org `JobPosting.title`
   - Company: `a[data-tracking-control-name*="company"]` OR schema.org `hiringOrganization`
   - Location: Element with "location" in class/data attribute
   - Apply URL: Current page URL OR "Easy Apply" button href
   - Description: `.description__text` or similar container

2. **Indeed** (Meta tags + DOM)
   - Meta tags: `og:title`, `og:description`
   - Company: `.jobsearch-InlineCompanyRating` or similar
   - Salary: Look for currency symbols + numbers in specific containers

3. **Company ATS Pages** (Greenhouse, Lever, Workday, etc.)
   - Greenhouse: Specific DOM IDs/classes (`.app-title`, `.company-name`)
   - Lever: `[data-qa="posting-name"]` patterns
   - Workday: Complex iframe structure - extract from URL params
   - Generic fallback: Look for `<h1>` near top, company in header/nav

4. **Generic Fallback** (Heuristic-based)
   - Largest `<h1>` on page likely = job title
   - Look for "company", "location" nearby in smaller headings
   - Extract apply URL from prominent CTA button
   - Use highlighted text if user manually selects

**Duplicate Detection Algorithm:**
- Hash: `company_name.toLowerCase() + "_" + job_title.toLowerCase().replace(/[^a-z0-9]/g, "")`
- Fuzzy match: If 85%+ similarity on title + company, flag as potential duplicate
- Show user: "This looks similar to [existing job]. Merge or save as new?"

## B) Web App — "Track & Update"

* **Simple list view** with all applications in a clean table/card layout. Each row shows: Company, Title, Location, Status badge, Last Updated, Quick Actions.
* **Status management:** Status dropdown on each row (Saved → Applied → Assessment → Interview → Offer → Accepted/Rejected). Changes automatically via email parsing or manually via dropdown.
* **Expandable detail view:** Click any row to expand inline panel showing contacts, notes, attachments, timeline, and next action.
* **Left sidebar navigation:** Applications (main), Calendar (optional), Settings.
* **Email connection (read-only):** When messages like "Thanks for applying" or "Interview scheduled" arrive, the app **updates the status** and **creates reminders**.
* **Calendar page (optional):** Simple weekly view showing interviews and deadlines if time permits.
* **Privacy Center:** An **Access Log** listing which emails were analyzed and what changed; quick export/delete controls.

**Design Philosophy:** Maximum simplicity. Backend structured so adding Kanban board view later is just a different UI component using the same data (like GitHub's table/board toggle).

---

# Technical Architecture (High-Level)

## System Components

### 1. Browser Extension (Chrome/Firefox)
* **Tech Stack:** Manifest V3, React for popup UI, Content scripts for page parsing
* **Storage:** IndexedDB for local cache (sync with server on connection)
* **Parsing Engine:** DOM selectors + fallback heuristics for job pages
* **API Communication:** RESTful calls to backend, JWT auth tokens

### 2. Web Application
* **Frontend:** React + TypeScript, TailwindCSS, shadcn/ui components
* **State Management:** React Query for server state, Zustand for local UI state
* **Routing:** React Router with protected routes
* **Real-time Updates:** WebSocket connection for email-triggered updates

### 3. Backend API
* **Framework:** Node.js + Express (or Next.js API routes for unified deployment)
* **Database:** PostgreSQL for relational data (applications, users, contacts)
* **Auth:** NextAuth.js or Auth0 (OAuth 2.0 for Google/Microsoft email access)
* **Email Processing:** Background worker with job queue (Bull/BullMQ)
* **Calendar Integration:** Google Calendar API, Outlook Calendar API

### 4. Email Processing Service
* **Access Method:** OAuth 2.0 read-only scopes (Gmail API, Microsoft Graph)
* **Processing:** Webhook listeners + periodic polling (every 5-15 minutes)
* **ML/Pattern Matching:** Keyword-based regex initially, can upgrade to lightweight NLP
* **Audit Trail:** Every email analysis logged with timestamp and decision rationale

## Data Flow

1. **Job Capture:** Extension → Validation → API → Database → WebSocket → Web App
2. **Email Update:** Email Provider → Webhook/Poll → Worker → Pattern Match → Update DB → WebSocket → Web App → Create Reminder
3. **Morning Digest:** Cron job (6 AM user timezone) → Query due actions → Email service → User inbox

## Security & Privacy

* **Encryption:** All data at rest encrypted, TLS for transit
* **Permissions:** Minimal OAuth scopes (read-only for email, calendar write for events)
* **Data Retention:** User-controlled; email metadata stored max 90 days unless explicitly saved
* **Audit Log:** Every email read/analyzed logged with purpose and outcome
* **Right to Delete:** One-click data export (JSON/CSV) and account deletion

## Third-Party Dependencies

* **Email:** Gmail API, Microsoft Graph API (read-only)
* **Calendar:** Google Calendar API, Outlook Calendar API
* **Storage:** PostgreSQL (Supabase or Railway for hosting)
* **File Storage:** S3-compatible (for resume/cover letter attachments)
* **Deployment:** Vercel/Netlify (frontend), Railway/Render (backend)
* **Monitoring:** Sentry for errors, Posthog/Mixpanel for analytics

---

# Data Models (Core Entities)

## Application
* ID, user_id, job_title, company_name, location, salary_range, apply_url, description_preview
* current_stage (enum), source (LinkedIn/Indeed/Company), created_at, updated_at
* deadline_date, next_action_text, next_action_date
* is_duplicate (link to canonical application_id if consolidated)

## Stage History
* ID, application_id, from_stage, to_stage, trigger (manual/email/reminder), timestamp
* email_reference (if triggered by email)

## Email Event
* ID, application_id, email_subject, email_from, email_date, detected_action, confidence_score
* raw_snippet (for audit), user_confirmed (null/true/false)

## Contact
* ID, application_id, name, role, email, phone, notes, source (recruiter/hiring_manager)

## Attachment
* ID, application_id, file_type (resume/cover_letter/assessment), file_url, version_number, uploaded_at

## Reminder
* ID, application_id, reminder_type (follow_up/thank_you/deadline), due_date, is_completed, created_by (auto/manual)

## User Settings
* user_id, email_connected, calendar_connected, timezone, digest_time (default 6 AM), notification_preferences

---

# API Endpoints (RESTful Design)

## Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/oauth/google` - Google OAuth callback
- `POST /api/auth/logout` - Invalidate session
- `GET /api/auth/me` - Get current user

## Applications
- `GET /api/applications` - List all (with filters: stage, source, date range)
- `POST /api/applications` - Create new (from extension or manual)
- `GET /api/applications/:id` - Get single application with full details
- `PATCH /api/applications/:id` - Update fields (stage, notes, next_action)
- `DELETE /api/applications/:id` - Soft delete
- `POST /api/applications/:id/move` - Change stage (validates state machine)
- `GET /api/applications/:id/history` - Stage change timeline

## Contacts
- `POST /api/applications/:id/contacts` - Add contact
- `PATCH /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Remove contact

## Attachments
- `POST /api/applications/:id/attachments` - Upload file (multipart)
- `GET /api/attachments/:id` - Download file (signed URL)
- `DELETE /api/attachments/:id` - Delete file

## Email Integration
- `POST /api/email/connect` - Initiate OAuth flow
- `POST /api/email/disconnect` - Revoke access
- `GET /api/email/status` - Check connection status
- `GET /api/email/events` - List email-triggered events (for Access Log)
- `POST /api/email/events/:id/confirm` - User confirms email detection
- `POST /api/email/events/:id/undo` - Undo stage change

## Calendar Integration
- `POST /api/calendar/connect` - Initiate OAuth flow
- `POST /api/calendar/disconnect` - Revoke access
- `POST /api/calendar/add-event` - Create calendar event from interview
- `GET /api/calendar/events` - List upcoming events

## Reminders
- `GET /api/reminders` - List all due reminders
- `POST /api/reminders` - Create manual reminder
- `PATCH /api/reminders/:id/complete` - Mark done
- `DELETE /api/reminders/:id` - Delete reminder

## Insights
- `GET /api/insights/funnel` - Conversion rates by stage
- `GET /api/insights/sources` - Effectiveness by source (LinkedIn/Indeed)
- `GET /api/insights/timeline` - Activity over time

## User Settings
- `GET /api/settings` - Get all user preferences
- `PATCH /api/settings` - Update (timezone, digest_time, notifications)
- `POST /api/settings/export` - Generate data export (CSV/JSON)
- `DELETE /api/settings/account` - Delete account and all data

## Internal/Worker
- `POST /api/webhooks/email` - Gmail/Outlook webhook listener
- `POST /api/worker/email-poll` - Trigger email polling job
- `POST /api/worker/digest-send` - Trigger morning digest job

---

# Application State Machine

**Valid Transitions:**
```
Saved → Applied
Applied → Assessment (OA)
Applied → Interview
Applied → Rejected
Assessment → Interview
Assessment → Rejected
Interview → Offer
Interview → Rejected
Offer → Accepted
Offer → Rejected
Any → Saved (user can reset)
```

**Trigger Rules:**
* Manual: User drag-and-drop or button click
* Email: Pattern match confidence > 75% → auto-update; 50-75% → suggest; <50% → ignore
* Reminder: Create follow-up reminder 5 days after "Applied" if no stage change

---

# MVP Feature List (Foundation & Acceptance Criteria)

### 1) Save Job (Extension)

* **Must be able to:** Save key fields (title, company, location, apply URL, description preview, optional salary, optional deadline) from **any job page** in ≤ 10 seconds.
* **User sees:** A confirmation panel to edit fields before saving.
* **Success:** 90%+ of common listings need zero or one tweak before saving.

### 2) Organize Applications (Web)

* **Must be able to:** View all applications in a list, filter/sort, change status via dropdown, and expand details inline.
* **User sees:** Clean table with all applications, status badges, search/filter. Click row to expand details with notes, contacts, attachments, and **Next Action** field.
* **Success:** Users can find an application, change its status, and add notes in ≤ 5 seconds. No drag-and-drop complexity.

### 3) Email-Aware Updates

* **Must be able to:** Detect common patterns (e.g., "We received your application," "Assessment," "Interview," "Offer") and **update the stage** automatically.
* **User sees:** A timeline event (what was detected), plus an optional toast prompting "Add to calendar" if applicable.
* **Success:** Most obvious events are correctly recognized; low false positives; users can undo.

**Email Detection Patterns (Implementation Guide):**

| Stage Transition | Keywords/Patterns | Confidence Factors | Auto-Action |
|-----------------|-------------------|-------------------|-------------|
| Saved → Applied | "received your application", "application submitted", "thank you for applying" | From: noreply/careers @company domain | Auto-update + 5-day follow-up reminder |
| Applied → Assessment | "online assessment", "coding challenge", "take-home", "complete the test" | Contains link/deadline | Auto-update + deadline reminder - 1 day |
| Applied/Assessment → Interview | "interview", "phone screen", "video call", "meet with", date/time present | Calendar invite attached OR time mentioned | Auto-update + suggest calendar event + prep reminder - 1 day |
| Interview → Offer | "pleased to offer", "offer letter", "compensation package", "congratulations" | From recruiter/HR | Auto-update + deadline reminder (accept by date) |
| Any → Rejected | "unfortunately", "not moving forward", "decided to pursue", "chosen another candidate" | High confidence phrases | Auto-update (no reminder) |

**Parsing Strategy:**
1. **Email Filtering:** Only process emails with job-related keywords in subject or from career domains
2. **Company Matching:** Extract company name from sender domain or email signature; match to existing applications
3. **Ambiguity Handling:** If multiple applications match, prompt user to select which one
4. **False Positive Prevention:** Never auto-reject without explicit phrases; never auto-accept offers
5. **User Feedback Loop:** "Was this correct?" prompt to improve pattern matching over time

### 4) Reminders & Calendar

* **Must be able to:** Auto-create reminders after key events (e.g., follow-up 5 days after “Applied,” thank-you the day after “Interview”).
* **User sees:** Due items in a **Calendar view** and receives a **Morning Digest** with the top three actions.
* **Success:** Users report fewer misses and a clear, short daily plan.

### 5) Insights (What’s Working)

* **Must be able to:** Show funnel conversion (Saved → Applied → Interview → Offer) and **source effectiveness** (e.g., LinkedIn vs company sites).
* **User sees:** Simple charts and counts, not a complex BI tool.
* **Success:** Users can answer “Which source is best for me?” in under a minute.

### 6) Privacy & Control

* **Must be able to:** Display an **Access Log** (what was read, when, and why), allow one-click disconnect of email, and export/delete data on demand.
* **User sees:** A clear privacy page in Settings.
* **Success:** Users feel safe connecting email; churn from privacy concerns is minimal.

---

# User Stories (MVP)

1. **Capture:**
   "As a student scanning LinkedIn, I click the extension icon. I see the job details pre-filled. I confirm and save. Done in 5 seconds."

2. **Organize & Update:**
   "I open the web app and see all my applications in a clean list. I click the status dropdown on one and change it from 'Saved' to 'Applied'. I expand the row and add a note."

3. **Email triggers:**
   "I receive 'We received your application' email. When I check the app, the status automatically updated to 'Applied' and there's a follow-up reminder in 5 days."

4. **Interview tracking:**
   "An 'Interview confirmed' email arrives. The app updates the status to 'Interview' and shows a button to add it to my Google Calendar. I click and it's added."

5. **Morning plan:**
   "Each morning I get a short email: 'Review ACME OA today, prepare for ACME interview tomorrow, follow up with Zephyr by Friday.'"

6. **Clarity & trust:**
   "I check the Access Log to see which emails were scanned and what changed. If I disconnect email, the system stops scanning and leaves my data intact."

---

# Onboarding & Setup

1. **Create account** → short tour.
2. **Install extension** → “Try saving your first job now.”
3. **Connect email (optional but recommended)** → show **scope explanation** and example of what will be detected.
4. **Connect calendar (optional)** → preview of an interview entry.
5. **Import from CSV/Notion (optional)** → basic mapper for title/company/status.

---

# UX/UI Specifications

## Screen Layouts & Key Interactions

### 1. Applications List (Main Dashboard)
**Layout:** Clean table/card list with left sidebar

**Left Sidebar (200px fixed):**
- Logo at top
- **Applications** (active/bold)
- **Calendar** (if implemented)
- Divider line
- **Settings** (bottom, with gear icon)

**Main Content Area:**
- **Header bar:** 
  - Search box (filter by company/title)
  - Filter dropdown: All | Saved | Applied | Interview | Offer | Rejected
  - Sort dropdown: Recent | Company | Status
- **Applications list/table:**
  - Each row: Company favicon/logo | Job Title | Company Name | Location | Status Badge | Last Updated | "..." menu
  - Status badge: Color-coded pill (gray=Saved, blue=Applied, yellow=Assessment, green=Interview, purple=Offer, red=Rejected)
  - Alternating row background for readability
  - Hover: Subtle highlight, show quick action buttons (Edit status, View details, Archive)
- **Empty state:** "Save your first job with the extension" + install link

**Interactions:**
- **Click row:** Expand inline detail panel below (slides down, pushes other rows)
- **Status dropdown:** Click badge → dropdown appears → select new status → auto-saves
- **"..." menu:** Archive, Delete (with confirmation)
- **No drag-and-drop** (simplified for MVP speed)

### 2. Application Detail Panel (Inline Expansion)
**Layout:** Expands below clicked row, full width of main content area

**Two-column layout within expansion:**

**Left column (60%):**
- **Overview card:**
  - Full job title (no truncation)
  - Company name + logo
  - Location | Salary (if present)
  - Apply URL (opens in new tab)
  - Description (expandable, first 300 chars visible)
- **Notes section:** Simple textarea, auto-saves on blur
- **Timeline:** Compact vertical list of events (status changes, emails detected, reminders)

**Right column (40%):**
- **Status changer:** Dropdown to manually change status
- **Next Action:** Text input + date picker, "Add to calendar" button
- **Contacts:** Mini list (+ Add contact button)
  - Each: Name, Role, Email (click to copy)
- **Attachments:** File upload area (drag or click)
  - Shows: filename, type, upload date
- **Quick Actions:** Archive | Delete buttons

**Interactions:**
- Click anywhere outside expansion OR click row again → Collapse
- All fields auto-save on change (no "Save" button needed)
- Collapse animation (smooth slide up)

### 3. Calendar View (Optional - Phase 3)
**Layout:** Simple weekly calendar - only build if time permits

**Minimal Components:**
- **Week navigation:** Previous/Next week, "Today" button
- **Events:** Interview blocks with company name + time
- **List view fallback:** If calendar is complex, just show upcoming events as a sorted list

**Note:** Can defer to post-MVP if needed. Core value is in tracking + email automation, not calendar visualization.

### 4. Insights Dashboard (Optional - Phase 4)
**Layout:** Simple stats cards - defer charts to post-MVP

**MVP Version (just numbers, no charts):**
- **Total Applications:** 47
- **By Status:** Saved (12) | Applied (20) | Interview (8) | Offer (2) | Rejected (5)
- **By Source:** LinkedIn (30) | Indeed (12) | Company Sites (5)
- **This Week:** 8 new applications, 3 status changes

**Post-MVP:** Add visual charts if users request them

**Actions:**
- Click status count → Filter main list to that status
- Export all data to CSV button

### 5. Settings / Privacy Center
**Layout:** Left sidebar nav + content area

**Sections:**
- **Profile:** Name, email, timezone, digest time
- **Email Connection:** 
  - Status badge (Connected/Disconnected)
  - "Connect Gmail" / "Connect Outlook" buttons
  - Last sync time
  - "Disconnect" button (with warning modal)
- **Calendar Connection:** Similar to email
- **Access Log:** 
  - Table: Date | Email Subject | Company | Action Taken | Confidence
  - Search and filter
  - Export log button
- **Notifications:** Toggle for digest, stage updates, reminders
- **Data & Privacy:**
  - Export data (JSON/CSV)
  - Delete account (with password confirmation)

### 6. Browser Extension Popup
**Layout:** 320px width, 480px height popup

**States:**

**A) Not Logged In:**
- Logo + tagline
- "Log in" button (opens web app in new tab)
- "Sign up" button

**B) Job Detected:**
- Parsed fields in form (editable):
  - Job title (input)
  - Company (input)
  - Location (input)
  - Salary (optional input)
  - Deadline (date picker)
  - Apply URL (auto-filled, read-only)
- Description preview (first 200 chars, expandable)
- Duplicate warning (if detected): "Similar to [job]. Merge or save as new?"
- "Save Job" button (primary, green)
- "Cancel" button

**C) Saved Successfully:**
- Success animation (checkmark)
- "View in Dashboard" link
- "Save Another" button
- Recent jobs list (last 3 saved)

**D) Manual Entry Mode (fallback):**
- All fields as empty inputs
- "Tip: Highlight text on the page, then click the field to paste"
- Highlight-to-field buttons for quick mapping

### 7. Onboarding Flow (Web App)
**Step 1: Welcome**
- Hero message: "Never miss a job opportunity again"
- "Get Started" CTA

**Step 2: Install Extension**
- Browser detection → Show Chrome/Firefox badge link
- "Skip for now" option (can install later)
- "Continue" button (disabled until extension detected OR skipped)

**Step 3: Connect Email (Optional)**
- Explanation: "We'll auto-update your applications when you get emails"
- Privacy promise: Read-only access, see what we scan
- "Connect Gmail" / "Connect Outlook" buttons
- "Skip" option (can connect later)

**Step 4: Try Saving a Job**
- Embedded video or GIF showing extension usage
- "Open LinkedIn Jobs" button (new tab)
- "I've saved my first job" button → Detect in DB, then proceed

**Step 5: You're Ready!**
- Celebration animation
- "View Your Pipeline" CTA

## Design System

### Colors (Suggested)
- **Primary:** #2563EB (Blue - trust, professionalism)
- **Success:** #10B981 (Green - positive actions)
- **Warning:** #F59E0B (Orange - deadlines)
- **Error:** #EF4444 (Red - rejections, critical)
- **Neutral:** Gray scale (#F9FAFB to #111827)

### Typography
- **Headings:** Inter or Geist (modern, clean)
- **Body:** System font stack for performance
- **Code/Monospace:** JetBrains Mono (for technical info)

### Components (shadcn/ui compatible)
- **Buttons:** Rounded corners (8px), clear hover states
- **Cards:** Subtle shadow, white background, 12px border radius
- **Inputs:** Bordered, focus ring, inline error messages
- **Modals:** Backdrop blur, slide-in animation, ESC to close
- **Toasts:** Top-right corner, auto-dismiss 5s, stacking

### Responsive Breakpoints
- **Mobile:** < 640px (stacked layout, bottom nav)
- **Tablet:** 640px - 1024px (2-column pipeline)
- **Desktop:** > 1024px (full multi-column pipeline)

### Accessibility
- **Keyboard navigation:** Tab order, Enter/Space for actions, ESC to close
- **ARIA labels:** All interactive elements labeled
- **Color contrast:** WCAG AA minimum (4.5:1 for text)
- **Screen reader:** Announce stage changes, form validation errors

---

# Content & Copy (What the product must communicate)

* **Primary CTA:** “Save Jobs Faster. Never Miss a Step.”
* **Privacy promise:** “Read-only mail access. See exactly what we scanned. Revoke anytime.”
* **Empty states:** Friendly, action-oriented tips (e.g., “Save your first 5 jobs—see your funnel come to life”).
* **Digest tone:** Short, encouraging, and specific (“Prep 3 questions for ACME phone screen tomorrow 10:30”).

---

# Success Metrics (Non-technical)

* **Activation:** 70% of new users save at least 3 jobs in week one.
* **Engagement:** ≥ 2 automatic status updates per user in week one after connecting email.
* **Outcome proxy:** 30% of active users schedule at least one interview event within 30 days.
* **Satisfaction:** NPS ≥ 45; “trust/permissions” complaint rate < 5% of support tickets.
* **Conversion:** Free → Pro ≥ 12% among weekly active users.

---

# Non-Goals (MVP)

* Autofilling long application forms.
* AI coaching/cover letters beyond small templates.
* Team/campus dashboards.
* Mobile apps (use mobile web + share sheet later).

---

# Pricing (Launch Positioning)

## Pricing Tiers & Feature Matrix

| Feature | Free | Pro | Student Annual |
|---------|------|-----|----------------|
| **Price** | €0 | €7.99/mo | €36/year (€3/mo) |
| Applications tracked | 30 max | Unlimited | Unlimited |
| Pipeline board | ✅ | ✅ | ✅ |
| Manual stage updates | ✅ | ✅ | ✅ |
| Notes & contacts | ✅ | ✅ | ✅ |
| Browser extension | ✅ | ✅ | ✅ |
| CSV export | ✅ | ✅ | ✅ |
| **Email automation** | ❌ | ✅ | ✅ |
| **Calendar sync** | ❌ | ✅ | ✅ |
| **Automated reminders** | 5/month | Unlimited | Unlimited |
| **Morning digest** | ❌ | ✅ | ✅ |
| **Attachments** | 3 max | Unlimited | Unlimited |
| **Insights dashboard** | Basic | Advanced | Advanced |
| **Access log** | Last 7 days | Unlimited history | Unlimited history |
| Resume version tracking | ❌ | ✅ | ✅ |
| Priority support | ❌ | ✅ | ✅ |

## Monetization Strategy

**Free Tier (Acquisition):**
- Purpose: Let users experience core value (capture + organize) to build habit
- Limit: 30 applications is enough for ~2-3 months of active search
- Conversion trigger: When hitting limit or wanting automation (email/calendar)

**Pro Tier (Main Revenue):**
- Target: Serious job seekers applying to 50+ roles over 4-6 months
- Value prop: Save 2+ hours/week on manual updates and tracking
- Price anchor: Competing tools charge €15-30/mo; we're 50% cheaper
- LTV estimate: €48 (6 months average job search × €7.99)

**Student Annual (Market Expansion):**
- Target: College students and recent grads (price-sensitive, longer search cycles)
- Verification: .edu email or university ID upload
- Retention play: Lock in for full academic year
- Upsell: Convert to Pro after graduation

## Revenue Projections (Conservative)

**Month 3:** 500 signups → 50 Pro (10% conversion) = €400/mo
**Month 6:** 2,000 signups → 240 Pro (12% conversion) = €1,900/mo
**Month 12:** 5,000 signups → 750 Pro (15% conversion) = €6,000/mo

**Cost structure:**
- Infrastructure: €200-400/mo (DB, hosting, storage)
- Email services: €50/mo (SendGrid/Resend)
- APIs: €100/mo (Google/Microsoft quotas)
- **Break-even:** ~100 Pro users (achievable by month 4-5)

## Future Pricing Opportunities (Post-MVP)
- **Add-ons:** AI cover letter generator (€2/mo), Application form autofill (€3/mo)
- **Campus Plan:** €99/year for career centers (coach dashboard for 50 students)
- **Lifetime Deal:** €199 one-time (limited early adopter offer)

---

# Risks & Mitigations (Conceptual)

* **Privacy sensitivity:** Provide an **Access Log**, plain-language scope descriptions, and easy disconnect.
* **Capture inconsistency:** Offer a manual confirm panel and “highlight-to-field” fallback; keep scope focused on the most common sites first.
* **Email misclassification:** Start with conservative patterns, show “Needs review” when uncertain, and allow quick undo/edit.

---

# Implementation Priorities & Phasing

## Phase 1: Foundation (Week 1-2)
**Goal:** Basic capture and list view without email integration

**Deliverables:**
- [ ] User authentication (email/password or Google OAuth)
- [ ] PostgreSQL database schema + migrations (status as enum field)
- [ ] REST API: CRUD for applications (GET, POST, PATCH, DELETE)
- [ ] Web app: Simple list view with filter/sort/search
- [ ] Web app: Inline expansion detail panel (notes, contacts, next action)
- [ ] Web app: Status dropdown for manual changes
- [ ] Browser extension: Basic capture for LinkedIn + Indeed
- [ ] Extension: Confirmation panel with manual field editing

**Success Criteria:**
- User can save 5 jobs from LinkedIn/Indeed
- User can view all applications in clean list
- User can change status via dropdown and add notes in < 5 seconds
- Inline detail expansion works smoothly

**Simplified vs Original:** No drag-and-drop complexity = saves 2-3 days development time

## Phase 2: Email Intelligence (Week 3-4)
**Goal:** Automated status updates from email

**Deliverables:**
- [ ] OAuth integration for Gmail/Outlook (read-only scopes)
- [ ] Email polling service (every 15 min) with webhook fallback
- [ ] Pattern matching engine (regex-based) for 5 common events
- [ ] Auto-update application stage with confidence scoring
- [ ] Email event timeline on application detail page
- [ ] Undo/confirm functionality for email-triggered updates
- [ ] Privacy: Access Log page showing what was scanned

**Success Criteria:**
- 80%+ accuracy on "application received" detection
- 70%+ accuracy on "interview scheduled" detection
- Zero false positives on rejections
- Users can view all email scanning activity

## Phase 3: Reminders & Calendar (Week 4-5)
**Goal:** Proactive nudges and optional calendar integration

**Deliverables:**
- [ ] Auto-reminder creation rules (follow-up, prep, thank-you)
- [ ] Calendar API integration (Google/Outlook) - OAuth only
- [ ] One-click "Add to calendar" for interviews (API call, not UI)
- [ ] Morning digest email (cron job at user's 6 AM)
- [ ] Email notification service (SendGrid/Resend)
- [ ] **Calendar view in web app** - DEFER to Phase 4 if time-constrained (just show reminders list instead)

**Success Criteria:**
- User receives morning digest with top 3 actions
- Interview events can be added to Google/Outlook calendar via button
- Follow-up reminders trigger 5 days after "Applied"
- Calendar UI is optional - core value is reminder creation, not visualization

## Phase 4: Polish & Optional Features (Week 5-6)
**Goal:** Production-ready UX and nice-to-haves

**Deliverables:**
- [ ] Basic stats dashboard (just numbers, no charts - defer charts to post-MVP)
- [ ] CSV import functionality (basic mapper)
- [ ] Attachment upload (resume/cover letter versions)
- [ ] Onboarding tour (simple 3-step walkthrough)
- [ ] Error handling and loading states throughout app
- [ ] Mobile-responsive UI (prioritize list view on mobile)
- [ ] Rate limiting and security hardening
- [ ] Sentry error monitoring
- [ ] Calendar view page (if time permits, otherwise defer)

**Success Criteria:**
- User can see basic stats (total apps, by status, by source)
- User can import existing applications from CSV
- App works smoothly on mobile browsers
- No critical bugs; error rates < 1%

**Deprioritized for Speed:**
- Complex charts (can add post-MVP if requested)
- Calendar visualization (just use external calendar + reminders list)
- Advanced filtering/sorting (basic is fine for MVP)

## Deprioritized for Post-MVP
- Mobile native apps (use responsive web)
- AI cover letter generation (complex, low ROI initially)
- Team/campus features (need individual PMF first)
- Autofill application forms (high complexity, fragile)
- Multi-language support (target English-speaking markets first)

---

# Testing Strategy

## Unit Tests (Target: 70%+ coverage)
- Data models and validation logic
- Email pattern matching functions (test against real email samples)
- State machine transition rules
- Duplicate detection algorithm
- Date/timezone calculations for reminders

## Integration Tests
- API endpoints (authentication, CRUD operations)
- OAuth flows (Gmail/Outlook connection)
- Email processing pipeline (mock email webhook)
- Calendar event creation
- WebSocket real-time updates

## End-to-End Tests (Playwright/Cypress)
- User signup and onboarding flow
- Extension: Capture job from LinkedIn test page
- Web app: Drag card across stages
- Email simulation: Trigger status update
- Morning digest: Verify email sent with correct content
- Privacy: Export data and verify completeness

## Manual Testing Checklist (Pre-Launch)
- [ ] Test with 10 real job listings from different sites
- [ ] Connect real Gmail account, apply to 3 jobs, verify email detection
- [ ] Test all stage transitions (manual and email-triggered)
- [ ] Verify calendar events appear correctly
- [ ] Check morning digest at various timezones
- [ ] Test data export and account deletion
- [ ] Security review: Check token expiry, permission scopes
- [ ] Performance: Ensure dashboard loads < 2 seconds with 50 applications

## Error Handling & Edge Cases

### Extension Errors
- **No internet connection:** Save job locally, sync when online
- **Unparseable page:** Show manual entry form with helpful hints
- **Duplicate detection unclear:** Let user decide, don't auto-merge
- **API timeout:** Retry with exponential backoff, show user notification

### Email Processing Errors
- **OAuth token expired:** Prompt user to re-authenticate
- **Ambiguous company match:** Show disambiguation prompt
- **Low confidence pattern:** Log for review, don't auto-update
- **Rate limit hit (Gmail API):** Queue emails, process with backoff

### Calendar Sync Errors
- **Calendar API error:** Fall back to "Copy to clipboard" option
- **Timezone mismatch:** Always use user's stored timezone preference
- **Event already exists:** Skip creation, log in audit trail

### Data Integrity
- **Concurrent updates:** Use optimistic locking (version field)
- **Invalid state transitions:** Reject with clear error message
- **Orphaned reminders:** Clean up daily with cron job
- **Email without matching application:** Store in "unmatched" queue for user review

---

# Environment Configuration

## Required Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mjt_db
DATABASE_SSL=true

# Authentication
JWT_SECRET=<random-256-bit-key>
SESSION_SECRET=<random-256-bit-key>
NEXTAUTH_URL=https://app.mjtjobs.com
NEXTAUTH_SECRET=<random-key>

# OAuth - Google
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<secret>
GMAIL_API_KEY=<api-key>

# OAuth - Microsoft
MICROSOFT_CLIENT_ID=<from-azure-portal>
MICROSOFT_CLIENT_SECRET=<secret>

# Calendar APIs
GOOGLE_CALENDAR_API_KEY=<key>
OUTLOOK_CALENDAR_API_KEY=<key>

# Email Service (for digest emails)
SENDGRID_API_KEY=<key>
FROM_EMAIL=digest@mjtjobs.com

# Storage (S3-compatible)
S3_BUCKET_NAME=mjt-attachments
S3_ACCESS_KEY=<key>
S3_SECRET_KEY=<secret>
S3_REGION=us-east-1

# Redis (for job queue)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=<sentry-url>
POSTHOG_API_KEY=<key>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
ENABLE_EMAIL_WEBHOOKS=true
ENABLE_AI_SUGGESTIONS=false  # post-MVP
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.mjtjobs.com
NEXT_PUBLIC_WS_URL=wss://api.mjtjobs.com
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_POSTHOG_KEY=<key>
```

### Browser Extension (manifest.json + config)
```json
{
  "api_base_url": "https://api.mjtjobs.com",
  "supported_sites": ["linkedin.com", "indeed.com", "greenhouse.io", "lever.co"],
  "extension_id": "<chrome-web-store-id>"
}
```

## Configuration Management

- **Development:** `.env.local` files (never committed)
- **Staging:** Vercel/Railway environment variables
- **Production:** Encrypted secrets in hosting platform
- **Extension:** Config injected at build time per environment

---

# Post-MVP Roadmap (High-level)

* **Autofill assistant** (opt-in, per-site controls).
* **Smart templates** (thank-you, follow-up) auto-filled from the job card.
* **Mobile capture** (share-to-save on iOS/Android) and push reminders.
* **Campus plan** (coach view) once individual product/market fit is clear.

---

# Pre-Development Setup Checklist

## Infrastructure Setup (Day 1)
- [ ] Create GitHub repository (private initially)
- [ ] Set up project structure (monorepo with /apps/web, /apps/api, /packages/extension)
- [ ] Initialize PostgreSQL database (Supabase or Railway)
- [ ] Set up Redis instance for job queue
- [ ] Configure S3-compatible storage for attachments
- [ ] Create Google Cloud Console project for Gmail/Calendar APIs
- [ ] Create Azure portal app for Microsoft Graph API
- [ ] Register OAuth redirect URLs for local/staging/prod
- [ ] Set up SendGrid/Resend account for digest emails
- [ ] Initialize Sentry project for error tracking
- [ ] Set up Vercel/Netlify project for frontend
- [ ] Set up Railway/Render for backend API

## Development Tools
- [ ] Set up ESLint + Prettier configs
- [ ] Configure TypeScript strict mode
- [ ] Set up Husky for pre-commit hooks (lint, type-check)
- [ ] Create Docker Compose for local development (DB + Redis)
- [ ] Set up database migration tool (Prisma/Drizzle/Knex)
- [ ] Configure Jest/Vitest for unit tests
- [ ] Configure Playwright for E2E tests
- [ ] Create Postman/Thunder Client collection for API testing

## Design Assets
- [ ] Create simple logo and favicon
- [ ] Define color palette (primary, secondary, success, warning, error)
- [ ] Set up TailwindCSS config with brand colors
- [ ] Create basic component library (Button, Card, Modal, Toast)
- [ ] Design pipeline board mockup (use Excalidraw or Figma Lite)
- [ ] Design application detail page mockup
- [ ] Design extension popup mockup

## Documentation
- [ ] Create README with setup instructions
- [ ] Create CONTRIBUTING.md with development workflow
- [ ] Document API authentication flow
- [ ] Document database schema with ER diagram
- [ ] Create sample .env files for all components

---

# Launch Checklist (MVP Release)

## Week Before Launch
- [ ] Complete all Phase 1-4 deliverables
- [ ] Run full E2E test suite (zero critical failures)
- [ ] Load test with 100 concurrent users (< 2s response time)
- [ ] Security audit: Check OAuth scopes, token storage, SQL injection prevention
- [ ] Set up production monitoring (Sentry, uptime monitoring)
- [ ] Create demo video (2-3 minutes showing key flows)
- [ ] Write landing page copy and FAQ
- [ ] Set up support email (support@mjtjobs.com)
- [ ] Prepare onboarding email sequence (welcome, tips, check-in)

## Extension Publishing
- [ ] Create Chrome Web Store developer account ($5 fee)
- [ ] Prepare extension screenshots (1280x800, 640x400)
- [ ] Write extension description and feature list
- [ ] Submit for review (can take 1-3 business days)
- [ ] Create Firefox Add-ons developer account
- [ ] Submit Firefox version for review

## Day of Launch
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Run smoke tests on production URLs
- [ ] Create first 3 user accounts (founders/testers)
- [ ] Test full user journey: signup → save job → email update → calendar sync
- [ ] Post on Product Hunt (schedule for 12:01 AM PST)
- [ ] Post on /r/cscareerquestions and /r/jobs (with value, not spam)
- [ ] Share on LinkedIn, Twitter, and relevant Discord/Slack communities
- [ ] Email personal network (students, recent grads) for beta testing
- [ ] Monitor error rates and user feedback closely

## Week After Launch
- [ ] Daily check: User signups, activation rate, errors
- [ ] Respond to all user feedback within 24 hours
- [ ] Fix critical bugs immediately (< 4 hour turnaround)
- [ ] Collect testimonials from early users
- [ ] Iterate on onboarding based on drop-off data
- [ ] Plan first feature update based on feedback

---

# Quick Start Command Reference

## Development
```bash
# Clone and setup
git clone <repo-url>
cd mjt
npm install
cp .env.example .env.local

# Start services
docker-compose up -d  # DB + Redis
npm run db:migrate
npm run dev  # Starts all apps (web, api, extension dev mode)

# Testing
npm run test:unit
npm run test:e2e
npm run lint
npm run type-check
```

## Deployment
```bash
# Backend (API)
railway up  # or: git push heroku main

# Frontend (Web App)
vercel --prod  # or: git push (if auto-deploy enabled)

# Extension
npm run build:extension
# Upload dist/extension.zip to Chrome/Firefox stores
```

---

# Document Summary & Next Steps

This PRD now includes:
✅ **Executive summary** with timeline and key challenges
✅ **Technical architecture** (components, data flow, security)
✅ **Detailed data models** for all entities
✅ **Complete API specification** with 40+ endpoints
✅ **Email pattern detection table** with confidence rules
✅ **Job page parsing strategy** for LinkedIn, Indeed, ATS pages
✅ **Application state machine** with valid transitions
✅ **4-phase implementation plan** (6 weeks to MVP)
✅ **Comprehensive testing strategy** (unit, integration, E2E)
✅ **Error handling** for all major failure modes
✅ **Environment configuration** for all components
✅ **Pre-development setup** and launch checklists

**You are now ready to start implementation.**

**Recommended first steps:**
1. Review this PRD and flag any unclear areas
2. Set up infrastructure (database, OAuth apps, hosting)
3. Start Phase 1 (Week 1-2): Basic capture and pipeline board
4. Build incrementally, testing each feature before moving to the next

**Key risks to monitor during development:**
- Email pattern accuracy (test with real emails early)
- OAuth token management (handle expiry gracefully)
- Browser extension compatibility (test on multiple sites)
- Performance with 100+ applications (optimize queries)

If you need me to elaborate on any section or create specific implementation guides (e.g., "Email parsing implementation guide" or "Extension content script architecture"), let me know!
