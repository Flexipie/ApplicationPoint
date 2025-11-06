import { db } from '@/db';
import { reminders } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

type ReminderType = typeof reminders.$inferSelect.reminderType;

export interface CreateReminderInput {
  applicationId: string;
  userId: string;
  reminderType: ReminderType;
  title: string;
  description?: string;
  dueDate: Date;
  createdBy: 'user' | 'system';
}

export interface UpdateReminderInput {
  title?: string;
  description?: string;
  dueDate?: Date;
  isCompleted?: boolean;
}

export class ReminderService {
  /**
   * Create a new reminder
   */
  static async create(input: CreateReminderInput) {
    const [reminder] = await db
      .insert(reminders)
      .values({
        id: createId(),
        ...input,
        createdAt: new Date(),
      })
      .returning();

    return reminder;
  }

  /**
   * Get all reminders for a user
   */
  static async list(userId: string, filters?: { isCompleted?: boolean }) {
    const conditions = [eq(reminders.userId, userId)];

    if (filters?.isCompleted !== undefined) {
      conditions.push(eq(reminders.isCompleted, filters.isCompleted));
    }

    return await db
      .select()
      .from(reminders)
      .where(and(...conditions))
      .orderBy(desc(reminders.dueDate));
  }

  /**
   * Get reminders for a specific application
   */
  static async getByApplication(applicationId: string) {
    return await db
      .select()
      .from(reminders)
      .where(eq(reminders.applicationId, applicationId))
      .orderBy(desc(reminders.dueDate));
  }

  /**
   * Get upcoming reminders (next 7 days)
   */
  static async getUpcoming(userId: string) {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return await db.query.reminders.findMany({
      where: (reminders, { and, eq, gte, lte }) =>
        and(
          eq(reminders.userId, userId),
          eq(reminders.isCompleted, false),
          gte(reminders.dueDate, today),
          lte(reminders.dueDate, nextWeek)
        ),
      orderBy: (reminders, { asc }) => [asc(reminders.dueDate)],
    });
  }

  /**
   * Get overdue reminders
   */
  static async getOverdue(userId: string) {
    const today = new Date();

    return await db.query.reminders.findMany({
      where: (reminders, { and, eq, lt }) =>
        and(
          eq(reminders.userId, userId),
          eq(reminders.isCompleted, false),
          lt(reminders.dueDate, today)
        ),
      orderBy: (reminders, { desc }) => [desc(reminders.dueDate)],
    });
  }

  /**
   * Update a reminder
   */
  static async update(id: string, userId: string, input: UpdateReminderInput) {
    const [reminder] = await db
      .update(reminders)
      .set({
        ...input,
        ...(input.isCompleted && { completedAt: new Date() }),
      })
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();

    return reminder;
  }

  /**
   * Complete a reminder
   */
  static async complete(id: string, userId: string) {
    return await this.update(id, userId, {
      isCompleted: true,
    });
  }

  /**
   * Delete a reminder
   */
  static async delete(id: string, userId: string) {
    await db
      .delete(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
  }

  /**
   * Auto-create reminders based on application status changes
   */
  static async autoCreateReminders(
    applicationId: string,
    userId: string,
    newStatus: string,
    companyName: string,
    jobTitle: string
  ) {
    const createdReminders = [];

    // After "applied" → follow-up reminder in 5 days
    if (newStatus === 'applied') {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 5);

      const reminder = await this.create({
        applicationId,
        userId,
        reminderType: 'follow_up',
        title: `Follow up on ${companyName} application`,
        description: `Check the status of your ${jobTitle} application at ${companyName}`,
        dueDate,
        createdBy: 'system',
      });

      createdReminders.push(reminder);
    }

    // After "interview" → thank-you reminder next day
    if (newStatus === 'interview') {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);

      const reminder = await this.create({
        applicationId,
        userId,
        reminderType: 'thank_you',
        title: `Send thank you note to ${companyName}`,
        description: `Send a follow-up thank you email after your ${jobTitle} interview`,
        dueDate,
        createdBy: 'system',
      });

      createdReminders.push(reminder);
    }

    return createdReminders;
  }

  /**
   * Create deadline reminder when deadline is set
   */
  static async createDeadlineReminder(
    applicationId: string,
    userId: string,
    deadlineDate: Date,
    companyName: string,
    jobTitle: string
  ) {
    // Create reminder 1 day before deadline
    const dueDate = new Date(deadlineDate);
    dueDate.setDate(dueDate.getDate() - 1);

    // Don't create if the reminder date is in the past
    if (dueDate < new Date()) {
      return null;
    }

    return await this.create({
      applicationId,
      userId,
      reminderType: 'deadline',
      title: `Deadline approaching for ${companyName}`,
      description: `The deadline for your ${jobTitle} application at ${companyName} is tomorrow`,
      dueDate,
      createdBy: 'system',
    });
  }
}
