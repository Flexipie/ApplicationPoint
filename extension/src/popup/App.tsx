import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [apiUrl, setApiUrl] = useState('http://localhost:3000');
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved API URL
    chrome.storage.local.get(['apiUrl'], (result) => {
      if (result.apiUrl) {
        setApiUrl(result.apiUrl);
        setTempUrl(result.apiUrl);
      } else {
        setTempUrl('http://localhost:3000');
      }
    });
  }, []);

  const handleOpenApp = () => {
    chrome.tabs.create({ url: `${apiUrl}/applications` });
  };

  const handleSaveSettings = () => {
    chrome.storage.local.set({ apiUrl: tempUrl }, () => {
      setApiUrl(tempUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="popup">
      {/* Header */}
      <div className="header">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h1>ApplicationPoint</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginLeft: 'auto',
            padding: '4px'
          }}
          title="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m5.2-17.2l-4.2 4.2m0 6l-4.2 4.2M23 12h-6m-6 0H5m17.2-5.2l-4.2 4.2m0 6l-4.2 4.2"></path>
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="content">
        {showSettings ? (
          <div className="settings-panel">
            <h2>Settings</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                API URL
              </label>
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://your-app.vercel.app"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Enter your ApplicationPoint URL (e.g., https://your-app.vercel.app)
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSaveSettings} className="primary-btn" style={{ flex: 1 }}>
                {saved ? '✓ Saved!' : 'Save'}
              </button>
              <button onClick={() => setShowSettings(false)} style={{
                flex: 1,
                padding: '8px 16px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2>Quick Save Extension</h2>
            <p>Save job postings from LinkedIn and Indeed with one click!</p>

            <div className="features">
          <div className="feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Auto-detect job details</span>
          </div>
          <div className="feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Save to your tracker instantly</span>
          </div>
          <div className="feature">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Works on LinkedIn & Indeed</span>
          </div>
        </div>

        <div className="instructions">
          <h3>How to use:</h3>
          <ol>
            <li>Navigate to a job posting on LinkedIn or Indeed</li>
            <li>Click the "Save to ApplicationPoint" button</li>
            <li>Job details are saved automatically!</li>
          </ol>
        </div>

        <button onClick={handleOpenApp} className="primary-btn">
          Open ApplicationPoint
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        <p>Version 0.1.0 {!showSettings && `• ${apiUrl.includes('localhost') ? 'Development' : 'Production'}`}</p>
      </div>
    </div>
  );
}
