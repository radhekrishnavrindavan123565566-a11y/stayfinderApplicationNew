import { Worker, Job } from 'bullmq';
import { queueConnection, QUEUE_NAMES } from '../config';
import { EmailJob } from '../queues';
import { sendEmail } from '@/lib/mailer';
import { logger } from '@/lib/logger';

// Email worker processor
async function processEmailJob(job: Job<EmailJob>) {
  const { to, subject, html, from } = job.data;

  logger.info('[EmailWorker] Processing job', { jobId: job.id, to });

  try {
    await sendEmail(to, subject, html);

    logger.info('[EmailWorker] Email sent successfully', { to });
    return { success: true, to };
  } catch (error) {
    logger.error('[EmailWorker] Failed to send email', { to, error });
    throw error; // Will trigger retry
  }
}

// Create and export the worker
export const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  processEmailJob,
  {
    connection: queueConnection,
    concurrency: 5, // Process 5 emails concurrently
  }
);

// Worker event handlers
emailWorker.on('completed', (job) => {
  logger.info('[EmailWorker] Job completed', { jobId: job.id });
});

emailWorker.on('failed', (job, err) => {
  logger.error('[EmailWorker] Job failed', { jobId: job?.id, error: err.message });
});

emailWorker.on('error', (err) => {
  logger.error('[EmailWorker] Worker error', { error: err.message });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('[EmailWorker] Shutting down gracefully...');
  await emailWorker.close();
});
