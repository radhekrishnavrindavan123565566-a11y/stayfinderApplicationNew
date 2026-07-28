# Quick Reference - Notifications & Confirmations

## 🚀 Quick Start

```typescript
import { confirmDelete, notifySuccess, notifyError } from "@/lib/notifications";
```

## 🎯 Common Patterns

### Delete Something
```typescript
const confirmed = await confirmDelete("Delete Item");
if (!confirmed) return;
// ... delete operation ...
notifySuccess("Item deleted!");
```

### Create Something
```typescript
try {
  await api.create(data);
  notifySuccess("Created successfully!");
} catch (error) {
  notifyError("Failed to create");
}
```

### Update Something
```typescript
try {
  await api.update(id, data);
  notifySuccess("Updated successfully!");
} catch (error) {
  notifyError("Failed to update");
}
```

## 📦 Available Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `confirmDelete(title, msg)` | Delete confirmation | `Promise<boolean>` |
| `confirm(title, msg, btnText)` | Generic confirm | `Promise<boolean>` |
| `notifySuccess(msg)` | Green toast | `void` |
| `notifyError(msg)` | Red toast | `void` |
| `notifyInfo(msg)` | Blue toast | `void` |
| `notifyLoading(msg)` | Grey toast | `string` (toastId) |
| `updateToast(id, msg, type)` | Update existing toast | `void` |
| `successAlert(title, msg)` | Full-page alert | `Promise<void>` |
| `errorAlert(title, msg)` | Full-page error | `Promise<void>` |

## ⚡ One-Liners

```typescript
// Delete with confirmation
const ok = await confirmDelete(); if (ok) { /* delete */ }

// Success
notifySuccess("Done!");

// Error
notifyError("Oops!");

// Loading
const id = notifyLoading("Wait..."); /* ... */ updateToast(id, "Done!", "success");

// Confirmation
const ok = await confirm("Title", "Message?"); if (ok) { /* action */ }
```

## 🎨 Default Messages

```typescript
confirmDelete()              // "Delete", "Are you sure?"
notifySuccess()              // "Success!"
notifyError()                // "Something went wrong"
notifyInfo()                 // "Info"
notifyLoading()              // "Loading..."
confirm()                    // Requires title + message
successAlert()               // "Success!", undefined
errorAlert()                 // "Error", undefined
```

## ⏱️ Durations

| Type | Duration |
|------|----------|
| Success | 3 seconds |
| Error | 4 seconds |
| Info | 3 seconds |
| Loading | No auto-dismiss |
| Alert | 2 seconds (with timer) |

## 🎯 Where to Find Communication Hub

**For Users**: Footer → "Features" → "💬 Communication Hub"

**Direct Link**: `/dashboard/communication`

## 📍 Where It's Used

| Component | What |
|-----------|------|
| AutomatedReplies | Create, update, delete replies |
| FloorPlanUploader | Add/remove rooms, upload plans |
| Admin Panel | User management, disputes |
| Admin Queues | Retry failed jobs |

## 🔗 Files

| File | Purpose |
|------|---------|
| `lib/notifications.ts` | All notification functions |
| `components/layout/Footer.tsx` | Communication Hub link |

---

**Need More?** Check `NOTIFICATIONS_USAGE_GUIDE.md` for complete documentation
