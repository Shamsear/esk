// Service Worker for Eskimos Road to Glory PWA
const CACHE_NAME = 'eskimos-r2g-v1';

// Resources to cache immediately when service worker is installed
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/assets/images/logo11.webp',
  '/css/performance.css',
  '/css/pwa.css',
  '/js/script.js',
  '/js/pwa-init.js',
  '/js/offline-manager.js'
];

// Resources to cache when visited
const DYNAMIC_CACHE_RESOURCES = [
  '/player-admin.html',
  '/player-status.html',
  '/player-signing.html',
  '/career-mode.html',
  '/registered-clubs.html',
  '/trophy-cabinet.html',
  '/manager-ranking.html',
  '/career-tournament.html',
  '/tournament-guide.html',
  '/admin-login.html',
  '/token-setup.html'
];

// Install event - precache critical resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - cache-first strategy with network fallback, 
// and updating cache in background for already cached resources
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip POST requests and non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Special handling for favicon and app icons
  if (event.request.url.includes('logo11.webp') || 
      event.request.url.includes('favicon') || 
      event.request.url.includes('apple-touch-icon')) {
    event.respondWith(
      caches.match('/assets/images/logo11.webp').then(response => {
        return response || fetch('/assets/images/logo11.webp');
      }).catch(() => {
        return fetch('/assets/images/logo11.webp');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached response if found
      if (cachedResponse) {
        // Update cache in background
        fetch(event.request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
            });
          }
        }).catch(() => {});
        
        return cachedResponse;
      }

      // Otherwise try network
      return fetch(event.request)
        .then(response => {
          // Cache response in background for future use
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed - check if it's an HTML request
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('offline.html');
          }
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-player-data') {
    event.waitUntil(syncPlayerData());
  }
});

// Function to sync player data when back online
async function syncPlayerData() {
  try {
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      const syncResponse = await fetch('/api/sync-player-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(offlineData)
      });
      
      if (syncResponse.ok) {
        await clearOfflineData();
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Get offline data from IndexedDB
async function getOfflineData() {
  // This is just a placeholder. Actual implementation would depend on your data storage approach.
  return [];
}

// Clear offline data after sync
async function clearOfflineData() {
  // This is just a placeholder. Actual implementation would depend on your data storage approach.
} 