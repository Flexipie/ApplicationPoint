/**
 * Environment variable validation
 *
 * This file validates that all required environment variables are present
 * and properly formatted at application startup.
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters for security'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required for Google OAuth'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required for Google OAuth'),

  // Cron Security (required for automated email processing)
  CRON_SECRET: z
    .string()
    .min(32, 'CRON_SECRET must be at least 32 characters for security')
    .optional(),

  // Optional: Email Service (for digest emails)
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  // App Config
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL').optional(),
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL').optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Call this at application startup
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);

    // Additional validation warnings (non-blocking)
    if (!env.CRON_SECRET && env.NODE_ENV === 'production') {
      console.warn(
        '⚠️  WARNING: CRON_SECRET is not set. Automated email processing will not work in production.'
      );
    }

    if (env.NODE_ENV === 'production') {
      if (!env.SENDGRID_API_KEY) {
        console.warn('⚠️  WARNING: SENDGRID_API_KEY not set. Email notifications will not work.');
      }
      if (!env.NEXT_PUBLIC_APP_URL) {
        console.warn('⚠️  WARNING: NEXT_PUBLIC_APP_URL not set. Some features may not work correctly.');
      }
    }

    console.log('✅ Environment variables validated successfully');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error(
        'Invalid environment variables. Please check your .env.local file.\n' +
          'See .env.example for required variables.'
      );
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * Only use after validateEnv() has been called
 */
export const env = process.env as unknown as Env;
