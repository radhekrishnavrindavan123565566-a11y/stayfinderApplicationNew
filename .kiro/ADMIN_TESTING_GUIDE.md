# SST Home Solutions - Admin Dashboard Testing Guide

## 🎯 Overview
Complete testing guide for the newly built admin dashboard with 5 main sections.

---

## 📋 Admin Dashboard Sections

### 1️⃣ **Overview Dashboard** (Home Screen)
**URL:** `http://localhost:3000/admin/dashboard?tab=overview`

#### What to Test:
- [ ] **Quick Stats Cards** display correctly:
  - Total Properties (Active / Pending / Inactive)
  - Total Owners & Total Tenants
  - New Inquiries (Today & This Week)
  - Revenue metrics

- [ ] **Recent Activity Feed** shows:
  - Latest property posts
  - Recent inquiries
  - Latest bookings/transactions

- [ ] **Conversion Rate** calculation is accurate
- [ ] **Growth Metrics** display properly
- [ ] **Top Cities** section shows inquiry volume by city
- [ ] **Quick Action Shortcuts** are accessible

#### API Endpoints Used:
```
GET /api/admin/stats
```

#### Expected Response:
```json
{
  "properties": {
    "total": 10000,
    "active": 8500,
    "pending": 1200,
    "inactive": 300,
    "featured": 200,
    "rejected": 0
  },
  "users": {
    "totalTenants": 50000,
    "totalOwners": 5000,
    "newThisMonth": 500,
    "verified": 4800,
    "blocked": 50
  },
  "inquiries": {
    "total": 25000,
    "today": 150,
    "thisWeek": 1200,
    "newLeads": 300,
    "closedDeals": 5000
  },
  "bookings": {
    "confirmed": 3000,
    "ongoing": 1500,
    "completed": 2000,
    "cancelled": 50
  },
  "revenue": {
    "totalRevenue": 15000000,
    "pendingPayments": 500000,
    "monthlyRecurring": 1000000
  },
  "topCities": [
    { "city": "Lucknow", "count": 5000 },
    { "city": "Prayagraj", "count": 3000 },
    { "city": "Kanpur", "count": 2000 },
    { "city": "Varanasi", "count": 1500 },
    { "city": "Noida", "count": 1000 }
  ],
  "recentActivity": [
    {
      "_id": "...",
      "action": "property_posted",
      "description": "New property: 3BHK in Lucknow",
      "timestamp": "2026-09-11T10:30:00Z"
    }
  ]
}
```

---

### 2️⃣ **Property Listings Management**
**URL:** `http://localhost:3000/admin/dashboard?tab=properties`

#### What to Test:

##### A. Display & Filtering
- [ ] **Property Table** loads with all columns:
  - Property title
  - Location (city, address)
  - Property type (1BHK, Room, etc.)
  - Rent amount
  - Owner name & contact
  - Status badge
  - Verification status
  - View count
  - Rating & reviews count

- [ ] **Filter Options** work:
  - [ ] Filter by city (dropdown)
  - [ ] Filter by property type
  - [ ] Filter by status (Active, Pending, Booked, Hidden)
  - [ ] Filter by verification (Verified, Unverified, Rejected)
  - [ ] Price range slider
  - [ ] Search box for property title/address

- [ ] **Sorting Options** work:
  - [ ] Sort by newest
  - [ ] Sort by views
  - [ ] Sort by price
  - [ ] Sort by rating

- [ ] **Pagination** works:
  - [ ] Next/Previous buttons
  - [ ] Jump to page number
  - [ ] Items per page selector (10, 25, 50, 100)

##### B. Property Actions
- [ ] **Approve Button** (for pending properties):
  - Click approve on a pending property
  - Property status changes to "active"
  - Owner receives notification
  - Audit log created

- [ ] **Reject Button** (for pending properties):
  - Click reject
  - Modal appears with rejection reason
  - Type reason and submit
  - Property status changes to "rejected"
  - Owner receives notification with reason

- [ ] **Status Change Dropdown**:
  - Change status between: Active → Booked → Hidden → Archived
  - Status updates immediately
  - Audit log is recorded

- [ ] **Edit Property**:
  - Click edit icon
  - Modal opens with property details
  - Edit title, price, description, amenities
  - Save changes
  - Property updates in database

- [ ] **Delete Property**:
  - Click delete icon
  - Confirmation dialog appears
  - Confirm deletion
  - Property is marked as archived
  - Audit log created

- [ ] **Bulk Operations**:
  - [ ] Multi-select checkboxes work
  - [ ] "Select All" checkbox
  - [ ] Bulk status change (if available)
  - [ ] Bulk delete (if available)

#### API Endpoints Used:
```
GET /api/admin/properties
POST /api/admin/properties
PATCH /api/admin/properties/[id]
DELETE /api/admin/properties/[id]
POST /api/admin/properties/[id]/approve
```

#### Test Data to Use:
1. Create a test property in pending status
2. Approve it → should become active
3. Reject another → should become rejected
4. Edit pricing on an active property
5. Change status between active/booked/hidden

---

### 3️⃣ **User Directory** (Owners & Tenants)
**URL:** `http://localhost:3000/admin/dashboard?tab=users`

#### What to Test:

##### A. Owners Tab
- [ ] **Owners Table** displays:
  - Username & Email
  - Phone number
  - City
  - Property count
  - Verification status (badge)
  - Response rate percentage
  - Trust score
  - Last activity timestamp

- [ ] **Owner Filters**:
  - [ ] Filter by verification status (Verified, Unverified, Rejected)
  - [ ] Filter by city
  - [ ] Filter by plan type (free, basic, pro, enterprise)
  - [ ] Filter by fraud risk level (low, medium, high)
  - [ ] Search by name/email

- [ ] **Owner Actions**:
  - [ ] **Call Owner** - Click call button → triggers WhatsApp/phone
  - [ ] **Verify Owner** - Admin can verify unverified owners
  - [ ] **Block/Unblock** - Toggle owner block status
  - [ ] **Suspend Account** - Temporary suspension
  - [ ] **View Properties** - See all properties by owner
  - [ ] **View Transactions** - See payment history

##### B. Tenants Tab
- [ ] **Tenants Table** displays:
  - Username & Email
  - Phone & Registration date
  - Inquiries count
  - Active inquiries
  - Bookings count
  - Credit score (if available)
  - Fraud risk level
  - Verification status
  - Last activity

- [ ] **Tenant Filters**:
  - [ ] Filter by verification status
  - [ ] Filter by city
  - [ ] Filter by fraud risk
  - [ ] Search by name/email

- [ ] **Tenant Actions**:
  - [ ] **Block Tenant** - Prevent from making inquiries
  - [ ] **Unblock Tenant** - Re-enable access
  - [ ] **View Inquiries** - See all their inquiries
  - [ ] **View Bookings** - See booking history
  - [ ] **Send Message** - Contact tenant directly

#### API Endpoints Used:
```
GET /api/admin/users
POST /api/admin/users/block
POST /api/admin/users/unblock
POST /api/admin/users/verify
GET /api/admin/users/[id]/properties
```

---

### 4️⃣ **Leads & Visit Inquiries Management** ⭐ (Revenue Engine)
**URL:** `http://localhost:3000/admin/dashboard?tab=leads`

#### What to Test:

##### A. Lead Display & Filtering
- [ ] **Leads Table** shows:
  - Inquiry ID
  - Tenant name & phone
  - Property title
  - Owner name
  - Current status (badge with color)
  - Inquiry date & time
  - Next follow-up date (if applicable)
  - Source (app, website, WhatsApp, call)
  - Priority (low, medium, high)

- [ ] **Lead Filters**:
  - [ ] Filter by status:
    - new_lead
    - call_done
    - visit_scheduled
    - visit_completed
    - closed_booked
    - closed_not_interested
  - [ ] Filter by priority
  - [ ] Filter by source
  - [ ] Filter by property
  - [ ] Filter by date range
  - [ ] Search by tenant name/property

- [ ] **Sorting**:
  - [ ] Sort by newest inquiries
  - [ ] Sort by status
  - [ ] Sort by follow-up due date
  - [ ] Sort by priority

##### B. Lead Status Transition (State Machine)
Test the workflow: `new_lead` → `call_done` → `visit_scheduled` → `closed_booked` OR `closed_not_interested`

**Test Case 1: New Lead → Call Done**
- [ ] Click on a "new_lead" inquiry
- [ ] Click "Mark as Call Done"
- [ ] Modal opens with fields:
  - [ ] Call duration (required, must be > 0)
  - [ ] Call notes (required)
  - [ ] Follow-up date (auto-set to +2 days)
- [ ] Submit
- [ ] Status changes to "call_done" ✓
- [ ] Audit log created ✓
- [ ] Two-day follow-up reminder scheduled ✓

**Test Case 2: Call Done → Visit Scheduled**
- [ ] On a "call_done" inquiry
- [ ] Click "Schedule Visit"
- [ ] Modal with:
  - [ ] Visit date (must be future date)
  - [ ] Visit time
  - [ ] Visit notes (optional)
- [ ] Submit
- [ ] Status becomes "visit_scheduled" ✓
- [ ] Notifications sent to tenant & owner ✓
- [ ] Calendar event created (if integrated)

**Test Case 3: Visit Completed → Booking or Not Interested**
- [ ] On a "visit_completed" inquiry (manual transition for testing)
- [ ] Option 1: "Mark as Booked"
  - [ ] Booking ID auto-generated
  - [ ] Status → "closed_booked"
  - [ ] Booking record created
  - [ ] Property availability updated
  - [ ] Invoice generated
- [ ] Option 2: "Not Interested"
  - [ ] Reason (dropdown: no_match, too_expensive, found_elsewhere, etc.)
  - [ ] Status → "closed_not_interested"
  - [ ] No follow-up scheduled

**Test Case 4: Invalid Transitions (Should Fail)**
- [ ] Try to go from "new_lead" directly to "closed_booked" → Should show error ❌
- [ ] Try to go from "closed_booked" to any other status → Should prevent ❌

##### C. Lead Details & History
- [ ] **View Lead Details Panel**:
  - [ ] Full tenant profile
  - [ ] Property details
  - [ ] Complete status history with timestamps
  - [ ] All notes/comments
  - [ ] Conversation/message link (if available)
  - [ ] Previous inquiries by this tenant

##### D. Bulk Export
- [ ] **Export to CSV**:
  - [ ] Select filters
  - [ ] Click "Export as CSV"
  - [ ] File downloads
  - [ ] CSV contains all lead details
  - [ ] Can be imported to Excel

- [ ] **Export to Excel (XLSX)**:
  - [ ] Similar to CSV
  - [ ] Better formatting in Excel
  - [ ] All columns included

#### API Endpoints Used:
```
GET /api/admin/inquiries
PATCH /api/admin/inquiries/[id]/status
POST /api/admin/inquiries/export
```

#### Test Data Creation:
```javascript
// Create test leads with different statuses
POST /api/admin/inquiries
{
  "tenantId": "...",
  "propertyId": "...",
  "ownerId": "...",
  "status": "new_lead",
  "source": "app",
  "priority": "high"
}
```

---

### 5️⃣ **App Content & Banners Management**
**URL:** `http://localhost:3000/admin/dashboard?tab=content`

#### What to Test:

##### A. Banner Management

**Create New Banner:**
- [ ] Click "Add Banner" button
- [ ] Form appears with fields:
  - [ ] Banner title
  - [ ] Description
  - [ ] Image upload (drag & drop or file picker)
  - [ ] Image alt text
  - [ ] Action URL (internal or external)
  - [ ] Action type (link, property, category, etc.)
  - [ ] Start date (scheduling)
  - [ ] End date (auto-expiry)
  - [ ] Target audience:
    - [ ] Role (tenant, owner, admin)
    - [ ] Cities (multi-select)
    - [ ] User segments
  - [ ] Display platform (app, web, or both)
- [ ] Submit
- [ ] Banner appears in list ✓

**Edit Banner:**
- [ ] Click edit icon on existing banner
- [ ] Modal pre-fills with current values
- [ ] Modify any field
- [ ] Save changes
- [ ] Audit log created ✓

**Delete Banner:**
- [ ] Click delete icon
- [ ] Confirmation dialog
- [ ] Confirm deletion
- [ ] Banner removed from list ✓

**Banner Performance Tracking:**
- [ ] View banner analytics:
  - [ ] Impressions count
  - [ ] Clicks count
  - [ ] Click-through rate (CTR)
  - [ ] Platform breakdown (app vs web)
  - [ ] Device breakdown (mobile, desktop, tablet)

##### B. Notification System

**Send Notification:**
- [ ] Click "Send Notification" button
- [ ] Form with:
  - [ ] Title
  - [ ] Message body
  - [ ] Notification type (info, warning, alert, success)
  - [ ] Channels (multi-select):
    - [ ] In-app notification
    - [ ] WhatsApp
    - [ ] SMS
    - [ ] Email
  - [ ] Target audience:
    - [ ] Role-based (tenant, owner, admin)
    - [ ] Geographic (city filter)
    - [ ] Specific users (optional)
  - [ ] Schedule (immediate or scheduled for later)

**Send Now:**
- [ ] Fill form
- [ ] Click "Send Now"
- [ ] Notifications dispatched immediately ✓
- [ ] Delivery stats show in real-time

**Schedule Notification:**
- [ ] Fill form
- [ ] Select "Schedule for later"
- [ ] Pick date & time
- [ ] Click "Schedule"
- [ ] Notification queued ✓
- [ ] Shows scheduled timestamp

**Notification History:**
- [ ] View all sent notifications
- [ ] Filter by status (sent, failed, pending)
- [ ] View delivery stats:
  - [ ] Total recipients
  - [ ] Successfully delivered
  - [ ] Failed
  - [ ] Opens/clicks (if tracked)

#### API Endpoints Used:
```
GET /api/admin/banners
POST /api/admin/banners
PUT /api/admin/banners/[id]
DELETE /api/admin/banners/[id]

GET /api/admin/notifications
POST /api/admin/notifications
PUT /api/admin/notifications/[id]
DELETE /api/admin/notifications/[id]
```

---

## 🔍 Cross-Functional Testing

### Audit Logging
For EVERY action taken in the admin dashboard, verify:
- [ ] Audit log entry created
- [ ] Admin ID recorded
- [ ] Action type recorded (property_approved, lead_status_changed, etc.)
- [ ] Timestamp accurate
- [ ] Changes documented (old value → new value)

**Check Audit Logs:**
```bash
# In MongoDB
db.admin_audit_logs.find().sort({ createdAt: -1 }).limit(10)
```

### Role-Based Access Control
- [ ] Super Admin can access all sections
- [ ] Admin can access all sections
- [ ] Support staff (if role exists) has limited access
- [ ] Unauthorized users see "Access Denied" ❌

### Real-Time Updates
- [ ] When one admin makes change, other admins see update
- [ ] Activity feed updates in real-time
- [ ] Stats refresh automatically

### Error Handling
Test error scenarios:
- [ ] Invalid inquiry ID → 404 error shown
- [ ] Missing required fields → Validation error shown
- [ ] Network timeout → Retry option offered
- [ ] Database error → User-friendly error message

---

## 📊 Performance Testing

- [ ] Overview dashboard loads in < 3 seconds
- [ ] Properties table with 1000+ items loads smoothly
- [ ] Filters apply instantly
- [ ] Pagination works without delay
- [ ] Bulk export doesn't hang (< 5 seconds for 10K records)

---

## 🔐 Security Testing

- [ ] Admin session expires after inactivity
- [ ] Cannot access /admin without authentication
- [ ] CSRF tokens validated on form submissions
- [ ] Input validation prevents SQL injection
- [ ] Rate limiting on API endpoints (prevent spam)
- [ ] Audit trails cannot be modified/deleted

---

## 📱 Mobile Responsive Testing

On mobile devices (or browser dev tools):
- [ ] Sidebar converts to hamburger menu ✓
- [ ] Tables remain readable (horizontal scroll if needed)
- [ ] Touch-friendly buttons (min 44px)
- [ ] Forms stack vertically
- [ ] Modals fit screen

---

## ✅ Quick Checklist - Priority Order

**CRITICAL (Must Work):**
- [ ] Overview dashboard stats display
- [ ] Property approval/rejection workflow
- [ ] Lead status transitions (new → call → visit → booked)
- [ ] User blocking/verification
- [ ] Notifications can be sent

**HIGH (Should Work):**
- [ ] All filters work
- [ ] Pagination works
- [ ] Bulk export works
- [ ] Audit logs created
- [ ] Real-time updates

**MEDIUM (Nice to Have):**
- [ ] Banner analytics
- [ ] Scheduled notifications
- [ ] Performance optimizations
- [ ] Mobile responsiveness

---

## 🚀 How to Test

### Step 1: Access Admin Dashboard
```
URL: http://localhost:3000/admin/dashboard
or http://localhost:3000/admin
```

### Step 2: Choose a Section
Click on tabs: Overview → Properties → Users → Leads → Content

### Step 3: Test Functionality
Follow the detailed steps above for each section

### Step 4: Check Audit Logs
```bash
# In MongoDB terminal:
db.admin_audit_logs.findOne({ action: "property_approved" })
```

### Step 5: Verify Notifications
Check if tenant/owner received notifications for property approval, visit scheduling, etc.

---

## 📝 Reporting Issues

When you find a bug, note:
1. **Section**: Which admin section (overview, properties, leads, etc.)
2. **Action**: What you were trying to do
3. **Expected**: What should happen
4. **Actual**: What actually happened
5. **Steps**: How to reproduce
6. **Screenshots**: If applicable

---

**Last Updated:** September 11, 2026
**Version:** 1.0 - Admin Dashboard
