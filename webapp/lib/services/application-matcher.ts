import { db } from '@/db';
import { applications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface MatchResult {
  applicationId: string;
  confidence: number; // 0-1
  matchReason: string;
}

export class ApplicationMatcher {
  /**
   * Find applications that match an email
   * Uses fuzzy matching on company name
   */
  static async findMatches(
    userId: string,
    companyName: string | null,
    jobTitle: string | null
  ): Promise<MatchResult[]> {
    if (!companyName) {
      return [];
    }

    // Get all user's applications
    const userApps = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));

    const matches: MatchResult[] = [];

    for (const app of userApps) {
      const score = this.calculateMatchScore(
        companyName,
        jobTitle,
        app.companyName,
        app.jobTitle
      );

      if (score > 0.5) {
        // Threshold: 50% confidence
        matches.push({
          applicationId: app.id,
          confidence: score,
          matchReason: this.getMatchReason(score, companyName, app.companyName),
        });
      }
    }

    // Sort by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);

    return matches;
  }

  /**
   * Calculate match score between email and application
   */
  private static calculateMatchScore(
    emailCompany: string,
    emailJobTitle: string | null,
    appCompany: string,
    appJobTitle: string
  ): number {
    let score = 0;

    // Company name matching (most important)
    const companySimilarity = this.fuzzyMatch(
      this.normalize(emailCompany),
      this.normalize(appCompany)
    );
    score += companySimilarity * 0.8; // 80% weight

    // Job title matching (bonus points)
    if (emailJobTitle && appJobTitle) {
      const titleSimilarity = this.fuzzyMatch(
        this.normalize(emailJobTitle),
        this.normalize(appJobTitle)
      );
      score += titleSimilarity * 0.2; // 20% weight
    }

    return Math.min(score, 1.0);
  }

  /**
   * Normalize string for comparison (lowercase, remove special chars)
   */
  private static normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Fuzzy string matching using Levenshtein distance
   */
  private static fuzzyMatch(str1: string, str2: string): number {
    // Exact match
    if (str1 === str2) return 1.0;

    // Contains match (e.g., "XR Solutions" contains "XR")
    if (str1.includes(str2) || str2.includes(str1)) {
      const longer = Math.max(str1.length, str2.length);
      const shorter = Math.min(str1.length, str2.length);
      return shorter / longer;
    }

    // Levenshtein distance
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    if (maxLength === 0) return 1.0;
    
    return 1.0 - distance / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get human-readable match reason
   */
  private static getMatchReason(
    score: number,
    emailCompany: string,
    appCompany: string
  ): string {
    if (score >= 0.95) {
      return 'Exact company name match';
    } else if (score >= 0.8) {
      return 'Very close company name match';
    } else if (score >= 0.6) {
      return `Company name similar: "${emailCompany}" ≈ "${appCompany}"`;
    } else {
      return `Possible match: "${emailCompany}" might be "${appCompany}"`;
    }
  }

  /**
   * Get best match (highest confidence)
   */
  static async getBestMatch(
    userId: string,
    companyName: string | null,
    jobTitle: string | null
  ): Promise<MatchResult | null> {
    const matches = await this.findMatches(userId, companyName, jobTitle);
    return matches.length > 0 ? matches[0] : null;
  }
}
