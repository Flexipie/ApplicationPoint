'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { reminders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { addDays } from 'date-fns';
import { revalidatePath } from 'next/cache';

export async function toggleReminderComplete(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const [reminder] = await db
    .select()
    .from(reminders)
    .where(eq(reminders.id, id))
    .limit(1);

  if (!reminder || reminder.userId !== session.user.id) {
    throw new Error('Reminder not found');
  }

  await db
    .update(reminders)
    .set({
      isCompleted: !reminder.isCompleted,
      completedAt: reminder.isCompleted ? null : new Date(),
    })
    .where(eq(reminders.id, id));

  revalidatePath('/dashboard-v2');
}

export async function snoozeReminder(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const [reminder] = await db
    .select()
    .from(reminders)
    .where(eq(reminders.id, id))
    .limit(1);

  if (!reminder || reminder.userId !== session.user.id) {
    throw new Error('Reminder not found');
  }

  // Snooze to tomorrow
  const newDueDate = addDays(new Date(), 1);

  await db
    .update(reminders)
    .set({
      dueDate: newDueDate,
    })
    .where(eq(reminders.id, id));

  revalidatePath('/dashboard-v2');
}

export async function addQuickReminder(title: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  if (!title.trim()) {
    throw new Error('Title is required');
  }

  // TODO: Quick reminders require applicationId in current schema
  // For now, this is a placeholder - would need schema update to support
  // general reminders not tied to a specific application

  throw new Error('Quick reminders not yet supported - schema update needed');

  // revalidatePath('/dashboard-v2');
}
