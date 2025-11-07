// Offline queue manager for handling failed save requests
import type { JobData } from '../content/preview-modal';

export interface QueuedJob {
  id: string;
  jobData: JobData;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

const QUEUE_KEY = 'offlineQueue';
const MAX_RETRIES = 3;
const RETRY_INTERVAL = 30000; // 30 seconds

/**
 * Add a job to the offline queue
 */
export async function addToQueue(jobData: JobData): Promise<string> {
  const queue = await getQueue();

  const queuedJob: QueuedJob = {
    id: crypto.randomUUID(),
    jobData,
    timestamp: Date.now(),
    retryCount: 0,
  };

  queue.push(queuedJob);
  await saveQueue(queue);

  console.log(`Added job to offline queue: ${queuedJob.id}`);
  return queuedJob.id;
}

/**
 * Get all jobs in the queue
 */
export async function getQueue(): Promise<QueuedJob[]> {
  const result = await chrome.storage.local.get([QUEUE_KEY]);
  return result[QUEUE_KEY] || [];
}

/**
 * Save the queue to storage
 */
async function saveQueue(queue: QueuedJob[]): Promise<void> {
  await chrome.storage.local.set({ [QUEUE_KEY]: queue });
}

/**
 * Remove a job from the queue
 */
export async function removeFromQueue(jobId: string): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter(job => job.id !== jobId);
  await saveQueue(filtered);
  console.log(`Removed job from queue: ${jobId}`);
}

/**
 * Update retry count and error for a job
 */
export async function updateJobRetry(jobId: string, error: string): Promise<void> {
  const queue = await getQueue();
  const job = queue.find(j => j.id === jobId);

  if (job) {
    job.retryCount++;
    job.lastError = error;

    // Remove if max retries exceeded
    if (job.retryCount >= MAX_RETRIES) {
      console.log(`Job ${jobId} exceeded max retries, removing from queue`);
      await removeFromQueue(jobId);
    } else {
      await saveQueue(queue);
    }
  }
}

/**
 * Get pending jobs count
 */
export async function getPendingCount(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}

/**
 * Process the queue - attempt to save all pending jobs
 */
export async function processQueue(
  saveFunction: (jobData: JobData) => Promise<any>
): Promise<{ succeeded: number; failed: number }> {
  const queue = await getQueue();

  if (queue.length === 0) {
    return { succeeded: 0, failed: 0 };
  }

  console.log(`Processing offline queue: ${queue.length} jobs pending`);

  let succeeded = 0;
  let failed = 0;

  for (const queuedJob of queue) {
    try {
      // Attempt to save the job
      await saveFunction(queuedJob.jobData);

      // Success - remove from queue
      await removeFromQueue(queuedJob.id);
      succeeded++;

      console.log(`Successfully saved queued job: ${queuedJob.id}`);
    } catch (error: any) {
      // Failed - update retry count
      await updateJobRetry(queuedJob.id, error.message);
      failed++;

      console.log(`Failed to save queued job ${queuedJob.id}: ${error.message}`);
    }
  }

  return { succeeded, failed };
}

/**
 * Clear the entire queue (for manual clearing)
 */
export async function clearQueue(): Promise<void> {
  await chrome.storage.local.remove([QUEUE_KEY]);
  console.log('Offline queue cleared');
}

/**
 * Start periodic queue processing
 */
export function startQueueProcessor(
  saveFunction: (jobData: JobData) => Promise<any>
): void {
  // Process immediately on start
  processQueue(saveFunction);

  // Then process periodically
  setInterval(() => {
    processQueue(saveFunction);
  }, RETRY_INTERVAL);

  console.log(`Offline queue processor started (interval: ${RETRY_INTERVAL}ms)`);
}
