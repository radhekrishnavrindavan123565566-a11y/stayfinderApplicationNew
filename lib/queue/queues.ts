import { Queue } from 'bullmq';
import { queueConnection, QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from './config';

// Email Queue
export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
  connection: queueConnection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

// Agreement Queue
export const agreementQueue = new Queue(QUEUE_NAMES.AGREEMENT, {
  connection: queueConnection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

// Notification Queue
export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATION, {
  connection: queueConnection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

// Payment Queue
export const paymentQueue = new Queue(QUEUE_NAMES.PAYMENT, {
  connection: queueConnection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

// Analytics Queue
export const analyticsQueue = new Queue(QUEUE_NAMES.ANALYTICS, {
  connection: queueConnection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

// Job type definitions
export interface EmailJob {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface AgreementJob {
  agreementId: string;
  action: 'generate' | 'sign' | 'expire';
  userId: string;
}

export interface NotificationJob {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface PaymentJob {
  bookingId: string;
  amount: number;
  action: 'process' | 'refund' | 'reminder';
}

export interface AnalyticsJob {
  event: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

// Helper functions to add jobs
export async function addEmailJob(data: EmailJob, options = {}) {
  return emailQueue.add('send-email', data, options);
}

export async function addAgreementJob(data: AgreementJob, options = {}) {
  return agreementQueue.add('process-agreement', data, options);
}

export async function addNotificationJob(data: NotificationJob, options = {}) {
  return notificationQueue.add('send-notification', data, options);
}

export async function addPaymentJob(data: PaymentJob, options = {}) {
  return paymentQueue.add('process-payment', data, options);
}

export async function addAnalyticsJob(data: AnalyticsJob, options = {}) {
  return analyticsQueue.add('track-event', data, options);
}

// Graceful shutdown
export async function closeQueues() {
  await Promise.all([
    emailQueue.close(),
    agreementQueue.close(),
    notificationQueue.close(),
    paymentQueue.close(),
    analyticsQueue.close(),
  ]);
}
