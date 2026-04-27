# Logo Update Instructions

## Manual Step Required

Please replace the logo file at `public/logo.png` with the new Nestora logo image you provided.

The new logo should be the image showing:
- A house icon with leaves and decorative elements
- "Nestora" text with the tagline "FIND YOUR PLACE. FEEL AT HOME."
- Navy blue and warm orange/amber color scheme

### Logo Specifications
- Path: `public/logo.png`
- Current dimensions referenced: 1385x752 (as per manifest.ts)
- Also create smaller versions for PWA:
  - `public/icon-192.png` (192x192)
  - `public/icon-512.png` (512x512)

### After Replacing the Logo

1. Clear the Next.js cache: `rm -rf .next`
2. Restart the development server: `npm run dev`
3. Clear browser cache or do a hard refresh (Ctrl+Shift+R)

All text references to "MatchNest" have been updated to "Nestora" throughout the application.
