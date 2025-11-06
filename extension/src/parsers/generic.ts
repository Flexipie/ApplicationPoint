// Generic job parser - fallback for unsupported sites
// Uses heuristics, structured data, and meta tags to extract job information

export interface JobData {
  jobTitle: string;
  companyName: string;
  location: string | null;
  salaryRange: string | null;
  applyUrl: string;
  descriptionPreview: string | null;
  source: 'generic';
  currentStatus: 'saved';
}

/**
 * Extract JSON-LD structured data from the page
 * Many job sites use schema.org JobPosting markup
 */
function extractFromJSONLD(): Partial<JobData> | null {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');

  for (const script of Array.from(scripts)) {
    try {
      const data = JSON.parse(script.textContent || '');

      // Check if it's a JobPosting
      if (data['@type'] === 'JobPosting' || data.type === 'JobPosting') {
        return {
          jobTitle: data.title || data.name || null,
          companyName: data.hiringOrganization?.name || data.company?.name || null,
          location: extractLocationFromJSONLD(data.jobLocation),
          salaryRange: extractSalaryFromJSONLD(data.baseSalary),
          descriptionPreview: data.description?.substring(0, 1000) || null,
        };
      }

      // Sometimes it's wrapped in @graph
      if (data['@graph']) {
        const jobPosting = data['@graph'].find((item: any) =>
          item['@type'] === 'JobPosting' || item.type === 'JobPosting'
        );
        if (jobPosting) {
          return {
            jobTitle: jobPosting.title || jobPosting.name || null,
            companyName: jobPosting.hiringOrganization?.name || jobPosting.company?.name || null,
            location: extractLocationFromJSONLD(jobPosting.jobLocation),
            salaryRange: extractSalaryFromJSONLD(jobPosting.baseSalary),
            descriptionPreview: jobPosting.description?.substring(0, 1000) || null,
          };
        }
      }
    } catch (error) {
      // Invalid JSON, skip
      continue;
    }
  }

  return null;
}

function extractLocationFromJSONLD(locationData: any): string | null {
  if (!locationData) return null;

  if (typeof locationData === 'string') return locationData;

  if (locationData.address) {
    const addr = locationData.address;
    if (typeof addr === 'string') return addr;

    // Build location string from structured address
    const parts = [
      addr.addressLocality,
      addr.addressRegion,
      addr.addressCountry
    ].filter(Boolean);

    if (parts.length > 0) return parts.join(', ');
  }

  if (locationData.name) return locationData.name;

  return null;
}

function extractSalaryFromJSONLD(salaryData: any): string | null {
  if (!salaryData) return null;

  if (typeof salaryData === 'string') return salaryData;

  if (salaryData.value) {
    const value = salaryData.value;
    const currency = salaryData.currency || '$';
    const unitText = salaryData.unitText || '';

    if (value.minValue && value.maxValue) {
      return `${currency}${value.minValue} - ${currency}${value.maxValue} ${unitText}`.trim();
    }

    return `${currency}${value} ${unitText}`.trim();
  }

  return null;
}

/**
 * Extract from meta tags (Open Graph, Twitter Cards, etc.)
 */
function extractFromMetaTags(): Partial<JobData> {
  const result: Partial<JobData> = {};

  // Job title from meta tags
  const titleMeta = document.querySelector('meta[property="og:title"], meta[name="twitter:title"]');
  if (titleMeta) {
    result.jobTitle = titleMeta.getAttribute('content') || undefined;
  }

  // Description from meta tags
  const descMeta = document.querySelector('meta[property="og:description"], meta[name="twitter:description"], meta[name="description"]');
  if (descMeta) {
    const desc = descMeta.getAttribute('content');
    if (desc) {
      result.descriptionPreview = desc.substring(0, 1000);
    }
  }

  return result;
}

/**
 * Extract using heuristics - look for common patterns
 */
function extractUsingHeuristics(): Partial<JobData> {
  const result: Partial<JobData> = {};

  // Job title - look for h1 or elements with "job", "title", "position" in class/id
  const titleSelectors = [
    'h1[class*="job"]',
    'h1[class*="title"]',
    'h1[class*="position"]',
    '[class*="job-title"]',
    '[class*="jobTitle"]',
    '[id*="job-title"]',
    '[id*="jobTitle"]',
    'h1',  // Last resort: first h1
  ];

  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.trim()) {
      const text = element.textContent.trim();
      // Validate it looks like a job title (not too long, has words)
      if (text.length > 3 && text.length < 200 && /\w/.test(text)) {
        result.jobTitle = text;
        break;
      }
    }
  }

  // Company name - look for common patterns
  const companySelectors = [
    '[class*="company"]',
    '[class*="employer"]',
    '[class*="organization"]',
    '[id*="company"]',
    '[data-company]',
    'a[href*="/company/"]',
    'a[href*="/companies/"]',
    '[itemprop="hiringOrganization"]',
  ];

  for (const selector of companySelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.trim()) {
      const text = element.textContent.trim();
      // Validate it looks like a company name
      if (text.length > 1 && text.length < 100 && /\w/.test(text)) {
        result.companyName = text;
        break;
      }
    }
  }

  // Location - look for common patterns
  const locationSelectors = [
    '[class*="location"]',
    '[class*="address"]',
    '[id*="location"]',
    '[data-location]',
    '[itemprop="jobLocation"]',
  ];

  for (const selector of locationSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.trim()) {
      const text = element.textContent.trim();
      // Validate it looks like a location (has city/state/country patterns)
      if (text.length > 2 && text.length < 200 && /[A-Z]/.test(text)) {
        result.location = text;
        break;
      }
    }
  }

  // Salary - look for $ signs and common salary keywords
  const salarySelectors = [
    '[class*="salary"]',
    '[class*="compensation"]',
    '[class*="pay"]',
    '[id*="salary"]',
    '[data-salary]',
  ];

  for (const selector of salarySelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.includes('$') || element?.textContent?.match(/\d{2,3},?\d{3}/)) {
      result.salaryRange = element.textContent.trim();
      break;
    }
  }

  // Description - look for large text blocks
  const descriptionSelectors = [
    '[class*="description"]',
    '[class*="job-details"]',
    '[class*="content"]',
    '[id*="description"]',
    '[itemprop="description"]',
    'article',
    'main',
  ];

  for (const selector of descriptionSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent && element.textContent.trim().length > 200) {
      result.descriptionPreview = element.textContent.trim().substring(0, 1000);
      break;
    }
  }

  return result;
}

/**
 * Main generic parser function
 * Tries multiple strategies in order of reliability
 */
export function parseGenericJob(): JobData | null {
  try {
    console.log('Generic parser: Attempting to parse job data...');

    // Strategy 1: Try JSON-LD structured data (most reliable)
    const jsonLDData = extractFromJSONLD();

    // Strategy 2: Try meta tags
    const metaData = extractFromMetaTags();

    // Strategy 3: Try heuristics
    const heuristicData = extractUsingHeuristics();

    // Merge all strategies (JSON-LD takes priority, then meta, then heuristics)
    const merged = {
      ...heuristicData,
      ...metaData,
      ...jsonLDData,
    };

    // Ensure we have required fields
    const jobTitle = merged.jobTitle || '';
    const companyName = merged.companyName || '';

    // If we're missing critical fields, try to extract from page title
    let finalJobTitle = jobTitle;
    let finalCompanyName = companyName;

    if (!jobTitle && document.title) {
      // Many sites use format like "Job Title - Company Name"
      const titleParts = document.title.split(/[-–|]/);
      if (titleParts.length >= 2) {
        finalJobTitle = titleParts[0].trim();
        finalCompanyName = titleParts[1].trim().replace(/\s+job.*$/i, '').trim();
      } else {
        finalJobTitle = document.title.split('|')[0].trim();
      }
    }

    // Validate we have minimum required data
    if (!finalJobTitle || !finalCompanyName) {
      console.warn('Generic parser: Missing required fields', {
        jobTitle: finalJobTitle,
        companyName: finalCompanyName
      });
      return null;
    }

    const result: JobData = {
      jobTitle: finalJobTitle,
      companyName: finalCompanyName,
      location: merged.location || null,
      salaryRange: merged.salaryRange || null,
      applyUrl: window.location.href,
      descriptionPreview: merged.descriptionPreview || null,
      source: 'generic',
      currentStatus: 'saved',
    };

    console.log('Generic parser: Successfully parsed job data', result);
    return result;
  } catch (error) {
    console.error('Generic parser: Error parsing job:', error);
    return null;
  }
}

/**
 * Check if the current page looks like a job posting
 * Used to determine whether to show the save button
 */
export function looksLikeJobPage(): boolean {
  // Check URL patterns
  const url = window.location.href.toLowerCase();
  const jobUrlPatterns = [
    '/job/',
    '/jobs/',
    '/career/',
    '/careers/',
    '/position/',
    '/positions/',
    '/opening/',
    '/opportunities/',
    '/apply/',
  ];

  if (jobUrlPatterns.some(pattern => url.includes(pattern))) {
    return true;
  }

  // Check for JSON-LD JobPosting
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of Array.from(scripts)) {
    try {
      const data = JSON.parse(script.textContent || '');
      if (data['@type'] === 'JobPosting' || data.type === 'JobPosting') {
        return true;
      }
      if (data['@graph']) {
        const hasJobPosting = data['@graph'].some((item: any) =>
          item['@type'] === 'JobPosting' || item.type === 'JobPosting'
        );
        if (hasJobPosting) return true;
      }
    } catch (error) {
      continue;
    }
  }

  // Check for job-related keywords in the page
  const bodyText = document.body.textContent?.toLowerCase() || '';
  const jobKeywords = ['apply now', 'job description', 'responsibilities', 'qualifications', 'hiring organization'];
  const keywordMatches = jobKeywords.filter(keyword => bodyText.includes(keyword)).length;

  // If we have multiple job keywords, it's probably a job page
  return keywordMatches >= 3;
}
