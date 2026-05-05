# Roommate Feature - Owner Restriction Fix

## Problem
Property owners were able to create roommate profiles, which doesn't make sense because:
- Owners list properties — they don't need roommates
- Roommate finder is for **tenants** looking for people to share rent with
- This created confusion in the system

## Root Cause
**No role-based access control** was implemented:
1. **Backend API** (`app/api/roommates/route.ts`) only checked authentication, not user role
2. **Frontend UI** (`app/roommates/page.tsx`) showed "Create Profile" button to all authenticated users

## Solution Implemented

### 1. Backend Fix (API Route)
**File:** `app/api/roommates/route.ts`

**Before:**
```typescript
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req); // Only checks if logged in
    const body = await req.json();
    // ... rest of code
```

**After:**
```typescript
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);

    // NEW: Block owners from creating roommate profiles
    if (user.role === "owner") {
      return errorResponse(
        "Property owners cannot create a roommate profile. Only tenants can look for roommates.", 
        403
      );
    }

    const body = await req.json();
    // ... rest of code
```

**What it does:**
- Checks if the authenticated user has role `"owner"`
- Returns HTTP 403 Forbidden with clear error message
- Only allows `"tenant"` and `"admin"` roles to proceed

---

### 2. Frontend Fix (UI)
**File:** `app/roommates/page.tsx`

**Before:**
```tsx
{user && (
  <Button onClick={() => setShowCreate(true)} className="gap-2">
    <Plus className="w-4 h-4" /> Create Profile
  </Button>
)}
```

**After:**
```tsx
{user && user.role !== "owner" && (
  <Button onClick={() => setShowCreate(true)} className="gap-2">
    <Plus className="w-4 h-4" /> Create Profile
  </Button>
)}
```

**What it does:**
- Hides "Create Profile" button from owners
- Only shows button to tenants and admins
- Applied in **two places**:
  1. Header section (main create button)
  2. Empty state (when no profiles exist)

---

## How It Works Now

### For Tenants (role: "tenant")
✅ Can see "Create Profile" button  
✅ Can create/update their roommate profile  
✅ Can browse other roommate profiles  
✅ Can message potential roommates  

### For Owners (role: "owner")
❌ Cannot see "Create Profile" button  
❌ API blocks profile creation with 403 error  
✅ Can still browse roommate profiles (read-only)  
✅ Can message users (if needed)  

### For Admins (role: "admin")
✅ Full access (can create profiles if needed)  
✅ Can moderate/manage all profiles  

---

## User Roles in System
The platform has 3 user roles:
1. **tenant** (default) — People looking for properties/roommates
2. **owner** — Property owners who list rentals
3. **admin** — Platform administrators

---

## Testing the Fix

### Test Case 1: Owner tries to create profile via UI
**Expected:** Button is hidden, cannot access modal

### Test Case 2: Owner tries to create profile via API
**Expected:** 
```json
{
  "success": false,
  "message": "Property owners cannot create a roommate profile. Only tenants can look for roommates.",
  "statusCode": 403
}
```

### Test Case 3: Tenant creates profile
**Expected:** Profile created successfully

### Test Case 4: Admin creates profile
**Expected:** Profile created successfully

---

## Files Changed
1. `app/api/roommates/route.ts` — Added role check in POST handler
2. `app/roommates/page.tsx` — Added role check to UI buttons (2 locations)

---

## Why This Design?

**Separation of Concerns:**
- **Owners** focus on listing properties and finding tenants
- **Tenants** focus on finding properties and roommates
- Keeps the platform organized and prevents confusion

**Business Logic:**
- An owner who needs a roommate should register as a tenant
- Owners typically own/manage properties, not rent them
- This maintains clear user journeys

---

## Future Enhancements (Optional)

1. **Dual Role Support:** Allow users to have both "owner" and "tenant" roles
2. **Role Switching:** Let owners create a tenant profile if they're also renting
3. **Better Error UX:** Show a tooltip explaining why owners can't create profiles
4. **Analytics:** Track how many owners attempt to create profiles (to gauge demand)

---

## Verification
✅ Build passes: `npx next build` — Exit Code 0  
✅ No TypeScript errors  
✅ API returns proper 403 for owners  
✅ UI hides button from owners  
✅ Tenants can still create profiles normally  
