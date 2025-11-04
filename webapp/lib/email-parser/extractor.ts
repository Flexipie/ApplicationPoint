import { DATE_PATTERNS } from './patterns';

export class DataExtractor {
  /**
   * Extract interview or deadline dates from email content
   */
  static extractDates(text: string): Date[] {
    const dates: Date[] = [];
    const lowerText = text.toLowerCase();

    // Look for date patterns
    for (const pattern of DATE_PATTERNS) {
      const matches = text.matchAll(new RegExp(pattern, 'gi'));
      for (const match of matches) {
        try {
          const date = this.parseDate(match[0]);
          if (date) {
            dates.push(date);
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    }

    return dates;
  }

  /**
   * Parse a date string into a Date object
   */
  private static parseDate(dateStr: string): Date | null {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return null;
      }
      // Only accept dates in the future or within last 7 days
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      
      if (date >= sevenDaysAgo && date <= oneYearFromNow) {
        return date;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Extract the most likely interview date from email
   */
  static extractInterviewDate(subject: string, body: string): Date | null {
    const text = `${subject} ${body}`;
    const dates = this.extractDates(text);
    
    // Return first future date (most likely the interview date)
    const now = new Date();
    const futureDates = dates.filter((d) => d > now);
    
    return futureDates.length > 0 ? futureDates[0] : null;
  }

  /**
   * Extract deadline date from email
   */
  static extractDeadline(subject: string, body: string): Date | null {
    const text = `${subject} ${body}`;
    
    // Look for deadline keywords near dates
    const deadlineKeywords = [
      'deadline',
      'by',
      'before',
      'due',
      'respond by',
      'complete by',
    ];

    const lowerText = text.toLowerCase();
    let closestDate: Date | null = null;
    let closestDistance = Infinity;

    const dates = this.extractDates(text);
    
    for (const keyword of deadlineKeywords) {
      const keywordIndex = lowerText.indexOf(keyword);
      if (keywordIndex === -1) continue;

      // Find date closest to this keyword
      for (const date of dates) {
        const dateStr = date.toISOString();
        const dateIndex = text.indexOf(dateStr);
        if (dateIndex === -1) continue;

        const distance = Math.abs(dateIndex - keywordIndex);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestDate = date;
        }
      }
    }

    return closestDate;
  }

  /**
   * Extract salary information from email
   */
  static extractSalary(text: string): string | null {
    const salaryPatterns = [
      /\$[\d,]+(?:k|K)?(?:\s*-\s*\$[\d,]+(?:k|K)?)?(?:\s*(?:per|\/)\s*(?:year|annum|yr))?/g,
      /£[\d,]+(?:k|K)?(?:\s*-\s*£[\d,]+(?:k|K)?)?(?:\s*(?:per|\/)\s*(?:year|annum|yr))?/g,
      /€[\d,]+(?:k|K)?(?:\s*-\s*€[\d,]+(?:k|K)?)?(?:\s*(?:per|\/)\s*(?:year|annum|yr))?/g,
      /salary.*?\$?[\d,]+(?:k|K)?/gi,
      /compensation.*?\$?[\d,]+(?:k|K)?/gi,
    ];

    for (const pattern of salaryPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }

    return null;
  }

  /**
   * Extract location from email
   */
  static extractLocation(text: string): string | null {
    const locationPatterns = [
      /location:?\s*([A-Z][A-Za-z\s,]+?)(?=\n|$)/i,
      /(?:in|at)\s+([A-Z][A-Za-z\s]+?,\s*[A-Z]{2,})/,
      /remote/i,
      /hybrid/i,
      /on-site/i,
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] ? match[1].trim() : match[0].trim();
      }
    }

    return null;
  }

  /**
   * Check if job is remote
   */
  static isRemote(text: string): boolean {
    const remoteKeywords = [
      /\bremote\b/i,
      /work from (home|anywhere)/i,
      /fully remote/i,
      /100% remote/i,
    ];

    return remoteKeywords.some((keyword) => keyword.test(text));
  }
}
