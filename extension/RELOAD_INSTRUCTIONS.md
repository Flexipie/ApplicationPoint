# How to Completely Reload the Extension

Chrome is caching the old version. Follow these steps exactly:

## Step 1: Remove Old Extension

1. Go to `chrome://extensions/`
2. Find **ApplicationPoint - Job Tracker**
3. Click **Remove** button
4. Confirm removal

## Step 2: Close All LinkedIn Tabs

1. Close ALL tabs with LinkedIn open
2. This ensures no old content scripts are still running

## Step 3: Restart Chrome (Optional but Recommended)

1. Completely quit Chrome
2. Reopen Chrome

## Step 4: Load Extension Fresh

1. Go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Navigate to: `/Users/flexipie/Desktop/Code/Projects/MJT/extension/dist`
5. **IMPORTANT**: Select the `dist` folder (NOT `extension` or `src`)
6. Click **Select**

## Step 5: Configure API URL

1. Click the extension icon in toolbar
2. Click the gear icon (⚙️)
3. Enter: `https://application-point-webapp.vercel.app`
4. Click **Save**

## Step 6: Test

1. Open a NEW LinkedIn job page
2. Example: https://www.linkedin.com/jobs/search/
3. Click any job listing
4. You should see "ApplicationPoint content script loaded" in console (F12)
5. Button should appear in bottom-right corner
6. Click button and try saving

## Verify Extension Path

After loading, the extension card should show:
- **Name**: ApplicationPoint - Job Tracker
- **Version**: 0.1.0
- **Path**: `/Users/flexipie/Desktop/Code/Projects/MJT/extension/dist`

If the path is different, you loaded the wrong folder!

## Still Having Issues?

Check the console for the exact error. The new version should NOT have any `chrome.storage.local` calls in the content script.
