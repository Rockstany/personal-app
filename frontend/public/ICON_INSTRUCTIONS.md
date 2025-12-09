# PWA Icon Setup Instructions

## Required Icon Files

You need to add the following icon files to this `/public` folder:

### 1. **icon-192.png** (192x192 pixels)
- Used for Android home screen, iOS bookmark
- Minimum size for PWA installation
- Should have your logo/branding centered

### 2. **icon-512.png** (512x512 pixels)
- Used for splash screens and high-res displays
- Better quality for larger devices
- Should have your logo/branding centered

### 3. **favicon.ico** (Optional but recommended)
- 32x32 or 16x16 pixels
- Shows in browser tab

## How to Create Icons

### Option 1: Use an Online Tool
1. Go to https://realfavicongenerator.net/
2. Upload your logo/video image
3. Download the generated icons
4. Place them in this `/public` folder

### Option 2: Manual Creation
1. Open your logo in an image editor (Photoshop, GIMP, etc.)
2. Resize to 512x512 pixels with transparent/white background
3. Save as `icon-512.png`
4. Resize same image to 192x192 pixels
5. Save as `icon-192.png`

### Option 3: Use ImageMagick (Command Line)
```bash
# From your logo file
convert your-logo.png -resize 512x512 icon-512.png
convert your-logo.png -resize 192x192 icon-192.png
convert your-logo.png -resize 32x32 favicon.ico
```

## Design Guidelines

### For Best Results:
- **Simple & Recognizable**: Icon should be clear even at small sizes
- **Centered Content**: Leave 10% padding around edges (safe zone)
- **Orange Theme**: Match your app's #FF6B35 color scheme
- **High Contrast**: Ensure icon stands out on any background
- **No Text**: Avoid small text - use symbols/logos only

### Suggested Icon Concept for "Habit Tracker":
- 🎯 Target/Bullseye with checkmark
- ✅ Checkmark in a circle
- 📊 Growth chart/progress bars
- 🏆 Trophy symbol
- Or your custom "video logo" branded design

## Testing Your Icons

After adding the icons:

1. **On iPhone 13**:
   - Open Safari → Share → "Add to Home Screen"
   - Check if your icon appears correctly

2. **On Android**:
   - Chrome → Menu → "Install app" or "Add to Home Screen"
   - Verify icon on home screen

3. **In Browser**:
   - Check browser tab for favicon
   - Inspect PWA manifest in DevTools

## Current Configuration

The app is configured with:
- **Theme Color**: #FF6B35 (Orange)
- **Background**: #FFFFFF (White)
- **Display Mode**: Standalone (full screen, no browser UI)
- **Orientation**: Portrait

All icons are referenced in:
- `vite.config.js` (PWA manifest)
- `index.html` (meta tags)

## Need Help?

If you don't have a logo yet, you can:
1. Use a placeholder from https://placeholder.com/
2. Create one at https://www.canva.com/ (free)
3. Hire a designer on Fiverr ($5-20)
4. Use an emoji as icon (🎯, ✅, 📊, etc.)
