// Export all workers
export { emailWorker } from './emailWorker';
export { agreementWorker } from './agreementWorker';
export { notificationWorker } from './notificationWorker';

// Start all workers
export function startAllWorkers() {
  // Workers are automatically started when imported
  // This function is just for explicit initialization if needed
}

// Stop all workers
export async function stopAllWorkers() {
  const { emailWorker } = await import('./emailWorker');
  const { agreementWorker } = await import('./agreementWorker');
  const { notificationWorker } = await import('./notificationWorker');
  
  await Promise.all([
    emailWorker.close(),
    agreementWorker.close(),
    notificationWorker.close(),
  ]);
  
}
