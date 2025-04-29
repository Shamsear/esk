// Service Worker for Eskimos Road to Glory PWA
const CACHE_NAME = 'eskimos-r2g-v1';

// Resources to cache immediately when service worker is installed
const PRECACHE_RESOURCES = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './assets/images/logo11.webp',
  './css/performance.css',
  './css/pwa.css',
  './css/styles.css',
  './js/script.js',
  './js/pwa-init.js',
  './js/offline-manager.js',
  './js/pwa-install-prompt.js'
];

// Resources to cache when visited
const DYNAMIC_CACHE_RESOURCES = [
  './player-admin.html',
  './player-status.html',
  './player-signing.html',
  './career-mode.html',
  './registered-clubs.html',
  './trophy-cabinet.html',
  './manager-ranking.html',
  './career-tournament.html',
  './tournament-guide.html',
  './admin-login.html',
  './token-setup.html'
];

// Install event - precache critical resources
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching files:', PRECACHE_RESOURCES.join(', '));
        // Pre-cache dynamic resources as well for better offline experience
        return cache.addAll([...PRECACHE_RESOURCES, ...DYNAMIC_CACHE_RESOURCES]);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete! Skipping waiting...');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Helper function to normalize URL paths for consistent caching
function normalizeUrl(url) {
  const newUrl = new URL(url, self.location.origin);
  
  // Ensure trailing slash consistency
  if (newUrl.pathname.endsWith('/')) {
    return newUrl.href;
  }
  
  // Handle root paths
  if (newUrl.pathname === '') {
    return newUrl.origin + '/';
  }
  
  return newUrl.href;
}

// Fetch event with improved cache handling
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip POST requests and non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Special handling for HTML requests (respond with index.html for navigation)
  const isNavigationRequest = event.request.mode === 'navigate';
  
  // Special handling for favicon and app icons
  if (event.request.url.includes('logo11.webp') || 
      event.request.url.includes('favicon') || 
      event.request.url.includes('apple-touch-icon')) {
    event.respondWith(
      caches.match('./assets/images/logo11.webp')
        .then(response => response || fetch('./assets/images/logo11.webp'))
        .catch(() => fetch('./assets/images/logo11.webp'))
    );
    return;
  }

  // For HTML navigation requests
  if (isNavigationRequest) {
    event.respondWith(
      // Try cache first for HTML
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // If not in cache, try network with cache update
          return fetch(event.request)
            .then(networkResponse => {
              // Cache the response for future
              if (networkResponse.ok) {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, clone);
                });
              }
              return networkResponse;
            })
            .catch(() => {
              // If both cache and network fail, show offline page
              return caches.match('./offline.html');
            });
        })
    );
    return;
  }

  // For all other requests
  event.respondWith(
    // Try from cache first
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          // Update cache in background
          fetch(event.request)
            .then(response => {
              if (response.ok) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, response.clone());
                });
              }
            })
            .catch(() => {});
          
          return cachedResponse;
        }

        // If not in cache, try network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache the response for future use
            if (networkResponse.ok) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, clone);
              });
            }
            return networkResponse;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            
            // For image requests that fail, return a fallback image
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
              return caches.match('./assets/images/logo11.webp');
            }
            
            // For HTML requests that fail, return offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./offline.html');
            }
            
            // For all other failures
            throw error;
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
      const syncResponse = await fetch('./api/sync-player-data', {
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