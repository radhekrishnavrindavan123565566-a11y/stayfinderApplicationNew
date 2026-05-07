import { Worker, Job } from 'bullmq';
import { queueConnection, QUEUE_NAMES } from '../config';
import { NotificationJob } from '../queues';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { logger } from '@/lib/logger';

// Notification worker processor
async function processNotificationJob(job: Job<NotificationJob>) {
  const { userId, type, title, message, data } = job.data;

  logger.info('[NotificationWorker] Processing job', { jobId: job.id, userId });

  await connectDB();

  try {
    // Create notification in database
    await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      read: false,
    });

    logger.info('[NotificationWorker] Successfully created notification', { userId });
    return { success: true, userId };
  } catch (error) {
    logger.error('[NotificationWorker] Failed to create notification', { userId, error });
    throw error;
  }
}

// Create and export the worker
export const notificationWorker = new Worker(
  QUEUE_NAMES.NOTIFICATION,
  processNotificationJob,
  {
    connection: queueConnection,
    concurrency: 10, // High concurrency for notifications
  }
);

// Worker event handlers
notificationWorker.on('completed', (job) => {
  logger.info('[NotificationWorker] Job completed', { jobId: job.id });
});

notificationWorker.on('failed', (job, err) => {
  logger.error('[NotificationWorker] Job failed', { jobId: job?.id, error: err.message });
});

notificationWorker.on('error', (err) => {
  logger.error('[NotificationWorker] Worker error', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('[NotificationWorker] Shutting down gracefully...');
  await notificationWorker.close();
});
