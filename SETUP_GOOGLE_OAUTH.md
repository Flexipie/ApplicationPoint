# Google OAuth Setup Guide

To enable Google Sign-In, you need to create OAuth credentials in Google Cloud Console.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://consoe.cloud.google.com/)
2. Click "Select a project" → "NEW PROJECT"
3. Name it "ApplicationPoint" (or your preference)
4. Click "CREATE"

## Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click "ENABLE"

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for testing) or **Internal** (if you have a Google Workspace)
3. Click "CREATE"
4. Fill in required fields:
   - **App name:** ApplicationPoint
   - **User support email:** Your email
   - **Developer contact:** Your email
5. Click "SAVE AND CONTINUE"
6. **Scopes:** Click "ADD OR REMOVE SCOPES"
   - Add: `./auth/userinfo.email`
   - Add: `./auth/userinfo.profile`
   - Click "UPDATE"
7. Click "SAVE AND CONTINUE" through remaining steps
8. Click "BACK TO DASHBOARD"

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "**+ CREATE CREDENTIALS**" → "OAuth client ID"
3. Choose **Application type:** "Web application"
4. **Name:** ApplicationPoint
5. **Authorized JavaScript origins:**
   - Add: `http://localhost:3001`
   - Add: `http://localhost:3000` (fallback)
6. **Authorized redirect URIs:**
   - Add: `http://localhost:3001/api/auth/callback/google`
   - Add: `http://localhost:3000/api/auth/callback/google` (fallback)
7. Click "CREATE"

## Step 5: Save Your Credentials

You'll see a popup with:
- **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123...`)

**Copy these!** You'll need them for the next step.

## Step 6: Add to Environment Variables

Edit `webapp/.env.local` and add:

```env
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

**Example:**
```env
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123def456"
```

## Step 7: Test It!

1. Restart your dev server:
   ```bash
   cd webapp
   pnpm dev
   ```

2. Go to `http://localhost:3001`
3. You should be redirected to login
4. Click "Sign in with Google"
5. Choose your Google account
6. You should be redirected back to the home page, logged in!

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Check that your redirect URI **exactly matches** what's in Google Cloud Console
- Make sure you're using the correct port (3001 vs 3000)
- No trailing slashes

### "Error 403: access_denied"
- Make sure you added your email as a test user in OAuth consent screen
- Go to OAuth consent screen → "ADD USERS" → add your email

### "OAuth has not been configured"
- Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in `webapp/.env.local`
- Restart the dev server after adding them

## For Production (Later)

When deploying to production:

1. Update OAuth consent screen to "Production" mode
2. Add your production URL to authorized origins:
   - `https://yourdomain.com`
3. Add production callback:
   - `https://yourdomain.com/api/auth/callback/google`
4. Update `NEXTAUTH_URL` in production environment to your domain

---

**Once configured, authentication is ready! ✅**
