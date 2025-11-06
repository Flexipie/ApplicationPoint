# ApplicationPoint

**Privacy-first job application tracker** with automated email updates and browser extension. Track your job search pipeline from save to offer without the noise.

🔗 **Live Demo:** [application-point-webapp.vercel.app](https://application-point-webapp.vercel.app)

---

## ✨ Features

### 📊 Application Management
- **Kanban & List Views** - Visualize your pipeline or scan through details
- **7 Status Stages** - Saved → Applied → Assessment → Interview → Offer → Accepted/Rejected
- **Rich Details** - Job title, company, location, salary, deadlines, notes
- **Statistics Dashboard** - Track response rates, interview conversion, active applications

### 🔌 Browser Extension
- **One-Click Save** - Floating button on LinkedIn & Indeed job pages
- **Smart Parsing** - Auto-extracts title, company, location, salary
- **Preview Before Save** - Review and edit details in modal before saving
- **Success Toast** - Direct link to view saved application
- **Multi-Site Support** - LinkedIn job view, search, collections + Indeed

### 📧 Email Integration
- **Gmail Auto-Sync** - Daily cron job scans for job-related emails
- **Smart Detection** - ML-style pattern matching for rejections, interviews, assessments
- **Auto Status Updates** - Application status changes when emails detected
- **Privacy First** - Read-only Gmail access, never sends emails
- **Full Transparency** - Email Access Log shows every scanned email with confidence scores

### ⚙️ Settings & Privacy
- **Gmail Connection Control** - Connect/disconnect with one click
- **Email Access Log** - See every email we've scanned with full details
- **Last Sync Display** - Know when emails were last processed
- **Session Persistence** - Stay logged in for 30 days

---

## 🏗️ Tech Stack

### Web App
- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** TailwindCSS + shadcn/ui components
- **Database:** PostgreSQL (Supabase) + Drizzle ORM
- **Auth:** NextAuth.js v5 with Google OAuth
- **Deployment:** Vercel with Cron Jobs
- **Email:** Gmail API with OAuth2 refresh tokens

### Browser Extension
- **Manifest:** V3 (Chrome)
- **UI:** React + TypeScript
- **Build:** Vite
- **Storage:** Chrome Storage API
- **Parsers:** Custom DOM scrapers for LinkedIn & Indeed

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)
- pnpm (recommended)
- Google OAuth credentials
- Chrome browser (for extension)

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/ApplicationPoint.git
cd ApplicationPoint

# Install dependencies
pnpm install
```

### 2. Database Setup

```bash
# Create a Supabase project or local PostgreSQL database
# Copy environment template
cp webapp/.env.example webapp/.env.local

# Edit webapp/.env.local with your credentials:
# - DATABASE_URL (PostgreSQL connection string)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
# - CRON_SECRET (for Vercel cron authentication)

# Run migrations
cd webapp
pnpm db:migrate

# (Optional) Open Drizzle Studio to browse database
pnpm db:studio
```

See [SETUP_DATABASE.md](SETUP_DATABASE.md) and [SETUP_GOOGLE_OAUTH.md](SETUP_GOOGLE_OAUTH.md) for detailed instructions.

### 3. Start Development Servers

```bash
# From root directory - starts both webapp and extension in watch mode
pnpm dev

# OR start individually:
cd webapp && pnpm dev      # Web app on http://localhost:3000
cd extension && pnpm dev   # Extension builds to extension/dist/
```

### 4. Load Browser Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Navigate to `extension/dist/` folder and select it
5. Extension icon should appear in toolbar
6. Click extension icon → Settings (gear icon) → Enter API URL: `http://localhost:3000`

---

## 📦 Project Structure

```
ApplicationPoint/
├── webapp/                  # Next.js application
│   ├── app/                # App router pages & API routes
│   │   ├── api/           # REST API endpoints
│   │   ├── dashboard/     # Dashboard page
│   │   ├── applications/  # Applications list & detail pages
│   │   └── settings/      # Settings & email access log
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui primitives
│   │   ├── applications/ # Application-specific components
│   │   └── settings/     # Settings components
│   ├── lib/              # Utilities & services
│   │   ├── services/     # Business logic (ApplicationService, EmailProcessor)
│   │   ├── gmail/        # Gmail API client
│   │   └── email-parser/ # Email pattern detection
│   └── db/               # Database schema & migrations
│
├── extension/             # Chrome extension
│   ├── src/
│   │   ├── popup/        # Extension popup UI
│   │   ├── content/      # Content scripts (injected into pages)
│   │   ├── background/   # Background service worker
│   │   └── parsers/      # LinkedIn & Indeed parsers
│   ├── public/           # Static assets & manifest.json
│   └── dist/             # Built extension (load this in Chrome)
│
├── CLAUDE.md             # AI assistant guide
├── STATUS.md             # Development status & sprint tracking
└── README.md            # This file
```

---

## 🛠️ Common Commands

### Development
```bash
# Start both webapp and extension
pnpm dev

# Start webapp only
cd webapp && pnpm dev

# Start extension in watch mode
cd extension && pnpm dev
```

### Database
```bash
cd webapp

# Generate migrations from schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema directly (dev only)
pnpm db:push

# Open database UI
pnpm db:studio
```

### Testing
```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Build
```bash
# Build webapp for production
cd webapp && pnpm build

# Build extension
cd extension && pnpm build

# Type check all workspaces
pnpm type-check
```

---

## 🔐 Environment Variables

Required in `webapp/.env.local`:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# NextAuth
NEXTAUTH_URL=http://localhost:3000  # Your deployed URL in production
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Google OAuth (for auth + Gmail API)
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# Cron Job Security (Vercel deployments)
CRON_SECRET=<generate with: openssl rand -base64 32>
```

See [SETUP_GOOGLE_OAUTH.md](SETUP_GOOGLE_OAUTH.md) and [SETUP_GMAIL_API.md](SETUP_GMAIL_API.md) for obtaining credentials.

---

## 🚀 Deployment

### Webapp (Vercel)

1. **Create Vercel Project:**
   - Import from GitHub
   - Root Directory: `webapp`
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`

2. **Set Environment Variables:**
   - Add all variables from `.env.local`
   - Update `NEXTAUTH_URL` to your Vercel domain

3. **Cron Job:**
   - Automatically configured via `vercel.json`
   - Runs daily at 9 AM UTC
   - Processes emails for all connected users

### Extension (Manual)

The extension is currently manually loaded for development/testing:

1. Build: `cd extension && pnpm build`
2. Distribute the `extension/dist/` folder
3. Users load it as unpacked extension in Chrome
4. Users configure API URL via extension settings (gear icon)

**Future:** Publish to Chrome Web Store for automatic updates.

---

## 📊 Current Status

**Phase 2 Complete** - Core features deployed and working in production:
- ✅ Full CRUD for applications
- ✅ Browser extension with LinkedIn & Indeed support
- ✅ Gmail integration with daily cron processing
- ✅ Settings page with privacy controls
- ✅ Email Access Log for transparency
- ✅ Persistent sessions (30-day login)

**Next Phases:**
- Phase 3: Reminders & notifications system
- Phase 4: Email integration improvements (better parsing, more sources)
- Phase 5: Mobile responsiveness
- Phase 6: Polish & beta launch

See [STATUS.md](STATUS.md) for detailed sprint tracking.

---

## 🤝 Contributing

This is currently a private project, but contributions are welcome:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes with tests
3. Commit using conventional commits: `feat:`, `fix:`, `refactor:`, etc.
4. Push and open a PR

---

## 📝 Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide & architecture
- [CLAUDE.md](CLAUDE.md) - AI assistant context & common commands
- [STATUS.md](STATUS.md) - Sprint tracking & development status
- [SETUP_DATABASE.md](SETUP_DATABASE.md) - Database setup guide
- [SETUP_GOOGLE_OAUTH.md](SETUP_GOOGLE_OAUTH.md) - OAuth credentials setup
- [SETUP_GMAIL_API.md](SETUP_GMAIL_API.md) - Gmail API configuration
- [TESTING_EXTENSION.md](TESTING_EXTENSION.md) - Extension testing guide

---

## 📄 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Hosting & cron jobs
- [Supabase](https://supabase.com/) - PostgreSQL hosting
