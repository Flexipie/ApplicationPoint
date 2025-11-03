# ApplicationPoint (MailAware Job Tracker)

Privacy-first job application tracker with browser extension and web app. Track applications, get automated email updates, and never miss a deadline.

## Project Structure

```
├── webapp/          # Next.js web application
├── extension/       # Chrome/Firefox browser extension
├── prd.md          # Product Requirements Document
└── README.md       # This file
```

## Tech Stack

### Web App
- **Framework:** Next.js 14 + React + TypeScript
- **Styling:** TailwindCSS + shadcn/ui
- **Database:** PostgreSQL (Supabase)
- **Auth:** NextAuth.js
- **Deployment:** Vercel

### Browser Extension
- **Manifest:** V3
- **UI:** React + TypeScript
- **Build:** Vite
- **Storage:** Chrome Storage API

## Development Workflow

We follow Git Flow with feature branches:

1. **Create feature branch:** `git checkout -b feature/name`
2. **Develop with tests:** Write tests for critical features
3. **Commit regularly:** Small, descriptive commits
4. **Push and PR:** Open PR for code review
5. **Merge after tests pass:** Squash merge to main

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `test/` - Adding/updating tests
- `docs/` - Documentation updates

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)
- pnpm (recommended) or npm

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp webapp/.env.example webapp/.env.local
# Edit webapp/.env.local with your credentials

# Run database migrations
cd webapp
pnpm db:migrate

# Start development servers
pnpm dev
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Phase 1 Goals (Week 1-2)

- [x] Project structure setup
- [ ] Database schema + migrations
- [ ] Authentication (NextAuth)
- [ ] Simple list view
- [ ] REST API for applications CRUD
- [ ] Browser extension basic capture
- [ ] Extension → API integration

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Open a PR with clear description

## License

Proprietary - All rights reserved
