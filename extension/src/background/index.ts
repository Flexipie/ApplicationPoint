// Background service worker for ApplicationPoint extension

console.log('ApplicationPoint background service worker started');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Background received message:', request);

  if (request.type === 'SAVE_JOB') {
    // Handle job save request
    handleSaveJob(request.data)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate async response
    return true;
  }

  if (request.type === 'GET_AUTH_TOKEN') {
    // Get stored auth token
    chrome.storage.local.get(['authToken'], (result) => {
      sendResponse({ authToken: result.authToken || null });
    });
    return true;
  }
});

// Function to save job to API
async function handleSaveJob(jobData: any) {
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
    return result;
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('ApplicationPoint extension installed!');
    // Set default API URL
    chrome.storage.local.set({ apiUrl: 'http://localhost:3000' });
  }
});

export {};
