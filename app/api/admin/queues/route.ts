import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/apiResponse';
import {
  emailQueue,
  agreementQueue,
  notificationQueue,
  paymentQueue,
  analyticsQueue,
} from '@/lib/queue/queues';

// GET - Get queue statistics
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);

    // Only admins can view queue stats
    if (user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const queues = [
      { name: 'Email', queue: emailQueue },
      { name: 'Agreement', queue: agreementQueue },
      { name: 'Notification', queue: notificationQueue },
      { name: 'Payment', queue: paymentQueue },
      { name: 'Analytics', queue: analyticsQueue },
    ];

    const stats = await Promise.all(
      queues.map(async ({ name, queue }) => {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
        ]);

        return {
          name,
          waiting,
          active,
          completed,
          failed,
          delayed,
          total: waiting + active + completed + failed + delayed,
        };
      })
    );

    return successResponse({ queues: stats });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Retry failed jobs
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);

    // Only admins can retry jobs
    if (user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const { queueName } = await req.json();

    let queue;
    switch (queueName) {
      case 'email':
        queue = emailQueue;
        break;
      case 'agreement':
        queue = agreementQueue;
        break;
      case 'notification':
        queue = notificationQueue;
        break;
      case 'payment':
        queue = paymentQueue;
        break;
      case 'analytics':
        queue = analyticsQueue;
        break;
      default:
        return errorResponse('Invalid queue name', 400);
    }

    // Get all failed jobs and retry them
    const failedJobs = await queue.getFailed();
    let retriedCount = 0;

    for (const job of failedJobs) {
      await job.retry();
      retriedCount++;
    }

    return successResponse({
      message: `Retried ${retriedCount} failed jobs in ${queueName} queue`,
      retriedCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
