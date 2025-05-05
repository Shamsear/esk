# Progressive Web App (PWA) Implementation

This project has been enhanced with Progressive Web App (PWA) capabilities, allowing users to install the application on their devices and access content offline.

## Features

- **Installable**: Users can add the app to their home screen
- **Offline Support**: Key pages and assets are cached for offline use
- **Responsive**: Works well on all device sizes
- **Fast Loading**: Optimized asset loading and caching strategies
- **Background Sync**: Data entered offline can be synced when back online

## PWA Files

The PWA implementation includes the following files:

- `manifest.json` - Web app manifest with app metadata
- `js/service-worker.js` - Service worker for caching and offline support
- `js/pwa-init.js` - Handles service worker registration and updates
- `js/offline-manager.js` - Manages offline detection and functionality
- `css/pwa.css` - PWA-specific styles
- `offline.html` - Custom offline page
- `update-pwa.js` - Script to add PWA support to all HTML files

## Testing PWA Features

### Installation

1. Open the website in Chrome, Edge, or another PWA-compatible browser
2. Look for the install icon in the address bar or three-dot menu
3. Click "Install" to add the app to your device

### Offline Testing

1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Refresh the page to see the offline experience
5. Try navigating to different pages to see which ones are available offline

### Lighthouse Audit

1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Check "Progressive Web App" category
4. Click "Generate report" to see PWA compliance

## Manual PWA Setup

If you need to update PWA support on all HTML files:

```bash
npm run pwa-setup
```

## Deployment Notes

- Ensure HTTPS is used in production for full PWA capability
- Test across multiple browsers and devices
- Verify offline functionality before deploying

## Browser Support

The PWA features are supported in:

- Chrome (desktop & mobile)
- Edge
- Safari (iOS 11.3+)
- Firefox
- Samsung Internet
- Opera

Some features may have limited support in older browsers. 