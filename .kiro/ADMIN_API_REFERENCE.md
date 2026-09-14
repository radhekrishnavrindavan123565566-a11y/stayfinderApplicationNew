# Admin Dashboard - API Reference

## 📡 Base URL
```
http://localhost:3000/api/admin
```

---

## 📊 1. Dashboard Statistics

### GET /stats
Retrieve all dashboard statistics and metrics

**Endpoint:**
```
GET /api/admin/stats
```

**Response:**
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
    { "city": "Prayagraj", "count": 3000 }
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

**Status Codes:**
- `200` - Success
- `500` - Server error

---

## 🏠 2. Property Management

### GET /properties
List all properties with filters and pagination

**Endpoint:**
```
GET /api/admin/properties
```

**Query Parameters:**
```
?page=1
&limit=25
&city=Lucknow
&status=active
&sortBy=newest
&search=3BHK
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "123...",
      "title": "3BHK in Lucknow",
      "location": {
        "address": "Sector 5, Lucknow",
        "city": "Lucknow",
        "state": "UP"
      },
      "propertyType": "apartment",
      "price": 25000,
      "ownerId": "...",
      "ownerName": "Rajesh Kumar",
      "status": "active",
      "images": ["url1", "url2"],
      "isVerified": true,
      "viewCount": 150,
      "averageRating": 4.5,
      "totalReviews": 12,
      "createdAt": "2026-09-01T10:00:00Z",
      "updatedAt": "2026-09-11T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 10000,
    "pages": 400
  }
}
```

### POST /properties
Create a new property

**Endpoint:**
```
POST /api/admin/properties
```

**Request Body:**
```json
{
  "title": "2BHK in Noida",
  "location": {
    "address": "Sector 12, Noida",
    "city": "Noida",
    "state": "UP"
  },
  "propertyType": "apartment",
  "price": 20000,
  "bedrooms": 2,
  "bathrooms": 2,
  "amenities": ["wifi", "parking"],
  "description": "..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "123...",
    "title": "2BHK in Noida",
    "status": "pending"
  }
}
```

### PATCH /properties/:id
Update property details

**Endpoint:**
```
PATCH /api/admin/properties/123...
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "price": 25000,
  "status": "active"
}
```

### POST /properties/:id/approve
Approve a pending property

**Endpoint:**
```
POST /api/admin/properties/123.../approve
```

**Request Body:**
```json
{
  "action": "approve",
  "notes": "Property verified and approved"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property approved successfully",
  "property": {
    "id": "123...",
    "title": "3BHK in Lucknow",
    "status": "active"
  }
}
```

### POST /properties/:id/approve (Reject)
Reject a pending property

**Endpoint:**
```
POST /api/admin/properties/123.../approve
```

**Request Body:**
```json
{
  "action": "reject",
  "notes": "Insufficient images. Need minimum 5 photos."
}
```

### DELETE /properties/:id
Delete/Archive a property

**Endpoint:**
```
DELETE /api/admin/properties/123...
```

**Response:**
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

## 👥 3. User Management

### GET /users
List all users (owners or tenants)

**Endpoint:**
```
GET /api/admin/users
```

**Query Parameters:**
```
?role=owner
&city=Lucknow
&verificationStatus=verified
&page=1
&limit=25
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "456...",
      "username": "rajesh_kumar",
      "email": "rajesh@example.com",
      "phone": "+91-9876543210",
      "role": "owner",
      "city": "Lucknow",
      "isVerified": true,
      "propertyCount": 5,
      "activeListings": 4,
      "responseRate": 92,
      "fraudRiskLevel": "low",
      "isBlocked": false,
      "lastActivity": "2026-09-11T10:00:00Z",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": { "total": 5000, "page": 1, "limit": 25 }
}
```

### POST /users/block
Block a user

**Endpoint:**
```
POST /api/admin/users/block
```

**Request Body:**
```json
{
  "userId": "456...",
  "reason": "Suspicious activity"
}
```

### POST /users/unblock
Unblock a user

**Endpoint:**
```
POST /api/admin/users/unblock
```

**Request Body:**
```json
{
  "userId": "456..."
}
```

### POST /users/verify
Verify an owner

**Endpoint:**
```
POST /api/admin/users/verify
```

**Request Body:**
```json
{
  "userId": "456...",
  "verificationMethod": "aadhaar"
}
```

---

## 💬 4. Lead/Inquiry Management

### GET /inquiries
List all inquiries with filters

**Endpoint:**
```
GET /api/admin/inquiries
```

**Query Parameters:**
```
?status=new_lead
&priority=high
&propertyId=...
&page=1
&limit=25
&sortBy=newest
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "789...",
      "tenantId": "...",
      "tenantName": "Priya Sharma",
      "tenantPhone": "+91-9876543210",
      "propertyId": "...",
      "propertyTitle": "3BHK in Lucknow",
      "ownerId": "...",
      "ownerName": "Rajesh Kumar",
      "inquiryDate": "2026-09-10T14:00:00Z",
      "status": "new_lead",
      "priority": "high",
      "source": "app",
      "statusHistory": [
        {
          "status": "new_lead",
          "changedAt": "2026-09-10T14:00:00Z",
          "changedBy": "..."
        }
      ]
    }
  ],
  "pagination": { "total": 25000, "page": 1, "limit": 25 }
}
```

### PATCH /inquiries/:id/status
Update inquiry status with state machine validation

**Endpoint:**
```
PATCH /api/admin/inquiries/789.../status
```

**Request Body (Mark as Call Done):**
```json
{
  "newStatus": "call_done",
  "notes": "Tenant interested, will visit on Saturday",
  "callDuration": 12,
  "followUpDate": "2026-09-13T00:00:00Z"
}
```

**Request Body (Schedule Visit):**
```json
{
  "newStatus": "visit_scheduled",
  "visitDate": "2026-09-14T00:00:00Z",
  "visitTime": "10:00 AM",
  "visitNotes": "Ask about amenities"
}
```

**Request Body (Mark as Booked):**
```json
{
  "newStatus": "closed_booked",
  "notes": "Tenant has agreed to move in"
}
```

**Request Body (Not Interested):**
```json
{
  "newStatus": "closed_not_interested",
  "notes": "Tenant found another property"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead status updated successfully",
  "data": {
    "inquiryId": "789...",
    "previousStatus": "new_lead",
    "newStatus": "call_done",
    "timestamp": "2026-09-11T15:00:00Z"
  }
}
```

**Valid Status Transitions:**
```
new_lead → [call_done, closed_not_interested, visit_scheduled]
call_done → [visit_scheduled, closed_not_interested, visit_completed]
visit_scheduled → [visit_completed, closed_not_interested]
visit_completed → [closed_booked, closed_not_interested]
closed_booked → [] (terminal state)
closed_not_interested → [] (terminal state)
```

### POST /inquiries/export
Export inquiries to CSV or Excel

**Endpoint:**
```
POST /api/admin/inquiries/export
```

**Request Body:**
```json
{
  "format": "csv",
  "filters": {
    "status": "new_lead",
    "priority": "high",
    "dateRange": {
      "from": "2026-09-01T00:00:00Z",
      "to": "2026-09-11T23:59:59Z"
    },
    "searchQuery": "Lucknow"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "inquiryId": "789...",
      "tenantName": "Priya Sharma",
      "tenantPhone": "+91-9876543210",
      "propertyTitle": "3BHK in Lucknow",
      "status": "new_lead",
      "inquiryDate": "2026-09-10",
      "priority": "high"
    }
  ],
  "format": "csv",
  "fileName": "leads_export_1694433600000.csv",
  "recordCount": 150
}
```

---

## 📢 5. Banners & Notifications

### GET /banners
List all banners

**Endpoint:**
```
GET /api/admin/banners
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "banner...",
      "title": "Summer Sale",
      "imageUrl": "https://...",
      "actionUrl": "/properties?filter=discount",
      "position": 1,
      "isActive": true,
      "startDate": "2026-09-01T00:00:00Z",
      "endDate": "2026-09-30T23:59:59Z",
      "impressions": 5000,
      "clicks": 250,
      "createdAt": "2026-09-01T10:00:00Z"
    }
  ]
}
```

### POST /banners
Create a new banner

**Endpoint:**
```
POST /api/admin/banners
```

**Request Body (FormData):**
```
title: "Summer Sale 2026"
description: "50% off on all listings"
image: [file]
imageAlt: "Summer discount banner"
actionUrl: "/properties"
actionType: "internal_page"
position: 1
isActive: true
startDate: "2026-09-01"
endDate: "2026-09-30"
targetAudience[roles]: ["tenant", "owner"]
targetAudience[cities]: ["Lucknow", "Prayagraj"]
displayPlatform: ["app", "web"]
```

### PUT /banners/:id
Update banner

**Endpoint:**
```
PUT /api/admin/banners/banner...
```

### DELETE /banners/:id
Delete banner

**Endpoint:**
```
DELETE /api/admin/banners/banner...
```

### GET /notifications
List all notifications

**Endpoint:**
```
GET /api/admin/notifications
```

### POST /notifications
Send a notification

**Endpoint:**
```
POST /api/admin/notifications
```

**Request Body:**
```json
{
  "title": "Special Offer",
  "message": "Get 50% discount on your first booking",
  "notificationType": "info",
  "channels": ["in_app", "email"],
  "targetAudience": {
    "roles": ["tenant"],
    "cities": ["Lucknow", "Prayagraj"]
  },
  "scheduledDate": "2026-09-12T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "deliveryStats": {
    "total": 1250,
    "delivered": 1245,
    "failed": 5
  }
}
```

---

## 🔍 Audit Logs

### GET /audit-logs
Retrieve audit logs

**Endpoint:**
```
GET /api/admin/audit-logs
```

**Query Parameters:**
```
?action=property_approved
&adminId=...
&entityType=property
&page=1
&limit=25
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "log...",
      "adminId": "admin-123...",
      "action": "property_approved",
      "entityType": "property",
      "entityId": "prop-123...",
      "changes": [
        {
          "field": "status",
          "oldValue": "pending",
          "newValue": "active"
        }
      ],
      "reason": "All verification done",
      "createdAt": "2026-09-11T15:00:00Z"
    }
  ]
}
```

---

## ❌ Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Property not found",
  "status": 404
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `422` - Unprocessable entity (invalid state transition)
- `500` - Server error

---

## 🔐 Authentication

All API endpoints require valid admin authentication. Include in headers:
```
Authorization: Bearer <jwt_token>
X-Admin-Role: admin
```

---

## 📊 Rate Limiting

To prevent abuse:
- `/api/admin/*` endpoints: 100 requests per minute per admin
- `/api/admin/inquiries/export`: 10 requests per minute per admin
- Bulk operations: 5 requests per minute per admin

---

## 🧪 Testing with cURL

### Get Dashboard Stats
```bash
curl -X GET http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer your_token_here"
```

### Approve a Property
```bash
curl -X POST http://localhost:3000/api/admin/properties/123/approve \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "notes": "Verified and approved"
  }'
```

### Update Lead Status
```bash
curl -X PATCH http://localhost:3000/api/admin/inquiries/789/status \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "newStatus": "call_done",
    "notes": "Call completed",
    "callDuration": 15
  }'
```

### Export Leads
```bash
curl -X POST http://localhost:3000/api/admin/inquiries/export \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "filters": {
      "status": "new_lead"
    }
  }'
```

---

## 📝 Additional Notes

- All timestamps are in UTC (ISO 8601 format)
- Pagination is 1-indexed
- Maximum query results: 10,000 records
- Large exports may take time and are queued
- Real-time updates via WebSocket (if implemented)
- All changes are audit-logged automatically

---

**Version:** 1.0
**Last Updated:** September 11, 2026
