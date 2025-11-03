// Indeed job parser

export interface JobData {
  jobTitle: string;
  companyName: string;
  location: string | null;
  salaryRange: string | null;
  applyUrl: string;
  descriptionPreview: string | null;
  source: 'indeed';
  currentStatus: 'saved';
}

export function parseIndeedJob(): JobData | null {
  try {
    // Job title
    const titleSelectors = [
      '.jobsearch-JobInfoHeader-title',
      'h1[class*="jobTitle"]',
      '[data-testid="jobsearch-JobInfoHeader-title"]',
    ];
    
    let jobTitle = '';
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        jobTitle = element.textContent.trim();
        break;
      }
    }

    // Company name
    const companySelectors = [
      '[data-testid="inlineHeader-companyName"]',
      '.jobsearch-InlineCompanyRating-companyHeader a',
      '[data-company-name="true"]',
    ];
    
    let companyName = '';
    for (const selector of companySelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        companyName = element.textContent.trim();
        break;
      }
    }

    // Location
    const locationSelectors = [
      '[data-testid="inlineHeader-companyLocation"]',
      '.jobsearch-JobInfoHeader-subtitle div',
      '[data-testid="job-location"]',
    ];
    
    let location: string | null = null;
    for (const selector of locationSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        location = element.textContent.trim();
        break;
      }
    }

    // Salary range (if available)
    const salarySelectors = [
      '[data-testid="attribute_snippet_testid"]',
      '.jobsearch-JobMetadataHeader-item',
      '#salaryInfoAndJobType',
    ];
    
    let salaryRange: string | null = null;
    for (const selector of salarySelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.includes('$') || element?.textContent?.includes('hour') || element?.textContent?.includes('year')) {
        salaryRange = element.textContent.trim();
        break;
      }
    }

    // Description preview (first 1000 chars)
    const descriptionSelectors = [
      '#jobDescriptionText',
      '[data-testid="jobsearch-JobComponent-description"]',
      '.jobsearch-jobDescriptionText',
    ];
    
    let descriptionPreview: string | null = null;
    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        descriptionPreview = element.textContent.trim().substring(0, 1000);
        break;
      }
    }

    // Current URL
    const applyUrl = window.location.href;

    // Validate required fields
    if (!jobTitle || !companyName) {
      console.error('Indeed parser: Missing required fields', { jobTitle, companyName });
      return null;
    }

    return {
      jobTitle,
      companyName,
      location,
      salaryRange,
      applyUrl,
      descriptionPreview,
      source: 'indeed',
      currentStatus: 'saved',
    };
  } catch (error) {
    console.error('Error parsing Indeed job:', error);
    return null;
  }
}
