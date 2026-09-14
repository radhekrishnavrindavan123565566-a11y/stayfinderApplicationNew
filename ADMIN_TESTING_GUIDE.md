# Admin Dashboard Testing Guide

## Overview
The admin dashboard has been built with the following modules:

1. **Overview Dashboard** - KPI metrics and real-time activity
2. **Property Listings Management** - Approve/reject properties, manage listings
3. **User Directory** - Manage owners and tenants
4. **Leads & Visit Inquiries** - Lead status tracking and export
5. **Content Management** - Banners and notifications

## Accessing the Admin Dashboard

### URL
```
http://localhost:3000/admin/dashboard
```

### Current Status
⚠️ **MongoDB Connection Issue**: The dashboard requires database connection.

**Two Ways to Test:**

## Option 1: Fix MongoDB Connection (Recommended for Production)

### Steps:
1. Go to https://cloud.mongodb.com
2. Navigate to **Network Access** in the left sidebar
3. Click **Add IP Address**
4. Choose one:
   - Add your current IP address
   - OR Select "Allow Access from Anywhere" (0.0.0.0/0) for development
5. Click **Confirm**
6. Wait 1-2 minutes for changes to apply
7. Refresh your browser

### Verify Connection:
- If successful, the admin dashboard will load with real data
- Check browser console for no 500 errors
- Properties, users, and inquiry data will display

---

## Option 2: Use Mock Data (Quick Testing)

Mock data is available in `lib/mockData.ts` with sample:
- 1,250 properties (890 active, 145 pending)
- 5,420 tenants and 1,850 owners
- 2,340 inquiries with various statuses
- Real-time activity feed

To use mock data, you can manually test by:

1. Inspecting browser console → Application tab
2. Checking the mock data structure in `lib/mockData.ts`
3. Testing UI components locally

---

## Features to Test

### 1. Overview Dashboard ✓
**What to verify:**
- [ ] Stats cards display (Properties, Users, Inquiries, Revenue)
- [ ] Real-time activity feed loads
- [ ] Growth metrics show percentages
- [ ] Top cities chart displays correctly
- [ ] Quick action buttons work
- [ ] Charts and graphs render properly

**Steps:**
1. Load `/admin/dashboard`
2. Check all stat cards update
3. Scroll to see activity feed
4. Verify responsive design on mobile

---

### 2. Property Listings Management ✓
**What to verify:**
- [ ] Property table loads with all columns
- [ ] Search functionality filters properties
- [ ] Status filter works (Active, Pending, Hidden)
- [ ] Price range filter works
- [ ] City filter works
- [ ] Pagination works (if many properties)
- [ ] Click property to view details
- [ ] Approve button updates status
- [ ] Reject button shows reason modal
- [ ] Bulk operations work
- [ ] Edit property data inline

**Steps:**
1. Navigate to Property Listings section
2. Test each filter
3. Try approving a property
4. Try rejecting with a reason
5. Check status updates in real-time

---

### 3. User Directory ✓
**What to verify:**
- [ ] Owners tab displays owner list
- [ ] Tenants tab displays tenant list
- [ ] Filter by city works
- [ ] Filter by verification status works
- [ ] Search by name/email works
- [ ] Block/Unblock user works
- [ ] Verify user works
- [ ] Click user shows profile details
- [ ] Response rate displays correctly
- [ ] Last activity shows correctly
- [ ] Trust badges display

**Steps:**
1. Go to User Directory
2. Test Owner and Tenant tabs
3. Try blocking a user
4. Try verifying a user
5. Check user details modal

---

### 4. Leads & Visit Inquiries ✓
**What to verify:**
- [ ] Inquiry table displays all leads
- [ ] Status column shows current state
- [ ] Status dropdown allows valid transitions only
- [ ] Status change saves to database
- [ ] Follow-up reminder checkbox works
- [ ] Visit date/time picker works
- [ ] Call duration input works
- [ ] Close reason dropdown works
- [ ] Export to CSV works
- [ ] Export to Excel works
- [ ] Filter by status works
- [ ] Filter by priority works
- [ ] Search by tenant name works

**Test Status Transitions:**
```
new_lead → call_done (requires call duration + notes)
call_done → visit_scheduled (requires date + time)
visit_scheduled → closed_booked OR closed_not_interested
closed_booked/not_interested → (terminal state)
```

**Steps:**
1. Go to Leads section
2. Select a lead with status "new_lead"
3. Change status to "call_done"
4. Fill in call duration and notes
5. Change to "visit_scheduled"
6. Set visit date and time
7. Try exporting to CSV/Excel
8. Verify audit logs were created

---

### 5. Content Management ✓
**What to verify:**
- [ ] Banner list displays
- [ ] Create new banner works
- [ ] Edit banner works
- [ ] Delete banner works
- [ ] Banner ordering works
- [ ] Banner schedule date works
- [ ] Banner status toggles (active/inactive)
- [ ] Notification form accepts message
- [ ] Multi-channel selection works (In-app, WhatsApp, SMS, Email)
- [ ] Target audience filters work
- [ ] Send notification works
- [ ] Notification history shows delivery stats

**Steps:**
1. Go to Content Management
2. Click "Create Banner"
3. Fill banner details
4. Set active date range
5. Save and verify appears in list
6. Try sending a notification
7. Select multiple channels
8. Verify notification sent

---

## Testing API Endpoints Directly

### Test with curl or Postman:

```bash
# Get stats
curl http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get properties
curl http://localhost:3000/api/admin/properties \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get users
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get inquiries
curl http://localhost:3000/api/admin/inquiries \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Update inquiry status
curl -X PATCH http://localhost:3000/api/admin/inquiries/[inquiry-id]/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newStatus": "call_done",
    "callDuration": 15,
    "notes": "Customer interested, scheduling visit"
  }'

# Approve property
curl -X POST http://localhost:3000/api/admin/properties/[property-id]/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve", "notes": "All docs verified"}'

# Export leads
curl -X POST http://localhost:3000/api/admin/inquiries/export \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"format": "csv", "filters": {"status": "new_lead"}}'
```

---

## Known Limitations (Development)

1. **Database Connection**: Requires MongoDB Atlas IP whitelist
2. **Authentication**: Admin token required for all API calls
3. **Real-time Updates**: Not yet implemented (manual refresh needed)
4. **Notifications**: Mock implementation (not actually sending SMS/WhatsApp)
5. **Audit Logs**: Stored in database (requires connection)
6. **Export**: CSV export works, Excel requires additional library setup

---

## Troubleshooting

### 500 Error on Admin Dashboard
**Cause**: MongoDB connection failed
**Solution**: 
1. Check `.env` file for MONGODB_URI
2. Whitelist your IP in MongoDB Atlas
3. Check network connectivity

### 401 Unauthorized
**Cause**: Invalid or missing auth token
**Solution**:
1. Log in as admin first
2. Check JWT token in local storage
3. Verify admin role in database

### Data Not Updating
**Cause**: Browser cache
**Solution**:
1. Hard refresh (Ctrl+Shift+R)
2. Clear local storage
3. Clear browser cache

---

## Next Steps After Testing

1. ✅ Verify all 5 modules work
2. ✅ Test all status transitions
3. ✅ Test all filters and searches
4. ✅ Test exports (CSV/Excel)
5. ✅ Test user blocking/verification
6. ✅ Test property approval workflow
7. 🔄 Set up real-time WebSocket updates
8. 🔄 Connect actual SMS/WhatsApp service
9. 🔄 Implement admin role verification
10. 🔄 Add audit log viewing interface

---

## Database Models Used

- `Property` - Property listings
- `User` - Owners and tenants
- `Inquiry` - Lead inquiries
- `Banner` - Promotional banners
- `AdminAuditLog` - Admin action tracking
- `LeadStatusHistory` - Lead status changes

All models are in `models/` directory.
