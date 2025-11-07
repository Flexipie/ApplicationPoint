import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { applications } from '@/db/schema';
import { eq, or, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { rateLimit, apiRateLimiter } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const checkDuplicateSchema = z.object({
  jobTitle: z.string().min(1),
  companyName: z.string().min(1),
  applyUrl: z.string().url().optional(),
});

interface DuplicateMatch {
  id: string;
  jobTitle: string;
  companyName: string;
  applyUrl: string | null;
  currentStatus: string;
  createdAt: string;
  matchType: 'exact_url' | 'exact_title_company' | 'fuzzy_match';
  similarity: number;
}

/**
 * Calculate similarity between two strings (0-1)
 * Uses a simple character-based approach
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  // Levenshtein distance for short strings
  if (s1.length < 50 && s2.length < 50) {
    const distance = levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    return 1 - (distance / maxLength);
  }

  // For longer strings, use word overlap
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Normalize string for comparison (lowercase, remove special chars, trim)
 */
function normalizeString(str: string): string {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * GET /api/applications/check-duplicate
 * Check if a job application already exists (duplicate detection)
 * Query params: jobTitle, companyName, applyUrl (optional)
 */
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(req, apiRateLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobTitle = searchParams.get('jobTitle');
    const companyName = searchParams.get('companyName');
    const applyUrl = searchParams.get('applyUrl');

    const validationResult = checkDuplicateSchema.safeParse({
      jobTitle,
      companyName,
      applyUrl: applyUrl || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: validationResult.error },
        { status: 400 }
      );
    }

    const { jobTitle: title, companyName: company, applyUrl: url } = validationResult.data;

    // Fetch all user's applications (we'll do filtering in-memory for better fuzzy matching)
    const userApplications = await db
      .select({
        id: applications.id,
        jobTitle: applications.jobTitle,
        companyName: applications.companyName,
        applyUrl: applications.applyUrl,
        currentStatus: applications.currentStatus,
        createdAt: applications.createdAt,
      })
      .from(applications)
      .where(eq(applications.userId, session.user.id));

    const duplicates: DuplicateMatch[] = [];

    // Normalize input for comparison
    const normalizedTitle = normalizeString(title);
    const normalizedCompany = normalizeString(company);

    for (const app of userApplications) {
      let matchType: DuplicateMatch['matchType'] | null = null;
      let similarity = 0;

      // Check 1: Exact URL match (highest priority)
      if (url && app.applyUrl && app.applyUrl === url) {
        matchType = 'exact_url';
        similarity = 1.0;
      }

      // Check 2: Exact title + company match
      if (!matchType) {
        const appNormalizedTitle = normalizeString(app.jobTitle);
        const appNormalizedCompany = normalizeString(app.companyName);

        if (appNormalizedTitle === normalizedTitle && appNormalizedCompany === normalizedCompany) {
          matchType = 'exact_title_company';
          similarity = 1.0;
        }
      }

      // Check 3: Fuzzy match (similar title + company)
      if (!matchType) {
        const titleSimilarity = calculateSimilarity(app.jobTitle, title);
        const companySimilarity = calculateSimilarity(app.companyName, company);

        // Consider it a potential duplicate if both are highly similar
        // Title weight: 60%, Company weight: 40%
        const combinedSimilarity = (titleSimilarity * 0.6) + (companySimilarity * 0.4);

        // Threshold: 0.75 (75% similar)
        if (combinedSimilarity >= 0.75) {
          matchType = 'fuzzy_match';
          similarity = combinedSimilarity;
        }
      }

      // Add to duplicates if matched
      if (matchType) {
        duplicates.push({
          id: app.id,
          jobTitle: app.jobTitle,
          companyName: app.companyName,
          applyUrl: app.applyUrl,
          currentStatus: app.currentStatus,
          createdAt: app.createdAt.toISOString(),
          matchType,
          similarity: Math.round(similarity * 100) / 100, // Round to 2 decimals
        });
      }
    }

    // Sort by similarity (highest first)
    duplicates.sort((a, b) => b.similarity - a.similarity);

    return NextResponse.json({
      hasDuplicates: duplicates.length > 0,
      duplicates,
      count: duplicates.length,
    });
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
