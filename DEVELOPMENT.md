# Development Guide

## ✅ Completed Setup

- [x] Git repository initialized and pushed to GitHub
- [x] Monorepo structure with pnpm workspaces
- [x] Next.js 14 webapp with TypeScript, Tailwind, and App Router
- [x] Testing infrastructure with Vitest
- [x] ESLint and Prettier configuration
- [x] Git hooks with Husky
- [x] Basic app layout and home page
- [x] Environment variable configuration

## 🎯 Current Sprint: Phase 1 - Foundation (Week 1-2)

### Priority 1: Database & Auth
**Branch:** `feature/database-auth-setup`

- [ ] Set up Drizzle ORM with PostgreSQL
- [ ] Create database schema (users, applications, contacts tables)
- [ ] Add migration scripts
- [ ] Set up NextAuth.js with Google OAuth
- [ ] Create auth API routes
- [ ] Add login/signup pages
- [ ] Write tests for auth flow

**Files to create:**
- `webapp/db/schema.ts` - Drizzle schema definitions
- `webapp/db/migrate.ts` - Migration runner
- `webapp/app/api/auth/[...nextauth]/route.ts` - NextAuth config
- `webapp/app/login/page.tsx` - Login page
- `webapp/lib/auth.ts` - Auth utilities

### Priority 2: Applications CRUD API
**Branch:** `feature/applications-api`

- [ ] Create REST API routes for applications
- [ ] Add validation with Zod
- [ ] Implement CRUD operations (Create, Read, Update, Delete)
- [ ] Add API tests
- [ ] Error handling middleware

**API Endpoints:**
- `GET /api/applications` - List all
- `POST /api/applications` - Create new
- `GET /api/applications/[id]` - Get one
- `PATCH /api/applications/[id]` - Update
- `DELETE /api/applications/[id]` - Delete

### Priority 3: Applications List View
**Branch:** `feature/applications-list-ui`

- [ ] Create applications list page
- [ ] Add filter/search/sort functionality
- [ ] Create application row component
- [ ] Add status dropdown
- [ ] Implement inline detail expansion
- [ ] Add loading and error states
- [ ] Mobile responsive design

### Priority 4: Browser Extension (Basic)
**Branch:** `feature/extension-basic-capture`

- [ ] Set up extension build with Vite
- [ ] Create manifest.json (V3)
- [ ] Build popup UI with React
- [ ] Add content script for LinkedIn parsing
- [ ] Add content script for Indeed parsing
- [ ] Connect to API
- [ ] Add confirmation panel

## Git Workflow

### Creating a Feature Branch
```bash
# Always start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Development Cycle
```bash
# Make changes and commit frequently
git add .
git commit -m "feat: descriptive message"

# Run tests before pushing
pnpm test

# Push to remote
git push origin feature/your-feature-name
```

### Pull Request Process
1. Push your feature branch to GitHub
2. Open a Pull Request to `main`
3. Ensure all tests pass
4. Request review (if working with team)
5. Squash merge after approval

### Commit Message Convention
Follow Conventional Commits:

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `docs:` Documentation changes
- `chore:` Maintenance tasks

## Running the Project

### Development
```bash
# Start webapp dev server
cd webapp
pnpm dev

# Or from root (will start all workspaces)
pnpm dev
```

### Testing
```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

### Type Checking
```bash
pnpm type-check
```

### Linting
```bash
pnpm lint
```

## Next Steps

1. **Set up local PostgreSQL database** (or Supabase account)
2. **Create feature branch for database setup**
3. **Implement database schema with Drizzle ORM**
4. **Add NextAuth configuration**
5. **Build applications API**
6. **Create list view UI**

## Database Setup Options

### Option 1: Local PostgreSQL
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb application_point
```

### Option 2: Supabase (Recommended for MVP)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string to `.env.local`
4. Supabase provides auth, DB, and storage in one

## Environment Setup

```bash
# Copy example env file
cp webapp/.env.example webapp/.env.local

# Edit with your credentials
vim webapp/.env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random string (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

## Troubleshooting

### Port already in use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module not found
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Type errors
```bash
# Regenerate TypeScript types
pnpm type-check
```

---

**Ready to start? Create the first feature branch:**
```bash
git checkout -b feature/database-auth-setup
```
