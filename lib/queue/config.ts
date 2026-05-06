import { ConnectionOptions } from 'bullmq';

// BullMQ connection configuration
export const queueConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

// Queue names
export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  AGREEMENT: 'agreement-queue',
  NOTIFICATION: 'notification-queue',
  PAYMENT: 'payment-queue',
  ANALYTICS: 'analytics-queue',
} as const;

// Job options
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000,
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24 hours
    count: 1000,
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days
  },
};
