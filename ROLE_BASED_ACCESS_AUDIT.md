# Role-Based Access Control Audit

## User Roles
1. **Tenant** - Regular users looking for properties
2. **Owner** - Property owners/landlords
3. **Admin** - System administrators

## Current Implementation Status

### ✅ Properly Implemented

#### Navbar (components/layout/Navbar.tsx)
**Desktop Menu:**
- ✅ "List Property" link - Only shown to `owner` role
- ✅ Owner-specific dropdown items:
  - My Properties
  - Add Property
  - Analytics
  - Rental Income
- ✅ Admin-specific dropdown item:
  - Admin Panel

**Mobile Menu:**
- ✅ Owner-specific items properly hidden for non-owners
- ✅ Admin panel link only for admins

#### API Routes Protection
All admin routes properly protected with `requireRole(req, ["admin"])`:
- ✅ `/api/admin/stats`
- ✅ `/api/admin/users`
- ✅ `/api/admin/users/[id]`
- ✅ `/api/admin/reminders`
- ✅ `/api/admin/revenue`
- ✅ `/api/admin/queues`
- ✅ `/api/admin/bulk-marketing`

Owner-specific routes protected with `requireRole(req, ["owner", "admin"])`:
- ✅ `/api/properties` (POST) - Create property
- ✅ `/api/properties/my` - List owner's properties
- ✅ `/api/owner/broadcast`
- ✅ `/api/owner/auto-pricing`
- ✅ `/api/ai/fraud-detection`

Mixed role routes with proper logic:
- ✅ `/api/bookings` - Filters by role (owner sees their properties' bookings, tenant sees their bookings)
- ✅ `/api/maintenance` - Role-based filtering
- ✅ `/api/rent-tracker` - Role-based filtering
- ✅ `/api/disputes` - Admin sees all, users see their own

### ⚠️ Issues Found & Recommendations

#### 1. **Navbar Menu Items - Missing Role Checks**

**Current Issues:**
- Rent Split, Rent Tracker, Maintenance shown to ALL users
- These should be contextual based on role

**Recommendations:**
```typescript
// Rent Tracker - Should show for both tenants and owners
{user && (
  <DropItem href="/dashboard/rent-tracker" icon={<IndianRupee />} label="Rent Tracker" />
)}

// Rent Split - Primarily for tenants
{user && user.role === "tenant" && (
  <DropItem href="/dashboard/rent-split" icon={<IndianRupee />} label="Rent Split" />
)}

// Maintenance - Both roles but different views
{user && (
  <DropItem 
    href="/dashboard/maintenance" 
    icon={<Wrench />} 
    label={user.role === "owner" ? "Maintenance Requests" : "Maintenance"} 
  />
)}
```

#### 2. **Dashboard Pages - Need Role-Based UI**

**Pages that need role-specific views:**

**`/dashboard/bookings`**
- Tenant: See bookings they made
- Owner: See bookings for their properties
- Admin: See all bookings
- ✅ API already handles this correctly
- ⚠️ UI should show different columns/actions based on role

**`/dashboard/maintenance`**
- Tenant: Create and track their requests
- Owner: View and respond to requests for their properties
- ✅ API already handles this
- ⚠️ UI should adapt based on role

**`/dashboard/rent-tracker`**
- Tenant: Track rent payments they need to make
- Owner: Track rent payments they should receive
- ✅ API already handles this
- ⚠️ UI labels should change based on role

#### 3. **Roommates Feature - Tenant Only**

**Current:**
- API correctly blocks owners from creating roommate profiles
- ✅ `/api/roommates` returns 403 for owners

**Recommendation:**
- Hide "Roommates" link in navbar for owners
```typescript
{(!user || user.role !== "owner") && (
  <Link href="/roommates">Roommates</Link>
)}
```

#### 4. **Property Creation - Owner Only**

**Current:**
- ✅ Navbar correctly shows "List Property" only to owners
- ✅ API protected with `requireRole(["owner", "admin"])`

**Additional Check Needed:**
- Add route protection in `/dashboard/properties/new/page.tsx`
```typescript
const { ready, user } = useRequireAuth(["owner", "admin"]);
```

#### 5. **Admin Panel - Admin Only**

**Current:**
- ✅ Navbar shows admin link only to admins
- ✅ All admin API routes protected

**Recommendation:**
- Add route-level protection to admin pages
```typescript
// app/admin/page.tsx
const { ready, user } = useRequireAuth(["admin"]);
```

## Recommended Changes

### 1. Update Navbar Component

```typescript
// components/layout/Navbar.tsx

// Desktop Nav - Hide roommates from owners
{(!user || user.role !== "owner") && (
  <Link href="/roommates">Roommates</Link>
)}

// Dropdown Menu - Role-specific items
<DropItem href="/dashboard/bookings" icon={<Calendar />} 
  label={user.role === "owner" ? "Property Bookings" : "My Bookings"} 
/>

{user.role === "tenant" && (
  <DropItem href="/dashboard/rent-split" icon={<IndianRupee />} label="Rent Split" />
)}

<DropItem href="/dashboard/rent-tracker" icon={<IndianRupee />} 
  label={user.role === "owner" ? "Rent Collection" : "Rent Tracker"} 
/>

<DropItem href="/dashboard/maintenance" icon={<Wrench />} 
  label={user.role === "owner" ? "Maintenance Requests" : "My Requests"} 
/>
```

### 2. Add Route Protection

**Owner-only pages:**
```typescript
// app/dashboard/properties/new/page.tsx
// app/dashboard/properties/[id]/edit/page.tsx
// app/dashboard/analytics/page.tsx
// app/dashboard/income/page.tsx
const { ready, user } = useRequireAuth(["owner", "admin"]);
```

**Admin-only pages:**
```typescript
// app/admin/page.tsx
// app/admin/queues/page.tsx
// app/admin/revenue/page.tsx
const { ready, user } = useRequireAuth(["admin"]);
```

### 3. Update Dashboard UI Labels

**Bookings Page:**
```typescript
<h1>{user.role === "owner" ? "Property Bookings" : "My Bookings"}</h1>
```

**Maintenance Page:**
```typescript
<h1>{user.role === "owner" ? "Maintenance Requests" : "My Maintenance Requests"}</h1>
```

**Rent Tracker:**
```typescript
<h1>{user.role === "owner" ? "Rent Collection Tracker" : "Rent Payment Tracker"}</h1>
```

## Summary

### ✅ Working Correctly:
1. API route protection with `requireRole`
2. Owner-specific menu items (Properties, Analytics, Income)
3. Admin panel access
4. Property creation restricted to owners
5. Roommate creation blocked for owners (API level)

### ⚠️ Needs Improvement:
1. Hide "Roommates" link from owners in navbar
2. Add role-based labels for shared features (Bookings, Maintenance, Rent Tracker)
3. Hide "Rent Split" from owners (tenant-specific feature)
4. Add route-level protection to admin and owner pages
5. Update UI labels to be role-contextual

### 🔒 Security Status:
- **API Layer**: ✅ Secure (all routes properly protected)
- **UI Layer**: ⚠️ Needs refinement (some items shown to wrong roles)
- **Route Protection**: ⚠️ Needs client-side guards for better UX

## Priority Actions:
1. **High**: Add route protection to admin pages
2. **High**: Hide roommates link from owners
3. **Medium**: Update UI labels to be role-contextual
4. **Medium**: Hide rent-split from owners
5. **Low**: Add role-specific dashboard widgets
