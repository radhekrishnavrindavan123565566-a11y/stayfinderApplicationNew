// Export all workers
export { emailWorker } from './emailWorker';
export { agreementWorker } from './agreementWorker';
export { notificationWorker } from './notificationWorker';

// Start all workers
export function startAllWorkers() {
  console.log('[Workers] Starting all workers...');
  
  // Workers are automatically started when imported
  // This function is just for explicit initialization if needed
  
  console.log('[Workers] All workers started successfully');
}

// Stop all workers
export async function stopAllWorkers() {
  console.log('[Workers] Stopping all workers...');
  
  const { emailWorker } = await import('./emailWorker');
  const { agreementWorker } = await import('./agreementWorker');
  const { notificationWorker } = await import('./notificationWorker');
  
  await Promise.all([
    emailWorker.close(),
    agreementWorker.close(),
    notificationWorker.close(),
  ]);
  
  console.log('[Workers] All workers stopped');
}
