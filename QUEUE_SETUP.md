# BullMQ & Redis Setup Guide

This document provides a complete guide for setting up and using the BullMQ queue system with Redis in the Nestora rental platform.

## 🎯 Overview

The queue system handles background jobs asynchronously, improving application performance and user experience by offloading time-consuming tasks like:

- ✉️ Email sending
- 📄 Agreement notifications
- 🔔 In-app notifications
- 💳 Payment processing
- 📊 Analytics tracking

## 📋 Prerequisites

- Node.js 18+ installed
- Redis server (local or remote)

## 🚀 Quick Start

### 1. Install Redis

Choose one method based on your OS:

**Docker (Recommended for development):**
```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

**Windows:**
Download from: https://github.com/microsoftarchive/redis/releases

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Leave empty for local development

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Verify Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

### 4. Start the Application

**Terminal 1 - Next.js App:**
```bash
npm run dev
```

**Terminal 2 - Queue Workers:**
```bash
npm run workers:dev
```

## 📦 Queue Architecture

### Available Queues

| Queue | Purpose | Concurrency | Retry Attempts |
|-------|---------|-------------|----------------|
| **Email** | Send emails via SMTP | 5 | 3 |
| **Agreement** | Agreement notifications | 3 | 3 |
| **Notification** | In-app notifications | 10 | 3 |
| **Payment** | Payment processing | 3 | 3 |
| **Analytics** | Event tracking | 10 | 3 |

### Job Flow

```
API Endpoint → Add Job to Queue → Redis → Worker Picks Up Job → Process → Complete/Fail
```

## 💻 Usage Examples

### 1. Sending Emails

```typescript
import { addEmailJob } from '@/lib/queue/queues';

// In your API route or server component
await addEmailJob({
  to: 'user@example.com',
  subject: 'Welcome to Nestora',
  html: '<h1>Welcome!</h1><p>Thanks for joining.</p>',
});
```

### 2. Agreement Notifications

```typescript
import { addAgreementJob } from '@/lib/queue/queues';

// After generating an agreement
await addAgreementJob({
  agreementId: agreement._id.toString(),
  action: 'generate',
  userId: user.userId,
});

// After signing
await addAgreementJob({
  agreementId: agreement._id.toString(),
  action: 'sign',
  userId: user.userId,
});
```

### 3. In-App Notifications

```typescript
import { addNotificationJob } from '@/lib/queue/queues';

await addNotificationJob({
  userId: '507f1f77bcf86cd799439011',
  type: 'booking_confirmed',
  title: 'Booking Confirmed',
  message: 'Your booking has been confirmed.',
  data: { bookingId: '507f1f77bcf86cd799439012' },
});
```

### 4. Delayed Jobs

```typescript
import { addEmailJob } from '@/lib/queue/queues';

// Send email after 1 hour
await addEmailJob(
  {
    to: 'user@example.com',
    subject: 'Reminder',
    html: '<p>This is a reminder</p>',
  },
  {
    delay: 60 * 60 * 1000, // 1 hour in milliseconds
  }
);
```

### 5. Scheduled Jobs

```typescript
import { addEmailJob } from '@/lib/queue/queues';

// Send email every day at 9 AM
await addEmailJob(
  {
    to: 'user@example.com',
    subject: 'Daily Report',
    html: '<p>Your daily report</p>',
  },
  {
    repeat: {
      pattern: '0 9 * * *', // Cron expression
    },
  }
);
```

## 🔍 Monitoring

### Admin Dashboard

Visit: `http://localhost:3000/admin/queues`

Features:
- Real-time queue statistics
- Job counts (waiting, active, completed, failed)
- Health indicators
- Retry failed jobs
- Auto-refresh every 10 seconds

### API Endpoint

```bash
# Get queue statistics
curl http://localhost:3000/api/admin/queues \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Retry failed jobs
curl -X POST http://localhost:3000/api/admin/queues \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"queueName": "email"}'
```

### Redis CLI

```bash
# Connect to Redis
redis-cli

# List all queue keys
KEYS bull:*

# Check waiting jobs count
LLEN bull:email-queue:wait

# Check active jobs count
LLEN bull:email-queue:active

# Monitor real-time commands
MONITOR
```

## 🏭 Production Deployment

### 1. Use Managed Redis

**Recommended Services:**
- **Redis Cloud** (https://redis.com/cloud/)
- **AWS ElastiCache**
- **DigitalOcean Managed Redis**
- **Upstash** (serverless Redis)

Update `.env`:
```env
REDIS_HOST=your-redis-host.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your-secure-password
```

### 2. Run Workers as Separate Process

**Using PM2:**
```bash
# Install PM2
npm install -g pm2

# Start workers
pm2 start workers.ts --name nestora-workers

# Start multiple instances
pm2 start workers.ts -i 4 --name nestora-workers

# Monitor
pm2 monit

# View logs
pm2 logs nestora-workers
```

**Using Docker:**
```dockerfile
# Dockerfile.workers
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "workers.js"]
```

```bash
docker build -f Dockerfile.workers -t nestora-workers .
docker run -d --name workers nestora-workers
```

**Using systemd:**
```ini
# /etc/systemd/system/nestora-workers.service
[Unit]
Description=Nestora Background Workers
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/nestora
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node workers.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable nestora-workers
sudo systemctl start nestora-workers
sudo systemctl status nestora-workers
```

### 3. Configure Logging

Update workers to use proper logging:

```typescript
// Use Winston or Pino for production logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### 4. Set Up Monitoring & Alerts

**Prometheus + Grafana:**
```typescript
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(agreementQueue),
  ],
  serverAdapter,
});
```

## 🐛 Troubleshooting

### Workers Not Processing Jobs

**Check if workers are running:**
```bash
ps aux | grep workers
```

**Check Redis connection:**
```bash
redis-cli ping
```

**Check worker logs:**
```bash
pm2 logs nestora-workers
# or
tail -f /var/log/nestora-workers.log
```

### High Failed Job Count

**View failed jobs:**
```typescript
import { emailQueue } from '@/lib/queue/queues';

const failed = await emailQueue.getFailed();
console.log('Failed jobs:', failed);
```

**Retry all failed jobs:**
```bash
curl -X POST http://localhost:3000/api/admin/queues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"queueName": "email"}'
```

### Redis Memory Issues

**Check memory usage:**
```bash
redis-cli INFO memory
```

**Set max memory policy:**
```bash
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Jobs Stuck in Active State

**Clean stuck jobs:**
```typescript
import { emailQueue } from '@/lib/queue/queues';

await emailQueue.clean(0, 1000, 'active');
```

## 📊 Performance Optimization

### 1. Adjust Concurrency

```typescript
// lib/queue/workers/emailWorker.ts
export const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  processEmailJob,
  {
    connection: queueConnection,
    concurrency: 10, // Increase for higher throughput
  }
);
```

### 2. Batch Processing

```typescript
// Process multiple jobs at once
const jobs = await emailQueue.getJobs(['waiting'], 0, 100);
await Promise.all(jobs.map(job => processEmailJob(job)));
```

### 3. Rate Limiting

```typescript
import { addEmailJob } from '@/lib/queue/queues';

await addEmailJob(
  emailData,
  {
    rateLimiter: {
      max: 100, // Max 100 jobs
      duration: 60000, // Per minute
    },
  }
);
```

## 🔒 Security Best Practices

1. **Use Redis password in production:**
   ```env
   REDIS_PASSWORD=strong-random-password
   ```

2. **Enable Redis TLS:**
   ```typescript
   const queueConnection = {
     host: process.env.REDIS_HOST,
     port: parseInt(process.env.REDIS_PORT || '6379'),
     password: process.env.REDIS_PASSWORD,
     tls: process.env.NODE_ENV === 'production' ? {} : undefined,
   };
   ```

3. **Restrict admin endpoints:**
   - Already implemented in `/api/admin/queues`
   - Only accessible to admin users

4. **Sanitize job data:**
   - Never store sensitive data in jobs
   - Use IDs and fetch data in workers

## 📚 Additional Resources

- **BullMQ Documentation:** https://docs.bullmq.io/
- **Redis Documentation:** https://redis.io/docs/
- **Queue Patterns:** https://docs.bullmq.io/patterns/
- **Best Practices:** https://docs.bullmq.io/guide/best-practices

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review BullMQ documentation
3. Check Redis logs: `redis-cli MONITOR`
4. Review worker logs: `pm2 logs nestora-workers`

## ✅ Checklist

- [ ] Redis installed and running
- [ ] Environment variables configured
- [ ] Workers started (`npm run workers:dev`)
- [ ] Test job added successfully
- [ ] Admin dashboard accessible
- [ ] Email sending working
- [ ] Agreement notifications working
- [ ] Production deployment planned
- [ ] Monitoring set up
- [ ] Backup strategy in place
