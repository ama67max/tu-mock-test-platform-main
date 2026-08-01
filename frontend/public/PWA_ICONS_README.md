# PWA Icons Required

To complete the PWA setup, you need to generate the following icon files and place them in this `/public` directory:

## Required Icons:

1. **pwa-64x64.png** (64x64 pixels)
2. **pwa-192x192.png** (192x192 pixels) - Standard icon
3. **pwa-512x512.png** (512x512 pixels) - High-res icon
4. **maskable-icon-512x512.png** (512x512 pixels) - Maskable icon with safe zone

## How to Generate:

### Option 1: Use an Online Tool
Visit: https://www.pwabuilder.com/imageGenerator

1. Upload your logo/icon (at least 512x512px recommended)
2. Download the generated icon pack
3. Rename files according to the list above
4. Place them in this `/public` directory

### Option 2: Manual Creation
Using image editing software (Photoshop, GIMP, etc.):

1. Start with a square logo (512x512px minimum)
2. Export at different sizes:
   - 64x64px → pwa-64x64.png
   - 192x192px → pwa-192x192.png
   - 512x512px → pwa-512x512.png
3. For maskable icon:
   - Create 512x512px canvas
   - Add 80px padding on all sides (safe zone)
   - Center your logo in the safe zone
   - Export as maskable-icon-512x512.png

### Design Guidelines:

- **Background**: Use solid color (black #000000 for dark theme)
- **Logo**: Should be centered and clearly visible
- **Maskable Safe Zone**: Keep important content within 80% circle
- **Format**: PNG with transparency where appropriate
- **Colors**: Match the black-silver-white theme

## Temporary Solution:

If you don't have custom icons yet, you can use the existing logo.svg file or create simple colored squares as placeholders. The PWA will still function, but custom icons provide a better user experience.

## Testing Icons:

After adding icons:
1. Build the app: `npm run build`
2. Preview: `npm run preview`
3. Open DevTools → Application → Manifest
4. Verify all icons load correctly
5. Test installation on mobile devices
