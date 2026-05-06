#!/usr/bin/env node
/**
 * BullMQ Workers Entry Point
 * 
 * This script starts all background workers for processing queued jobs.
 * Run with: node workers.ts or npm run workers
 */

import { startAllWorkers, stopAllWorkers } from './lib/queue/workers';

console.log('='.repeat(50));
console.log('Starting BullMQ Workers');
console.log('='.repeat(50));

// Start all workers
startAllWorkers();

// Graceful shutdown handlers
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  try {
    await stopAllWorkers();
    console.log('Workers stopped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Keep the process running
console.log('Workers are running. Press Ctrl+C to stop.');
