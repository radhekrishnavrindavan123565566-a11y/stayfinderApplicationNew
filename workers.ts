#!/usr/bin/env node
/**
 * BullMQ Workers Entry Point
 * 
 * This script starts all background workers for processing queued jobs.
 * Run with: node workers.ts or npm run workers
 */

import { startAllWorkers, stopAllWorkers } from './lib/queue/workers';
import { logger } from './lib/logger';

logger.info('='.repeat(50));
logger.info('Starting BullMQ Workers');
logger.info('='.repeat(50));

// Start all workers
startAllWorkers();

// Graceful shutdown handlers
const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  
  try {
    await stopAllWorkers();
    logger.info('Workers stopped successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error as Error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Keep the process running
logger.info('Workers are running. Press Ctrl+C to stop.');
