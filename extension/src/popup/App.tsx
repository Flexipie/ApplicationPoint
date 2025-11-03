import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [apiUrl, setApiUrl] = useState('http://localhost:3000');

  useEffect(() => {
    // Load saved API URL
    chrome.storage.local.get(['apiUrl'], (result) => {
      if (result.apiUrl) {
        setApiUrl(result.apiUrl);
      }
    });
  }, []);

  const handleOpenApp = () => {
    chrome.tabs.create({ url: `${apiUrl}/applications` });
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
      </div>

      {/* Main content */}
      <div className="content">
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
      </div>

      {/* Footer */}
      <div className="footer">
        <p>Version 0.1.0</p>
      </div>
    </div>
  );
}
