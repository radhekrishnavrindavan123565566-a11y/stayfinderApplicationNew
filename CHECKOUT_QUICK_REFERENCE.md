# Checkout Feature - Quick Reference

## 🎯 For Tenants

### How to Request Checkout

**Step 1: Open Menu**
```
Menu (☰) → Checkout Management
or
Mobile Menu → Checkout Management
or
Direct: /dashboard/checkout
```

**Step 2: Find Your Room**
```
Active Bookings
  [Property Image] Property Name
  Location: City, Address
  [Request Checkout] ← Click this
```

**Step 3: Fill Modal**
```
Modal appears:
  1. Read confirmation → Click "Continue"
  2. Fill form:
     - Checkout Date: [Required - pick from calendar]
     - Reason: [Optional - select from dropdown]
     - Message: [Optional - up to 200 characters]
  3. Click "Send Notification"
  4. See success screen
```

**Step 4: Confirmation**
```
Checkout appears in "Checkout Requested" section
Green badge shows: "Checkout Requested"
Status shows: "Awaiting Confirmation"
```

### Required vs Optional

| Field | Required | Format |
|-------|----------|--------|
| Checkout Date | ✅ Yes | Future date only |
| Reason | ❌ No | Dropdown select |
| Message | ❌ No | Text, max 200 chars |

### Checkout Reasons
- Relocating
- Work change/Transfer
- Family reasons
- Lease end
- Other

---

## 👑 For Owners

### What You'll Receive

**Notification:**
```
Type: Checkout Notice - [Property Name]
Title: Tenant Name checking out on [Date]
Contains:
  - Tenant name & email
  - Checkout date
  - Reason (if provided)
  - Custom message (if provided)
```

**Where to Check:**
- Notifications Center
- Dashboard notifications
- (Future: Email notification)

### What to Do

1. ✅ Acknowledge notification
2. ✅ Follow up with tenant if needed
3. ✅ Prepare room for checkout
4. ✅ Plan cleaning and repairs
5. ✅ Start marketing if needed
6. ✅ Arrange deposit refund
7. ✅ Schedule move-out inspection

---

## 🔗 URLs

| Action | URL |
|--------|-----|
| Checkout Management | `/dashboard/checkout` |
| My Bookings | `/dashboard/bookings` |
| Dashboard Home | `/dashboard` |

---

## 🚨 Troubleshooting

### "Page not loading"
- Check internet connection
- Try refreshing page
- Clear browser cache

### "Submit button disabled"
- Make sure you selected a checkout date
- Date must be in the future
- Check for form errors

### "Notification not sent"
- Check error toast message
- Try again in a moment
- Contact support if error persists

### "Can't find Checkout Management"
- Make sure you're logged in as tenant
- Check menu for "Checkout Management" link
- Try direct URL: `/dashboard/checkout`

### "Checkout date not selectable"
- You can only select future dates
- Can't checkout today or yesterday
- Pick a date at least 1 day in the future

---

## 📱 Mobile Usage

### Desktop vs Mobile

**Desktop:**
- Menu (☰) in top-right
- Click "Checkout Management"
- Full layout with all sections

**Mobile:**
- Hamburger menu (☰) bottom-right
- Tap "Checkout Management"
- Stacked layout, single column

---

## 📊 Status Guide

| Status | What It Means | Your Action |
|--------|---------------|-------------|
| Active Booking | You're living here | Can request checkout |
| Checkout Requested | Request sent | Waiting for owner |
| Awaiting Confirmation | Owner received notice | Owner will confirm |

---

## ⏰ Timeline Example

```
Today (Dec 1)
  ↓
You request checkout for Jan 15
  ↓
Owner gets notification
  ↓
Owner confirms/prepares
  ↓
Jan 15 - Move out
  ↓
Final rent calculated
  ↓
Deposit refund processed
```

---

## 💡 Pro Tips

1. **Give Advance Notice**
   - Request checkout 2-4 weeks ahead
   - Gives owner time to prepare
   - Better chance of deposit refund

2. **Be Specific**
   - Choose exact checkout date
   - Select appropriate reason
   - Include helpful message (room issues, feedback, etc.)

3. **Document Everything**
   - Take photos before leaving
   - Keep move-out inspection report
   - Save notification confirmation

4. **Communicate**
   - Follow up after notification
   - Confirm move-out date with owner
   - Discuss deposit refund timeline

---

## ❓ FAQ

**Q: Can I change my checkout date?**
A: Not yet. Contact owner directly to request changes.

**Q: Will the owner see my message?**
A: Yes, your message is included in the notification.

**Q: What if I don't select a reason?**
A: It's optional. You can leave it blank.

**Q: How long before owner receives notification?**
A: Instantly (if server is working).

**Q: Can I cancel a checkout request?**
A: Not yet. Contact owner directly.

**Q: Will rent be adjusted automatically?**
A: No, owner calculates final rent based on checkout date.

---

## 🎨 Visual Layout

### Desktop
```
┌──────────────────────────────────────────────┐
│ Checkout Management                          │
├──────────────────────────────────────────────┤
│                                              │
│ Active Bookings (3)                          │
│                                              │
│ ┌──────────────┐  Details      [Request]    │
│ │  Room Image  │  Info         [Checkout]   │
│ └──────────────┘                            │
│                                              │
│ Checkout Requested (1)                       │
│                                              │
│ ┌──────────────┐  Details      [Awaiting]   │
│ │  Room Image  │  Info         [Confirm]    │
│ └──────────────┘                            │
└──────────────────────────────────────────────┘
```

### Mobile
```
┌──────────────────────────┐
│ Checkout Management      │
├──────────────────────────┤
│                          │
│ Active Bookings (3)      │
│                          │
│ ┌────────────┐           │
│ │  Image     │           │
│ ├────────────┤           │
│ │  Property  │           │
│ │  Location  │           │
│ │  Dates     │           │
│ ├────────────┤           │
│ │[Request]   │           │
│ └────────────┘           │
│                          │
│ Checkout Requested (1)   │
│                          │
│ ┌────────────┐           │
│ │  Image     │           │
│ ├────────────┤           │
│ │  Property  │           │
│ │  Requested │           │
│ │  Status    │           │
│ └────────────┘           │
└──────────────────────────┘
```

---

## 🔐 Privacy & Security

✅ Only you can request checkout for your bookings  
✅ Owner sees your name and contact  
✅ Checkout date is not public  
✅ Message is private between you and owner  

---

**Version**: 1.0  
**Last Updated**: July 28, 2024
