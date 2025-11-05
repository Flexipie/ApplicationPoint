// Content script for ApplicationPoint extension
import { parseLinkedInJob } from '../parsers/linkedin';
import { parseIndeedJob } from '../parsers/indeed';
import { createPreviewModal, type JobData } from './preview-modal';
import { showSuccessToast, showErrorToast } from './success-toast';

console.log('ApplicationPoint content script loaded');

// Detect which site we're on
const isLinkedIn = window.location.hostname.includes('linkedin.com');
const isIndeed = window.location.hostname.includes('indeed.com');

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

// Handle save job click - show preview modal
async function handleSaveJob() {
  try {
    // Parse job data based on site
    let jobData: JobData | null = null;
    if (isLinkedIn) {
      jobData = parseLinkedInJob();
    } else if (isIndeed) {
      jobData = parseIndeedJob();
    }

    if (!jobData) {
      showErrorToast('Could not parse job data from this page');
      return;
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

// Initialize: inject button when page is ready
function init() {
  if (isLinkedIn || isIndeed) {
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      createSaveButton();
    } else {
      window.addEventListener('load', createSaveButton);
    }

    // Also watch for navigation changes (SPAs)
    let lastUrl = window.location.href;
    new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        setTimeout(createSaveButton, 1000); // Wait for page content to load
      }
    }).observe(document.body, { subtree: true, childList: true });
  }
}

init();

export {};
