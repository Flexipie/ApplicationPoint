# Testing the ApplicationPoint Chrome Extension

## Prerequisites

1. ✅ Web app running at `http://localhost:3000`
2. ✅ Logged in to ApplicationPoint
3. ✅ Extension built (`pnpm build` in `extension/` folder)

## Load Extension in Chrome

### Step 1: Open Chrome Extensions Page
```
chrome://extensions/
```

### Step 2: Enable Developer Mode
- Toggle "Developer mode" in the top right corner

### Step 3: Load Unpacked Extension
1. Click "Load unpacked"
2. Navigate to: `/Users/flexipie/Desktop/Code/Projects/MJT/extension/dist`
3. Click "Select"

The extension should now appear in your extensions list!

---

## Testing on LinkedIn

### 1. Find a Job Posting
Navigate to any LinkedIn job page, for example:
```
https://www.linkedin.com/jobs/view/1234567890/
```

### 2. Look for the Save Button
- A purple button should appear in the bottom-right corner
- Button text: "Save to ApplicationPoint"
- Button has a bookmark icon

### 3. Click the Button
- Button shows loading state: "Saving..."
- On success: Button turns green, shows "Saved!"
- On error: Button turns red, shows "Failed - Try again"

### 4. Verify in ApplicationPoint
1. Go to `http://localhost:3000/applications`
2. The job should appear in your list!
3. Check that all details were captured:
   - Job title
   - Company name
   - Location
   - Source: "linkedin"
   - Status: "saved"

---

## Testing on Indeed

### 1. Find a Job Posting
Navigate to any Indeed job page, for example:
```
https://www.indeed.com/viewjob?jk=abc123
```

### 2. Repeat Testing Steps
- Same as LinkedIn testing
- Button should appear
- Click to save
- Verify in ApplicationPoint

### 3. Check Source
- Source should be "indeed" this time

---

## Testing the Popup

### 1. Click Extension Icon
- Look for ApplicationPoint in your Chrome toolbar
- Click the extension icon

### 2. Verify Popup Content
- Should show: "ApplicationPoint" header
- Should show: 3 feature checkmarks
- Should show: "How to use" instructions
- Should show: "Open ApplicationPoint" button

### 3. Click "Open ApplicationPoint"
- Should open: `http://localhost:3000/applications`
- In a new tab

---

## Troubleshooting

### Button Doesn't Appear

**Check Console:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for: "ApplicationPoint content script loaded"

**If you don't see it:**
- Refresh the page
- Make sure you're on a job detail page (not search results)
- Check that extension is enabled in `chrome://extensions/`

### Save Fails

**Common Issues:**

1. **Not Logged In**
   - Go to `http://localhost:3000`
   - Make sure you're logged in
   - Try saving again

2. **Web App Not Running**
   - Check that dev server is running on port 3000
   - Terminal should show: `✓ Ready in ...ms`

3. **CORS Error**
   - Check browser console for errors
   - Make sure `credentials: 'include'` is in fetch request

**Check API Response:**
1. Open DevTools → Network tab
2. Click save button
3. Look for request to `/api/applications`
4. Check status code (should be 201)
5. Check response body

### Extension Won't Load

**Verify Build:**
```bash
cd extension
ls -la dist/
```

Should see:
- `manifest.json`
- `background/index.js`
- `content/index.js`
- `src/popup/index.html`
- `popup/index.js`

**If files are missing:**
```bash
cd extension
pnpm build
```

---

## Test Checklist

### LinkedIn
- [ ] Button appears on job page
- [ ] Button has correct styling (purple, gradient)
- [ ] Click shows loading state
- [ ] Success shows green checkmark
- [ ] Job appears in ApplicationPoint
- [ ] All fields populated correctly

### Indeed
- [ ] Button appears on job page
- [ ] Same behavior as LinkedIn
- [ ] Source is "indeed" in database

### Popup
- [ ] Popup opens when clicking icon
- [ ] UI looks good (purple gradient background)
- [ ] "Open ApplicationPoint" button works

### Error Handling
- [ ] Try saving when not logged in (should fail gracefully)
- [ ] Try saving same job twice (should still work)
- [ ] Try saving from non-job page (button shouldn't appear)

---

## Success Criteria ✅

Extension is working if:
1. ✅ Button appears on LinkedIn and Indeed job pages
2. ✅ Clicking button saves job to database
3. ✅ Job appears in ApplicationPoint web app
4. ✅ All job details are captured correctly
5. ✅ Error states work (not logged in, network error)
6. ✅ Popup UI shows correctly

---

## Next Steps After Testing

Once testing is complete:
1. Take screenshots of working extension
2. Report any bugs or issues
3. Merge `feature/extension-basic-capture` to main
4. **Phase 1 Complete!** 🎉

---

## Demo Flow

**Perfect test flow to show everything works:**

1. Open `http://localhost:3000/applications` (empty or few jobs)
2. Navigate to LinkedIn job posting
3. Show save button appearing
4. Click button and show success animation
5. Go back to ApplicationPoint
6. Show new job in the list
7. Expand job card to show all captured details
8. Repeat with Indeed job
9. Show both jobs with different sources

**This proves the entire system works end-to-end!** 🚀
