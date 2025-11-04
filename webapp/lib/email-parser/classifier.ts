import { EmailType, ParsedEmail } from '../gmail/types';
import {
  EMAIL_PATTERNS,
  EXCLUDE_PATTERNS,
  COMPANY_PATTERNS,
  JOB_TITLE_PATTERNS,
} from './patterns';

interface ClassificationScore {
  type: EmailType;
  score: number;
  matchedPatterns: string[];
}

export class EmailClassifier {
  /**
   * Classify an email and return the type with confidence score
   */
  static classify(
    subject: string,
    body: string,
    from: string
  ): { type: EmailType; confidence: number; matches: string[] } {
    // Check if email should be excluded (newsletter, digest, etc.)
    if (this.shouldExclude(subject, body)) {
      return { type: EmailType.UNKNOWN, confidence: 0, matches: [] };
    }

    const scores: ClassificationScore[] = [];

    // Score each email type based on pattern matches
    for (const pattern of EMAIL_PATTERNS) {
      const score = this.scorePattern(pattern, subject, body, from);
      if (score.score > 0) {
        scores.push(score);
      }
    }

    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);

    // If no matches, return UNKNOWN
    if (scores.length === 0 || scores[0].score < 0.3) {
      return { type: EmailType.UNKNOWN, confidence: 0, matches: [] };
    }

    // Return best match
    const best = scores[0];
    return {
      type: best.type,
      confidence: Math.min(best.score, 1.0), // Cap at 1.0
      matches: best.matchedPatterns,
    };
  }

  /**
   * Check if email should be excluded (not job-related)
   */
  private static shouldExclude(subject: string, body: string): boolean {
    const text = `${subject} ${body}`.toLowerCase();
    return EXCLUDE_PATTERNS.some((pattern) => pattern.test(text));
  }

  /**
   * Score a pattern against email content
   */
  private static scorePattern(
    pattern: any,
    subject: string,
    body: string,
    from: string
  ): ClassificationScore {
    let score = 0;
    const matches: string[] = [];

    // Check subject patterns
    if (pattern.patterns.subject) {
      for (const regex of pattern.patterns.subject) {
        if (regex.test(subject)) {
          score += pattern.weight * 0.6; // Subject matches are weighted heavily
          matches.push(`subject: ${regex.source}`);
        }
      }
    }

    // Check body patterns
    if (pattern.patterns.body) {
      for (const regex of pattern.patterns.body) {
        if (regex.test(body)) {
          score += pattern.weight * 0.4; // Body matches are weighted less
          matches.push(`body: ${regex.source}`);
        }
      }
    }

    // Check from patterns
    if (pattern.patterns.from) {
      for (const regex of pattern.patterns.from) {
        if (regex.test(from)) {
          score += pattern.weight * 0.3;
          matches.push(`from: ${regex.source}`);
        }
      }
    }

    return {
      type: pattern.type,
      score,
      matchedPatterns: matches,
    };
  }

  /**
   * Extract company name from email content
   */
  static extractCompany(subject: string, body: string, from: string): string | null {
    const text = `${subject} ${body}`;

    // Try each company pattern
    for (const [key, pattern] of Object.entries(COMPANY_PATTERNS)) {
      const match = text.match(pattern);
      if (match && match[2]) {
        return match[2].trim();
      }
    }

    // Fallback: extract from email domain
    const domainMatch = from.match(/@([^.]+)\./);
    if (domainMatch) {
      const domain = domainMatch[1];
      // Capitalize first letter
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    return null;
  }

  /**
   * Extract job title from email content
   */
  static extractJobTitle(subject: string, body: string): string | null {
    const text = `${subject} ${body}`;

    for (const pattern of JOB_TITLE_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const title = match[1].trim();
        // Filter out if it's too long or too short
        if (title.length > 5 && title.length < 100) {
          return title;
        }
      }
    }

    return null;
  }

  /**
   * Parse email into structured data
   */
  static parse(
    messageId: string,
    from: string,
    subject: string,
    body: string,
    date: Date
  ): ParsedEmail {
    // Classify email type
    const classification = this.classify(subject, body, from);

    // Extract data
    const companyName = this.extractCompany(subject, body, from);
    const jobTitle = this.extractJobTitle(subject, body);

    return {
      messageId,
      from,
      subject,
      body: body.substring(0, 1000), // Limit body length
      date,
      type: classification.type,
      confidence: classification.confidence,
      companyName,
      extractedData: {
        jobTitle: jobTitle || undefined,
      },
    };
  }
}
