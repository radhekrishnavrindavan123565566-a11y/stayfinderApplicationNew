# Translation Implementation Guide

## ✅ Completed

### Translation Files Created
- **messages/en.json** - Complete English translations (500+ keys)
- **messages/hi.json** - Complete Hindi translations (500+ keys)

### Translation Namespaces

1. **nav** - Navigation menu items
2. **hero** - Hero section text
3. **categories** - Property categories
4. **stats** - Statistics labels
5. **search** - Search and filter UI
6. **property** - Property card and details
7. **auth** - Authentication forms
8. **dashboard** - Dashboard UI
9. **footer** - Footer links and text
10. **home** - Homepage sections
11. **booking** - Booking form and flow
12. **calendar** - Calendar UI
13. **dispute** - Dispute form
14. **maintenance** - Maintenance requests
15. **chat** - Chat interface
16. **notifications** - Notification center
17. **filters** - Advanced filters
18. **location** - Location intelligence
19. **urgency** - Urgency signals
20. **ai** - AI features
21. **common** - Common UI elements (buttons, labels, etc.)

## 📝 How to Use Translations in Components

### Client Components
```tsx
"use client";
import { useTranslations } from "next-intl";

export default function MyComponent() {
  const t = useTranslations("namespace");
  
  return <button>{t("buttonKey")}</button>;
}
```

### Server Components
```tsx
import { getTranslations } from "next-intl/server";

export default async function MyPage() {
  const t = await getTranslations("namespace");
  
  return <h1>{t("title")}</h1>;
}
```

### With Variables
```tsx
// Translation: "Booked {count} times"
t("bookedTimes", { count: 5 })
```

## 🔄 Next Steps - Component Updates Needed

The following components need to be updated to use translations:

### High Priority (User-Facing)
1. ✅ `components/layout/Navbar.tsx` - Already using translations
2. ✅ `components/layout/Footer.tsx` - Already using translations
3. ✅ `app/page.tsx` - Already using translations
4. `app/auth/login/page.tsx` - Needs update
5. `app/auth/register/page.tsx` - Needs update
6. `components/booking/BookingForm.tsx` - Needs update
7. `components/property/PropertyCard.tsx` - Needs update
8. `components/property/SearchBar.tsx` - Needs update
9. `components/search/AdvancedFilters.tsx` - Needs update
10. `components/search/AISearchBar.tsx` - Needs update

### Medium Priority
11. `components/booking/DisputeForm.tsx` - Needs update
12. `components/maintenance/MaintenanceForm.tsx` - Needs update
13. `components/booking/AvailabilityCalendar.tsx` - Needs update
14. `components/chat/ChatWidget.tsx` - Needs update
15. `components/notifications/NotificationCenter.tsx` - Needs update
16. `components/properties/LocationIntelligence.tsx` - Needs update
17. `components/properties/UrgencySignals.tsx` - Needs update
18. `components/properties/AIDescriptionGenerator.tsx` - Needs update
19. `app/dashboard/page.tsx` - Needs update

## 🌐 Language Switching

The language switcher is already implemented in `components/ui/LanguageSwitcher.tsx` and uses cookies to persist the user's language preference.

## 📋 Translation Keys Reference

### Common Buttons
- `common.save` - Save
- `common.cancel` - Cancel
- `common.submit` - Submit
- `common.edit` - Edit
- `common.delete` - Delete
- `common.close` - Close
- `common.back` - Back
- `common.next` - Next

### Auth
- `auth.login` - Sign In
- `auth.register` - Create Account
- `auth.email` - Email address
- `auth.password` - Password
- `auth.signIn` - Sign in
- `auth.signUp` - Sign up

### Property
- `property.bookNow` - Book Now
- `property.messageOwner` - Message Owner
- `property.viewDetails` - View Details
- `property.addToWishlist` - Add to wishlist
- `property.addToCompare` - Add to compare

### Search
- `search.button` - Search
- `search.filters` - Filters
- `search.applyFilters` - Apply Filters
- `search.clear` - Clear

### Booking
- `booking.checkIn` - Check-in
- `booking.checkOut` - Check-out
- `booking.guests` - Guests
- `booking.confirmBooking` - Confirm Booking

## 🎯 Example Component Update

### Before
```tsx
<button>Book Now</button>
```

### After
```tsx
"use client";
import { useTranslations } from "next-intl";

export default function MyComponent() {
  const t = useTranslations("property");
  return <button>{t("bookNow")}</button>;
}
```

## 🔍 Finding Translation Keys

All translation keys are organized by feature/section. To find a key:
1. Identify the component's purpose (auth, booking, property, etc.)
2. Look in the corresponding namespace in `messages/en.json`
3. Use the key with `useTranslations("namespace")`

## ✨ Benefits

- ✅ Full English and Hindi support
- ✅ Easy to add more languages
- ✅ Type-safe with next-intl
- ✅ Cookie-based persistence
- ✅ SSR and client-side support
- ✅ 500+ translation keys ready to use
