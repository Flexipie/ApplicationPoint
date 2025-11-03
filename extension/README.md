# ApplicationPoint Browser Extension

Chrome extension for saving job postings from LinkedIn and Indeed to your ApplicationPoint tracker.

## Features

- 🚀 One-click save button on job pages
- 🔍 Auto-detects job details (title, company, location, salary)
- 💼 Works on LinkedIn and Indeed
- 🔗 Direct integration with ApplicationPoint API
- ✨ Beautiful UI with loading and success states

## Development

### Install Dependencies
```bash
pnpm install
```

### Build Extension
```bash
pnpm build
```

This creates a `dist/` folder with the built extension.

### Development Mode (Watch)
```bash
pnpm dev
```

This watches for changes and rebuilds automatically.

### Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/dist` folder
5. The extension is now loaded!

## Testing

1. Make sure your ApplicationPoint web app is running (`http://localhost:3000`)
2. Navigate to a job on LinkedIn or Indeed
3. Look for the purple "Save to ApplicationPoint" button (bottom right)
4. Click it to save the job
5. Check your ApplicationPoint tracker to see the saved job

## File Structure

```
extension/
├── public/
│   ├── manifest.json       # Extension manifest (Manifest V3)
│   └── icon*.png          # Extension icons
├── src/
│   ├── background/        # Background service worker
│   │   └── index.ts
│   ├── content/           # Content script (injected into pages)
│   │   └── index.ts
│   ├── parsers/           # Job page parsers
│   │   ├── linkedin.ts
│   │   └── indeed.ts
│   └── popup/             # Extension popup UI
│       ├── index.html
│       ├── index.tsx
│       ├── App.tsx
│       └── App.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## How It Works

1. **Content Script** (`src/content/index.ts`)
   - Injects save button into LinkedIn/Indeed pages
   - Detects job page URL patterns
   - Handles button click events

2. **Parsers** (`src/parsers/`)
   - Extract job details from page DOM
   - LinkedIn and Indeed have different selectors
   - Returns structured job data

3. **Background Worker** (`src/background/index.ts`)
   - Receives save requests from content script
   - Makes API calls to ApplicationPoint backend
   - Handles authentication and storage

4. **Popup** (`src/popup/`)
   - Shows extension info and instructions
   - Provides link to open ApplicationPoint web app

## API Integration

The extension sends POST requests to:
```
http://localhost:3000/api/applications
```

With job data in this format:
```json
{
  "jobTitle": "Senior Software Engineer",
  "companyName": "Google",
  "location": "Mountain View, CA",
  "salaryRange": "$150k - $200k",
  "applyUrl": "https://...",
  "descriptionPreview": "...",
  "source": "linkedin",
  "currentStatus": "saved"
}
```

## Troubleshooting

### Button doesn't appear
- Check that you're on a supported job page (LinkedIn/Indeed job view)
- Open DevTools Console and look for "ApplicationPoint content script loaded"
- Refresh the page

### Save fails
- Make sure the web app is running on `http://localhost:3000`
- Check that you're logged in to ApplicationPoint
- Open DevTools Console to see error messages

### Extension won't load
- Make sure you built the extension (`pnpm build`)
- Check that `dist/manifest.json` exists
- Try reloading the extension in `chrome://extensions/`

## Next Steps

- [ ] Add Firefox support (Manifest V2 compatibility)
- [ ] Add more job sites (Greenhouse, Lever, etc.)
- [ ] Offline support with IndexedDB
- [ ] Browser action badge with save count
- [ ] Keyboard shortcuts
