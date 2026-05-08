# Quick Authentication Reference Guide

## For Developers: How to Add Authentication to New Endpoints

### Basic Authentication (Any Logged-in User)

```typescript
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    
    // user.userId and user.role are now safe to use
    const data = await fetchUserData(user.userId);
    
    return successResponse({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Role-Based Authentication (Specific Roles Only)

```typescript
import { requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = requireRole(req, ["owner", "admin"]);
    if (!user) return errorResponse("Forbidden", 403);
    
    // Only owners and admins can reach here
    const body = await req.json();
    // Your logic...
    
    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Multiple Handlers in One File

```typescript
// GET - Any authenticated user
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    // ...
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Only owners
export async function POST(req: NextRequest) {
  try {
    const user = requireRole(req, ["owner"]);
    if (!user) return errorResponse("Forbidden", 403);
    // ...
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Only admins
export async function DELETE(req: NextRequest) {
  try {
    const user = requireRole(req, ["admin"]);
    if (!user) return errorResponse("Forbidden", 403);
    // ...
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Dynamic Routes (with params)

```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    
    const { id } = await params; // Next.js 16: params must be awaited
    
    // Your logic...
    return successResponse({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Ownership Verification

```typescript
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    
    const { id } = await params;
    const resource = await Resource.findById(id);
    
    if (!resource) return errorResponse("Not found", 404);
    
    // Verify ownership
    if (resource.ownerId.toString() !== user.userId && user.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }
    
    // Update logic...
    return successResponse({ resource });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## Status Codes Quick Reference

| Code | Name | When to Use | Example |
|------|------|-------------|---------|
| 200 | OK | Successful GET/PATCH/DELETE | Data retrieved/updated |
| 201 | Created | Successful POST | Resource created |
| 400 | Bad Request | Invalid input | Missing required fields |
| 401 | Unauthorized | Not authenticated | No token or invalid token |
| 403 | Forbidden | Not authorized | Wrong role or not owner |
| 404 | Not Found | Resource doesn't exist | Invalid ID |
| 500 | Internal Error | Server error | Database error |

---

## Common Patterns

### Pattern 1: Public Endpoint (No Auth)
```typescript
export async function GET(req: NextRequest) {
  try {
    // No authentication required
    const data = await fetchPublicData();
    return successResponse({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Pattern 2: Optional Auth (Different Data for Logged-in Users)
```typescript
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    // Don't return error if no user - just continue
    
    const data = user 
      ? await fetchPersonalizedData(user.userId)
      : await fetchPublicData();
    
    return successResponse({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Pattern 3: Admin or Owner of Resource
```typescript
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    
    const { id } = await params;
    const resource = await Resource.findById(id);
    
    if (!resource) return errorResponse("Not found", 404);
    
    const isOwner = resource.ownerId.toString() === user.userId;
    const isAdmin = user.role === "admin";
    
    if (!isOwner && !isAdmin) {
      return errorResponse("Forbidden", 403);
    }
    
    await resource.deleteOne();
    return successResponse({ message: "Deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## Frontend: Making Authenticated Requests

### Using useApi Hook
```typescript
import { useApi } from "@/hooks/useApi";
import axios from "axios";

function MyComponent() {
  const { authHeaders } = useApi();
  
  const fetchData = async () => {
    try {
      const { data } = await axios.get("/api/my-endpoint", authHeaders());
      console.log(data);
    } catch (error) {
      // Axios interceptor will handle 401/403 automatically
      console.error(error);
    }
  };
  
  return <button onClick={fetchData}>Fetch</button>;
}
```

### Using useRequireAuth Hook (Page Protection)
```typescript
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ProtectedPage() {
  const { ready, user } = useRequireAuth(["owner", "admin"]);
  
  if (!ready || !user) {
    return <div>Loading...</div>;
  }
  
  return <div>Protected content for {user.role}</div>;
}
```

---

## Error Handling

### Backend Error Response Format
```typescript
// Success
return successResponse({ data: {...} }, 200);

// Error
return errorResponse("Error message", 400);

// With details
return errorResponse("Validation failed", 400, { 
  fields: ["email", "password"] 
});
```

### Frontend Error Handling
```typescript
try {
  const { data } = await axios.post("/api/endpoint", body, authHeaders());
  toast.success("Success!");
} catch (error) {
  // Axios interceptor handles 401/403
  // You only need to handle other errors
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error || "Something went wrong";
    toast.error(message);
  }
}
```

---

## Testing Checklist

When adding a new protected endpoint:

- [ ] Add `requireAuth()` or `requireRole()` call
- [ ] Add null check immediately after
- [ ] Return appropriate status code (401 or 403)
- [ ] Test with valid token → Should work
- [ ] Test without token → Should return 401
- [ ] Test with wrong role → Should return 403
- [ ] Test ownership verification if applicable
- [ ] Add to API documentation

---

## Common Mistakes to Avoid

❌ **Don't forget null check**
```typescript
const user = requireAuth(req);
// Missing: if (!user) return errorResponse("Unauthorized", 401);
const data = await fetchData(user.userId); // Will crash if user is null
```

✅ **Always check for null**
```typescript
const user = requireAuth(req);
if (!user) return errorResponse("Unauthorized", 401);
const data = await fetchData(user.userId); // Safe
```

❌ **Don't use wrong status code**
```typescript
if (!user) return errorResponse("Unauthorized", 403); // Wrong!
```

✅ **Use correct status codes**
```typescript
if (!user) return errorResponse("Unauthorized", 401); // Correct
if (!roles.includes(user.role)) return errorResponse("Forbidden", 403); // Correct
```

❌ **Don't forget to await params in Next.js 16**
```typescript
const { id } = params; // Wrong in Next.js 16!
```

✅ **Always await params**
```typescript
const { id } = await params; // Correct
```

---

## Need Help?

- Check `lib/auth.ts` for authentication functions
- Check `lib/apiResponse.ts` for response helpers
- Check existing API routes for examples
- Read `AUTHENTICATION_FIXES_COMPLETE.md` for detailed documentation

---

**Remember**: Authentication (401) = "Who are you?" | Authorization (403) = "You can't do that!"
