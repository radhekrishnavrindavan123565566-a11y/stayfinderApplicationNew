# Admin Dashboard - Quick Start Guide

## 🚀 Access the Admin Dashboard

### Main URL
```
http://localhost:3000/admin/dashboard
```

---

## 📑 Dashboard Sections

### 1. **Overview Dashboard**
- **What it shows:** Key metrics, stats, and recent activity
- **Key Metrics:**
  - Total properties (active, pending, inactive)
  - User counts (tenants, owners)
  - Inquiry & lead statistics
  - Revenue data
  - Conversion rates
  - Top performing cities
- **Quick Test:** Load the page and verify all numbers display

### 2. **Properties Management**
- **What it does:** Manage all property listings
- **Key Features:**
  - View all properties with filters
  - Approve/Reject pending properties
  - Edit property details
  - Change property status
  - Delete properties
  - Bulk operations
- **Quick Test:**
  1. Apply a filter (e.g., city = "Lucknow")
  2. Look for pending properties
  3. Click "Approve" button
  4. Verify status changes to "Active"

### 3. **Users Directory**
- **What it does:** Manage owners and tenants
- **Key Features:**
  - View all owners (properties posted, verification status)
  - View all tenants (inquiries, bookings)
  - Block/Unblock users
  - Verify owner accounts
  - View interaction history
- **Quick Test:**
  1. Switch to "Owners" tab
  2. Find an owner
  3. Click "Block" → User is blocked ✓
  4. Click "Unblock" → User is unblocked ✓

### 4. **Leads Management** ⭐ Most Important
- **What it does:** Manage inquiries and track conversion
- **Key Features:**
  - View all inquiries with their status
  - Update lead status through workflow
  - Schedule visits
  - Export leads to CSV/Excel
  - Track follow-ups
  - View lead history
  
- **Lead Status Workflow:**
  ```
  new_lead → call_done → visit_scheduled → closed_booked (or closed_not_interested)
  ```

- **Quick Test Workflow:**
  1. Find a "new_lead" inquiry
  2. Click "Mark as Call Done"
  3. Enter call duration & notes → Click Save
  4. Status changes to "call_done" ✓
  5. Click "Schedule Visit"
  6. Pick a future date & time → Click Save
  7. Status changes to "visit_scheduled" ✓
  8. Click "Mark as Booked" or "Not Interested"
  9. Status changes to "closed_booked" or "closed_not_interested" ✓

### 5. **Content Management**
- **What it does:** Manage banners and notifications
- **Key Features:**
  - Create/Edit/Delete promotional banners
  - Track banner performance (impressions, clicks)
  - Send notifications via multiple channels (in-app, WhatsApp, SMS, email)
  - Schedule notifications
  - View notification delivery stats

- **Quick Test:**
  1. Click "Add Banner"
  2. Fill in title, upload image, set action URL
  3. Click Save → Banner appears in list ✓
  4. Click "Send Notification"
  5. Write message, select channels
  6. Click "Send Now" → Notification queued ✓

---

## 🔑 Key Workflows to Test

### Workflow 1: Property Approval
```
1. Go to Properties tab
2. Filter by Status: "Pending"
3. Find a property
4. Click "Approve" button
5. Confirmation dialog
6. Property status → "Active"
7. Owner receives notification
```

### Workflow 2: Lead Conversion (Revenue Engine)
```
1. Go to Leads tab
2. Find a "new_lead"
3. Click "Mark as Call Done" (add call details)
4. Status → "call_done"
5. Click "Schedule Visit" (pick date/time)
6. Status → "visit_scheduled"
7. Click "Mark as Booked"
8. Status → "closed_booked" (CONVERSION COMPLETE!)
9. Audit log created with timestamps
10. Notifications sent to tenant & owner
```

### Workflow 3: User Verification
```
1. Go to Users tab
2. Click "Owners" tab
3. Find an "Unverified" owner
4. Click "Verify" button
5. Owner verification status → "Verified"
6. Owner can now post properties
```

### Workflow 4: Send Bulk Notification
```
1. Go to Content tab
2. Click "Send Notification"
3. Fill in:
   - Title: "Special Offer"
   - Message: "50% off on premium listings"
   - Select Channels: in-app, email
   - Target: Owners in "Lucknow"
4. Click "Send Now"
5. Notification delivered instantly
6. View delivery stats
```

---

## 🧪 Testing Checklist

### ✅ Must Work
- [ ] Overview page loads with stats
- [ ] Can filter properties
- [ ] Can approve/reject properties
- [ ] Lead status workflow is smooth
- [ ] Can send notifications
- [ ] Can export leads as CSV/Excel

### ✅ Should Work
- [ ] Pagination works smoothly
- [ ] Real-time updates when data changes
- [ ] Audit logs created for all actions
- [ ] User blocking/unblocking works
- [ ] Banner creation works

### ✅ Nice to Have
- [ ] Mobile responsive design
- [ ] Dark mode support
- [ ] Advanced filters
- [ ] Bulk operations
- [ ] Performance is fast

---

## 🔗 Direct Links to Each Section

### Mobile Menu (Hamburger)
Click the menu icon ≡ in top-left for navigation on mobile

### Desktop Sidebar
Left sidebar shows:
- ⚙️ Overview
- 🏠 Properties
- 👥 Users
- 💬 Leads
- ⚙️ Content

### Tab Switching
Tabs are also accessible at the top of the page content area

---

## 🛠️ Troubleshooting

### Page shows blank / no content
- **Solution:** Hard refresh browser (Ctrl+Shift+R)
- **Check:** Is server running? (Terminal should show "✓ Ready")

### "Module not found" error
- **Solution:** Check if `lib/db.ts` exists
- **Location:** `lib/db.ts` should re-export from `lib/mongodb.ts`

### Filters not working
- **Check:** Are you clicking "Search" button?
- **Check:** Are filter values valid?

### Notifications not sending
- **Check:** Are channels selected (in-app, email, SMS, WhatsApp)?
- **Check:** Is target audience selected?

### Audit logs not creating
- **Check:** Is MongoDB connection working?
- **Check:** Are audit collections created?
  ```bash
  db.admin_audit_logs.stats()
  ```

---

## 📊 Data to Test With

### Test Inquiry (for Lead Workflow)
| Field | Value |
|-------|-------|
| Tenant | Test User |
| Phone | +91-9876543210 |
| Property | 3BHK in Lucknow |
| Status | new_lead |
| Priority | high |
| Source | app |

### Test Banner
| Field | Value |
|-------|-------|
| Title | Summer Sale 2026 |
| Action | Link to /properties |
| Target | Tenants in Lucknow |
| Image | Upload any image |

### Test Notification
| Field | Value |
|-------|-------|
| Title | Welcome to SST |
| Message | Explore verified properties |
| Channels | in-app, email |
| Target | All new users |

---

## 🎯 Performance Benchmarks

Expected load times:
- Overview Dashboard: < 2 seconds
- Properties List (1000 items): < 3 seconds
- Leads Table: < 2 seconds
- Export 10K leads: < 5 seconds

---

## 📞 Support

For issues or questions:
1. Check the full testing guide: `.kiro/ADMIN_TESTING_GUIDE.md`
2. Review API endpoints documentation
3. Check browser console for errors (F12 → Console tab)
4. Check server logs in terminal

---

**Version:** 1.0
**Last Updated:** September 11, 2026
**Status:** ✅ Ready for Testing
