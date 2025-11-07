// Success toast notification with link to view application

export function showSuccessToast(applicationId: string, apiUrl: string) {
  // Remove existing toast if any
  const existing = document.getElementById('applicationpoint-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'applicationpoint-toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100000;
    background: white;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 400px;
    animation: slideIn 0.3s ease, slideOut 0.3s ease 4.7s;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  toast.innerHTML = `
    <style>
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
      #applicationpoint-toast .icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-center;
      }
      #applicationpoint-toast .content {
        flex: 1;
        min-width: 0;
      }
      #applicationpoint-toast .title {
        font-size: 14px;
        font-weight: 600;
        color: #111827;
        margin: 0 0 4px 0;
      }
      #applicationpoint-toast .message {
        font-size: 13px;
        color: #6b7280;
        margin: 0;
      }
      #applicationpoint-toast .actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      #applicationpoint-toast .view-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        transition: transform 0.2s;
      }
      #applicationpoint-toast .view-btn:hover {
        transform: translateY(-1px);
      }
      #applicationpoint-toast .close-btn {
        flex-shrink: 0;
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }
      #applicationpoint-toast .close-btn:hover {
        color: #374151;
      }
    </style>

    <div class="icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <div class="content">
      <p class="title">Application Saved!</p>
      <p class="message">Successfully added to your tracker</p>
      <div class="actions">
        <a href="${apiUrl}/applications/${applicationId}" target="_blank" class="view-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          View Application
        </a>
      </div>
    </div>
    <button class="close-btn" id="toast-close">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  document.body.appendChild(toast);

  // Handle close button
  const closeBtn = document.getElementById('toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });
  }

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

export function showErrorToast(message: string) {
  // Remove existing toast if any
  const existing = document.getElementById('applicationpoint-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'applicationpoint-toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100000;
    background: white;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 400px;
    animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  toast.innerHTML = `
    <style>
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    </style>

    <div style="flex-shrink: 0; width: 40px; height: 40px; background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    </div>
    <div style="flex: 1;">
      <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 4px 0;">Error</p>
      <p style="font-size: 13px; color: #6b7280; margin: 0;">${escapeHtml(message)}</p>
    </div>
    <button id="toast-close" style="flex-shrink: 0; background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  document.body.appendChild(toast);

  // Handle close button
  const closeBtn = document.getElementById('toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });
  }

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 3000);
}

export function showQueuedToast(message: string) {
  // Remove existing toast if any
  const existing = document.getElementById('applicationpoint-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'applicationpoint-toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100000;
    background: white;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 400px;
    animation: slideIn 0.3s ease, slideOut 0.3s ease 3.7s;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  toast.innerHTML = `
    <style>
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    </style>

    <div style="flex-shrink: 0; width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    </div>
    <div style="flex: 1;">
      <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 4px 0;">Saved to Queue</p>
      <p style="font-size: 13px; color: #6b7280; margin: 0;">${escapeHtml(message)}</p>
    </div>
    <button id="toast-close" style="flex-shrink: 0; background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  document.body.appendChild(toast);

  // Handle close button
  const closeBtn = document.getElementById('toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });
  }

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 4000);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
