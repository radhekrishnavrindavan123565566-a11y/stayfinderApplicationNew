import { Worker, Job } from 'bullmq';
import { queueConnection, QUEUE_NAMES } from '../config';
import { NotificationJob } from '../queues';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

// Notification worker processor
async function processNotificationJob(job: Job<NotificationJob>) {
  const { userId, type, title, message, data } = job.data;

  console.log(`[NotificationWorker] Processing job ${job.id}: Sending notification to user ${userId}`);

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

    console.log(`[NotificationWorker] Successfully created notification for user ${userId}`);
    return { success: true, userId };
  } catch (error) {
    console.error(`[NotificationWorker] Failed to create notification for user ${userId}:`, error);
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
  console.log(`[NotificationWorker] Job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`[NotificationWorker] Job ${job?.id} failed:`, err.message);
});

notificationWorker.on('error', (err) => {
  console.error('[NotificationWorker] Worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[NotificationWorker] Shutting down gracefully...');
  await notificationWorker.close();
});
