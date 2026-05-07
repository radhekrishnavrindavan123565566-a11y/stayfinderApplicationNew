# 🚀 Quick Fixes Implementation Guide

## Priority 1: Critical Security & Accessibility (30 minutes)

### 1. Add Rate Limiting to Auth Routes (10 min)

```typescript
// app/api/auth/login/route.ts
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  // Add this at the start
  const { success, remaining } = rateLimit(req, 5, 60000); // 5 attempts per minute
  
  if (!success) {
    return errorResponse('Too many login attempts. Please try again later.', 429);
  }

  // ... rest of your code
}
```

Apply to:
- ✅ `/api/auth/login/route.ts`
- ✅ `/api/auth/register/route.ts`
- ✅ `/api/auth/forgot-password/route.ts`
- ✅ `/api/ai/chat/route.ts` (10 requests/min)
- ✅ `/api/ai/search/route.ts` (20 requests/min)

---

### 2. Add Input Sanitization (10 min)

```typescript
// app/api/auth/login/route.ts
import { sanitizeInput } from '@/lib/sanitize';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const sanitized = sanitizeInput(body); // Add this line
  
  const parsed = loginSchema.safeParse(sanitized); // Use sanitized
  // ... rest
}
```

Apply to ALL API routes that accept user input.

---

### 3. Add Reduced Motion Support (10 min)

```typescript
// Update all animated components
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 2 }}
    >
      Content
    </motion.div>
  );
}
```

Update these components:
- ✅ `components/ui/ScrollProgress.tsx`
- ✅ `components/ui/AnimatedInput.tsx`
- ✅ `components/ui/EnhancedButton.tsx`
- ✅ `components/ui/AnimatedNumber.tsx`
- ✅ `components/property/PropertyCard.tsx`
- ✅ `app/page.tsx` (hero animations)

---

## Priority 2: Error Handling & Logging (20 minutes)

### 4. Replace console.log with Logger (15 min)

```typescript
// Find and replace in all files
import { logger } from '@/lib/logger';

// Replace:
console.log('[Mailer] Email sent');
// With:
logger.info('[Mailer] Email sent');

// Replace:
console.error('Error:', error);
// With:
logger.error('Error occurred', error);
```

Files to update:
- ✅ `lib/mailer.ts`
- ✅ `lib/queue/workers/emailWorker.ts`
- ✅ `lib/queue/workers/agreementWorker.ts`
- ✅ `lib/queue/workers/notificationWorker.ts`
- ✅ `workers.ts`
- ✅ `lib/redis.ts`

---

### 5. Add Error Boundary to Layout (5 min)

```typescript
// app/layout.tsx
import ErrorBoundary from '@/components/ErrorBoundary';
import ScrollProgress from '@/components/ui/ScrollProgress';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ScrollProgress />
        <ErrorBoundary>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ClientProviders />
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
```

---

## Priority 3: Performance Optimizations (30 minutes)

### 6. Add Database Indexes (10 min)

```typescript
// models/Property.ts
PropertySchema.index({ 'location.city': 1, price: 1 });
PropertySchema.index({ propertyType: 1, isAvailable: 1 });
PropertySchema.index({ ownerId: 1, createdAt: -1 });
PropertySchema.index({ isBoosted: -1, isFeatured: -1, createdAt: -1 });

// models/User.ts
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ refreshToken: 1 });

// models/Booking.ts
BookingSchema.index({ tenantId: 1, status: 1 });
BookingSchema.index({ ownerId: 1, status: 1 });
BookingSchema.index({ propertyId: 1, startDate: 1, endDate: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });

// models/Notification.ts
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// models/Message.ts
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
```

---

### 7. Add Health Check Endpoint (10 min)

Create `app/api/health/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import redis from '@/lib/redis';

export async function GET(req: NextRequest) {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  try {
    await connectDB();
    checks.services.database = 'healthy';
  } catch (error) {
    checks.services.database = 'unhealthy';
    checks.status = 'degraded';
  }

  try {
    await redis.ping();
    checks.services.redis = 'healthy';
  } catch (error) {
    checks.services.redis = 'unhealthy';
    checks.status = 'degraded';
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  
  return new Response(JSON.stringify(checks, null, 2), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
```

Test: `curl http://localhost:3000/api/health`

---

### 8. Optimize Images (10 min)

Update `next.config.ts`:

```typescript
images: {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 31536000, // 1 year
  dangerouslyAllowSVG: false,
  contentDispositionType: 'attachment',
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'res.cloudinary.com' },
  ],
}
```

---

## Testing Your Fixes

### 1. Test Rate Limiting

```bash
# Should fail after 5 attempts
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### 2. Test Reduced Motion

```javascript
// In browser console
matchMedia('(prefers-reduced-motion: reduce)').matches
// Change in OS settings and reload
```

### 3. Test Health Check

```bash
curl http://localhost:3000/api/health
```

### 4. Test Error Boundary

```typescript
// Add to any component temporarily
throw new Error('Test error boundary');
```

---

## Verification Checklist

After implementing fixes:

- [ ] Rate limiting works on auth routes
- [ ] Input sanitization applied to all POST routes
- [ ] Reduced motion respected in animations
- [ ] Logger used instead of console.log
- [ ] Error boundary catches errors
- [ ] Database indexes created
- [ ] Health check endpoint responds
- [ ] Images optimized
- [ ] No TypeScript errors
- [ ] All tests pass

---

## Run These Commands

```bash
# 1. Install any missing dependencies (if needed)
npm install

# 2. Run type check
npx tsc --noEmit

# 3. Run tests
npm test

# 4. Run linter
npm run lint

# 5. Build for production
npm run build

# 6. Start production server
npm start
```

---

## Monitoring After Deployment

### Check Logs

```bash
# View application logs
pm2 logs nestora

# View worker logs
pm2 logs nestora-workers
```

### Monitor Health

```bash
# Set up monitoring (cron job)
*/5 * * * * curl -f http://localhost:3000/api/health || echo "Health check failed"
```

### Database Performance

```javascript
// In MongoDB shell
db.properties.getIndexes()
db.properties.stats()
```

---

## Next Steps (Optional)

1. **Set up Sentry** for error tracking
2. **Add Redis-based rate limiting** for production
3. **Implement API caching** with Redis
4. **Add request logging** middleware
5. **Set up CI/CD** with automated tests
6. **Configure monitoring** (Datadog, New Relic)
7. **Add API documentation** (Swagger/OpenAPI)
8. **Implement webhook retry logic**
9. **Add database backups** automation
10. **Set up load balancing** for scale

---

## Estimated Time

- **Priority 1**: 30 minutes ⏱️
- **Priority 2**: 20 minutes ⏱️
- **Priority 3**: 30 minutes ⏱️
- **Testing**: 15 minutes ⏱️

**Total**: ~1.5 hours for all critical fixes

---

## Need Help?

- Check `AUDIT_REPORT.md` for detailed explanations
- Review `UI_ENHANCEMENTS.md` for UI improvements
- See `IMPLEMENTATION_EXAMPLES.tsx` for code examples

Good luck! 🚀
