# Admin Panel - API Endpoints Documentation

## Overview

All admin API endpoints require:
- **Authentication**: Valid JWT token in Authorization header
- **Admin Role**: User must have `role: 'admin'`
- **Base URL**: `http://localhost:3000/api`

---

## Dashboard & Statistics

### GET /api/admin/stats
**Description**: Get overview statistics for dashboard

**Response**:
```json
{
  "properties": {
    "total": 1250,
    "active": 890,
    "pending": 145,
    "inactive": 215,
    "featured": 67,
    "rejected": 3
  },
  "users": {
    "totalTenants": 5420,
    "totalOwners": 1850,
    "newThisMonth": 342,
    "verified": 6840,
    "blocked": 45
  },
  "inquiries": {
    "total": 2340,
    "today": 45,
    "thisWeek": 287,
    "newLeads": 124,
    "closedDeals": 156
  },
  "bookings": {
    "confirmed": 234,
    "ongoing": 87,
    "completed": 445,
    "cancelled": 23
  },
  "revenue": {
    "totalRevenue": 245000,
    "pendingPayments": 45000,
    "monthlyRecurring": 89000
  },
  "recentActivity": [...]
}
```

---

## User Management

### GET /api/admin/users
**Description**: Get all platform users

**Query Parameters**:
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `role` (string) - Filter by role: 'tenant', 'owner', 'admin'
- `search` (string) - Search by username, email, phone
- `sortBy` (string) - Sort option: 'recent', 'name', 'active'

**Response**:
```json
{
  "users": [
    {
      "_id": "userid123",
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "owner",
      "isActive": true,
      "ownerVerified": true,
      "registrationDate": "2024-01-15",
      "lastActivity": "2024-09-26",
      "propertyCount": 5,
      "activeListings": 3,
      "responseRate": 95,
      "fraudRiskLevel": "low",
      "trustBadges": ["responsive", "verified"]
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### PATCH /api/admin/users/:userId
**Description**: Update user status or verification

**Body**:
```json
{
  "isActive": true,
  "ownerVerified": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": { ... }
}
```

### DELETE /api/admin/users/:userId
**Description**: Delete a user account

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Property Management

### GET /api/admin/properties
**Description**: Get all properties (stub - should be implemented)

**Query Parameters**:
- `page` (number) - Pagination
- `limit` (number) - Items per page
- `status` (string) - Filter by status
- `approved` (boolean) - Filter by approval status
- `search` (string) - Search properties

### PATCH /api/admin/properties/:id
**Description**: Update property details or approval status

**Body**:
```json
{
  "title": "Updated Title",
  "rent": 15000,
  "isApproved": true,
  "status": "available"
}
```

### DELETE /api/admin/properties/:id
**Description**: Delete a property listing

---

## Inquiry & Leads Management

### GET /api/admin/inquiries
**Description**: Get all inquiries with filters

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string) - Filter: new_lead, call_done, visit_scheduled, closed_booked, closed_not_interested
- `priority` (string) - Filter: low, medium, high
- `sortBy` (string) - Sort: newest, oldest
- `search` (string) - Search by tenant, property, phone

**Response**:
```json
{
  "leads": [
    {
      "_id": "inq123",
      "tenantId": "tenant1",
      "tenantName": "Akshay Sharma",
      "tenantPhone": "9876543210",
      "propertyId": "prop1",
      "propertyTitle": "2BHK Flat",
      "ownerId": "owner1",
      "ownerName": "Rajesh Kumar",
      "inquiryDate": "2024-09-26",
      "inquiryTime": "14:30",
      "status": "new_lead",
      "priority": "high",
      "followUpDate": "2024-09-28",
      "tags": ["urgent"],
      "notes": "Interested in immediate occupancy"
    }
  ],
  "total": 2340,
  "page": 1,
  "pages": 234
}
```

### PATCH /api/admin/inquiries/:id
**Description**: Update inquiry status or priority

**Body**:
```json
{
  "status": "call_done",
  "priority": "medium",
  "followUpDate": "2024-09-28"
}
```

**Response**:
```json
{
  "success": true,
  "inquiry": { ... }
}
```

### GET /api/admin/inquiries/export/csv
**Description**: Export inquiries as CSV file

**Query Parameters**: Same as GET /api/admin/inquiries

**Response**: CSV file attachment

### GET /api/admin/inquiries/export/excel
**Description**: Export inquiries as Excel/TSV format

**Query Parameters**: Same as GET /api/admin/inquiries

**Response**: Excel-compatible file attachment

---

## Banners Management

### GET /api/admin/banners
**Description**: Get all promotional banners

**Query Parameters**:
- `page` (number) - Pagination
- `limit` (number) - Items per page
- `search` (string) - Search banners

**Response**:
```json
{
  "banners": [
    {
      "_id": "banner1",
      "title": "Summer Sale",
      "description": "Get 20% off on new properties",
      "imageUrl": "https://example.com/banner.jpg",
      "link": "https://example.com/sale",
      "isActive": true,
      "displayOrder": 1,
      "viewCount": 1250,
      "clickCount": 45,
      "createdAt": "2024-01-01"
    }
  ],
  "total": 10,
  "page": 1
}
```

### POST /api/admin/banners
**Description**: Create new banner

**Body**:
```json
{
  "title": "New Banner",
  "description": "Banner description",
  "imageUrl": "https://example.com/image.jpg",
  "link": "https://example.com/target"
}
```

### PATCH /api/admin/banners/:id
**Description**: Update banner

**Body**: Same fields as POST

### DELETE /api/admin/banners/:id
**Description**: Delete banner

---

## Notifications Management

### GET /api/admin/notifications
**Description**: Get all notifications

**Query Parameters**:
- `page` (number)
- `limit` (number)
- `status` (string) - Filter: draft, scheduled, sent, failed
- `search` (string)

**Response**:
```json
{
  "notifications": [
    {
      "_id": "notif1",
      "title": "Payment Reminder",
      "message": "Your payment is due in 3 days",
      "channels": ["sms", "email"],
      "targetAudience": "all",
      "status": "sent",
      "sentCount": 5420,
      "sentAt": "2024-09-26",
      "scheduledAt": null,
      "createdAt": "2024-09-26"
    }
  ],
  "total": 50,
  "page": 1
}
```

### POST /api/admin/notifications
**Description**: Create new notification

**Body**:
```json
{
  "title": "New Notification",
  "message": "Notification content",
  "channels": ["sms", "whatsapp", "email"],
  "targetAudience": "owners",
  "scheduledAt": "2024-09-27T10:00:00Z"
}
```

### PATCH /api/admin/notifications/:id
**Description**: Update notification (draft only)

### POST /api/admin/notifications/:id/send
**Description**: Send notification (must be draft status)

**Response**:
```json
{
  "success": true,
  "message": "Notification sent to 5420 users",
  "sentCount": 5420
}
```

### DELETE /api/admin/notifications/:id
**Description**: Delete notification

---

## Disputes Management

### GET /api/disputes
**Description**: Get all disputes

**Query Parameters**:
- `page` (number)
- `limit` (number)
- `status` (string) - Filter: open, under_review, resolved_refund, resolved_no_action
- `search` (string)

**Response**:
```json
{
  "disputes": [
    {
      "_id": "dispute1",
      "reason": "payment_issue",
      "description": "Dispute description",
      "status": "open",
      "raisedBy": { "username": "tenant1" },
      "createdAt": "2024-09-25",
      "resolution": null
    }
  ],
  "total": 45,
  "page": 1
}
```

### PATCH /api/disputes/:id
**Description**: Update dispute status and resolution

**Body**:
```json
{
  "status": "resolved_refund",
  "resolution": "Refund of ₹5000 processed"
}
```

---

## Additional Admin Endpoints

### POST /api/auth/register
**Description**: Create user account (with admin flag)

**Body**:
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "phone": "9876543210",
  "password": "secure_password",
  "role": "tenant",
  "isAdminCreated": true
}
```

**Response**: User created with `phoneVerified: true` if admin-created

### GET /api/admin/queues
**Description**: Get background job queue status

### GET /api/admin/revenue
**Description**: Get revenue and financial metrics

### GET /api/admin/occupancy
**Description**: Get occupancy statistics and trends

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Admin access required"
}
```

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid query parameters or body"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Authentication Example

### Request with Auth Header:
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer your_jwt_token_here" \
  -H "Content-Type: application/json"
```

### Request with Cookie:
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Cookie: accessToken=your_jwt_token_here" \
  -H "Content-Type: application/json"
```

---

## Rate Limiting

- Admin endpoints have relaxed rate limits
- Standard: 100 requests per minute
- Export endpoints: 10 requests per minute

---

## Response Headers

All API responses include:
```
Content-Type: application/json
Cache-Control: no-cache
X-Total-Count: [total_items]
X-Page: [current_page]
X-Limit: [items_per_page]
```

For file exports:
```
Content-Type: text/csv or application/vnd.ms-excel
Content-Disposition: attachment; filename="export_date.csv"
```

---

## Data Formats

### Date Format
- ISO 8601: `2024-09-26T14:30:00Z`

### Phone Format
- India: `9876543210` (10 digits without country code)

### Currency
- Indian Rupees (₹)
- Stored as integers (in paise for precision)

### Status Enums

**Inquiry Status**:
- `new_lead` - Fresh inquiry
- `call_done` - Called tenant
- `visit_scheduled` - Visit booked
- `closed_booked` - Successfully booked
- `closed_not_interested` - Rejected

**Notification Status**:
- `draft` - Not yet sent
- `scheduled` - Scheduled for future
- `sent` - Successfully sent
- `failed` - Send failed

**Dispute Status**:
- `open` - Recently filed
- `under_review` - Being investigated
- `resolved_refund` - Refund issued
- `resolved_no_action` - No action taken

---

## Pagination

All list endpoints support pagination:
- `page`: Page number (starts at 1)
- `limit`: Items per page (1-100, default 10)

**Total Pages Calculation**:
```
totalPages = Math.ceil(total / limit)
```

---

## Filtering & Search

**Search**: Full-text search across multiple fields
- Users: username, email, phone
- Properties: title, city, owner name
- Inquiries: tenant name, property, phone
- Banners: title, description

**Filters**: Specific field matching
- Status filters use exact matching
- Date ranges supported on timestamps

---

## Best Practices

1. **Always Include Auth Header**: Required for all endpoints
2. **Handle Pagination**: Implement pagination for large datasets
3. **Check Response Status**: Verify HTTP status codes
4. **Implement Retry Logic**: For export endpoints with failures
5. **Use Appropriate Methods**: GET for retrieval, PATCH for updates, DELETE for deletion
6. **Validate Input**: Check required fields before submitting
7. **Handle Errors**: Parse error responses for user feedback

---

## Testing API Endpoints

### Using cURL:
```bash
# Get users
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer TOKEN"

# Get inquiries
curl -X GET "http://localhost:3000/api/admin/inquiries?status=new_lead" \
  -H "Authorization: Bearer TOKEN"

# Export as CSV
curl -X GET "http://localhost:3000/api/admin/inquiries/export/csv" \
  -H "Authorization: Bearer TOKEN" \
  --output "inquiries.csv"
```

### Using Postman:
1. Set request type (GET, POST, PATCH, DELETE)
2. Enter full URL
3. Add header: `Authorization: Bearer YOUR_TOKEN`
4. Include body JSON if needed (for POST/PATCH)
5. Click Send

---

## Webhooks & Events

Currently, no webhook support. Future implementation may include:
- Property status changes
- Inquiry status updates
- User registration events
- Payment notifications

---

## Version History

- **v1.0** (Current): Initial admin API implementation
- Future: GraphQL support planned
- Future: Real-time WebSocket updates

---

## Support

For API issues:
1. Check authentication token validity
2. Verify admin role assignment
3. Review query parameters
4. Check error response message
5. Contact development team with:
   - Endpoint URL
   - Request body/parameters
   - Response error message
   - Timestamp of request
