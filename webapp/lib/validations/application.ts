import { z } from 'zod';

// Application status enum (matches database)
export const applicationStatusSchema = z.enum([
  'saved',
  'applied',
  'assessment',
  'interview',
  'offer',
  'accepted',
  'rejected',
]);

// Application source enum (matches database)
export const applicationSourceSchema = z.enum([
  'linkedin',
  'indeed',
  'company_site',
  'referral',
  'other',
]);

// Schema for creating a new application
export const createApplicationSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(200),
  companyName: z.string().min(1, 'Company name is required').max(200),
  location: z.string().max(200).optional().nullable(),
  salaryRange: z.string().max(100).optional().nullable(),
  applyUrl: z.string().url('Must be a valid URL').optional().nullable(),
  descriptionPreview: z.string().max(1000).optional().nullable(),
  currentStatus: applicationStatusSchema.default('saved'),
  source: applicationSourceSchema.default('other'),
  deadlineDate: z.string().datetime().optional().nullable(),
  nextActionText: z.string().max(500).optional().nullable(),
  nextActionDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Schema for updating an existing application
export const updateApplicationSchema = createApplicationSchema.partial();

// Schema for updating application status
export const updateStatusSchema = z.object({
  currentStatus: applicationStatusSchema,
  trigger: z.enum(['manual', 'email', 'reminder']).default('manual'),
});

// Schema for query parameters (listing applications)
export const listApplicationsSchema = z.object({
  status: applicationStatusSchema.optional(),
  source: applicationSourceSchema.optional(),
  search: z.string().optional(), // Search in company name or job title
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(['createdAt', 'updatedAt', 'companyName', 'deadlineDate']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListApplicationsQuery = z.infer<typeof listApplicationsSchema>;
