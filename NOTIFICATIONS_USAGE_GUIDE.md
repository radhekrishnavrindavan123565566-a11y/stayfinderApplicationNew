# Notifications & Confirmations Usage Guide

## Quick Start

### Import
```typescript
import { confirmDelete, notifySuccess, notifyError, notifyLoading, updateToast } from "@/lib/notifications";
```

## Usage Patterns

### 1. Delete with SweetAlert2 Confirmation
```typescript
const handleDelete = async (id: string) => {
  // Show confirmation dialog
  const confirmed = await confirmDelete("Delete Item", "This action cannot be undone.");
  if (!confirmed) return; // User cancelled
  
  try {
    await axios.delete(`/api/items/${id}`, authHeaders());
    notifySuccess("Item deleted successfully");
  } catch (error) {
    notifyError("Failed to delete item");
  }
};
```

### 2. Create/Add Operation
```typescript
const handleCreate = async (data: ItemData) => {
  try {
    await axios.post("/api/items", data, authHeaders());
    notifySuccess("Item created successfully!");
    // Optionally reset form, close modal, etc.
  } catch (error) {
    notifyError("Failed to create item");
  }
};
```

### 3. Update Operation
```typescript
const handleUpdate = async (id: string, data: ItemData) => {
  try {
    await axios.patch(`/api/items/${id}`, data, authHeaders());
    notifySuccess("Item updated successfully!");
  } catch (error) {
    notifyError(error.response?.data?.error || "Failed to update item");
  }
};
```

### 4. Loading State with Notification
```typescript
const handleLongOperation = async () => {
  const toastId = notifyLoading("Processing your request...");
  
  try {
    const result = await someLongOperation();
    updateToast(toastId, "Process completed!", "success");
  } catch (error) {
    updateToast(toastId, "Process failed!", "error");
  }
};
```

### 5. Generic Confirmation (for non-delete actions)
```typescript
const handlePublish = async (id: string) => {
  const confirmed = await confirm(
    "Publish Property",
    "This will make your property visible to all users.",
    "Publish"
  );
  
  if (confirmed) {
    try {
      await axios.patch(`/api/properties/${id}`, { published: true });
      notifySuccess("Property published!");
    } catch (error) {
      notifyError("Failed to publish");
    }
  }
};
```

## API Reference

### confirmDelete(title, message)
- **Purpose**: Show delete confirmation dialog with SweetAlert2
- **Returns**: `Promise<boolean>` - true if user confirmed
- **Default Title**: "Delete"
- **Default Message**: "Are you sure?"
- **Button Colors**: Red confirm, gray cancel
- **Example**:
```typescript
const ok = await confirmDelete("Delete User", "This user will be permanently removed.");
```

### confirm(title, message, confirmText)
- **Purpose**: Generic confirmation dialog
- **Returns**: `Promise<boolean>` - true if user confirmed
- **Button Colors**: Blue confirm, gray cancel
- **Example**:
```typescript
const ok = await confirm("Activate", "Enable this feature?", "Activate");
```

### notifySuccess(message, options?)
- **Purpose**: Show success toast notification
- **Duration**: 3 seconds
- **Position**: top-right
- **Icon**: Green checkmark
- **Example**:
```typescript
notifySuccess("Changes saved!");
```

### notifyError(message, options?)
- **Purpose**: Show error toast notification
- **Duration**: 4 seconds (longer than success)
- **Position**: top-right
- **Icon**: Red X
- **Example**:
```typescript
notifyError("Network error. Please try again.");
```

### notifyLoading(message)
- **Purpose**: Show loading toast (no auto-dismiss)
- **Returns**: `string` - toastId for updating later
- **Example**:
```typescript
const id = notifyLoading("Uploading file...");
```

### notifyInfo(message, options?)
- **Purpose**: Show info toast notification
- **Duration**: 3 seconds
- **Position**: top-right
- **Example**:
```typescript
notifyInfo("This is informational");
```

### updateToast(toastId, message, type)
- **Purpose**: Update existing toast (useful for loading → success)
- **Types**: 'success' | 'error' | 'info'
- **Example**:
```typescript
const id = notifyLoading("Uploading...");
// ... after upload ...
updateToast(id, "Upload complete!", "success");
```

### successAlert(title, message?)
- **Purpose**: Full-page SweetAlert (for important success messages)
- **Auto-closes**: After 2 seconds
- **Example**:
```typescript
await successAlert("Payment Successful", "Your booking is confirmed!");
```

### errorAlert(title, message?)
- **Purpose**: Full-page SweetAlert (for important errors)
- **Example**:
```typescript
await errorAlert("Payment Failed", "Your card was declined. Please try another.");
```

## Complete Example Component

```typescript
"use client";
import { useState } from "react";
import axios from "axios";
import { confirmDelete, notifySuccess, notifyError } from "@/lib/notifications";

interface Item {
  _id: string;
  name: string;
}

export default function ItemList({ items }: { items: Item[] }) {
  const [list, setList] = useState(items);

  const handleDelete = async (id: string) => {
    // 1. Show confirmation
    const confirmed = await confirmDelete(
      "Delete Item",
      "This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      // 2. Delete from server
      await axios.delete(`/api/items/${id}`);
      
      // 3. Update local state
      setList(list.filter(item => item._id !== id));
      
      // 4. Show success
      notifySuccess("Item deleted!");
    } catch (error) {
      notifyError("Failed to delete item");
    }
  };

  const handleAdd = async () => {
    try {
      const { data } = await axios.post("/api/items", { name: "New Item" });
      setList([...list, data.data]);
      notifySuccess("Item added!");
    } catch (error) {
      notifyError("Failed to add item");
    }
  };

  return (
    <div>
      <button onClick={handleAdd}>Add Item</button>
      <ul>
        {list.map(item => (
          <li key={item._id}>
            {item.name}
            <button onClick={() => handleDelete(item._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Footer Integration

The footer now shows a "Features" section for authenticated users:

```
📱 Your Features
  💬 Communication Hub  ← Links to /dashboard/communication
```

This link is:
- ✅ Only visible when user is logged in
- ✅ Discoverable in the footer on all pages
- ✅ Leads to the Communication Hub page

## Best Practices

1. **Always confirm destructive actions** (delete, disable, reset)
2. **Show success messages** for confirmations of important actions
3. **Use specific error messages** from server when available
4. **Keep loading toast for operations > 1 second**
5. **Use appropriate toast duration** (error: 4s, success: 3s)
6. **Never show sensitive information** in public notifications

## Color Reference

- 🟢 **Success** (Green): `#10b981` - For confirmations
- 🔴 **Error** (Red): `#ef4444` - For failures/delete
- 🔵 **Info** (Blue): `#3b82f6` - For general info
- 🟡 **Warning** (Orange): `#f59e0b` - For caution alerts
