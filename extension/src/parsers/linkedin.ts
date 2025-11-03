// LinkedIn job parser

export interface JobData {
  jobTitle: string;
  companyName: string;
  location: string | null;
  salaryRange: string | null;
  applyUrl: string;
  descriptionPreview: string | null;
  source: 'linkedin';
  currentStatus: 'saved';
}

export function parseLinkedInJob(): JobData | null {
  try {
    // Job title - multiple selectors for different LinkedIn layouts
    const titleSelectors = [
      '.top-card-layout__title',
      '.job-details-jobs-unified-top-card__job-title',
      'h1.t-24',
      '[data-test-job-title]',
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
      '.top-card-layout__second-subline a',
      '.job-details-jobs-unified-top-card__company-name',
      '[data-test-employer-name]',
      '.topcard__org-name-link',
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
      '.top-card-layout__second-subline .topcard__flavor--bullet',
      '.job-details-jobs-unified-top-card__bullet',
      '[data-test-job-location]',
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
      '.job-details-jobs-unified-top-card__job-insight--highlight',
      '.compensation__salary',
    ];
    
    let salaryRange: string | null = null;
    for (const selector of salarySelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.includes('$')) {
        salaryRange = element.textContent.trim();
        break;
      }
    }

    // Description preview (first 1000 chars)
    const descriptionSelectors = [
      '.jobs-description__content',
      '.job-details-jobs-unified-top-card__job-description',
      '[data-test-job-description]',
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
      console.error('LinkedIn parser: Missing required fields', { jobTitle, companyName });
      return null;
    }

    return {
      jobTitle,
      companyName,
      location,
      salaryRange,
      applyUrl,
      descriptionPreview,
      source: 'linkedin',
      currentStatus: 'saved',
    };
  } catch (error) {
    console.error('Error parsing LinkedIn job:', error);
    return null;
  }
}
