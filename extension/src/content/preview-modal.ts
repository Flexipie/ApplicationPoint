// Preview modal for job data before saving

export interface JobData {
  jobTitle: string;
  companyName: string;
  location: string | null;
  salaryRange: string | null;
  applyUrl: string;
  source: string;
}

export function createPreviewModal(jobData: JobData, onSave: (editedData: JobData) => void, onCancel: () => void) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'applicationpoint-modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  `;

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'applicationpoint-modal';
  modal.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  modal.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      #applicationpoint-modal input,
      #applicationpoint-modal textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.2s;
      }
      #applicationpoint-modal input:focus,
      #applicationpoint-modal textarea:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
      #applicationpoint-modal label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
      }
      #applicationpoint-modal .field {
        margin-bottom: 16px;
      }
      #applicationpoint-modal .buttons {
        display: flex;
        gap: 10px;
        margin-top: 24px;
      }
      #applicationpoint-modal button {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }
      #applicationpoint-modal .save-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      #applicationpoint-modal .save-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      #applicationpoint-modal .cancel-btn {
        background: #f3f4f6;
        color: #374151;
      }
      #applicationpoint-modal .cancel-btn:hover {
        background: #e5e7eb;
      }
    </style>

    <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #111827;">
      Preview Job Application
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">
      Review and edit the details before saving
    </p>

    <div class="field">
      <label for="job-title">Job Title *</label>
      <input type="text" id="job-title" value="${escapeHtml(jobData.jobTitle)}" required />
    </div>

    <div class="field">
      <label for="company-name">Company Name *</label>
      <input type="text" id="company-name" value="${escapeHtml(jobData.companyName)}" required />
    </div>

    <div class="field">
      <label for="location">Location</label>
      <input type="text" id="location" value="${escapeHtml(jobData.location || '')}" placeholder="e.g. Stockholm, Sweden" />
    </div>

    <div class="field">
      <label for="salary">Salary Range</label>
      <input type="text" id="salary" value="${escapeHtml(jobData.salaryRange || '')}" placeholder="e.g. $80k - $120k" />
    </div>

    <div class="field">
      <label for="url">Job URL</label>
      <input type="url" id="url" value="${escapeHtml(jobData.applyUrl)}" readonly style="background: #f9fafb; color: #6b7280;" />
    </div>

    <div class="buttons">
      <button class="cancel-btn" id="cancel-btn">Cancel</button>
      <button class="save-btn" id="save-btn">
        <span style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          Save Application
        </span>
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Get form elements
  const jobTitleInput = document.getElementById('job-title') as HTMLInputElement;
  const companyNameInput = document.getElementById('company-name') as HTMLInputElement;
  const locationInput = document.getElementById('location') as HTMLInputElement;
  const salaryInput = document.getElementById('salary') as HTMLInputElement;
  const urlInput = document.getElementById('url') as HTMLInputElement;
  const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
  const cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;

  // Handle save
  saveBtn.addEventListener('click', () => {
    const editedData: JobData = {
      jobTitle: jobTitleInput.value.trim(),
      companyName: companyNameInput.value.trim(),
      location: locationInput.value.trim() || null,
      salaryRange: salaryInput.value.trim() || null,
      applyUrl: urlInput.value.trim(),
      source: jobData.source,
    };

    if (!editedData.jobTitle || !editedData.companyName) {
      alert('Job title and company name are required');
      return;
    }

    removeModal();
    onSave(editedData);
  });

  // Handle cancel
  cancelBtn.addEventListener('click', () => {
    removeModal();
    onCancel();
  });

  // Handle escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      removeModal();
      onCancel();
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Handle click outside
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      removeModal();
      onCancel();
    }
  });

  function removeModal() {
    document.removeEventListener('keydown', handleEscape);
    overlay.remove();
  }
}

function escapeHtml(text: string | null): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
