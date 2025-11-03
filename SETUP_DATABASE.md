# Database Setup Guide - Supabase

## ✅ Step 1: Get Your Supabase Connection String

1. Go to your Supabase project: https://supabase.com/dashboard/project/[your-project]
2. Click on **Settings** (gear icon in sidebar)
3. Click on **Database**
4. Scroll down to **Connection String**
5. Select **Connection Pooling** tab (not Direct connection)
6. Copy the **Connection string** - it looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
7. **Important:** Replace `[YOUR-PASSWORD]` with your actual database password

## ✅ Step 2: Set Up Environment Variables

```bash
# Create .env.local file in webapp folder
cd webapp
cp .env.local.template .env.local

# Edit .env.local and add your connection string
```

Your `webapp/.env.local` should look like:
```env
DATABASE_URL="postgresql://postgres.xxxxx:your-password@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="generate-this-with-openssl-rand-base64-32"
```

## ✅ Step 3: Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` in your `.env.local`

## ✅ Step 4: Generate and Run Migrations

```bash
# From the webapp folder:
cd webapp

# Generate migration files from schema
pnpm db:generate

# Apply migrations to database
pnpm db:migrate
```

You should see:
```
✅ Migrations completed successfully
```

## ✅ Step 5: Verify Setup

```bash
# Open Drizzle Studio to see your tables
pnpm db:studio
```

This will open http://localhost:4983 where you can see all your database tables.

## 🎯 What We Just Created

### Database Tables:
- ✅ **users** - User accounts
- ✅ **applications** - Job applications (main table)
- ✅ **stage_history** - Track status changes
- ✅ **email_events** - Detected email updates
- ✅ **contacts** - Recruiters/hiring managers
- ✅ **attachments** - Resume uploads
- ✅ **reminders** - Follow-ups and deadlines
- ✅ **accounts** - OAuth accounts (NextAuth)
- ✅ **sessions** - User sessions (NextAuth)
- ✅ **verification_tokens** - Email verification (NextAuth)

### Enums Created:
- `application_status`: saved, applied, assessment, interview, offer, accepted, rejected
- `application_source`: linkedin, indeed, company_site, referral, other
- `reminder_type`: follow_up, thank_you, deadline, preparation, other

## Troubleshooting

### "DATABASE_URL is not set"
- Make sure you created `webapp/.env.local`
- Make sure the variable name is exactly `DATABASE_URL`
- No spaces around the `=` sign

### "Connection refused"
- Check that your Supabase project is active (not paused)
- Verify you're using the **Pooling** connection string, not Direct
- Confirm password is correct

### "Cannot find module"
- Run `pnpm install` in the webapp folder
- Make sure all dependencies are installed

## Next Steps

Once migrations are successful:
1. ✅ Verify tables in Drizzle Studio
2. Move to NextAuth setup
3. Build the applications API
4. Create the UI

---

**Ready?** Let me know when you've added the `DATABASE_URL` to `.env.local` and I'll help you run the migrations!
