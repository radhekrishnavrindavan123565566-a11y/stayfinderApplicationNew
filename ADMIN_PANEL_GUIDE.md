# SST Home Solutions - Admin Panel Complete Guide

## 🎯 Quick Navigation

### Main Dashboard Access
- **URL**: http://localhost:3000/admin
- **Auth Required**: Admin role
- **Default View**: Overview Dashboard

---

## 📑 Tab Navigation Guide

### 1. Overview Dashboard
**Tab Key**: `overview` | **Navigation**: First tab

**What You'll See**:
- 8 Quick Stat Cards (Total Users, Owners, Tenants, Properties, Bookings, Revenue, Platform Fees, Boosted Listings)
- Quick Access Cards (Queue Management, Revenue Dashboard)
- Occupancy Chart with occupancy trends
- Recent Bookings section with full details

**Use Cases**:
- Get quick overview of platform metrics
- Monitor recent booking activity
- Check system health via queue management
- Access revenue information

---

### 2. Properties Management
**Tab Key**: `properties` | **Navigation**: "Properties" tab

**Features**:
- Browse all property listings in table format
- Search properties by name, city, or owner
- Filter by status (Available, Booked, Hidden, Pending)
- Filter by approval status (Approved, Pending Review)
- See property counts with filters applied

**Actions**:
- ✏️ Edit: Inline edit property title or rent
- ✅ Approve: Toggle approval status
- 🔄 Change Status: Cycle through status options
- ❌ Delete: Remove property (with confirmation)

**Columns Shown**:
- Property Title
- Owner Name & Email
- Room Type
- Rent Amount (₹)
- Approval Status
- Current Status
- Action Buttons

---

### 3. User Directory
**Tab Key**: `user-directory` | **Navigation**: "Directory" tab

**Two Tabs Within**:

#### Owners Tab
**Information Shown**:
- Username and email
- Phone number
- City
- Number of properties
- Active listings count
- Response rate %
- Registration date
- Trust badges
- Fraud risk level

**Actions**:
- 📞 Call owner
- 💬 Send SMS
- 🚫 Block/Unblock user

#### Tenants Tab
**Information Shown**:
- Username and email
- Phone number
- Number of inquiries
- Active inquiries
- Total bookings
- Registration date
- Trust badges
- Fraud risk level

**Actions**:
- 📞 Call tenant
- 💬 Send SMS
- 🚫 Block/Unblock user

**Filters** (Available on Both):
- 🔍 Search by name/email/phone
- 📊 Sort (Most Recent, A-Z, Recently Active)
- ✅ Filter by verification status
- 🟢 Filter by activity status (Active/Inactive)

**Downloads**:
- 📥 Download as CSV (with timestamps)
- 📥 Download as JSON

---

### 4. Leads & Inquiries (⭐ PRIORITY)
**Tab Key**: `leads` | **Navigation**: "Leads" tab

**Main Display**:
- Table showing all tenant inquiries
- Tenant name with clickable phone link
- Property details
- Owner information
- Status and priority

**Status Pipeline** (Dropdown for Updates):
1. **New Lead** (🔵 Blue) - Fresh inquiry received
2. **Call Done** (🟣 Purple) - Contacted tenant
3. **Visit Scheduled** (🟠 Amber) - Site visit planned
4. **Booked** (🟢 Green) - Successfully closed
5. **Not Interested** (🔴 Red) - Lead rejected

**Priority Levels** (Dropdown for Updates):
- 🔴 High - Urgent/hot leads
- 🟠 Medium - Standard priority
- ⚪ Low - Cold leads

**Filters**:
- 🔍 Search (tenant name, property, phone)
- 📊 Filter by status
- 🎯 Filter by priority
- 🔄 Sort (Newest/Oldest first)

**Exports**:
- 📥 **CSV**: Download all leads with all details
- 📥 **JSON**: Download as JSON for data analysis
- Files auto-name with current date

**Additional Fields**:
- Follow-up date tracking
- Internal notes
- Inquiry timestamp
- Last updated date

---

### 5. Content & Banners
**Tab Key**: `content` | **Navigation**: "Content & Banners" tab

**Two Sections**:

#### Promotional Banners
**Display**: Grid of banner cards

**Card Shows**:
- Banner image thumbnail
- Banner title
- Description
- View count
- Click count

**Create/Edit Form Fields**:
- Title (required)
- Description
- Image URL
- Link/CTA URL (optional)

**Actions**:
- ✏️ Edit banner details
- ❌ Delete banner
- 📊 View statistics

#### Notifications & Alerts
**Display**: Table format

**Notification Details Shown**:
- Title
- Message preview (truncated)
- Channels used (SMS 📱, WhatsApp 💬, Push 🔔, Email 📧)
- Target audience (All, Owners, Tenants)
- Status (Draft, Scheduled, Sent, Failed)
- Sent count

**Create/Edit Form Fields**:
- Title (required)
- Message content
- Channel selection (checkboxes)
- Target audience (dropdown)
- Schedule date (optional)

**Actions**:
- ✏️ Edit notification
- ❌ Delete notification
- 📤 Send (only for drafts)

**Notification Channels**:
- 📱 SMS - Direct SMS to users
- 💬 WhatsApp - WhatsApp message
- 🔔 Push - App push notification
- 📧 Email - Email notification

---

### 6-8. Additional Admin Features

**Users Tab** (`users`):
- Filter by role
- View user details
- Toggle user status
- Delete users
- Download user data

**Add User** (`add-user`):
- Create new admin/user accounts
- Skip OTP requirement for admin-created users
- Bulk user creation support

**Verifications** (`verifications`):
- Review pending owner verification documents
- Approve verified owners
- Reject applications

**Disputes** (`disputes`):
- View open/resolved disputes
- Manage dispute resolution
- Track dispute history

**Late Fee Calculator** (`late-fee`):
- Calculate late payment fees
- Manage fee structures
- Generate reports

**Reminders** (`reminders`):
- Send payment reminders
- Schedule automated reminders
- Track reminder status

**Bulk Marketing** (`marketing`):
- Send bulk notifications
- Segment audiences
- Campaign management

---

## 🔄 Common Workflows

### Workflow 1: Approve New Properties
1. Go to **Properties** tab
2. Filter by "Pending Review"
3. For each property:
   - Click **Edit** to review details
   - Click the "Pending Review" badge to approve
   - Property moves to "Active" status

### Workflow 2: Track a Lead to Booking
1. Go to **Leads** tab
2. Find the inquiry
3. Click status dropdown:
   - Start: **New Lead**
   - Call tenant: Change to **Call Done**
   - Schedule visit: Change to **Visit Scheduled**
   - Confirm booking: Change to **Booked**
4. Adjust priority as needed
5. Add follow-up date if needed

### Workflow 3: Manage Problem Users
1. Go to **Directory** tab
2. Select **Owners** or **Tenants** tab
3. Search for user
4. Review fraud risk level
5. If problem: Click **🚫** to block user
6. Click **💬** to send warning SMS
7. Export user data if needed for records

### Workflow 4: Send Marketing Campaign
1. Go to **Content & Banners** tab
2. Click on **Notifications** section
3. Click **Create New**
4. Fill in:
   - Title: Campaign name
   - Message: Campaign message
   - Select channels (SMS, WhatsApp, Email, Push)
   - Select target audience
5. Click **Save**
6. Review and click **Send**
7. Monitor sent count

### Workflow 5: Export Leads Report
1. Go to **Leads** tab
2. Apply filters (status, priority, date range)
3. Click **CSV** button to download
4. Open in Excel for analysis
5. Or click **JSON** for data integration

---

## 📊 Key Metrics at a Glance

### Overview Dashboard Shows:
- **Users**: Total active platform users
- **Owners**: Total property owners
- **Tenants**: Total tenant users
- **Properties**: Total listings on platform
- **Bookings**: Total active bookings
- **Revenue**: Total platform revenue
- **Platform Fees**: Revenue from commissions
- **Boosted Listings**: Premium featured properties

### Directory Statistics:
- **Owners**: Name, properties count, response rate, city
- **Tenants**: Name, inquiries count, bookings, status

### Leads Pipeline:
- New leads vs. converted leads
- Lead conversion rate
- Average time from inquiry to booking
- High-priority leads outstanding

---

## ⚙️ Settings & Configuration

### Filters & Sorting:
Most sections support:
- Text search
- Date range filtering
- Status filtering
- Sort options
- Pagination (10-50 items per page)

### Export Options:
- CSV: Compatible with Excel, Google Sheets
- JSON: For data analysis, integration
- Automatic timestamps
- All relevant data included

### Real-Time Updates:
- Click **🔄 Refresh** button to reload data
- Status changes apply immediately
- Notifications confirm actions
- Auto-save on form submission

---

## 🔐 Permissions

**Admin Access Required For**:
- All admin panel sections
- User management
- Property approval/rejection
- Dispute resolution
- Content creation
- Data exports

**Cannot Access**:
- Non-admin users blocked from admin panel
- Automatic redirect to dashboard if unauthorized

---

## 🆘 Troubleshooting

### "No data found" message
- Check if filters are too restrictive
- Click refresh button
- Verify MongoDB connection is active
- Check if mock data is being used

### Status change not saving
- Check network connection
- Verify admin authorization
- Try refreshing page
- Check browser console for errors

### Export file not downloading
- Disable popup blockers
- Check browser download settings
- Verify data exists before export
- Try different export format (CSV vs JSON)

### Search not finding results
- Try partial name search
- Check spelling
- Clear filters and search again
- Use different search fields

---

## 📞 Support & Help

### For Issues:
1. Check the troubleshooting section above
2. Verify admin credentials
3. Check database connection
4. Review browser console errors
5. Contact development team with:
   - Screenshot
   - Steps to reproduce
   - Error message
   - Admin username

### Performance Tips:
- Limit date ranges for exports
- Use specific filters before exporting large datasets
- Clear browser cache if UI slow
- Refresh page after bulk operations

---

## ✨ Features Summary

| Feature | Tab | Status | Priority |
|---------|-----|--------|----------|
| Overview Dashboard | overview | ✅ | High |
| Property Management | properties | ✅ | High |
| User Directory | user-directory | ✅ | High |
| Leads Tracking | leads | ✅ | **CRITICAL** |
| Content & Banners | content | ✅ | Medium |
| User Management | users | ✅ | High |
| Add User | add-user | ✅ | Medium |
| Verifications | verifications | ✅ | High |
| Disputes | disputes | ✅ | Medium |
| Late Fees | late-fee | ✅ | Low |
| Reminders | reminders | ✅ | Low |
| Marketing | marketing | ✅ | Low |

---

## 🚀 Getting Started

1. **Login** to admin account
2. **Navigate** to `/admin` 
3. **Review** Overview dashboard
4. **Select** a tab based on your task
5. **Use** filters and search as needed
6. **Take Action** using buttons and dropdowns
7. **Export** data when needed

Enjoy managing SST Home Solutions! 🎉
