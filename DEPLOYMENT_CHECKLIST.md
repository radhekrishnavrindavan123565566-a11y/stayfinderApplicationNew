# 🚀 Production Deployment Checklist

## Pre-Deployment Automated Checks

### Run All Verification Scripts
```bash
# Run complete verification suite
npm run check:all

# Or run individually:
npm run lint                    # ESLint check
npm run check:auth              # Authentication route verification
npm run verify                  # Pre-production comprehensive check
npm run build                   # Production build test
```

---

## 1. Code Quality ✅

### Automated Checks
- [ ] TypeScript compilation: `npx tsc --noEmit`
- [ ] ESLint: `npm run lint`
- [ ] No console.log statements in production code
- [ ] No commented-out code blocks
- [ ] No TODO/FIXME comments for critical features

### Manual Review
- [ ] Code reviewed by at least one other developer
- [ ] All PR comments addressed
- [ ] No merge conflicts
- [ ] Git history is clean

---

## 2. Authentication & Security 🔒

### Automated Checks
- [ ] All API routes have proper auth checks: `npm run check:auth`
- [ ] No hardcoded secrets or passwords
- [ ] No eval() usage
- [ ] No dangerouslySetInnerHTML without sanitization

### Manual Verification
- [ ] Test login flow (valid credentials)
- [ ] Test login flow (invalid credentials)
- [ ] Test logout functionality
- [ ] Test token expiration handling
- [ ] Test role-based access control
  - [ ] Tenant can access tenant endpoints
  - [ ] Owner can access owner endpoints
  - [ ] Admin can access admin endpoints
  - [ ] Unauthorized access returns 401
  - [ ] Forbidden access returns 403

---

## 3. Database & Models 💾

### Automated Checks
- [ ] No duplicate indexes in models
- [ ] All models use `mongoose.models` pattern

### Manual Verification
- [ ] Database connection string is correct
- [ ] Database indexes are optimized
- [ ] Migration scripts tested (if any)
- [ ] Backup strategy in place
- [ ] Database credentials secured

---

## 4. Environment Variables 🌍

### Required Variables
```bash
# Core
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
NEXT_PUBLIC_API_URL=

# Email (if using)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=

# SMS (if using)
SMS_API_KEY=

# Payment (if using)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Storage (if using)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
```

### Checklist
- [ ] All required env vars documented in `.env.example`
- [ ] Production env vars set in hosting platform
- [ ] No sensitive data in `.env.example`
- [ ] `.env` file in `.gitignore`
- [ ] Env vars validated on startup

---

## 5. API Endpoints Testing 🧪

### Critical Endpoints
```bash
# Authentication
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] POST /api/auth/logout
- [ ] GET  /api/auth/me
- [ ] POST /api/auth/refresh

# Bookings
- [ ] GET  /api/bookings
- [ ] POST /api/bookings
- [ ] GET  /api/bookings/[id]
- [ ] PATCH /api/bookings/[id]
- [ ] POST /api/bookings/[id]/move-in-confirm

# Properties
- [ ] GET  /api/properties
- [ ] POST /api/properties
- [ ] GET  /api/properties/[id]
- [ ] PUT  /api/properties/[id]
- [ ] DELETE /api/properties/[id]

# Admin
- [ ] GET  /api/admin/stats
- [ ] GET  /api/admin/users
- [ ] PATCH /api/admin/users/[id]
```

### Test Scenarios
- [ ] Valid requests return expected data
- [ ] Invalid requests return proper error codes
- [ ] Unauthorized requests return 401
- [ ] Forbidden requests return 403
- [ ] Not found requests return 404
- [ ] Malformed requests return 400

---

## 6. Frontend Testing 🎨

### Pages
- [ ] Home page loads correctly
- [ ] Login page works
- [ ] Register page works
- [ ] Dashboard loads for all roles
- [ ] Property listing page works
- [ ] Property detail page works
- [ ] Booking flow works end-to-end
- [ ] Admin panel accessible (admin only)

### Responsive Design
- [ ] Mobile (320px - 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1024px+)

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Dark Mode
- [ ] All pages readable in dark mode
- [ ] No contrast issues
- [ ] Images/icons visible

---

## 7. Performance 🚄

### Build Optimization
- [ ] Production build completes successfully
- [ ] Build size is reasonable (<5MB)
- [ ] No build warnings
- [ ] Images optimized
- [ ] Code splitting working

### Runtime Performance
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] No memory leaks
- [ ] API response time < 1 second
- [ ] Database queries optimized

### Monitoring
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (Google Analytics, etc.)
- [ ] Performance monitoring configured
- [ ] Uptime monitoring configured

---

## 8. Error Handling 🚨

### Frontend
- [ ] All API errors handled gracefully
- [ ] User-friendly error messages
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Network error handling

### Backend
- [ ] All endpoints have try-catch blocks
- [ ] Errors logged properly
- [ ] Error responses consistent
- [ ] No sensitive data in error messages
- [ ] Database errors handled

---

## 9. Data & Content 📝

### Database
- [ ] Test data removed
- [ ] Production data seeded (if needed)
- [ ] Database backed up
- [ ] Indexes created

### Content
- [ ] All placeholder text replaced
- [ ] All images have alt text
- [ ] All links work
- [ ] Contact information correct
- [ ] Legal pages (Privacy, Terms) present

---

## 10. Third-Party Services 🔌

### Email
- [ ] Email service configured
- [ ] Email templates tested
- [ ] Unsubscribe links work
- [ ] Bounce handling configured

### SMS
- [ ] SMS service configured
- [ ] SMS templates tested
- [ ] Opt-out mechanism works

### Payment
- [ ] Payment gateway configured
- [ ] Test transactions work
- [ ] Webhook endpoints secured
- [ ] Refund process tested

### Storage
- [ ] File upload works
- [ ] File download works
- [ ] Storage limits configured
- [ ] CDN configured (if using)

---

## 11. SEO & Accessibility ♿

### SEO
- [ ] Meta tags present on all pages
- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Canonical URLs set

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Color contrast sufficient
- [ ] Focus indicators visible

---

## 12. Security Hardening 🛡️

### Headers
- [ ] CORS configured correctly
- [ ] CSP headers set
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set
- [ ] Strict-Transport-Security set

### Authentication
- [ ] Password hashing (bcrypt)
- [ ] JWT tokens secure
- [ ] Refresh token rotation
- [ ] Rate limiting configured
- [ ] CSRF protection enabled

### Data Protection
- [ ] Sensitive data encrypted
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Input validation
- [ ] Output sanitization

---

## 13. Deployment Process 🚢

### Pre-Deployment
- [ ] All checks above completed
- [ ] Staging environment tested
- [ ] Database migration plan ready
- [ ] Rollback plan documented
- [ ] Team notified

### Deployment
- [ ] Deploy to production
- [ ] Run database migrations
- [ ] Verify deployment successful
- [ ] Check error logs
- [ ] Monitor performance

### Post-Deployment
- [ ] Smoke test critical flows
- [ ] Monitor error rates
- [ ] Check analytics
- [ ] Verify email/SMS working
- [ ] Test payment flow

---

## 14. Documentation 📚

### Code Documentation
- [ ] README.md updated
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Setup instructions clear
- [ ] Troubleshooting guide present

### User Documentation
- [ ] User guide available
- [ ] FAQ updated
- [ ] Help center content current
- [ ] Video tutorials (if any)

---

## 15. Monitoring & Alerts 📊

### Setup
- [ ] Error tracking active
- [ ] Performance monitoring active
- [ ] Uptime monitoring active
- [ ] Log aggregation configured
- [ ] Alert thresholds set

### Alerts
- [ ] Error rate alerts
- [ ] Performance degradation alerts
- [ ] Downtime alerts
- [ ] Database alerts
- [ ] Disk space alerts

---

## Quick Command Reference

```bash
# Run all checks
npm run check:all

# Individual checks
npm run lint                    # ESLint
npm run check:auth              # Auth routes
npm run verify                  # Full verification
npm run build                   # Production build

# Testing
npm run test                    # Unit tests
npm run test:integration        # Integration tests
npm run test:e2e                # E2E tests

# Development
npm run dev                     # Start dev server
npm run workers                 # Start background workers
```

---

## Emergency Rollback Plan 🆘

If issues are discovered after deployment:

1. **Immediate Actions**
   ```bash
   # Revert to previous version
   git revert HEAD
   git push origin main
   
   # Or rollback deployment (platform-specific)
   vercel rollback  # For Vercel
   # or use your platform's rollback command
   ```

2. **Communication**
   - Notify team immediately
   - Post status update
   - Inform affected users (if needed)

3. **Investigation**
   - Check error logs
   - Review recent changes
   - Identify root cause
   - Create hotfix if needed

4. **Resolution**
   - Fix issue in development
   - Test thoroughly
   - Deploy fix
   - Verify resolution

---

## Sign-Off

Before deploying to production, ensure:

- [ ] All automated checks pass
- [ ] All manual tests complete
- [ ] Team lead approval
- [ ] Stakeholder approval (if needed)
- [ ] Deployment window scheduled
- [ ] Team available for monitoring

**Deployed by:** _______________  
**Date:** _______________  
**Version:** _______________  
**Approved by:** _______________  

---

## Post-Deployment Verification (First 24 Hours)

- [ ] Hour 1: Monitor error rates
- [ ] Hour 2: Check performance metrics
- [ ] Hour 4: Verify user registrations working
- [ ] Hour 8: Check booking flow
- [ ] Hour 12: Review payment transactions
- [ ] Hour 24: Full system health check

---

**Remember:** It's better to delay deployment than to deploy with known issues!
