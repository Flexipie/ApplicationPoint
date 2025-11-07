// Content script for ApplicationPoint extension
import { parseLinkedInJob } from '../parsers/linkedin';
import { parseIndeedJob } from '../parsers/indeed';
import { parseGenericJob, looksLikeJobPage } from '../parsers/generic';
import { createPreviewModal, type JobData } from './preview-modal';
import { showSuccessToast, showErrorToast } from './success-toast';

console.log('ApplicationPoint content script loaded');

// Detect which site we're on
const isLinkedIn = window.location.hostname.includes('linkedin.com');
const isIndeed = window.location.hostname.includes('indeed.com');
const isGenericJobPage = !isLinkedIn && !isIndeed && looksLikeJobPage();

// Create and inject the save button
function createSaveButton() {
  // Check if button already exists
  if (document.getElementById('applicationpoint-save-btn')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'applicationpoint-save-btn';
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
    Save to ApplicationPoint
  `;
  
  // Styling
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    transition: all 0.2s ease;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
  });

  button.addEventListener('click', handleSaveJob);

  document.body.appendChild(button);
  console.log('ApplicationPoint save button injected');
}

// Handle save job click - check for duplicates then show preview modal
async function handleSaveJob() {
  try {
    // Parse job data based on site
    let jobData: JobData | null = null;

    // Try site-specific parsers first
    if (isLinkedIn) {
      jobData = parseLinkedInJob();
      console.log('LinkedIn parser result:', jobData);
    } else if (isIndeed) {
      jobData = parseIndeedJob();
      console.log('Indeed parser result:', jobData);
    }

    // Fall back to generic parser if site-specific parser failed
    if (!jobData) {
      console.log('Site-specific parser failed, trying generic parser...');
      jobData = parseGenericJob();
      console.log('Generic parser result:', jobData);
    }

    if (!jobData) {
      showErrorToast('Could not parse job data from this page. Please try copying the details manually.');
      return;
    }

    // Check for duplicates before showing preview
    const duplicateCheck = await checkForDuplicates(jobData);

    if (duplicateCheck.hasDuplicates && duplicateCheck.duplicates.length > 0) {
      // Show duplicate warning
      const shouldContinue = await showDuplicateWarning(duplicateCheck.duplicates, duplicateCheck.apiUrl);
      if (!shouldContinue) {
        console.log('Save cancelled due to duplicate');
        return;
      }
    }

    // Show preview modal
    createPreviewModal(
      jobData,
      async (editedData) => {
        await saveJobToAPI(editedData);
      },
      () => {
        console.log('Save cancelled');
      }
    );
  } catch (error) {
    console.error('Error parsing job:', error);
    showErrorToast('Failed to parse job data');
  }
}

// Actually save the job to API
async function saveJobToAPI(jobData: JobData) {
  try {
    // Send to background script to save via API
    const response = await chrome.runtime.sendMessage({
      type: 'SAVE_JOB',
      data: jobData,
    });

    if (response.success) {
      // Get API URL from the response (background script includes it)
      const baseUrl = response.data.apiUrl || 'http://localhost:3000';

      // Show success toast with link (API returns application directly, not wrapped)
      showSuccessToast(response.data.id, baseUrl);

      // Update button to show already saved
      updateButtonToSaved();
    } else {
      throw new Error(response.error || 'Failed to save job');
    }
  } catch (error) {
    console.error('Error saving job:', error);
    showErrorToast('Failed to save application. Please try again.');
  }
}

// Check for duplicate applications
async function checkForDuplicates(jobData: JobData): Promise<{
  hasDuplicates: boolean;
  duplicates: any[];
  apiUrl: string;
}> {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CHECK_DUPLICATE',
      data: {
        jobTitle: jobData.jobTitle,
        companyName: jobData.companyName,
        applyUrl: jobData.applyUrl,
      },
    });

    if (response.success) {
      return response.data;
    } else {
      console.error('Duplicate check failed:', response.error);
      // Don't block save if duplicate check fails
      return { hasDuplicates: false, duplicates: [], apiUrl: 'http://localhost:3000' };
    }
  } catch (error) {
    console.error('Error checking duplicates:', error);
    // Don't block save if duplicate check fails
    return { hasDuplicates: false, duplicates: [], apiUrl: 'http://localhost:3000' };
  }
}

// Show duplicate warning modal
async function showDuplicateWarning(duplicates: any[], apiUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;

    const topDuplicate = duplicates[0];
    const matchTypeLabelMap: Record<string, string> = {
      'exact_url': 'Exact URL match',
      'exact_title_company': 'Exact match',
      'fuzzy_match': 'Similar application'
    };
    const matchTypeLabel = matchTypeLabelMap[topDuplicate.matchType] || 'Potential duplicate';

    modal.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 20px; font-weight: 600; color: #f59e0b; margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Possible Duplicate
        </h2>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">
          Found ${duplicates.length} similar application${duplicates.length > 1 ? 's' : ''} already saved
        </p>
      </div>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin-bottom: 20px;">
        <div style="font-size: 12px; color: #92400e; font-weight: 600; margin-bottom: 8px;">
          ${matchTypeLabel} (${Math.round(topDuplicate.similarity * 100)}% match)
        </div>
        <div style="font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 4px;">
          ${topDuplicate.jobTitle}
        </div>
        <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
          ${topDuplicate.companyName}
        </div>
        <div style="font-size: 12px; color: #9ca3af;">
          Status: <span style="text-transform: capitalize; font-weight: 500;">${topDuplicate.currentStatus}</span> •
          Saved ${new Date(topDuplicate.createdAt).toLocaleDateString()}
        </div>
      </div>

      ${duplicates.length > 1 ? `
        <div style="font-size: 13px; color: #6b7280; margin-bottom: 16px;">
          + ${duplicates.length - 1} more similar application${duplicates.length > 2 ? 's' : ''}
        </div>
      ` : ''}

      <div style="display: flex; gap: 8px; flex-direction: column;">
        <button id="ap-duplicate-view" style="
          flex: 1;
          padding: 10px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">
          View Existing Application
        </button>
        <button id="ap-duplicate-save-anyway" style="
          flex: 1;
          padding: 10px 16px;
          background: white;
          color: #374151;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">
          Save as New Application
        </button>
        <button id="ap-duplicate-cancel" style="
          flex: 1;
          padding: 10px 16px;
          background: transparent;
          color: #6b7280;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        ">
          Cancel
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Button handlers
    const viewButton = modal.querySelector('#ap-duplicate-view');
    const saveAnywayButton = modal.querySelector('#ap-duplicate-save-anyway');
    const cancelButton = modal.querySelector('#ap-duplicate-cancel');

    viewButton?.addEventListener('click', () => {
      // Open existing application in new tab
      window.open(`${apiUrl}/applications/${topDuplicate.id}`, '_blank');
      document.body.removeChild(overlay);
      resolve(false); // Don't continue with save
    });

    saveAnywayButton?.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(true); // Continue with save
    });

    cancelButton?.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(false); // Don't continue with save
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
        resolve(false);
      }
    });
  });
}

// Update button to "Already Saved" state
function updateButtonToSaved() {
  const button = document.getElementById('applicationpoint-save-btn');
  if (!button) return;

  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
    Saved
  `;
  button.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
  button.style.pointerEvents = 'none';
  button.style.opacity = '0.9';
}

// Keyboard shortcut handler
function handleKeyboardShortcut(event: KeyboardEvent) {
  // Ctrl+Shift+S (Windows/Linux) or Cmd+Shift+S (Mac)
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
    event.preventDefault();
    console.log('ApplicationPoint: Keyboard shortcut triggered (Ctrl+Shift+S)');
    handleSaveJob();
  }
}

// Initialize: inject button when page is ready
function init() {
  // Always add keyboard shortcut (works everywhere, even if button doesn't show)
  document.addEventListener('keydown', handleKeyboardShortcut);
  console.log('ApplicationPoint: Keyboard shortcut enabled (Ctrl+Shift+S or Cmd+Shift+S)');

  // Check if we should show the button on this page
  const shouldShowButton = isLinkedIn || isIndeed || isGenericJobPage;

  if (shouldShowButton) {
    console.log('ApplicationPoint: Detected job page, will inject save button');

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      createSaveButton();
    } else {
      window.addEventListener('load', createSaveButton);
    }

    // Also watch for navigation changes (SPAs)
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('ApplicationPoint: URL changed, re-checking page...');

        // Re-check if this is a job page after navigation
        try {
          const isStillJobPage = isLinkedIn || isIndeed || looksLikeJobPage();
          if (isStillJobPage) {
            setTimeout(createSaveButton, 1000); // Wait for page content to load
          }
        } catch (error) {
          console.error('ApplicationPoint: Error checking if job page:', error);
          // Still try to show button on LinkedIn/Indeed
          if (isLinkedIn || isIndeed) {
            setTimeout(createSaveButton, 1000);
          }
        }
      }
    });

    // Wrap observer in try-catch to handle any DOM access issues
    try {
      observer.observe(document.body, { subtree: true, childList: true });
    } catch (error) {
      console.error('ApplicationPoint: Error setting up observer:', error);
      // Fallback: just create button once
      setTimeout(createSaveButton, 2000);
    }
  } else {
    console.log('ApplicationPoint: Not a job page, but keyboard shortcut still available');
    console.log('ApplicationPoint: Press Ctrl+Shift+S (or Cmd+Shift+S) to save any job');
  }
}

init();

export {};
