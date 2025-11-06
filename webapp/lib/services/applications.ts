import { db } from '@/db';
import { applications, stageHistory } from '@/db/schema';
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm';
import type { CreateApplicationInput, UpdateApplicationInput, ListApplicationsQuery } from '@/lib/validations/application';
import { ReminderService } from './reminder-service';

export class ApplicationService {
  /**
   * Create a new application for a user
   */
  static async create(userId: string, data: CreateApplicationInput) {
    const [application] = await db
      .insert(applications)
      .values({
        userId,
        ...data,
        deadlineDate: data.deadlineDate ? new Date(data.deadlineDate) : null,
        nextActionDate: data.nextActionDate ? new Date(data.nextActionDate) : null,
      })
      .returning();

    // Create initial stage history
    await db.insert(stageHistory).values({
      applicationId: application.id,
      fromStatus: null,
      toStatus: data.currentStatus || 'saved',
      trigger: 'manual',
    });

    // Auto-create reminders based on initial status
    const initialStatus = data.currentStatus || 'saved';
    if (initialStatus === 'applied' || initialStatus === 'interview') {
      await ReminderService.autoCreateReminders(
        application.id,
        userId,
        initialStatus,
        application.companyName,
        application.jobTitle
      );
    }

    // Create deadline reminder if deadline is set
    if (data.deadlineDate) {
      await ReminderService.createDeadlineReminder(
        application.id,
        userId,
        new Date(data.deadlineDate),
        application.companyName,
        application.jobTitle
      );
    }

    return application;
  }

  /**
   * Get all applications for a user with filtering, search, and pagination
   */
  static async list(userId: string, query: ListApplicationsQuery) {
    const { status, source, search, limit, offset, sortBy, sortOrder } = query;

    // Build WHERE conditions
    const conditions = [eq(applications.userId, userId)];

    if (status) {
      conditions.push(eq(applications.currentStatus, status));
    }

    if (source) {
      conditions.push(eq(applications.source, source));
    }

    if (search) {
      conditions.push(
        or(
          like(applications.companyName, `%${search}%`),
          like(applications.jobTitle, `%${search}%`)
        )!
      );
    }

    // Build ORDER BY
    const orderColumn =
      sortBy === 'createdAt'
        ? applications.createdAt
        : sortBy === 'updatedAt'
        ? applications.updatedAt
        : sortBy === 'companyName'
        ? applications.companyName
        : applications.deadlineDate;

    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Execute query
    const results = await db
      .select()
      .from(applications)
      .where(and(...conditions))
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(and(...conditions));

    return {
      applications: results,
      pagination: {
        total: Number(count),
        limit,
        offset,
        hasMore: offset + results.length < Number(count),
      },
    };
  }

  /**
   * Get a single application by ID
   */
  static async getById(applicationId: string, userId: string) {
    const [application] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
      .limit(1);

    return application || null;
  }

  /**
   * Update an application
   */
  static async update(applicationId: string, userId: string, data: UpdateApplicationInput) {
    const existing = await this.getById(applicationId, userId);
    if (!existing) {
      throw new Error('Application not found');
    }

    // If status is changing, create stage history and auto-reminders
    if (data.currentStatus && data.currentStatus !== existing.currentStatus) {
      await db.insert(stageHistory).values({
        applicationId,
        fromStatus: existing.currentStatus,
        toStatus: data.currentStatus,
        trigger: 'manual',
      });

      // Auto-create reminders based on status change
      await ReminderService.autoCreateReminders(
        applicationId,
        userId,
        data.currentStatus,
        existing.companyName,
        existing.jobTitle
      );
    }

    const [updated] = await db
      .update(applications)
      .set({
        ...data,
        deadlineDate: data.deadlineDate ? new Date(data.deadlineDate) : undefined,
        nextActionDate: data.nextActionDate ? new Date(data.nextActionDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, applicationId))
      .returning();

    // If deadline is being set or updated, create/update deadline reminder
    if (data.deadlineDate && data.deadlineDate !== existing.deadlineDate) {
      await ReminderService.createDeadlineReminder(
        applicationId,
        userId,
        new Date(data.deadlineDate),
        existing.companyName,
        existing.jobTitle
      );
    }

    return updated;
  }

  /**
   * Update application status only
   */
  static async updateStatus(
    applicationId: string,
    userId: string,
    newStatus: string,
    trigger: 'manual' | 'email' | 'reminder' = 'manual'
  ) {
    const existing = await this.getById(applicationId, userId);
    if (!existing) {
      throw new Error('Application not found');
    }

    // Create stage history
    await db.insert(stageHistory).values({
      applicationId,
      fromStatus: existing.currentStatus,
      toStatus: newStatus as any,
      trigger,
    });

    // Auto-create reminders based on status change (only for non-reminder triggers to avoid loops)
    if (trigger !== 'reminder') {
      await ReminderService.autoCreateReminders(
        applicationId,
        userId,
        newStatus,
        existing.companyName,
        existing.jobTitle
      );
    }

    const [updated] = await db
      .update(applications)
      .set({
        currentStatus: newStatus as any,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, applicationId))
      .returning();

    return updated;
  }

  /**
   * Delete an application
   */
  static async delete(applicationId: string, userId: string) {
    const existing = await this.getById(applicationId, userId);
    if (!existing) {
      throw new Error('Application not found');
    }

    await db.delete(applications).where(eq(applications.id, applicationId));

    return { success: true };
  }

  /**
   * Get statistics for user's applications
   */
  static async getStats(userId: string) {
    const allApps = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));

    const stats = {
      total: allApps.length,
      byStatus: {
        saved: allApps.filter((a) => a.currentStatus === 'saved').length,
        applied: allApps.filter((a) => a.currentStatus === 'applied').length,
        assessment: allApps.filter((a) => a.currentStatus === 'assessment').length,
        interview: allApps.filter((a) => a.currentStatus === 'interview').length,
        offer: allApps.filter((a) => a.currentStatus === 'offer').length,
        accepted: allApps.filter((a) => a.currentStatus === 'accepted').length,
        rejected: allApps.filter((a) => a.currentStatus === 'rejected').length,
      },
    };

    return stats;
  }
}
