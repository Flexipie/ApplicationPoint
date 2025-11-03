// Content script for ApplicationPoint extension
import { parseLinkedInJob } from '../parsers/linkedin';
import { parseIndeedJob } from '../parsers/indeed';

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

// Handle save job click
async function handleSaveJob() {
  const button = document.getElementById('applicationpoint-save-btn');
  if (!button) return;

  // Show loading state
  const originalContent = button.innerHTML;
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
      <circle cx="12" cy="12" r="10"></circle>
    </svg>
    Saving...
  `;
  button.style.pointerEvents = 'none';
  button.style.opacity = '0.7';

  // Add spinning animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spin { animation: spin 1s linear infinite; }
  `;
  document.head.appendChild(style);

  try {
    // Parse job data based on site
    let jobData = null;
    if (isLinkedIn) {
      jobData = parseLinkedInJob();
    } else if (isIndeed) {
      jobData = parseIndeedJob();
    }

    if (!jobData) {
      throw new Error('Could not parse job data from this page');
    }

    // Send to background script to save via API
    const response = await chrome.runtime.sendMessage({
      type: 'SAVE_JOB',
      data: jobData,
    });

    if (response.success) {
      // Show success state
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Saved!
      `;
      button.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';

      // Reset after 2 seconds
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        button.style.pointerEvents = 'auto';
        button.style.opacity = '1';
      }, 2000);
    } else {
      throw new Error(response.error || 'Failed to save job');
    }
  } catch (error) {
    console.error('Error saving job:', error);
    
    // Show error state
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      Failed - Try again
    `;
    button.style.background = 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';

    // Reset after 3 seconds
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      button.style.pointerEvents = 'auto';
      button.style.opacity = '1';
    }, 3000);
  }
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
