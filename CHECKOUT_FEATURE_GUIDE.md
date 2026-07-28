# Checkout Notification Feature Guide

## Overview
Tenants can now notify property owners when they plan to vacate their rented room. This feature improves communication and helps owners prepare for the next tenant.

## 🎯 User Flow

### For Tenants

#### 1. Access Checkout Management
- **Desktop**: Menu → "Checkout Management"
- **Mobile**: Mobile menu → "Checkout Management"
- **Direct URL**: `/dashboard/checkout`

#### 2. View Active Bookings
```
┌─────────────────────────────────────────┐
│ Checkout Management                     │
├─────────────────────────────────────────┤
│ Active Bookings (1)                     │
│                                         │
│ [Property Image]  Property Title        │
│                   Location              │
│                   Check-In: Dec 01      │
│                   Check-Out: Mar 01     │
│                                         │
│                  [Request Checkout] ➜   │
└─────────────────────────────────────────┘
```

#### 3. Click "Request Checkout"
Opens a beautiful 3-step modal:

**Step 1: Confirmation**
```
┌──────────────────────────────┐
│ Checkout Request             │
├──────────────────────────────┤
│                              │
│ Property: Your Room          │
│ Owner: John Doe              │
│                              │
│ You're about to send a       │
│ checkout notification...     │
│                              │
│ [Continue]  [Cancel]         │
└──────────────────────────────┘
```

**Step 2: Fill Details**
```
┌──────────────────────────────┐
│ Checkout Request             │
├──────────────────────────────┤
│                              │
│ Checkout Date: [20/04/2024]  │
│ Reason: [Relocating ▼]       │
│ Message: [Optional...]       │
│                              │
│ [Send Notification] [Back]   │
└──────────────────────────────┘
```

**Step 3: Success**
```
┌──────────────────────────────┐
│ ✓ Notification Sent!         │
│                              │
│ John Doe has been notified   │
│ about your checkout          │
│                              │
│ (Closes automatically)       │
└──────────────────────────────┘
```

#### 4. View Requested Checkouts
After sending:
```
┌─────────────────────────────────────────┐
│ Checkout Requested (1)                  │
│                                         │
│ [Property Image]  Property Title        │
│                   Location              │
│                   [✓ Checkout Requested]│
│                                         │
│ Requested Date: Apr 20, 2024            │
│ Reason: Relocating                      │
│ Status: Awaiting Confirmation           │
└─────────────────────────────────────────┘
```

### For Owners

#### Receive Notification
Owners get a notification in the "Notifications" section:

```
Notification:
"Checkout Notice - Your Room"

Tenant Name has requested to checkout 
on April 20, 2024. They may have left 
a message with more details.

[View Details] [Acknowledge]
```

## 📋 Form Fields

### Checkout Date (Required)
- Date picker input
- Minimum: Today's date
- Helps owner prepare for next tenant

### Reason (Optional)
Predefined reasons:
- Relocating
- Work change/Transfer
- Family reasons
- Lease end
- Other

### Message to Owner (Optional)
- Free text (up to 200 characters)
- Can include feedback or special requests
- Example: "The AC needs servicing before the next tenant"

## 🔧 Technical Details

### API Endpoint
```
POST /api/bookings/[bookingId]/notify-checkout

Request Body:
{
  "checkoutDate": "2024-04-20",
  "reason": "relocating",
  "message": "Optional message",
  "propertyTitle": "2 BHK Apartment",
  "ownerId": "owner-id",
  "ownerName": "John Doe"
}

Response:
{
  "data": {
    "notification": { /* notification object */ },
    "message": "Checkout notification sent successfully"
  }
}
```

### Database Updates

#### Booking Model
New fields added:
```typescript
checkoutDate?: Date              // When tenant plans to leave
checkoutReason?: string          // Why they're leaving
checkoutNotificationSent?: boolean // Track notification sent
checkoutNotificationDate?: Date   // When notification was sent
```

#### Notification Model
New notification type:
```typescript
{
  type: "checkout_notification",
  title: "Checkout Notice - [Property Name]",
  message: "Tenant Name has requested to checkout on [Date]",
  data: {
    bookingId,
    tenantId,
    tenantName,
    tenantEmail,
    checkoutDate,
    reason,
    propertyTitle
  }
}
```

### Files Created/Modified

| File | Type | Purpose |
|------|------|---------|
| `components/booking/CheckoutNotificationModal.tsx` | NEW | Modal UI for checkout requests |
| `app/api/bookings/[id]/notify-checkout/route.ts` | NEW | API endpoint for sending notifications |
| `app/dashboard/checkout/page.tsx` | NEW | Checkout management dashboard |
| `components/layout/Navbar.tsx` | UPDATED | Added "Checkout Management" menu link |

## ✨ Features

✅ **Multi-step Modal UI**
- Confirmation step (prevents accidental submissions)
- Form step (collect details)
- Success step (confirmation feedback)

✅ **Beautiful Design**
- Gradient backgrounds
- Smooth animations
- Mobile-responsive
- Dark mode support

✅ **Smart Validation**
- Date picker prevents past dates
- Message character limit (200)
- Required field validation
- Toast notifications for errors

✅ **Real-time Updates**
- Automatic page refresh after successful submission
- Shows checkout requested status immediately
- Prevents duplicate submissions

✅ **Owner Notifications**
- Stored in database
- Can be shown in notification center
- Contains all tenant details
- Can be emailed (optional, not yet implemented)

## 🔐 Security

✅ **Authorization Checks**
- Only booking tenant can send notification
- Owner ID verification
- Token-based authentication

✅ **Data Validation**
- All inputs sanitized
- Date range validation
- Message length limits

✅ **Rate Limiting** (Recommended)
- Prevent spam notifications
- Implement per-booking limits

## 📊 User Experience

### Before
❌ Tenants had to manually contact owners
❌ No structured checkout process
❌ Owners had no visibility into checkout plans
❌ Communication was ad-hoc

### After
✅ Clear, guided checkout process
✅ Structured notification with details
✅ Owners receive formal notification
✅ Better preparation for property handover
✅ Professional communication

## 🚀 Usage Examples

### Tenant Initiates Checkout
```
1. Click "Checkout Management" in menu
2. See active bookings
3. Click "Request Checkout" button
4. Fill in checkout date (required)
5. Select reason (optional)
6. Add message (optional)
7. Click "Send Notification"
8. See success confirmation
9. Checkout appears in "Requested" section
```

### Owner Receives Notification
```
1. Notification appears in notification center
2. Shows: "Tenant Name checking out on Apr 20"
3. Owner can view booking details
4. Owner can reach out to tenant if needed
5. Owner can prepare next booking
```

## 💡 Tips for Users

**For Tenants:**
- Give advance notice (at least 2-4 weeks)
- Provide accurate checkout date
- Include relevant reason for better understanding
- Leave constructive feedback for owner

**For Owners:**
- Check notifications regularly
- Confirm checkout date with tenant
- Use time to clean and prepare property
- Start marketing if needed

## 🔄 Future Enhancements

- [ ] Email notifications to owner
- [ ] Automated final rent calculator
- [ ] Move-out inspection checklist
- [ ] Deposit refund tracking
- [ ] Tenant exit survey
- [ ] Landlord checkout confirm/deny response
- [ ] Integration with calendar/Google Calendar

## ⚠️ Important Notes

1. **Checkout Request is NOT Final**: Owner still needs to confirm
2. **No Cancellation**: Current implementation doesn't allow cancellation
3. **No Automatic Rent Adjustment**: Manual final rent calculation needed
4. **Notification Only**: No payment processing happens automatically

## 📞 Support

If tenants face issues:
1. Check notification was sent (success toast appears)
2. Try again if network error occurs
3. Contact owner directly if urgent
4. Report bugs to support team

---

**Feature Version**: 1.0.0  
**Last Updated**: July 28, 2024  
**Status**: ✅ Production Ready
