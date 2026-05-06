# BullMQ Queue System

This directory contains the queue infrastructure for handling background jobs using BullMQ and Redis.

## Architecture

```
lib/queue/
├── config.ts           # Queue configuration and connection settings
├── queues.ts          # Queue definitions and job helpers
├── workers/           # Worker processors
│   ├── emailWorker.ts
│   ├── agreementWorker.ts
│   ├── notificationWorker.ts
│   └── index.ts
└── README.md
```

## Available Queues

### 1. Email Queue
Handles all email sending operations.

**Job Type:** `EmailJob`
```typescript
{
  to: string;
  subject: string;
  html: string;
  from?: string;
}
```

**Usage:**
```typescript
import { addEmailJob } from '@/lib/queue/queues';

await addEmailJob({
  to: 'user@example.com',
  subject: 'Welcome to Nestora',
  html: '<p>Welcome!</p>',
});
```

### 2. Agreement Queue
Handles agreement-related background tasks (generation, signing, expiration).

**Job Type:** `AgreementJob`
```typescript
{
  agreementId: string;
  action: 'generate' | 'sign' | 'expire';
  userId: string;
}
```

**Usage:**
```typescript
import { addAgreementJob } from '@/lib/queue/queues';

await addAgreementJob({
  agreementId: '507f1f77bcf86cd799439011',
  action: 'generate',
  userId: '507f1f77bcf86cd799439012',
});
```

### 3. Notification Queue
Handles in-app notification creation.

**Job Type:** `NotificationJob`
```typescript
{
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}
```

**Usage:**
```typescript
import { addNotificationJob } from '@/lib/queue/queues';

await addNotificationJob({
  userId: '507f1f77bcf86cd799439012',
  type: 'agreement_signed',
  title: 'Agreement Signed',
  message: 'Your rental agreement has been signed.',
});
```

### 4. Payment Queue
Handles payment processing tasks.

**Job Type:** `PaymentJob`
```typescript
{
  bookingId: string;
  amount: number;
  action: 'process' | 'refund' | 'reminder';
}
```

### 5. Analytics Queue
Handles analytics event tracking.

**Job Type:** `AnalyticsJob`
```typescript
{
  event: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
}
```

## Setup

### 1. Install Redis

**Using Docker:**
```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

**Using Homebrew (macOS):**
```bash
brew install redis
brew services start redis
```

**Using apt (Ubuntu/Debian):**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### 2. Configure Environment Variables

Add to `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Optional, leave empty for local development
```

### 3. Start Workers

**Development:**
```bash
npm run workers:dev
```

**Production:**
```bash
npm run workers
```

## Worker Configuration

### Concurrency
Each worker has a configured concurrency level:
- Email Worker: 5 concurrent jobs
- Agreement Worker: 3 concurrent jobs
- Notification Worker: 10 concurrent jobs

### Retry Strategy
Failed jobs are automatically retried with exponential backoff:
- Max attempts: 3
- Initial delay: 2 seconds
- Backoff type: exponential

### Job Retention
- Completed jobs: Kept for 24 hours (max 1000)
- Failed jobs: Kept for 7 days

## Monitoring

### BullMQ Board (Optional)
Install BullMQ Board for a web UI to monitor queues:

```bash
npm install -g @bull-board/cli
bull-board
```

Then visit `http://localhost:3000`

### Redis CLI
Monitor queue activity:
```bash
redis-cli
> KEYS bull:*
> LLEN bull:email-queue:wait
```

## Production Deployment

### Separate Worker Process
In production, run workers as a separate process from the Next.js app:

**Using PM2:**
```bash
pm2 start workers.ts --name nestora-workers
```

**Using systemd:**
Create `/etc/systemd/system/nestora-workers.service`:
```ini
[Unit]
Description=Nestora Background Workers
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/nestora
ExecStart=/usr/bin/node workers.js
Restart=always

[Install]
WantedBy=multi-user.target
```

### Scaling Workers
Run multiple worker instances for high throughput:
```bash
pm2 start workers.ts -i 4 --name nestora-workers
```

## Error Handling

Workers automatically:
- Retry failed jobs with exponential backoff
- Log errors to console
- Move permanently failed jobs to failed queue

Monitor failed jobs:
```typescript
import { emailQueue } from '@/lib/queue/queues';

const failed = await emailQueue.getFailed();
console.log('Failed jobs:', failed);
```

## Testing

Test queue functionality:
```typescript
import { addEmailJob } from '@/lib/queue/queues';

// Add a test job
const job = await addEmailJob({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>Test</p>',
});

console.log('Job added:', job.id);
```

## Graceful Shutdown

Workers handle SIGTERM and SIGINT signals for graceful shutdown:
```bash
# Stop workers gracefully
kill -SIGTERM <worker-pid>
```

## Best Practices

1. **Always use queues for:**
   - Email sending
   - External API calls
   - Heavy computations
   - Scheduled tasks

2. **Keep job data small:**
   - Store IDs, not full objects
   - Fetch data in worker from database

3. **Make jobs idempotent:**
   - Jobs may be retried
   - Ensure duplicate execution is safe

4. **Monitor queue health:**
   - Check queue lengths
   - Monitor failed jobs
   - Set up alerts for high failure rates
