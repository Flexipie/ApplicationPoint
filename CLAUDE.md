# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ApplicationPoint (MailAware Job Tracker) is a privacy-first job application tracker with a Next.js web app and Chrome extension. Users track applications manually or via browser extension, get automated email updates through Gmail API integration, and manage their job search pipeline with status tracking.

## Common Commands

### Development
```bash
# Start both webapp and extension in dev mode (from root)
pnpm dev

# Start webapp only
cd webapp && pnpm dev

# Start extension in watch mode
cd extension && pnpm dev
```

### Database Operations
```bash
cd webapp

# Generate migrations from schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema directly to database (dev only)
pnpm db:push

# Open Drizzle Studio (visual database browser)
pnpm db:studio
```

### Testing
```bash
# Run all tests across workspaces
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage reports
pnpm test:coverage

# Run tests for webapp only
cd webapp && pnpm test
```

### Build and Type Checking
```bash
# Build both webapp and extension
pnpm build

# Type check all workspaces
pnpm type-check

# Lint all workspaces
pnpm lint
```

## Architecture

### Monorepo Structure
This is a pnpm workspace monorepo with two main packages:
- `webapp/` - Next.js 14 application
- `extension/` - Chrome Manifest V3 extension

### Web App Architecture (Next.js 14)

**Core Stack:**
- Framework: Next.js 14 with App Router
- Database: PostgreSQL (Supabase) with Drizzle ORM
- Auth: NextAuth.js v5 with Google OAuth
- UI: TailwindCSS + shadcn/ui components
- Validation: Zod schemas
- Testing: Vitest + React Testing Library

**App Router Structure:**
- `/` - Landing page
- `/login` - Authentication page
- `/dashboard` - Main dashboard with stats
- `/applications` - Applications list view with filters/search
- `/applications/[id]` - Individual application detail page

**API Routes:**
```
/api/auth/[...nextauth]     - NextAuth handler
/api/applications           - List/create applications
/api/applications/[id]      - Get/update/delete single application
/api/applications/[id]/status - Update application status
/api/applications/stats     - Get statistics
/api/email/process          - Process Gmail messages
/api/email/test             - Test email detection
```

**Database Schema (webapp/db/schema.ts):**
The database uses Drizzle ORM with 10 tables:
- `users` - User accounts with settings
- `applications` - Core job application records with status tracking
- `stageHistory` - Audit trail of status changes
- `emailEvents` - Detected job-related emails with ML confidence scores
- `contacts` - Recruiters and hiring managers
- `attachments` - Resumes, cover letters, assessments
- `reminders` - Follow-up tasks and deadlines
- `accounts`, `sessions`, `verificationTokens` - NextAuth tables

Key patterns:
- All IDs use CUID2 (via `@paralleldrive/cuid2`)
- Status tracking uses `applicationStatusEnum`: saved, applied, assessment, interview, offer, accepted, rejected
- Cascade deletes on user/application relationships
- Timestamps on all entities (createdAt, updatedAt)

**Services Layer (webapp/lib/services/):**
- `applications.ts` - ApplicationService for CRUD operations
- `email-processor.ts` - Processes Gmail messages, detects job events
- `application-matcher.ts` - Matches emails to existing applications

**Gmail Integration (webapp/lib/gmail/):**
- `client.ts` - GmailClient class wrapping Google APIs
- `types.ts` - TypeScript types for Gmail messages
- Uses OAuth2 with refresh tokens stored in `accounts` table
- Queries Gmail for job-related emails (after date filters)

**Email Parsing (webapp/lib/email-parser/):**
- `patterns.ts` - Regex patterns for detecting job events in emails
- `classifier.ts` - ML-style scoring to classify email intent
- `extractor.ts` - Extracts structured data from email content

### Browser Extension (Chrome Manifest V3)

**Build System:**
- Vite for building with React
- TypeScript throughout
- Entry points: popup, content script, background worker

**Architecture:**
- `src/popup/` - React UI shown when clicking extension icon
- `src/content/` - Injected into LinkedIn/Indeed pages, adds save button
- `src/background/` - Service worker handling API requests
- `src/parsers/` - LinkedIn and Indeed DOM parsers

**Flow:**
1. Content script detects job page URL patterns
2. Injects floating save button into page
3. On click, parser extracts job details from DOM
4. Background worker sends POST to `/api/applications`
5. Shows success/error toast to user

**Extension Development:**
```bash
cd extension
pnpm build          # Build to dist/
pnpm dev            # Watch mode

# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select extension/dist/ folder
```

## Important Patterns and Conventions

### Authentication
- Use `auth()` from `@/lib/auth` to get session in Server Components/Actions
- Session includes `user.id` for database queries
- Protected routes checked in middleware
- Google OAuth scopes include Gmail readonly for email integration

### Database Queries
- Import `db` from `@/db` and table schemas from `@/db/schema`
- Use Drizzle ORM query builder (type-safe)
- Always filter by `userId` for user-owned resources
- Example: `await db.select().from(applications).where(eq(applications.userId, userId))`

### API Route Pattern
```typescript
// Validate session
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Validate input with Zod
const result = schema.safeParse(data);
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 });
}

// Use service layer for business logic
const application = await ApplicationService.create(result.data);

// Return JSON response
return NextResponse.json(application);
```

### Component Organization
- UI primitives in `webapp/components/ui/` (shadcn/ui)
- Feature components in `webapp/components/[feature]/`
- Layout components in `webapp/components/layout/`
- Use `@/` alias for imports from webapp root

### Styling
- TailwindCSS utility classes
- shadcn/ui provides base components (Button, Dialog, Card, etc.)
- Custom colors defined in `tailwind.config.ts`
- Use `cn()` helper from `@/lib/utils` for conditional classes

### Testing
- Tests colocated with source files (`.test.ts` suffix)
- Use Vitest + React Testing Library
- Mock Next.js modules when needed
- Run `pnpm test` before committing

## Environment Variables

Required in `webapp/.env.local`:
```bash
DATABASE_URL=                    # PostgreSQL connection string (Supabase)
NEXTAUTH_SECRET=                 # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=                # From Google Cloud Console
GOOGLE_CLIENT_SECRET=            # From Google Cloud Console
```

Setup guides:
- `SETUP_DATABASE.md` - Database configuration
- `SETUP_GOOGLE_OAUTH.md` - OAuth credentials
- `SETUP_GMAIL_API.md` - Gmail API access

## Development Workflow

### Git Branches
- `main` - Production branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `refactor/*` - Code refactoring

### Commits
Follow Conventional Commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `test:` - Add/update tests
- `docs:` - Documentation changes
- `chore:` - Maintenance

Husky runs pre-commit hooks (lint-staged) automatically.

## Key Files to Review

When working on specific features, review these files:

**Database changes:**
- `webapp/db/schema.ts` - Schema definitions
- `webapp/drizzle.config.ts` - Drizzle configuration
- `webapp/db/migrate.ts` - Migration runner

**Authentication:**
- `webapp/lib/auth.ts` - NextAuth configuration
- `webapp/app/api/auth/[...nextauth]/route.ts` - Auth handler
- `webapp/middleware.ts` - Route protection

**Applications feature:**
- `webapp/lib/services/applications.ts` - Service layer
- `webapp/lib/validations/application.ts` - Zod schemas
- `webapp/app/api/applications/route.ts` - API routes

**Email integration:**
- `webapp/lib/gmail/client.ts` - Gmail API wrapper
- `webapp/lib/email-parser/` - Email parsing logic
- `webapp/lib/services/email-processor.ts` - Email processing

**Extension:**
- `extension/public/manifest.json` - Extension manifest
- `extension/src/parsers/` - Job site parsers
- `extension/src/content/index.ts` - Content script

## Project Status

Current sprint: Phase 3 - Polish & Enhancement
- Core CRUD functionality complete
- Browser extension working
- Gmail integration implemented
- Working on UI improvements with shadcn/ui migration
- Recent work: Sidebar navigation and unified layout (Sprint 3.6)

See `STATUS.md` for detailed progress tracking.
