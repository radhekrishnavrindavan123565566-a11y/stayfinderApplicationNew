import { Worker, Job } from 'bullmq';
import { queueConnection, QUEUE_NAMES } from '../config';
import { EmailJob } from '../queues';
import { sendEmail } from '@/lib/mailer';

// Email worker processor
async function processEmailJob(job: Job<EmailJob>) {
  const { to, subject, html, from } = job.data;

  console.log(`[EmailWorker] Processing job ${job.id}: Sending email to ${to}`);

  try {
    await sendEmail(to, subject, html);

    console.log(`[EmailWorker] Successfully sent email to ${to}`);
    return { success: true, to };
  } catch (error) {
    console.error(`[EmailWorker] Failed to send email to ${to}:`, error);
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
  console.log(`[EmailWorker] Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
});

emailWorker.on('error', (err) => {
  console.error('[EmailWorker] Worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[EmailWorker] Shutting down gracefully...');
  await emailWorker.close();
});
