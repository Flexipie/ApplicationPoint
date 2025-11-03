# Gmail API Setup Guide

To enable email integration, you need to add the Gmail API to your Google Cloud project.

---

## Step 1: Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your "ApplicationPoint" project (same one used for OAuth)
3. Go to **APIs & Services** → **Library**
4. Search for **"Gmail API"**
5. Click on it and click **"ENABLE"**

---

## Step 2: Update OAuth Consent Screen

Since we're adding a new scope, we need to update the consent screen:

1. Go to **APIs & Services** → **OAuth consent screen**
2. Click **"EDIT APP"**
3. Click **"SAVE AND CONTINUE"** until you reach "Scopes"
4. Click **"ADD OR REMOVE SCOPES"**
5. Find and add:
   - `https://www.googleapis.com/auth/gmail.readonly` (Read email messages and settings)
6. Click **"UPDATE"**
7. Click **"SAVE AND CONTINUE"** through remaining steps

---

## Step 3: Test the Integration

### Re-authenticate to Grant Gmail Access

Since we added a new scope, users need to sign out and sign in again:

1. Go to `http://localhost:3000`
2. **Sign out** (click sign out button)
3. **Sign in again** with Google
4. You should see a **new permission** request:
   - ✅ View your email messages and settings
5. Click **"Allow"**

---

## Step 4: Test Email Fetching

### Option A: Use the API directly

```bash
# In your browser, while logged in:
http://localhost:3000/api/email/test
```

This will:
- Connect to your Gmail
- Fetch emails from last 7 days
- Filter for job-related emails
- Return parsed results as JSON

### Option B: Check browser console

```
Open DevTools → Console
You should see logs about emails being fetched
```

---

## Expected Response

If Gmail is connected successfully:

```json
{
  "success": true,
  "messagesFound": 5,
  "messages": [
    {
      "id": "18d1234...",
      "headers": {
        "from": "jobs@company.com",
        "subject": "Thanks for applying!",
        "date": "Mon, 01 Nov 2024 10:00:00 +0000"
      },
      "bodyPreview": "Thank you for your interest in...",
      "companyName": "Company"
    }
  ]
}
```

---

## Troubleshooting

### Error: "Gmail not connected"

**Solution:** You need to re-authenticate.

1. Sign out from ApplicationPoint
2. Sign in again
3. **Make sure you click "Allow"** on the Gmail permission screen

### Error: "insufficient_scope"

**Solution:** The Gmail scope wasn't added properly.

1. Go back to Step 2
2. Make sure `gmail.readonly` scope is added to OAuth consent screen
3. Sign out and sign in again

### Error: "Access blocked: ApplicationPoint has not completed..."

**Solution:** Your app is in testing mode.

1. Go to OAuth consent screen
2. Add your email as a **test user**
3. Click "ADD USERS" and enter your Gmail address

### No emails found (messagesFound: 0)

**This is normal if:**
- You don't have job-related emails in last 7 days
- Emails don't match our keywords (noreply, jobs, recruiting, etc.)

**To test:**
- Send yourself a test email with "job application" in the subject
- OR: Send from an email like "noreply@test.com"
- Wait a minute, then call `/api/email/test` again

---

## Security Notes

### What We Access:
- ✅ **Read-only access** to your Gmail
- ✅ We ONLY fetch job-related emails (filtered by keywords)
- ✅ We NEVER send emails on your behalf
- ✅ We NEVER delete or modify emails

### What We Store:
- Email content (only job-related)
- Sender information
- Email metadata (date, subject)
- Link to original email

### Revoking Access:
If you want to remove Gmail access:

1. Go to [Google Account Permissions](https://myaccount.google.com/permissions)
2. Find "ApplicationPoint"
3. Click "Remove Access"

---

## Next Steps

Once Gmail API is working:

1. ✅ Test email fetching (`/api/email/test`)
2. ⏳ Build email classifier (Sprint 2.2)
3. ⏳ Implement auto-status updates (Sprint 2.3)
4. ⏳ Add background sync (Sprint 2.4)
5. ⏳ Create UI for email events (Sprint 2.5)

---

## Testing with Real Emails

### Send yourself test emails:

**Application Received:**
- Subject: "Thanks for applying to [Company]"
- From: noreply@company.com

**Interview Invitation:**
- Subject: "Interview invitation for [Position]"
- From: recruiting@company.com

**Rejection:**
- Subject: "Update on your application"
- Body: "...decided to move forward with other candidates..."

Then test with `/api/email/test` to see if they're detected! 🎯

---

**Gmail API is now set up! Ready to build the email classifier next.** 🚀
