// Background service worker for ApplicationPoint extension
import { addToQueue, processQueue, getPendingCount, startQueueProcessor } from './offline-queue';

console.log('ApplicationPoint background service worker started');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Background received message:', request);

  if (request.type === 'SAVE_JOB') {
    // Handle job save request with offline queue support
    handleSaveJobWithQueue(request.data)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate async response
    return true;
  }

  if (request.type === 'CHECK_DUPLICATE') {
    // Check for duplicate applications
    handleCheckDuplicate(request.data)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  if (request.type === 'GET_AUTH_TOKEN') {
    // Get stored auth token
    chrome.storage.local.get(['authToken'], (result) => {
      sendResponse({ authToken: result.authToken || null });
    });
    return true;
  }

  if (request.type === 'GET_PENDING_COUNT') {
    // Get count of pending offline jobs
    getPendingCount()
      .then((count) => {
        sendResponse({ success: true, count });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.type === 'PROCESS_QUEUE') {
    // Manually trigger queue processing
    processQueue(saveJobToAPI)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Function to check for duplicate applications
async function handleCheckDuplicate(jobData: { jobTitle: string; companyName: string; applyUrl?: string }) {
  try {
    // Get API URL from storage or use default
    const { apiUrl } = await chrome.storage.local.get(['apiUrl']);
    const baseUrl = apiUrl || 'http://localhost:3000';

    // Build query parameters
    const params = new URLSearchParams({
      jobTitle: jobData.jobTitle,
      companyName: jobData.companyName,
    });

    if (jobData.applyUrl) {
      params.append('applyUrl', jobData.applyUrl);
    }

    const response = await fetch(`${baseUrl}/api/applications/check-duplicate?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for auth
    });

    if (!response.ok) {
      throw new Error(`Failed to check duplicates: ${response.statusText}`);
    }

    const result = await response.json();
    return { ...result, apiUrl: baseUrl };
  } catch (error) {
    console.error('Error checking duplicates:', error);
    throw error;
  }
}

// Function to save job to API (used by both direct saves and queue processor)
async function saveJobToAPI(jobData: any) {
  try {
    // Get API URL from storage or use default
    const { apiUrl } = await chrome.storage.local.get(['apiUrl']);
    const baseUrl = apiUrl || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for auth
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      throw new Error(`Failed to save job: ${response.statusText}`);
    }

    const result = await response.json();
    // Include the API URL in the response so content script can use it
    return { ...result, apiUrl: baseUrl };
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
}

// Function to save job with offline queue fallback
async function handleSaveJobWithQueue(jobData: any) {
  try {
    // First attempt: try to save directly
    const result = await saveJobToAPI(jobData);
    console.log('Job saved successfully');
    return result;
  } catch (error: any) {
    // Failed - add to offline queue
    console.log('Save failed, adding to offline queue:', error.message);

    try {
      const queueId = await addToQueue(jobData);

      // Return a special response indicating job was queued
      return {
        queued: true,
        queueId,
        message: 'Job saved to offline queue. Will retry automatically.',
      };
    } catch (queueError: any) {
      console.error('Failed to add to queue:', queueError);
      throw new Error(`Save failed and could not queue: ${error.message}`);
    }
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('ApplicationPoint extension installed!');
    // Set default API URL
    chrome.storage.local.set({ apiUrl: 'http://localhost:3000' });
  }

  // Start queue processor on install/update
  startQueueProcessor(saveJobToAPI);
});

// Start queue processor on service worker startup
startQueueProcessor(saveJobToAPI);

export {};
